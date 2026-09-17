import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface CartSummaryFooterProps {
  cartTotal: number;
  formatPrice: (price: number) => string;
  onProceedToCheckout: () => void;
}

export function CartSummaryFooter({ cartTotal, formatPrice, onProceedToCheckout }: CartSummaryFooterProps) {
  return (
    <View style={styles.footer}>
      <View style={styles.summaryBox}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>{formatPrice(cartTotal)}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Envío Nacional</Text>
          <Text style={styles.freeBadge}>GRATIS</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.totalRow}>
          <View>
            <Text style={styles.totalLabel}>Total a Pagar</Text>
            <Text style={styles.totalSub}>Incluye impuestos de ley</Text>
          </View>
          <Text style={styles.totalAmount}>{formatPrice(cartTotal)}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.checkoutBtn}
        onPress={onProceedToCheckout}
        activeOpacity={0.85}
      >
        <Text style={styles.checkoutBtnText}>Continuar a Checkout</Text>
        <Text style={styles.checkoutArrow}>→</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#F0ECE8',
    shadowColor: '#1C1510',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  summaryBox: {
    backgroundColor: '#FAF8F5',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EFEBE6',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#7D7065',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1C1510',
  },
  freeBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#28A745',
    backgroundColor: '#EAF7EE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#E8E2DA',
    marginVertical: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1510',
  },
  totalSub: {
    fontSize: 11,
    color: '#9C8F84',
    marginTop: 1,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#8C5E35',
  },
  checkoutBtn: {
    backgroundColor: '#1C1510',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1C1510',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  checkoutBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  checkoutArrow: {
    color: '#FFFFFF',
    fontSize: 18,
    marginLeft: 8,
    fontWeight: '700',
  },
});
