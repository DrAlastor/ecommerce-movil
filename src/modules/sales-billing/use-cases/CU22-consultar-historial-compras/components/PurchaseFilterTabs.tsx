import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { PurchaseFilter } from '../types/purchases.types';

interface PurchaseFilterTabsProps {
  selectedFilter: PurchaseFilter;
  onSelectFilter: (filter: PurchaseFilter) => void;
}

export function PurchaseFilterTabs({ selectedFilter, onSelectFilter }: PurchaseFilterTabsProps) {
  const tabs: { key: PurchaseFilter; label: string }[] = [
    { key: 'todos', label: 'Todas' },
    { key: 'pagada', label: 'Pagadas' },
    { key: 'pendiente', label: 'Pendientes' },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = selectedFilter === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onSelectFilter(tab.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FAF8F5',
    padding: 4,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#EFEBE6',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#1C1510',
    shadowColor: '#1C1510',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7D7065',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
