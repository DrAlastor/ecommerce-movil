import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useShop } from '../../../../../shared/context/ShopContext';
import { useAuth } from '../../../../users-security/shared/AuthContext';
import { CheckoutService } from '../services/checkout.service';
import type { ProcessDigitalPurchaseInput, DigitalPurchaseResult } from '../types/checkout.types';
import { MobileBranchesService } from '../../../../branches-inventory/use-cases/CU14-consultar-sucursales/services/branches.service';
import type { MobileBranch } from '../../../../branches-inventory/use-cases/CU14-consultar-sucursales/types';
import type { DeliveryType } from '../components/DeliveryMethodTabs';

export function useCheckout(navigation: any) {
  const { cart, cartTotal, clearCart, syncCartWithBackend } = useShop();
  const { user, isAuthenticated } = useAuth();

  // Método de entrega: 'domicilio' | 'retiro_sucursal'
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('domicilio');

  // Sucursales para retiro
  const [branches, setBranches] = useState<MobileBranch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [isLoadingBranches, setIsLoadingBranches] = useState<boolean>(true);

  // Cargar sucursales activas
  useEffect(() => {
    let isMounted = true;
    async function loadBranches() {
      try {
        setIsLoadingBranches(true);
        const data = await MobileBranchesService.getActiveBranches();
        if (isMounted) {
          setBranches(data);
          if (data.length > 0) {
            setSelectedBranchId(data[0].id_sucursal);
          }
        }
      } catch (err) {
        console.warn('Error loading branches in checkout:', err);
      } finally {
        if (isMounted) setIsLoadingBranches(false);
      }
    }
    loadBranches();
    return () => {
      isMounted = false;
    };
  }, []);

  // Datos de envío / retiro
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Santa Cruz');
  const [phone, setPhone] = useState((user?.cliente as any)?.telefono || user?.empleado?.telefono || '');
  const [recipient, setRecipient] = useState(
    user?.cliente?.nombre
      ? `${user.cliente.nombre} ${user.cliente.apellido || ''}`.trim()
      : user?.empleado?.nombre || ''
  );
  const [notes, setNotes] = useState('');

  // Modal de Pago
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);

  // Alerta elegante
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    primaryText?: string;
    onPrimaryPress?: () => void;
  }>({
    visible: false,
    type: 'warning',
    title: '',
    message: '',
  });

  const showAlert = (
    title: string,
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'warning',
    primaryText = 'Entendido',
    onPrimaryPress?: () => void,
  ) => {
    setAlertConfig({ visible: true, type, title, message, primaryText, onPrimaryPress });
  };

  const closeAlert = () => {
    setAlertConfig((prev) => ({ ...prev, visible: false }));
  };

  const formatPrice = (price: number) => `${price.toFixed(2)} Bs`;

  const handleOpenPayment = async () => {
    if (cart.length === 0) {
      showAlert('Bolsa Vacía', 'No tienes prendas en tu bolsa para proceder al pago.', 'warning');
      return;
    }

    const token = await AsyncStorage.getItem('accessToken');
    if (!isAuthenticated || !user || !token) {
      showAlert(
        'Iniciar Sesión Requerido',
        'Tu sesión ha expirado o necesitas iniciar sesión para completar la compra de forma segura.',
        'warning',
        'Iniciar Sesión',
        () => {
          closeAlert();
          navigation?.navigate('Login');
        },
      );
      return;
    }

    if (!recipient.trim()) {
      showAlert(
        'Nombre Requerido',
        deliveryType === 'domicilio'
          ? 'Ingresa el nombre de la persona que recibirá el paquete.'
          : 'Ingresa el nombre de la persona que retirará las prendas en boutique.',
        'warning',
      );
      return;
    }

    if (!phone.trim()) {
      showAlert('Teléfono Requerido', 'Ingresa un número de teléfono de contacto.', 'warning');
      return;
    }

    if (deliveryType === 'domicilio') {
      if (!address.trim()) {
        showAlert('Dirección Requerida', 'Por favor ingresa la dirección de entrega de tu pedido.', 'warning');
        return;
      }
    } else {
      if (!selectedBranchId) {
        showAlert('Sucursal Requerida', 'Por favor selecciona la sucursal donde deseas retirar tus prendas.', 'warning');
        return;
      }
    }

    // Sincronizar en segundo plano mientras el usuario interactúa con la pasarela
    syncCartWithBackend().catch(() => {});
    setIsPaymentModalVisible(true);
  };

  const handleClosePayment = () => {
    setIsPaymentModalVisible(false);
  };

  const handleProcessPayment = async (paymentData: any): Promise<DigitalPurchaseResult> => {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) {
      throw new Error('Sesión Expirada. Por favor inicia sesión nuevamente para completar tu compra.');
    }

    // 1. Asegurar sincronización atómica con el backend antes del cobro final
    await syncCartWithBackend();

    const isCard = paymentData.metodo_pago === 'tarjeta' || paymentData.metodo_pago === 'stripe';
    const payload: ProcessDigitalPurchaseInput = {
      metodo_pago: isCard ? 'stripe' : (paymentData.metodo_pago as 'stripe' | 'qr' | 'transferencia'),
      tipo_entrega: deliveryType,
      id_sucursal_retiro:
        deliveryType === 'retiro_sucursal' && selectedBranchId ? Number(selectedBranchId) : undefined,
      nueva_direccion:
        deliveryType === 'domicilio'
          ? {
              destinatario: recipient.trim(),
              telefono: phone.trim(),
              calle: address.trim(),
              detalle: notes.trim() || undefined,
              id_ciudad: 1,
            }
          : undefined,
      transaccion_externa: isCard
        ? `ch_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
        : `QR-${Date.now()}`,
    };

    return await CheckoutService.processPurchase(payload);
  };

  const handlePaymentSuccess = (_result: DigitalPurchaseResult) => {
    clearCart();
  };

  const handleFinishAndGoHome = () => {
    setIsPaymentModalVisible(false);
    navigation.replace('Home');
  };

  return {
    cart,
    cartTotal,
    formatPrice,
    deliveryType,
    setDeliveryType,
    branches,
    selectedBranchId,
    setSelectedBranchId,
    isLoadingBranches,
    address,
    setAddress,
    city,
    setCity,
    phone,
    setPhone,
    recipient,
    setRecipient,
    notes,
    setNotes,
    isPaymentModalVisible,
    alertConfig,
    closeAlert,
    handleOpenPayment,
    handleClosePayment,
    handleProcessPayment,
    handlePaymentSuccess,
    handleFinishAndGoHome,
  };
}
