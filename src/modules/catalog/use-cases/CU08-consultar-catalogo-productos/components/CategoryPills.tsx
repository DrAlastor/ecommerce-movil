import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

interface CategoryItem {
  id: string;
  name: string;
}

interface CategoryPillsProps {
  categories: CategoryItem[];
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  onOpenFilters: () => void;
  hasActiveFilters: boolean;
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  onOpenFilters,
  hasActiveFilters,
}) => {
  const renderCategory = ({ item }: { item: CategoryItem }) => {
    const isSelected = selectedCategory.toLowerCase() === item.id.toLowerCase();
    return (
      <TouchableOpacity
        style={[styles.categoryButton, isSelected && styles.categoryButtonSelected]}
        onPress={() => onSelectCategory(item.id)}
      >
        <Text style={[styles.categoryText, isSelected && styles.categoryTextSelected]}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.filterRow}>
      <TouchableOpacity
        style={[styles.filterButton, hasActiveFilters && styles.filterButtonActive]}
        onPress={onOpenFilters}
      >
        <Text
          style={[styles.filterButtonText, hasActiveFilters && styles.filterButtonTextActive]}
        >
          Filtros ▾
        </Text>
      </TouchableOpacity>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={renderCategory}
        contentContainerStyle={styles.categoriesList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingLeft: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginRight: 10,
    backgroundColor: '#FFFFFF',
  },
  filterButtonActive: {
    backgroundColor: '#1A1A1A',
    borderColor: '#1A1A1A',
  },
  filterButtonText: { fontSize: 13, color: '#1A1A1A', fontWeight: '500' },
  filterButtonTextActive: { color: '#FFFFFF' },
  categoriesList: { paddingRight: 16 },
  categoryButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  categoryButtonSelected: { backgroundColor: '#1A1A1A' },
  categoryText: { fontSize: 13, color: '#4B5563' },
  categoryTextSelected: { color: '#FFFFFF', fontWeight: '600' },
});
