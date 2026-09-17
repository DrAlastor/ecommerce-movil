import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function CartBenefitsBanner() {
  return (
    <View style={styles.banner}>
      <View style={styles.item}>
        <Text style={styles.icon}>✨</Text>
        <Text style={styles.text}>Prendas Exclusivas</Text>
      </View>
      <View style={styles.separator} />
      <View style={styles.item}>
        <Text style={styles.icon}>🔒</Text>
        <Text style={styles.text}>Pago 100% Seguro</Text>
      </View>
      <View style={styles.separator} />
      <View style={styles.item}>
        <Text style={styles.icon}>🚚</Text>
        <Text style={styles.text}>Envío Rápido</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#F7F3EE',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 16,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  icon: {
    fontSize: 12,
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
    color: '#635345',
  },
  separator: {
    width: 1,
    height: 14,
    backgroundColor: '#E2DAD0',
  },
});
