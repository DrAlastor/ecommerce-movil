import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface PurchasesEmptyStateProps {
  onStartShopping: () => void;
}

export function PurchasesEmptyState({ onStartShopping }: PurchasesEmptyStateProps) {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconCircle}>
        <Text style={styles.emptyIcon}>📦</Text>
      </View>
      <Text style={styles.emptyTitle}>Sin compras registradas</Text>
      <Text style={styles.emptySubtitle}>
        Aún no has realizado ninguna compra en nuestra tienda digital. Explora nuestras colecciones exclusivas.
      </Text>
      <TouchableOpacity
        style={styles.shopBtn}
        onPress={onStartShopping}
        activeOpacity={0.8}
      >
        <Text style={styles.shopBtnText}>Ver Catálogo</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    paddingVertical: 60,
    paddingHorizontal: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FAF5EE',
    borderWidth: 1,
    borderColor: '#EFE7DC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyIcon: {
    fontSize: 36,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1C1510',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#8C7D70',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 22,
  },
  shopBtn: {
    backgroundColor: '#1C1510',
    paddingVertical: 12,
    paddingHorizontal: 26,
    borderRadius: 12,
  },
  shopBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
