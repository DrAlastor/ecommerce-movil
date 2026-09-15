import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, TextInput } from 'react-native';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
  currentFilters: any;
  availableSizes?: string[];
  availableColors?: string[];
}

const DEFAULT_SIZES = ['XS', 'S', 'M', 'L', 'XL'];
const DEFAULT_COLORS = ['Negro', 'Blanco', 'Azul', 'Rojo', 'Verde'];

export default function FilterModal({
  visible,
  onClose,
  onApply,
  currentFilters,
  availableSizes = DEFAULT_SIZES,
  availableColors = DEFAULT_COLORS,
}: FilterModalProps) {
  const [selectedSizes, setSelectedSizes] = useState<string[]>(currentFilters.sizes || []);
  const [selectedColors, setSelectedColors] = useState<string[]>(currentFilters.colors || []);
  const [minPrice, setMinPrice] = useState<string>(currentFilters.minPrice || '');
  const [maxPrice, setMaxPrice] = useState<string>(currentFilters.maxPrice || '');
  const [onlySale, setOnlySale] = useState<boolean>(currentFilters.onlySale || false);
  const [selectedGender, setSelectedGender] = useState<string>(currentFilters.gender || 'all');

  useEffect(() => {
    if (visible) {
      setSelectedSizes(currentFilters.sizes || []);
      setSelectedColors(currentFilters.colors || []);
      setMinPrice(currentFilters.minPrice || '');
      setMaxPrice(currentFilters.maxPrice || '');
      setOnlySale(currentFilters.onlySale || false);
      setSelectedGender(currentFilters.gender || 'all');
    }
  }, [visible, currentFilters]);

  const toggleSelection = (item: string, list: string[], setList: (v: string[]) => void) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleApply = () => {
    onApply({
      sizes: selectedSizes,
      colors: selectedColors,
      minPrice,
      maxPrice,
      onlySale,
      gender: selectedGender,
    });
    onClose();
  };

  const handleClear = () => {
    setSelectedSizes([]);
    setSelectedColors([]);
    setMinPrice('');
    setMaxPrice('');
    setOnlySale(false);
    setSelectedGender('all');
  };

  const sizesToRender = availableSizes.length > 0 ? availableSizes : DEFAULT_SIZES;
  const colorsToRender = availableColors.length > 0 ? availableColors : DEFAULT_COLORS;

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Filtros Avanzados</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* Género */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Género</Text>
              <View style={styles.pillContainer}>
                {[
                  { label: 'Todos', value: 'all' },
                  { label: 'Mujer', value: 'Mujer' },
                  { label: 'Hombre', value: 'Hombre' },
                  { label: 'Unisex', value: 'Unisex' },
                ].map((g) => {
                  const isSelected = selectedGender === g.value;
                  return (
                    <TouchableOpacity
                      key={g.value}
                      style={[styles.pill, isSelected && styles.pillSelected]}
                      onPress={() => setSelectedGender(g.value)}
                    >
                      <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                        {g.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Promociones */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Promociones</Text>
              <TouchableOpacity
                style={[styles.salePill, onlySale && styles.salePillSelected]}
                onPress={() => setOnlySale(!onlySale)}
              >
                <Text style={[styles.salePillText, onlySale && styles.salePillTextSelected]}>
                  🏷️ Solo artículos con descuento
                </Text>
              </TouchableOpacity>
            </View>

            {/* Tallas */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Talla</Text>
              <View style={styles.pillContainer}>
                {sizesToRender.map((size) => {
                  const isSelected = selectedSizes.includes(size);
                  return (
                    <TouchableOpacity
                      key={size}
                      style={[styles.pill, isSelected && styles.pillSelected]}
                      onPress={() => toggleSelection(size, selectedSizes, setSelectedSizes)}
                    >
                      <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>{size}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Colores */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Color</Text>
              <View style={styles.pillContainer}>
                {colorsToRender.map((color) => {
                  const isSelected = selectedColors.includes(color);
                  return (
                    <TouchableOpacity
                      key={color}
                      style={[styles.pill, isSelected && styles.pillSelected]}
                      onPress={() => toggleSelection(color, selectedColors, setSelectedColors)}
                    >
                      <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>{color}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Precio */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Rango de Precio (Bs)</Text>
              <View style={styles.priceContainer}>
                <TextInput
                  style={styles.priceInput}
                  placeholder="Mínimo"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  value={minPrice}
                  onChangeText={setMinPrice}
                />
                <Text style={styles.priceDivider}>-</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="Máximo"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  value={maxPrice}
                  onChangeText={setMaxPrice}
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
              <Text style={styles.clearButtonText}>Limpiar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyButtonText}>Aplicar Filtros</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '82%',
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  closeText: {
    fontSize: 20,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  scrollBody: {
    padding: 20,
  },
  section: {
    marginBottom: 22,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 10,
  },
  pillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 20,
    backgroundColor: '#FAFAFA',
  },
  pillSelected: {
    backgroundColor: '#1A1A1A',
    borderColor: '#1A1A1A',
  },
  pillText: {
    color: '#4B5563',
    fontSize: 14,
  },
  pillTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  salePill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
  },
  salePillSelected: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  salePillText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '600',
  },
  salePillTextSelected: {
    color: '#FFFFFF',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priceInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#1A1A1A',
    backgroundColor: '#FAFAFA',
  },
  priceDivider: {
    fontSize: 16,
    color: '#6B6B6B',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    gap: 12,
    backgroundColor: '#FFFFFF',
  },
  clearButton: {
    flex: 1,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1A1A1A',
    borderRadius: 8,
  },
  clearButtonText: {
    color: '#1A1A1A',
    fontSize: 15,
    fontWeight: '600',
  },
  applyButton: {
    flex: 2,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
