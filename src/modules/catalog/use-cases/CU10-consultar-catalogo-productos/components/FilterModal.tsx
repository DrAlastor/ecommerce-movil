import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, TextInput } from 'react-native';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
  currentFilters: any;
}

const SIZES = ['XS', 'S', 'M', 'L', 'XL'];
const COLORS = ['Negro', 'Blanco', 'Beige', 'Rojo', 'Azul'];

export default function FilterModal({ visible, onClose, onApply, currentFilters }: FilterModalProps) {
  const [selectedSizes, setSelectedSizes] = useState<string[]>(currentFilters.sizes || []);
  const [selectedColors, setSelectedColors] = useState<string[]>(currentFilters.colors || []);
  const [minPrice, setMinPrice] = useState<string>(currentFilters.minPrice || '');
  const [maxPrice, setMaxPrice] = useState<string>(currentFilters.maxPrice || '');

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
    });
    onClose();
  };

  const handleClear = () => {
    setSelectedSizes([]);
    setSelectedColors([]);
    setMinPrice('');
    setMaxPrice('');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Filtros</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* Tallas */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Talla</Text>
              <View style={styles.pillContainer}>
                {SIZES.map((size) => {
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
                {COLORS.map((color) => {
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
                  keyboardType="numeric"
                  value={minPrice}
                  onChangeText={setMinPrice}
                />
                <Text style={styles.priceDivider}>-</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="Máximo"
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
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: '80%',
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  },
  scrollBody: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
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
  },
  pillSelected: {
    backgroundColor: '#1A1A1A',
    borderColor: '#1A1A1A',
  },
  pillText: {
    color: '#6B6B6B',
    fontSize: 14,
  },
  pillTextSelected: {
    color: '#FFFFFF',
    fontWeight: '500',
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
    fontSize: 16,
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
    fontSize: 16,
    fontWeight: '600',
  },
});
