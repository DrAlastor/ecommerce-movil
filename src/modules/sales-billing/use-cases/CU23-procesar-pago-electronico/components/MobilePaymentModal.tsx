/**
 * @caso-de-uso CU23 — Procesar pago electrónico
 * @subsistema Ventas, Pagos y Compras
 * @capa Boundary — Aplicación móvil
 * @responsabilidad Implementa una parte reutilizable de la interfaz de Aplicación móvil y comunica eventos al controlador de presentación.
 * @secuencia Cliente -> interfaz de pago -> controlador de pagos -> servicio de pago -> Pasarela de Pago/Pago/Venta.
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import type { MobilePaymentModalProps } from '../types/payment.types';
import { usePaymentModal } from '../hooks/usePaymentModal';
import { PaymentMethodTabs } from './PaymentMethodTabs';
import { CreditCardForm } from './CreditCardForm';
import { QrPaymentView } from './QrPaymentView';
import { PaymentProcessingState } from './PaymentProcessingState';
import { PaymentSuccessReceipt } from './PaymentSuccessReceipt';
import { ElegantAlertModal } from '../../../../../shared/components/ElegantAlertModal';

export function MobilePaymentModal(props: MobilePaymentModalProps) {
  const { visible, totalAmount, onNavigateHome, onNavigateOrders } = props;

  const {
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
  } = usePaymentModal(props);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleModalClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Pasarela de Pago Oficial</Text>
              <Text style={styles.headerSubtitle}>
                Total: <Text style={styles.totalHighlight}>{totalAmount.toFixed(2)} Bs</Text>
              </Text>
            </View>

            {!isProcessing && (
              <TouchableOpacity
                onPress={handleModalClose}
                style={styles.closeBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}
            keyboardShouldPersistTaps="handled"
          >
            {isProcessing ? (
              <PaymentProcessingState />
            ) : successResult ? (
              <PaymentSuccessReceipt
                result={successResult}
                onNavigateOrders={onNavigateOrders}
                onNavigateHome={onNavigateHome}
              />
            ) : (
              <>
                {/* Selector de Método */}
                <PaymentMethodTabs
                  currentMethod={method}
                  onSelectMethod={setMethod}
                />

                {/* Formulario según Método */}
                {method === 'tarjeta' && (
                  <CreditCardForm
                    cardNumber={cardNumber}
                    onCardNumberChange={handleCardNumberChange}
                    cardHolder={cardHolder}
                    onCardHolderChange={setCardHolder}
                    expiry={expiry}
                    onExpiryChange={handleExpiryChange}
                    cvc={cvc}
                    onCvcChange={handleCvcChange}
                    onAutofillTestCard={handleAutofillTestCard}
                  />
                )}

                {method === 'qr' && (
                  <QrPaymentView
                    totalAmount={totalAmount}
                    onQrScanned={setQrScannedCode}
                    isQrScanned={Boolean(qrScannedCode)}
                  />
                )}

                {method === 'transferencia' && (
                  <View style={styles.transferCard}>
                    <Text style={styles.transferTitle}>Transferencia Bancaria Directa</Text>
                    <Text style={styles.transferSub}>
                      Realiza la transferencia desde la banca por internet a cualquiera de nuestras cuentas oficiales.
                    </Text>

                    <View style={styles.bankInfoBox}>
                      <Text style={styles.bankLabel}>Banco de Crédito (BCP):</Text>
                      <Text style={styles.bankValue}>Cta Cte: 201-5093821 (Bs)</Text>
                      <Text style={styles.bankTitular}>FashionStore S.R.L. • NIT: 1029384756</Text>
                    </View>

                    <Text style={styles.refInputLabel}>Número de Comprobante / Referencia:</Text>
                    <TextInput
                      style={styles.refInput}
                      placeholder="Ej: BCP-981240 o N° Operación"
                      placeholderTextColor="#999"
                      value={transferReference}
                      onChangeText={setTransferReference}
                    />
                  </View>
                )}

                {/* Botón de Confirmación */}
                <TouchableOpacity
                  style={styles.confirmBtn}
                  onPress={handleSubmit}
                  activeOpacity={0.85}
                >
                  <Text style={styles.confirmBtnText}>
                    {method === 'tarjeta'
                      ? `Pagar ${totalAmount.toFixed(2)} Bs con Tarjeta`
                      : method === 'qr'
                      ? `Confirmar Pago QR (${totalAmount.toFixed(2)} Bs)`
                      : `Confirmar Transferencia (${totalAmount.toFixed(2)} Bs)`}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </View>
      </View>

      <ElegantAlertModal
        visible={alertConfig.visible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        primaryButtonText={alertConfig.primaryText || 'Entendido'}
        onPrimaryPress={() => {
          if (alertConfig.onPrimaryPress) {
            alertConfig.onPrimaryPress();
          } else {
            closeAlert();
          }
        }}
        onClose={closeAlert}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(28, 21, 16, 0.65)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    maxHeight: '90%',
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0ECE8',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1C1510',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#7D7065',
    marginTop: 2,
  },
  totalHighlight: {
    color: '#8C5E35',
    fontWeight: '800',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FAF8F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 15,
    color: '#7D7065',
    fontWeight: 'bold',
  },
  scrollBody: {
    padding: 22,
  },
  confirmBtn: {
    backgroundColor: '#1C1510',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#1C1510',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  transferCard: {
    backgroundColor: '#FAF8F5',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EFEBE6',
    marginBottom: 16,
  },
  transferTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1C1510',
  },
  transferSub: {
    fontSize: 11,
    color: '#777',
    marginTop: 2,
    marginBottom: 12,
  },
  bankInfoBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E8E3DC',
    marginBottom: 12,
  },
  bankLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C1510',
  },
  bankValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8C5E35',
    marginTop: 2,
  },
  bankTitular: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  refInputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#554A40',
    marginBottom: 4,
  },
  refInput: {
    height: 42,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8E3DC',
    paddingHorizontal: 10,
    fontSize: 13,
    color: '#1C1510',
  },
});
