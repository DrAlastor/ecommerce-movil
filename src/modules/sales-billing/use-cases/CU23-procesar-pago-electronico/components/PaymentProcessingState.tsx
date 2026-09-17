import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

export function PaymentProcessingState() {
  return (
    <View style={styles.container}>
      <View style={styles.spinnerCircle}>
        <ActivityIndicator size="large" color="#8C5E35" />
      </View>
      <Text style={styles.title}>Procesando Pago Seguro</Text>
      <Text style={styles.subtitle}>
        Estamos comunicando con la pasarela bancaria. No cierres esta ventana...
      </Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>🔒 Conexión Encriptada TLS 1.3</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  spinnerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FAF5EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EFE7DC',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1C1510',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: '#8C7D70',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  badge: {
    backgroundColor: '#FAF8F5',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8E2DA',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5C4E43',
  },
});
