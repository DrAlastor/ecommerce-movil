import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { PurchaseHistoryItem } from '../types/purchases.types';

interface PurchaseOrderCardProps {
  item: PurchaseHistoryItem;
  formatPrice: (amount: number) => string;
  onViewReceipt: (item: PurchaseHistoryItem) => void;
}

export function PurchaseOrderCard({ item, formatPrice, onViewReceipt }: PurchaseOrderCardProps) {
  const getStatusBadgeStyle = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s.includes('paga') || s.includes('completa') || s.includes('entrega')) {
      return { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0', label: 'Pagada' };
    }
    if (s.includes('pend')) {
      return { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A', label: 'Pendiente' };
    }
    if (s.includes('canc')) {
      return { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA', label: 'Cancelada' };
    }
    return { bg: '#F3F4F6', text: '#4B5563', border: '#E5E7EB', label: status };
  };

  const badge = getStatusBadgeStyle(item.estado_venta);
  const dateFormatted = new Date(item.fecha).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={styles.orderCard}>
      {/* Cabecera de la Orden */}
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.orderNumber}>Orden #{item.id_venta}</Text>
          <Text style={styles.orderDate}>{dateFormatted}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: badge.bg, borderColor: badge.border }]}>
          <Text style={[styles.statusText, { color: badge.text }]}>{badge.label}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Artículos (Vista previa) */}
      {item.items && item.items.length > 0 ? (
        <View style={styles.itemsPreview}>
          {item.items.slice(0, 3).map((it) => (
            <Text key={it.id_detalle_venta} style={styles.itemLine} numberOfLines={1}>
              • {it.cantidad}x {it.nombre_producto} {it.talla ? `(${it.talla})` : ''}
            </Text>
          ))}
          {item.items.length > 3 && (
            <Text style={styles.moreItemsText}>+ {item.items.length - 3} prendas más...</Text>
          )}
        </View>
      ) : (
        <Text style={styles.itemCountText}>{item.items_count} prendas adquiridas</Text>
      )}

      <View style={styles.divider} />

      {/* Pie de Tarjeta con Total y Botón de Comprobante */}
      <View style={styles.cardFooter}>
        <View>
          <Text style={styles.totalLabel}>Total Pagado</Text>
          <Text style={styles.totalValue}>{formatPrice(item.total)}</Text>
        </View>

        <TouchableOpacity
          style={styles.receiptBtn}
          onPress={() => onViewReceipt(item)}
          activeOpacity={0.8}
        >
          <Text style={styles.receiptBtnIcon}>🧾</Text>
          <Text style={styles.receiptBtnText}>Ver Comprobante</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F0ECE8',
    shadowColor: '#1C1510',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1C1510',
  },
  orderDate: {
    fontSize: 12,
    color: '#8C7D70',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#F5F2EE',
    marginVertical: 12,
  },
  itemsPreview: {
    gap: 4,
  },
  itemLine: {
    fontSize: 13,
    color: '#4A3E34',
  },
  moreItemsText: {
    fontSize: 12,
    color: '#8C5E35',
    fontStyle: 'italic',
    marginTop: 2,
  },
  itemCountText: {
    fontSize: 13,
    color: '#7D7065',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 11,
    color: '#8C7D70',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#8C5E35',
  },
  receiptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#E8E2DA',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  receiptBtnIcon: {
    fontSize: 14,
  },
  receiptBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C1510',
  },
});
