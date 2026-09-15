import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import type { MobileSizeGuideItem } from '../services/product-detail.service';

interface MobileSizeGuideModalProps {
  visible: boolean;
  categoryName: string;
  guideItems: MobileSizeGuideItem[];
  onClose: () => void;
}

export const MobileSizeGuideModal: React.FC<MobileSizeGuideModalProps> = ({
  visible,
  categoryName,
  guideItems,
  onClose,
}) => {
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modalBox}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Guía de Tallas — {categoryName}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.body}>
            <View style={styles.infoBanner}>
              <Text style={styles.infoIcon}>ℹ️</Text>
              <Text style={styles.infoText}>
                Medidas anatómicas en centímetros (cm) recomendadas para esta categoría.
              </Text>
            </View>

            {/* Table */}
            <View style={styles.table}>
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.th, { flex: 2 }]}>Zona</Text>
                <Text style={[styles.th, { flex: 1, textAlign: 'center' }]}>Talla</Text>
                <Text style={[styles.th, { flex: 1.2, textAlign: 'right' }]}>Rango</Text>
              </View>
              {guideItems.map((item) => (
                <View key={item.id_guia_talla} style={styles.tableRow}>
                  <Text style={[styles.td, { flex: 2, fontWeight: '600' }]}>{item.parte_cuerpo}</Text>
                  <Text style={[styles.td, { flex: 1, textAlign: 'center' }]}>{item.talla_etiqueta}</Text>
                  <Text style={[styles.td, { flex: 1.2, textAlign: 'right', color: '#4B5563' }]}>
                    {item.min_cm} - {item.max_cm} cm
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.closeActionBtn} onPress={onClose}>
            <Text style={styles.closeActionText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  closeBtn: {
    padding: 4,
  },
  closeText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '700',
  },
  body: {
    padding: 16,
    gap: 12,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    padding: 10,
    borderRadius: 8,
  },
  infoIcon: {
    fontSize: 14,
  },
  infoText: {
    fontSize: 12,
    color: '#1E40AF',
    flex: 1,
  },
  table: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  th: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  td: {
    fontSize: 13,
    color: '#111827',
  },
  closeActionBtn: {
    backgroundColor: '#111827',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeActionText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
