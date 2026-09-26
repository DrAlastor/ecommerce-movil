/**
 * @caso-de-uso CU21 — Realizar compra digital
 * @subsistema Ventas, Pagos y Compras
 * @capa Boundary — Aplicación móvil
 * @responsabilidad Representa la pantalla principal de Aplicación móvil; compone la interfaz e inicia las acciones del caso de uso.
 * @secuencia Cliente -> checkout -> controlador de compra -> servicios de compra y pago -> Venta/DetalleVenta/Pago/Inventario.
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useCheckout } from '../hooks/useCheckout';
import { DeliveryMethodTabs } from '../components/DeliveryMethodTabs';
import { DeliveryAddressForm } from '../components/DeliveryAddressForm';
import { BranchPickupSelector } from '../components/BranchPickupSelector';
import { OrderSummaryList } from '../components/OrderSummaryList';
import { CheckoutTotalsCard } from '../components/CheckoutTotalsCard';
import { CheckoutFooter } from '../components/CheckoutFooter';
import { MobilePaymentModal } from '../../CU23-procesar-pago-electronico';
import { ElegantAlertModal } from '../../../../../shared/components/ElegantAlertModal';

export default function CheckoutScreen({ navigation }: any) {
  const {
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
  } = useCheckout(navigation);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.backBtn}
        >
          <Text style={styles.backText}>← Volver a la Bolsa</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Finalizar Compra</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Selector de Método: Domicilio vs Sucursal */}
        <DeliveryMethodTabs
          selectedType={deliveryType}
          onSelectType={setDeliveryType}
        />

        {/* Formulario según el método seleccionado */}
        {deliveryType === 'domicilio' ? (
          <DeliveryAddressForm
            recipient={recipient}
            setRecipient={setRecipient}
            phone={phone}
            setPhone={setPhone}
            city={city}
            setCity={setCity}
            address={address}
            setAddress={setAddress}
            notes={notes}
            setNotes={setNotes}
          />
        ) : (
          <BranchPickupSelector
            branches={branches}
            selectedBranchId={selectedBranchId}
            onSelectBranch={setSelectedBranchId}
            recipient={recipient}
            setRecipient={setRecipient}
            phone={phone}
            setPhone={setPhone}
            pickupNotes={notes}
            setPickupNotes={setNotes}
            isLoading={isLoadingBranches}
          />
        )}

        {/* Resumen de prendas */}
        <OrderSummaryList cart={cart} formatPrice={formatPrice} />

        {/* Desglose económico */}
        <CheckoutTotalsCard cartTotal={cartTotal} formatPrice={formatPrice} />
      </ScrollView>

      {/* Barra fija inferior */}
      <CheckoutFooter
        cartTotal={cartTotal}
        formatPrice={formatPrice}
        onProceedToPayment={handleOpenPayment}
      />

      {/* Modal de Pago Electrónico (CU23) */}
      <MobilePaymentModal
        visible={isPaymentModalVisible}
        totalAmount={cartTotal}
        onClose={handleClosePayment}
        onConfirmPayment={handleProcessPayment}
        onSuccess={handlePaymentSuccess}
        onNavigateHome={handleFinishAndGoHome}
        onNavigateOrders={() => {
          handleClosePayment();
          navigation.replace('MyPurchases');
        }}
        onNavigateLogin={() => {
          handleClosePayment();
          navigation.navigate('Login');
        }}
      />

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0ECE8',
  },
  backBtn: {
    paddingVertical: 4,
  },
  backText: {
    fontSize: 13,
    color: '#8C5E35',
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1C1510',
    letterSpacing: 0.3,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
});
