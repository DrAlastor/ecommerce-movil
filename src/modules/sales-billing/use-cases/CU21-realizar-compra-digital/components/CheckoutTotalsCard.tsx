import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface CheckoutTotalsCardProps {
  cartTotal: number;
  formatPrice: (price: number) => string;
}

export function CheckoutTotalsCard({ cartTotal, formatPrice }: CheckoutTotalsCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Desglose del Pago</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Subtotal de Prendas</Text>
        <Text style={styles.value}>{formatPrice(cartTotal)}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Costo de Envío</Text>
        <Text style={styles.freeBadge}>GRATIS</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Impuestos de Ley (Factura)</Text>
        <Text style={styles.value}>Incluidos</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.totalRow}>
        <View>
          <Text style={styles.totalLabel}>Monto Final</Text>
          <Text style={styles.totalSub}>Factura con derecho a crédito fiscal</Text>
        </View>
        <Text style={styles.totalAmount}>{formatPrice(cartTotal)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FAF8F5',
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EFEBE6',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1C1510',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    color: '#7D7065',
  },
  value: {
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
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1C1510',
  },
  totalSub: {
    fontSize: 11,
    color: '#9C8F84',
    marginTop: 2,
  },
  totalAmount: {
    fontSize: 19,
    fontWeight: '800',
    color: '#8C5E35',
  },
});
