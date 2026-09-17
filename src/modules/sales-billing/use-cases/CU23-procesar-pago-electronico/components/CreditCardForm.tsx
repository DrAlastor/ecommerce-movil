import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

interface CreditCardFormProps {
  cardNumber: string;
  onCardNumberChange: (text: string) => void;
  cardHolder: string;
  onCardHolderChange: (text: string) => void;
  expiry: string;
  onExpiryChange: (text: string) => void;
  cvc: string;
  onCvcChange: (text: string) => void;
  onAutofillTestCard: () => void;
}

export function CreditCardForm({
  cardNumber,
  onCardNumberChange,
  cardHolder,
  onCardHolderChange,
  expiry,
  onExpiryChange,
  cvc,
  onCvcChange,
  onAutofillTestCard,
}: CreditCardFormProps) {
  return (
    <View style={styles.container}>
      {/* Botón de llenado rápido de tarjeta de prueba */}
      <TouchableOpacity
        style={styles.testCardBanner}
        onPress={onAutofillTestCard}
        activeOpacity={0.8}
      >
        <View style={styles.testCardLeft}>
          <Text style={styles.testCardBadge}>TEST</Text>
          <Text style={styles.testCardText}>Usar Tarjeta de Prueba Stripe</Text>
        </View>
        <Text style={styles.testCardArrow}>⚡ Auto-completar</Text>
      </TouchableOpacity>

      {/* Número de Tarjeta */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Número de Tarjeta</Text>
        <View style={styles.inputWithIcon}>
          <TextInput
            style={styles.input}
            value={cardNumber}
            onChangeText={onCardNumberChange}
            placeholder="0000 0000 0000 0000"
            placeholderTextColor="#A89F95"
            keyboardType="number-pad"
            maxLength={19}
          />
          <Text style={styles.cardBrandIcon}>💳</Text>
        </View>
      </View>

      {/* Titular */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Nombre del Titular</Text>
        <TextInput
          style={styles.input}
          value={cardHolder}
          onChangeText={onCardHolderChange}
          placeholder="Ej. ANA MORALES SUAREZ"
          placeholderTextColor="#A89F95"
          autoCapitalize="characters"
        />
      </View>

      {/* Vencimiento y CVC */}
      <View style={styles.row}>
        <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
          <Text style={styles.label}>Vencimiento</Text>
          <TextInput
            style={styles.input}
            value={expiry}
            onChangeText={onExpiryChange}
            placeholder="MM/AA"
            placeholderTextColor="#A89F95"
            keyboardType="number-pad"
            maxLength={5}
          />
        </View>

        <View style={[styles.formGroup, { flex: 1, marginLeft: 10 }]}>
          <Text style={styles.label}>CVC / CVV</Text>
          <TextInput
            style={styles.input}
            value={cvc}
            onChangeText={onCvcChange}
            placeholder="123"
            placeholderTextColor="#A89F95"
            keyboardType="number-pad"
            maxLength={4}
            secureTextEntry
          />
        </View>
      </View>

      {/* Seguridad */}
      <View style={styles.securityRow}>
        <Text style={styles.securityIcon}>🔒</Text>
        <Text style={styles.securityText}>
          Encriptación SSL de 256 bits certificada por Stripe. Tus datos no se almacenan en nuestros servidores.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  testCardBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3EFEA',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E6DEC',
  },
  testCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  testCardBadge: {
    backgroundColor: '#1C1510',
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  testCardText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C1510',
  },
  testCardArrow: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8C5E35',
  },
  formGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5C4E43',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#E8E2DA',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1C1510',
  },
  inputWithIcon: {
    position: 'relative',
    justifyContent: 'center',
  },
  cardBrandIcon: {
    position: 'absolute',
    right: 14,
    fontSize: 18,
  },
  row: {
    flexDirection: 'row',
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 6,
    paddingHorizontal: 4,
  },
  securityIcon: {
    fontSize: 14,
  },
  securityText: {
    flex: 1,
    fontSize: 11,
    color: '#9C8F84',
    lineHeight: 16,
  },
});
