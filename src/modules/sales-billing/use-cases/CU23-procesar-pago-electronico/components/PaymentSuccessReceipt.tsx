import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { DigitalPurchaseResult } from '../../CU21-realizar-compra-digital/types/checkout.types';

interface PaymentSuccessReceiptProps {
  result: DigitalPurchaseResult;
  onNavigateOrders?: () => void;
  onNavigateHome?: () => void;
}

export function PaymentSuccessReceipt({
  result,
  onNavigateOrders,
  onNavigateHome,
}: PaymentSuccessReceiptProps) {
  return (
    <View style={styles.container}>
      <View style={styles.successIconCircle}>
        <Text style={styles.successCheck}>✓</Text>
      </View>

      <Text style={styles.title}>¡Pago Exitoso!</Text>
      <Text style={styles.subtitle}>Tu compra ha sido procesada y confirmada.</Text>

      {/* Comprobante Digital */}
      <View style={styles.voucher}>
        <View style={styles.voucherHeader}>
          <Text style={styles.voucherBrand}>DRESSLY BOUTIQUE</Text>
          <Text style={styles.voucherType}>COMPROBANTE ELECTRÓNICO</Text>
        </View>

        <View style={styles.voucherDivider} />

        <View style={styles.voucherRow}>
          <Text style={styles.voucherLabel}>Nº de Orden:</Text>
          <Text style={styles.voucherValue}>
            {result.venta?.codigo_venta || `#VENTA-${result.venta?.id_venta || 'DIGITAL'}`}
          </Text>
        </View>

        {result.pago?.transaccion_id && (
          <View style={styles.voucherRow}>
            <Text style={styles.voucherLabel}>Transacción:</Text>
            <Text style={styles.voucherValue} numberOfLines={1}>
              {result.pago.transaccion_id}
            </Text>
          </View>
        )}

        {result.factura?.numero_autorizacion && (
          <View style={styles.voucherRow}>
            <Text style={styles.voucherLabel}>Nº Autorización:</Text>
            <Text style={styles.voucherValue}>{result.factura.numero_autorizacion}</Text>
          </View>
        )}

        <View style={styles.voucherRow}>
          <Text style={styles.voucherLabel}>Método de Pago:</Text>
          <Text style={styles.voucherValue}>
            {(result.pago?.metodo || 'TARJETA').toUpperCase()}
          </Text>
        </View>

        <View style={styles.voucherRow}>
          <Text style={styles.voucherLabel}>Fecha y Hora:</Text>
          <Text style={styles.voucherValue}>
            {result.venta?.fecha ? new Date(result.venta.fecha).toLocaleString() : 'Reciente'}
          </Text>
        </View>

        <View style={styles.voucherDivider} />

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>TOTAL PAGADO</Text>
          <Text style={styles.totalAmount}>
            {result.venta?.total ? `${result.venta.total.toFixed(2)} Bs` : 'PAGADO'}
          </Text>
        </View>

        <View style={styles.voucherFooter}>
          <Text style={styles.fiscalNotice}>
            Factura electrónica emitida de conformidad con la normativa del SIN.
          </Text>
        </View>
      </View>

      {/* Acciones */}
      <View style={styles.actions}>
        {onNavigateOrders && (
          <TouchableOpacity
            style={styles.ordersBtn}
            onPress={onNavigateOrders}
            activeOpacity={0.8}
          >
            <Text style={styles.ordersBtnText}>Ver en Mis Compras</Text>
          </TouchableOpacity>
        )}

        {onNavigateHome && (
          <TouchableOpacity
            style={styles.homeBtn}
            onPress={onNavigateHome}
            activeOpacity={0.8}
          >
            <Text style={styles.homeBtnText}>Volver a la Tienda</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  successIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#28A745',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#28A745',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  successCheck: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1C1510',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#8C7D70',
    marginBottom: 20,
    textAlign: 'center',
  },
  voucher: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E8E2DA',
    shadowColor: '#1C1510',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 20,
  },
  voucherHeader: {
    alignItems: 'center',
    marginBottom: 10,
  },
  voucherBrand: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1C1510',
    letterSpacing: 1.5,
  },
  voucherType: {
    fontSize: 10,
    color: '#8C5E35',
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  voucherDivider: {
    height: 1,
    backgroundColor: '#F0ECE8',
    marginVertical: 10,
  },
  voucherRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  voucherLabel: {
    fontSize: 12,
    color: '#8C7D70',
  },
  voucherValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C1510',
    maxWidth: '65%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1C1510',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '900',
    color: '#28A745',
  },
  voucherFooter: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F5F2EE',
  },
  fiscalNotice: {
    fontSize: 10,
    color: '#A89F95',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  actions: {
    width: '100%',
    gap: 10,
  },
  ordersBtn: {
    backgroundColor: '#1C1510',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: '#1C1510',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  ordersBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  homeBtn: {
    backgroundColor: '#FAF8F5',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E2DA',
  },
  homeBtnText: {
    color: '#635345',
    fontSize: 14,
    fontWeight: '700',
  },
});
