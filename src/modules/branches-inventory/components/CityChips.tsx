import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import type { MobileCity } from '../types';

interface CityChipsProps {
  cities: MobileCity[];
  totalBranches: number;
  selectedCityId: number | null;
  onSelectCity: (id: number | null) => void;
}

export const CityChips: React.FC<CityChipsProps> = React.memo(({
  cities,
  totalBranches,
  selectedCityId,
  onSelectCity,
}) => {
  const data = React.useMemo(() => [
    { id_ciudad: 0, nombre: 'Todas', total_sucursales: totalBranches },
    ...cities,
  ], [cities, totalBranches]);

  const renderItem = React.useCallback(({ item }: { item: { id_ciudad: number; nombre: string; total_sucursales: number } }) => {
    const isSelected = item.id_ciudad === 0 ? selectedCityId === null : selectedCityId === item.id_ciudad;

    return (
      <TouchableOpacity
        style={[styles.cityChip, isSelected && styles.cityChipActive]}
        onPress={() => onSelectCity(item.id_ciudad === 0 ? null : item.id_ciudad)}
        activeOpacity={0.7}
      >
        <Text style={[styles.cityChipText, isSelected && styles.cityChipTextActive]}>
          {item.nombre}
        </Text>
        {item.total_sucursales > 0 && (
          <View style={[styles.cityChipBadge, isSelected && styles.cityChipBadgeActive]}>
            <Text style={[styles.cityChipBadgeText, isSelected && styles.cityChipBadgeTextActive]}>
              {item.total_sucursales}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }, [selectedCityId, onSelectCity]);

  return (
    <View style={styles.citiesScrollWrapper}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={data}
        keyExtractor={(item) => item.id_ciudad.toString()}
        contentContainerStyle={styles.citiesListContent}
        renderItem={renderItem}
      />
    </View>
  );
});

CityChips.displayName = 'CityChips';

const styles = StyleSheet.create({
  citiesScrollWrapper: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ECE7E0',
  },
  citiesListContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  cityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#F8F5F1',
    borderWidth: 1,
    borderColor: '#ECE7E0',
    marginRight: 6,
  },
  cityChipActive: {
    backgroundColor: '#1C1510',
    borderColor: '#1C1510',
  },
  cityChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666666',
  },
  cityChipTextActive: {
    color: '#FFFFFF',
  },
  cityChipBadge: {
    marginLeft: 6,
    backgroundColor: 'rgba(0,0,0,0.06)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  cityChipBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  cityChipBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#666666',
  },
  cityChipBadgeTextActive: {
    color: '#FFFFFF',
  },
});
