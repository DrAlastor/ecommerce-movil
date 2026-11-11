/**
 * @caso-de-uso CU23 — Procesar pago electrónico
 * @subsistema Ventas, Pagos y Compras
 * @capa Control (presentación) — Aplicación móvil
 * @responsabilidad Coordina estado, validaciones y acciones de la interfaz antes de delegar la operación al servicio o API.
 * @secuencia Cliente -> interfaz de pago -> controlador de pagos -> servicio de pago -> Pasarela de Pago/Pago/Venta.
 */
import { useState } from 'react';
import { Alert } from 'react-native';
import type { PaymentMethod, MobilePaymentModalProps } from '../types/payment.types';
import type { DigitalPurchaseResult } from '../../CU21-realizar-compra-digital/types/checkout.types';

export function usePaymentModal({
  onConfirmPayment,
  onSuccess,
  onClose,
  onNavigateLogin,
}: Pick<MobilePaymentModalProps, 'onConfirmPayment' | 'onSuccess' | 'onClose' | 'onNavigateLogin'>) {
  const [method, setMethod] = useState<PaymentMethod>('tarjeta');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [qrScannedCode, setQrScannedCode] = useState<string | null>(null);
  const [transferReference, setTransferReference] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successResult, setSuccessResult] = useState<DigitalPurchaseResult | null>(null);

  // Formato de tarjeta en bloques de 4 dígitos
  const handleCardNumberChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 16);
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    setCardNumber(formatted);
  };

  // Formato MM/AA
  const handleExpiryChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length >= 3) {
      setExpiry(`${cleaned.slice(0, 2)}/${cleaned.slice(2)}`);
    } else {
      setExpiry(cleaned);
    }
  };

  const handleCvcChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 4);
    setCvc(cleaned);
  };

  // Autofill tarjeta de prueba
  const handleAutofillTestCard = () => {
    setCardNumber('4242 4242 4242 4242');
    setCardHolder('CLIENTE DRESSLY VIP');
    setExpiry('12/28');
    setCvc('789');
  };

  const resetForm = () => {
    setCardNumber('');
    setCardHolder('');
    setExpiry('');
    setCvc('');
    setQrScannedCode(null);
    setTransferReference('');
    setIsProcessing(false);
    setSuccessResult(null);
  };

  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    primaryText?: string;
    onPrimaryPress?: () => void;
  }>({
    visible: false,
    type: 'error',
    title: '',
    message: '',
    primaryText: 'Entendido',
  });

  const showAlert = (
    title: string,
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'error',
    primaryText = 'Entendido',
    onPrimaryPress?: () => void,
  ) => {
    setAlertConfig({ visible: true, type, title, message, primaryText, onPrimaryPress });
  };

  const closeAlert = () => {
    setAlertConfig((prev) => ({ ...prev, visible: false }));
  };

  const handleModalClose = () => {
    resetForm();
    closeAlert();
    onClose();
  };

  const handleSubmit = async () => {
    if (method === 'tarjeta') {
      const rawCard = cardNumber.replace(/\s/g, '');
      if (rawCard.length < 15) {
        showAlert('Tarjeta Inválida', 'Ingresa los 16 dígitos de tu tarjeta de crédito o débito.', 'warning');
        return;
      }
      if (!cardHolder.trim()) {
        showAlert('Titular Requerido', 'Ingresa el nombre del titular tal como figura en el plástico.', 'warning');
        return;
      }
      if (expiry.length < 5) {
        showAlert('Vencimiento Inválido', 'Ingresa la fecha de vencimiento en formato MM/AA.', 'warning');
        return;
      }
      if (cvc.length < 3) {
        showAlert('CVC Inválido', 'Ingresa el código de seguridad de 3 o 4 dígitos de tu tarjeta.', 'warning');
        return;
      }
    }

    try {
      setIsProcessing(true);
      const result = await onConfirmPayment({
        metodo_pago: method,
        numero_tarjeta: cardNumber.replace(/\s/g, ''),
        titular: cardHolder.trim(),
        expiracion: expiry,
        cvc,
      });

      setSuccessResult(result);
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (error: any) {
      const errMsg = error?.message || '';
      const isAuthError =
        errMsg.toLowerCase().includes('unauthorized') ||
        errMsg.toLowerCase().includes('sesión expirada') ||
        errMsg.toLowerCase().includes('token') ||
        error?.response?.status === 401;

      if (isAuthError) {
        showAlert(
          'Sesión Expirada',
          'Tu sesión ha expirado por motivos de seguridad. Inicia sesión nuevamente para procesar el pago sin perder tus prendas de la bolsa.',
          'warning',
          'Iniciar Sesión',
          () => {
            closeAlert();
            handleModalClose();
            if (onNavigateLogin) {
              onNavigateLogin();
            }
          },
        );
      } else {
        showAlert(
          'Pago Rechazado',
          errMsg || 'No se pudo procesar la transacción. Por favor verifica tus datos bancarios.',
          'error',
        );
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    method,
    setMethod,
    cardNumber,
    cardHolder,
    setCardHolder,
    expiry,
    cvc,
    qrScannedCode,
    setQrScannedCode,
    transferReference,
    setTransferReference,
    isProcessing,
    successResult,
    alertConfig,
    closeAlert,
    handleCardNumberChange,
    handleExpiryChange,
    handleCvcChange,
    handleAutofillTestCard,
    handleModalClose,
    handleSubmit,
  };
}
