import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface CheckoutFooterProps {
  cartTotal: number;
  formatPrice: (price: number) => string;
  onProceedToPayment: () => void;
}

export function CheckoutFooter({ cartTotal, formatPrice, onProceedToPayment }: CheckoutFooterProps) {
  return (
    <View style={styles.footer}>
      <View style={styles.footerInfo}>
        <Text style={styles.footerTotalLabel}>Total a Pagar</Text>
        <Text style={styles.footerTotalVal}>{formatPrice(cartTotal)}</Text>
      </View>

      <TouchableOpacity
        style={styles.payBtn}
        onPress={onProceedToPayment}
        activeOpacity={0.85}
      >
        <Text style={styles.payBtnIcon}>🔒</Text>
        <Text style={styles.payBtnText}>Proceder al Pago</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#F0ECE8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#1C1510',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  footerInfo: {
    flex: 1,
    marginRight: 16,
  },
  footerTotalLabel: {
    fontSize: 12,
    color: '#8C7D70',
    fontWeight: '600',
  },
  footerTotalVal: {
    fontSize: 19,
    fontWeight: '800',
    color: '#1C1510',
    marginTop: 2,
  },
  payBtn: {
    backgroundColor: '#1C1510',
    borderRadius: 14,
    paddingVertical: 15,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#1C1510',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  payBtnIcon: {
    fontSize: 15,
    marginRight: 8,
  },
  payBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
