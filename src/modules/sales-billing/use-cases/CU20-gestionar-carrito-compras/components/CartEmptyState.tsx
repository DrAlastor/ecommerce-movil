import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface CartEmptyStateProps {
  onExplore: () => void;
}

export function CartEmptyState({ onExplore }: CartEmptyStateProps) {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconCircle}>
        <Text style={styles.emptyIcon}>🛍️</Text>
      </View>
      <Text style={styles.emptyTitle}>Tu bolsa está vacía</Text>
      <Text style={styles.emptySubtitle}>
        Explora las colecciones exclusivas de Dressly y añade tus prendas favoritas a tu bolsa.
      </Text>
      <TouchableOpacity
        style={styles.exploreBtn}
        onPress={onExplore}
        activeOpacity={0.8}
      >
        <Text style={styles.exploreBtnText}>Explorar Catálogo</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 36,
  },
  emptyIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FAF5EE',
    borderWidth: 1,
    borderColor: '#EFE7DC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyIcon: {
    fontSize: 42,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1C1510',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8C7D70',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 26,
  },
  exploreBtn: {
    backgroundColor: '#1C1510',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    shadowColor: '#1C1510',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
