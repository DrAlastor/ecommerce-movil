import { useState } from 'react';
import { Alert } from 'react-native';
import type { PaymentMethod, MobilePaymentModalProps } from '../types/payment.types';
import type { DigitalPurchaseResult } from '../../CU21-realizar-compra-digital/types/checkout.types';

export function usePaymentModal({
  onConfirmPayment,
  onSuccess,
  onClose,
}: Pick<MobilePaymentModalProps, 'onConfirmPayment' | 'onSuccess' | 'onClose'>) {
  const [method, setMethod] = useState<PaymentMethod>('tarjeta');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
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
    setIsProcessing(false);
    setSuccessResult(null);
  };

  const handleModalClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (method === 'tarjeta') {
      const rawCard = cardNumber.replace(/\s/g, '');
      if (rawCard.length < 15) {
        Alert.alert('Tarjeta Inválida', 'Ingresa los 16 dígitos de tu tarjeta de crédito o débito.');
        return;
      }
      if (!cardHolder.trim()) {
        Alert.alert('Titular Requerido', 'Ingresa el nombre del titular tal como figura en el plástico.');
        return;
      }
      if (expiry.length < 5) {
        Alert.alert('Vencimiento Inválido', 'Ingresa la fecha de vencimiento en formato MM/AA.');
        return;
      }
      if (cvc.length < 3) {
        Alert.alert('CVC Inválido', 'Ingresa el código de seguridad de 3 o 4 dígitos de tu tarjeta.');
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
      Alert.alert(
        'Pago Rechazado',
        error.message || 'No se pudo procesar la transacción. Por favor verifica tus datos bancarios.'
      );
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
    isProcessing,
    successResult,
    handleCardNumberChange,
    handleExpiryChange,
    handleCvcChange,
    handleAutofillTestCard,
    handleModalClose,
    handleSubmit,
  };
}
