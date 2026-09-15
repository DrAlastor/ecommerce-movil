import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import type { MobileProductVariant } from '../services/product-detail.service';

interface MobileVariantSelectorProps {
  colores: Array<{ id_color: number; nombre: string; codigo_hex: string | null }>;
  tallas: Array<{ id_talla: number; codigo: string }>;
  variantes: MobileProductVariant[];
  selectedColorId: number | null;
  selectedTallaId: number | null;
  hasSizeGuide: boolean;
  onSelectColor: (id_color: number) => void;
  onSelectTalla: (id_talla: number) => void;
  onOpenSizeGuide: () => void;
}

export const MobileVariantSelector: React.FC<MobileVariantSelectorProps> = ({
  colores,
  tallas,
  variantes,
  selectedColorId,
  selectedTallaId,
  hasSizeGuide,
  onSelectColor,
  onSelectTalla,
  onOpenSizeGuide,
}) => {
  const activeColor = colores.find((c) => c.id_color === selectedColorId);

  const isSizeInStock = (id_talla: number) => {
    if (!selectedColorId) return true;
    const v = variantes.find(
      (item) => item.color.id_color === selectedColorId && item.talla.id_talla === id_talla,
    );
    return v ? v.total_stock > 0 : false;
  };

  return (
    <View style={styles.container}>
      {/* Selector de Color */}
      <View style={styles.sectionBlock}>
        <View style={styles.headerRow}>
          <Text style={styles.sectionLabel}>
            Color: <Text style={styles.boldLabel}>{activeColor?.nombre || 'Elige un color'}</Text>
          </Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.optionsRow}>
          {colores.map((color) => {
            const isSelected = color.id_color === selectedColorId;
            return (
              <TouchableOpacity
                key={color.id_color}
                style={[
                  styles.colorCircle,
                  { backgroundColor: color.codigo_hex || '#111827' },
                  isSelected && styles.colorCircleSelected,
                ]}
                onPress={() => onSelectColor(color.id_color)}
                activeOpacity={0.8}
              >
                {isSelected && (
                  <Text
                    style={[
                      styles.colorCheckmark,
                      {
                        color:
                          color.codigo_hex && color.codigo_hex.toLowerCase() === '#ffffff'
                            ? '#000000'
                            : '#FFFFFF',
                      },
                    ]}
                  >
                    ✓
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Selector de Talla */}
      <View style={styles.sectionBlock}>
        <View style={styles.headerRow}>
          <Text style={styles.sectionLabel}>Talla:</Text>
          {hasSizeGuide && (
            <TouchableOpacity onPress={onOpenSizeGuide} style={styles.guideTrigger} activeOpacity={0.7}>
              <Text style={styles.guideIcon}>📏</Text>
              <Text style={styles.guideTriggerText}>Guía de tallas</Text>
            </TouchableOpacity>
          )}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.optionsRow}>
          {tallas.map((talla) => {
            const isSelected = talla.id_talla === selectedTallaId;
            const inStock = isSizeInStock(talla.id_talla);

            return (
              <TouchableOpacity
                key={talla.id_talla}
                style={[
                  styles.sizeChip,
                  isSelected && styles.sizeChipSelected,
                  !inStock && styles.sizeChipOutOfStock,
                ]}
                onPress={() => onSelectTalla(talla.id_talla)}
                activeOpacity={0.8}
              >
                <Text style={[styles.sizeText, isSelected && styles.sizeTextSelected]}>
                  {talla.codigo}
                </Text>
                {!inStock && <View style={styles.diagonalSlash} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 14,
    gap: 16,
  },
  sectionBlock: {
    gap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionLabel: {
    fontSize: 14,
    color: '#4B5563',
  },
  boldLabel: {
    fontWeight: '700',
    color: '#111827',
  },
  guideTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  guideIcon: {
    fontSize: 13,
  },
  guideTriggerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4F46E5',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 2,
  },
  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorCheckmark: {
    fontSize: 12,
    fontWeight: '700',
  },
  colorCircleSelected: {
    borderColor: '#111827',
    borderWidth: 2.5,
  },
  sizeChip: {
    minWidth: 48,
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  sizeChipSelected: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  sizeChipOutOfStock: {
    opacity: 0.45,
    backgroundColor: '#F9FAFB',
  },
  sizeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  sizeTextSelected: {
    color: '#FFFFFF',
  },
  diagonalSlash: {
    position: 'absolute',
    height: 1,
    left: '10%',
    right: '10%',
    backgroundColor: '#DC2626',
    transform: [{ rotate: '-30deg' }],
  },
});
