import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import type { MobileBranchStock } from '../services/product-detail.service';

interface MobileBranchStockSheetProps {
  visible: boolean;
  sucursales: MobileBranchStock[];
  selectedTalla?: string;
  selectedColor?: string;
  onClose: () => void;
}

export const MobileBranchStockSheet: React.FC<MobileBranchStockSheetProps> = ({
  visible,
  sucursales,
  selectedTalla,
  selectedColor,
  onClose,
}) => {
  const groupedByCity = sucursales.reduce<Record<string, MobileBranchStock[]>>((acc, curr) => {
    const city = curr.ciudad || 'Otras ciudades';
    if (!acc[city]) acc[city] = [];
    acc[city].push(curr);
    return acc;
  }, {});

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheetContainer}>
          {/* Cabecera */}
          <View style={styles.sheetHeader}>
            <View style={styles.titleGroup}>
              <Text style={styles.headerIcon}>🏬</Text>
              <Text style={styles.sheetTitle}>Disponibilidad en Tiendas</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {selectedTalla && selectedColor && (
            <View style={styles.variantBadge}>
              <Text style={styles.variantBadgeText}>
                Variante: {selectedColor} / Talla {selectedTalla}
              </Text>
            </View>
          )}

          <ScrollView contentContainerStyle={styles.scrollContent}>
            {Object.keys(groupedByCity).length === 0 ? (
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyIcon}>ℹ️</Text>
                <Text style={styles.emptyText}>No hay inventario registrado en tiendas para esta variante.</Text>
              </View>
            ) : (
              Object.entries(groupedByCity).map(([city, branches]) => (
                <View key={city} style={styles.citySection}>
                  <Text style={styles.cityTitle}>{city}</Text>
                  {branches.map((b) => {
                    const isAvailable = b.stock_disponible > 0;
                    return (
                      <View key={b.id_sucursal} style={styles.branchCard}>
                        <View style={styles.branchInfo}>
                          <Text style={styles.branchName}>{b.nombre}</Text>
                          <Text style={styles.branchAddress}>{b.direccion}</Text>
                        </View>
                        <View style={[styles.stockBadge, isAvailable ? styles.stockAvailable : styles.stockOut]}>
                          <Text style={[styles.stockBadgeText, isAvailable ? styles.stockAvailableText : styles.stockOutText]}>
                            {isAvailable ? `Disponible (${b.stock_disponible} u.)` : 'Agotado'}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '75%',
    paddingBottom: 24,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  headerIcon: {
    fontSize: 18,
  },
  closeBtn: {
    padding: 4,
  },
  closeText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '700',
  },
  variantBadge: {
    backgroundColor: '#F3F4F6',
    marginHorizontal: 20,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  variantBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 20,
    gap: 16,
  },
  citySection: {
    gap: 8,
  },
  cityTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: '#6B7280',
    letterSpacing: 0.5,
  },
  branchCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    gap: 10,
  },
  branchInfo: {
    flex: 1,
  },
  branchName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  branchAddress: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  stockBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  stockAvailable: {
    backgroundColor: '#DEF7EC',
  },
  stockAvailableText: {
    color: '#03543F',
  },
  stockOut: {
    backgroundColor: '#FDE8E8',
  },
  stockOutText: {
    color: '#9B1C1C',
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  emptyIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});
