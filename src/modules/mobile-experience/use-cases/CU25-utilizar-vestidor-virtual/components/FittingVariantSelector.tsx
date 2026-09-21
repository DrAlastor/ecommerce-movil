import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import type { ArVariant, ProductSummary } from '../types/virtual-fitting.types';

interface FittingVariantSelectorProps {
  product: ProductSummary;
  selectedVariant: ArVariant | null;
  tallas: Array<{ id_talla: number; codigo: string }>;
  colores: Array<{ id_color: number; nombre: string; codigo_hex: string | null }>;
  selectedTallaId: number | null;
  selectedColorId: number | null;
  onSelectTalla: (idTalla: number) => void;
  onSelectColor: (idColor: number) => void;
}

export const FittingVariantSelector: React.FC<FittingVariantSelectorProps> = ({
  product,
  selectedVariant,
  tallas,
  colores,
  selectedTallaId,
  selectedColorId,
  onSelectTalla,
  onSelectColor,
}) => {
  const stock = selectedVariant?.total_stock ?? 0;
  const inStock = stock > 0;

  return (
    <View style={styles.container}>
      {/* Encabezado: Título y Precios */}
      <View style={styles.headerRow}>
        <View style={styles.titleColumn}>
          <Text style={styles.categoryBadge}>{product.categoria}</Text>
          <Text style={styles.productName} numberOfLines={1}>
            {product.nombre}
          </Text>
          {selectedVariant && (
            <Text style={styles.skuText}>SKU: {selectedVariant.sku}</Text>
          )}
        </View>

        <View style={styles.priceColumn}>
          {selectedVariant?.tiene_descuento ? (
            <>
              <View style={styles.discountRow}>
                <Text style={styles.discountTag}>
                  -{selectedVariant.descuento_porcentaje}%
                </Text>
                <Text style={styles.originalPrice}>
                  Bs {selectedVariant.precio_variante.toFixed(2)}
                </Text>
              </View>
              <Text style={styles.finalPrice}>
                Bs {selectedVariant.precio_final.toFixed(2)}
              </Text>
            </>
          ) : (
            <Text style={styles.finalPrice}>
              Bs {(selectedVariant?.precio_final ?? product.precio_base).toFixed(2)}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.divider} />

      {/* Selector de Tallas */}
      <View style={styles.sectionRow}>
        <View style={styles.sectionLabelRow}>
          <Text style={styles.sectionLabel}>Talla:</Text>
          {selectedVariant && (
            <Text style={styles.sectionValueHighlight}>{selectedVariant.talla.codigo}</Text>
          )}
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsScroll}
        >
          {tallas.map((t) => {
            const isSelected = t.id_talla === selectedTallaId;
            return (
              <TouchableOpacity
                key={t.id_talla}
                style={[styles.tallaChip, isSelected && styles.tallaChipActive]}
                onPress={() => onSelectTalla(t.id_talla)}
                activeOpacity={0.8}
              >
                <Text
                  style={[styles.tallaChipText, isSelected && styles.tallaChipTextActive]}
                >
                  {t.codigo}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Selector de Colores */}
      <View style={styles.sectionRow}>
        <View style={styles.sectionLabelRow}>
          <Text style={styles.sectionLabel}>Color:</Text>
          {selectedVariant && (
            <Text style={styles.sectionValueHighlight}>{selectedVariant.color.nombre}</Text>
          )}
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.swatchesScroll}
        >
          {colores.map((c) => {
            const isSelected = c.id_color === selectedColorId;
            const bg = c.codigo_hex || '#4B5563';
            return (
              <TouchableOpacity
                key={c.id_color}
                style={[
                  styles.colorSwatch,
                  { backgroundColor: bg },
                  isSelected && styles.colorSwatchActive,
                ]}
                onPress={() => onSelectColor(c.id_color)}
                activeOpacity={0.8}
              >
                {isSelected && <Text style={styles.swatchCheck}>✓</Text>}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Indicadores de estado (RA y Stock) */}
      <View style={styles.statusRow}>
        <View style={styles.statusItem}>
          <Text style={styles.statusDotGreen}>●</Text>
          <Text style={styles.statusText}>Modelo 3D y RA habilitados</Text>
        </View>
        <View style={styles.statusItem}>
          <Text style={inStock ? styles.statusDotBlue : styles.statusDotAmber}>●</Text>
          <Text style={styles.statusText}>
            {inStock ? `${stock} unid. disponibles` : 'Sin stock inmediato'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleColumn: {
    flex: 1,
    paddingRight: 12,
  },
  categoryBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#C4956A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  productName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  skuText: {
    fontSize: 11,
    color: '#888888',
    marginTop: 2,
  },
  priceColumn: {
    alignItems: 'flex-end',
  },
  discountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  discountTag: {
    backgroundColor: '#DC2626',
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  originalPrice: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  finalPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 12,
  },
  sectionRow: {
    marginBottom: 10,
  },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555555',
    marginRight: 6,
  },
  sectionValueHighlight: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  chipsScroll: {
    flexDirection: 'row',
    gap: 8,
  },
  tallaChip: {
    minWidth: 42,
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tallaChipActive: {
    borderColor: '#1A1A1A',
    backgroundColor: '#1A1A1A',
  },
  tallaChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  tallaChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  swatchesScroll: {
    flexDirection: 'row',
    gap: 10,
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorSwatchActive: {
    borderColor: '#1A1A1A',
    transform: [{ scale: 1.15 }],
  },
  swatchCheck: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowRadius: 2,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    padding: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDotGreen: {
    color: '#10B981',
    fontSize: 10,
    marginRight: 5,
  },
  statusDotBlue: {
    color: '#3B82F6',
    fontSize: 10,
    marginRight: 5,
  },
  statusDotAmber: {
    color: '#F59E0B',
    fontSize: 10,
    marginRight: 5,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
  },
});

export default FittingVariantSelector;
