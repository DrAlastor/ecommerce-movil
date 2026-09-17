import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface QrPaymentViewProps {
  totalAmount: number;
}

export function QrPaymentView({ totalAmount }: QrPaymentViewProps) {
  return (
    <View style={styles.container}>
      <View style={styles.qrCard}>
        <View style={styles.qrPlaceholder}>
          <Text style={styles.qrLargeIcon}>🏁</Text>
          <Text style={styles.qrCodeText}>CÓDIGO QR SIMPLE</Text>
          <Text style={styles.qrSubText}>Válido por 10:00 minutos</Text>
        </View>

        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>¿Cómo pagar con QR?</Text>
          <Text style={styles.instructionStep}>1. Abre la app de tu banco (BNB, BCP, Mercantil, etc.).</Text>
          <Text style={styles.instructionStep}>2. Selecciona la opción "Pago Simple QR".</Text>
          <Text style={styles.instructionStep}>3. Escanea o carga este comprobante por {totalAmount.toFixed(2)} Bs.</Text>
          <Text style={styles.instructionStep}>4. Presiona "Confirmar Pago" a continuación.</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 16,
  },
  qrCard: {
    width: '100%',
    backgroundColor: '#FAF8F5',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EFEBE6',
    alignItems: 'center',
  },
  qrPlaceholder: {
    width: 170,
    height: 170,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#1C1510',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    marginBottom: 16,
  },
  qrLargeIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  qrCodeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1C1510',
  },
  qrSubText: {
    fontSize: 10,
    color: '#8C5E35',
    marginTop: 4,
    fontWeight: '600',
  },
  instructions: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F0ECE8',
  },
  instructionsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1510',
    marginBottom: 6,
  },
  instructionStep: {
    fontSize: 12,
    color: '#6E6259',
    lineHeight: 18,
    marginBottom: 3,
  },
});
