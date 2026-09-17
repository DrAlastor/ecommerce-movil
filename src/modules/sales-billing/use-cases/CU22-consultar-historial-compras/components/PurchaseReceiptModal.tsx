import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import type { PurchaseHistoryItem } from '../types/purchases.types';

interface PurchaseReceiptModalProps {
  receipt: PurchaseHistoryItem | null;
  formatPrice: (amount: number) => string;
  onClose: () => void;
}

export function PurchaseReceiptModal({
  receipt,
  formatPrice,
  onClose,
}: PurchaseReceiptModalProps) {
  if (!receipt) return null;

  return (
    <Modal visible={Boolean(receipt)} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Comprobante Fiscal Digital</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.receiptBody}>
            {/* Encabezado de Factura */}
            <View style={styles.brandHeader}>
              <Text style={styles.brandTitle}>DRESSLY BOUTIQUE S.R.L.</Text>
              <Text style={styles.brandSub}>Casa Matriz: Santa Cruz de la Sierra - Bolivia</Text>
              <Text style={styles.nitText}>NIT: {receipt.factura?.nit_emisor || '1028475023'}</Text>
              <Text style={styles.brandType}>FACTURA DE COMPRA DIGITAL</Text>
            </View>

            <View style={styles.dividerDashed} />

            {/* Datos Técnicos de Facturación */}
            <View style={styles.metaSection}>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Nº Factura:</Text>
                <Text style={styles.metaValue}>{receipt.factura?.numero_factura || `#${receipt.id_venta}`}</Text>
              </View>
              {receipt.factura?.numero_autorizacion && (
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Nº Autorización:</Text>
                  <Text style={styles.metaValue}>{receipt.factura.numero_autorizacion}</Text>
                </View>
              )}
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Fecha y Hora:</Text>
                <Text style={styles.metaValue}>{new Date(receipt.fecha).toLocaleString()}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Método de Pago:</Text>
                <Text style={styles.metaValue}>{(receipt.pago?.metodo || 'TARJETA').toUpperCase()}</Text>
              </View>
              {receipt.pago?.transaccion_id && (
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>ID Transacción:</Text>
                  <Text style={styles.metaValue} numberOfLines={1}>{receipt.pago.transaccion_id}</Text>
                </View>
              )}
            </View>

            <View style={styles.dividerDashed} />

            {/* Desglose de Ítems */}
            <Text style={styles.itemsHeader}>DETALLE DE PRENDAS</Text>
            {receipt.items && receipt.items.length > 0 ? (
              receipt.items.map((it) => (
                <View key={it.id_detalle_venta} style={styles.itemRow}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={styles.receiptItemName}>{it.nombre_producto}</Text>
                    <Text style={styles.receiptItemMeta}>
                      {it.cantidad} unidad(es) x {formatPrice(it.precio_unitario)}
                      {it.talla ? ` | Talla: ${it.talla}` : ''}
                    </Text>
                  </View>
                  <Text style={styles.receiptItemSubtotal}>{formatPrice(it.subtotal)}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noItemsDetail}>{receipt.items_count} prendas registradas en orden.</Text>
            )}

            <View style={styles.dividerDashed} />

            {/* Total */}
            <View style={styles.receiptTotalRow}>
              <Text style={styles.receiptTotalLabel}>TOTAL BS</Text>
              <Text style={styles.receiptTotalAmount}>{formatPrice(receipt.total)}</Text>
            </View>

            {receipt.factura?.codigo_control && (
              <View style={styles.controlCodeBox}>
                <Text style={styles.controlCodeLabel}>Código de Control SIN:</Text>
                <Text style={styles.controlCodeValue}>{receipt.factura.codigo_control}</Text>
              </View>
            )}

            <Text style={styles.legalLegend}>
              "ESTA FACTURA CONTRIBUYE AL DESARROLLO DEL PAÍS, EL USO ILÍCITO SERÁ SANCIONADO DE ACUERDO A LEY"
            </Text>

            <TouchableOpacity style={styles.closeReceiptBtn} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.closeReceiptBtnText}>Cerrar Comprobante</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(28, 21, 16, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '88%',
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0ECE8',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1510',
  },
  modalCloseBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FAF8F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 14,
    color: '#7D7065',
    fontWeight: 'bold',
  },
  receiptBody: {
    padding: 20,
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  brandTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#1C1510',
    letterSpacing: 1,
  },
  brandSub: {
    fontSize: 11,
    color: '#7D7065',
    marginTop: 2,
  },
  nitText: {
    fontSize: 11,
    color: '#7D7065',
    fontWeight: '600',
    marginTop: 1,
  },
  brandType: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8C5E35',
    marginTop: 6,
    letterSpacing: 0.5,
  },
  dividerDashed: {
    height: 1,
    backgroundColor: '#E8E2DA',
    marginVertical: 12,
  },
  metaSection: {
    gap: 6,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 12,
    color: '#8C7D70',
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C1510',
    maxWidth: '65%',
  },
  itemsHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1C1510',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  receiptItemName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1510',
  },
  receiptItemMeta: {
    fontSize: 11,
    color: '#7D7065',
    marginTop: 2,
  },
  receiptItemSubtotal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1510',
  },
  noItemsDetail: {
    fontSize: 12,
    color: '#7D7065',
    fontStyle: 'italic',
    paddingVertical: 6,
  },
  receiptTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  receiptTotalLabel: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1C1510',
  },
  receiptTotalAmount: {
    fontSize: 20,
    fontWeight: '900',
    color: '#28A745',
  },
  controlCodeBox: {
    backgroundColor: '#FAF8F5',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E2DA',
  },
  controlCodeLabel: {
    fontSize: 10,
    color: '#8C7D70',
    fontWeight: '600',
  },
  controlCodeValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1C1510',
    marginTop: 2,
    letterSpacing: 1,
  },
  legalLegend: {
    fontSize: 9,
    color: '#A89F95',
    textAlign: 'center',
    marginVertical: 14,
    lineHeight: 13,
  },
  closeReceiptBtn: {
    backgroundColor: '#1C1510',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  closeReceiptBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
