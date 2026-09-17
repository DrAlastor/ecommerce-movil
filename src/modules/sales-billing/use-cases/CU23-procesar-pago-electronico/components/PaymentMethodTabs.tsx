import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { PaymentMethod } from '../types/payment.types';

interface PaymentMethodTabsProps {
  currentMethod: PaymentMethod;
  onSelectMethod: (method: PaymentMethod) => void;
}

export function PaymentMethodTabs({ currentMethod, onSelectMethod }: PaymentMethodTabsProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.tab, currentMethod === 'tarjeta' && styles.tabActive]}
        onPress={() => onSelectMethod('tarjeta')}
        activeOpacity={0.8}
      >
        <Text style={styles.tabIcon}>💳</Text>
        <Text style={[styles.tabText, currentMethod === 'tarjeta' && styles.tabTextActive]}>
          Tarjeta
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, currentMethod === 'qr' && styles.tabActive]}
        onPress={() => onSelectMethod('qr')}
        activeOpacity={0.8}
      >
        <Text style={styles.tabIcon}>📱</Text>
        <Text style={[styles.tabText, currentMethod === 'qr' && styles.tabTextActive]}>
          Pago QR
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FAF8F5',
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EFEBE6',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  tabActive: {
    backgroundColor: '#1C1510',
    shadowColor: '#1C1510',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  tabIcon: {
    fontSize: 16,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7D7065',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
});
