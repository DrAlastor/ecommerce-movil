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
import { DeliveryAddressForm } from '../components/DeliveryAddressForm';
import { OrderSummaryList } from '../components/OrderSummaryList';
import { CheckoutTotalsCard } from '../components/CheckoutTotalsCard';
import { CheckoutFooter } from '../components/CheckoutFooter';
import { MobilePaymentModal } from '../../CU23-procesar-pago-electronico';

export default function CheckoutScreen({ navigation }: any) {
  const {
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
        {/* 1. Dirección de entrega */}
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

        {/* 2. Resumen de prendas */}
        <OrderSummaryList cart={cart} formatPrice={formatPrice} />

        {/* 3. Desglose económico */}
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
