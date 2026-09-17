import { useState } from 'react';
import { Alert } from 'react-native';
import { useShop } from '../../../../../shared/context/ShopContext';
import { useAuth } from '../../../../users-security/shared/AuthContext';
import { CheckoutService } from '../services/checkout.service';
import type { ProcessDigitalPurchaseInput, DigitalPurchaseResult } from '../types/checkout.types';

export function useCheckout(navigation: any) {
  const { cart, cartTotal, clearCart } = useShop();
  const { user } = useAuth();

  // Datos de envío
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

  const formatPrice = (price: number) => `${price.toFixed(2)} Bs`;

  const handleOpenPayment = () => {
    if (!address.trim()) {
      Alert.alert('Dirección Requerida', 'Por favor ingresa la dirección de entrega de tu pedido.');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Teléfono Requerido', 'Ingresa un número de teléfono de contacto para la entrega.');
      return;
    }
    if (!recipient.trim()) {
      Alert.alert('Destinatario Requerido', 'Ingresa el nombre de la persona que recibirá el paquete.');
      return;
    }
    setIsPaymentModalVisible(true);
  };

  const handleClosePayment = () => {
    setIsPaymentModalVisible(false);
  };

  const handleProcessPayment = async (paymentData: any): Promise<DigitalPurchaseResult> => {
    const payload: ProcessDigitalPurchaseInput = {
      direccion_envio: {
        direccion: address.trim(),
        ciudad: city.trim(),
        telefono: phone.trim(),
        destinatario: recipient.trim(),
        notas: notes.trim() || undefined,
      },
      metodo_pago: paymentData.metodo_pago,
      datos_pago: {
        numero_tarjeta: paymentData.numero_tarjeta,
        titular: paymentData.titular,
        expiracion: paymentData.expiracion,
        cvc: paymentData.cvc,
      },
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
    handleOpenPayment,
    handleClosePayment,
    handleProcessPayment,
    handlePaymentSuccess,
    handleFinishAndGoHome,
  };
}
