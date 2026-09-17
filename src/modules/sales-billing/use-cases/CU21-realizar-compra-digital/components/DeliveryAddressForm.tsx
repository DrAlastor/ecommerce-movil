import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

const BOLIVIA_CITIES = [
  'Santa Cruz',
  'La Paz',
  'Cochabamba',
  'Sucre',
  'Tarija',
  'Oruro',
  'Potosí',
  'Beni',
  'Pando',
];

interface DeliveryAddressFormProps {
  recipient: string;
  setRecipient: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  city: string;
  setCity: (val: string) => void;
  address: string;
  setAddress: (val: string) => void;
  notes: string;
  setNotes: (val: string) => void;
}

export function DeliveryAddressForm({
  recipient,
  setRecipient,
  phone,
  setPhone,
  city,
  setCity,
  address,
  setAddress,
  notes,
  setNotes,
}: DeliveryAddressFormProps) {
  return (
    <View style={styles.card}>
      <View style={styles.sectionHeader}>
        <View style={styles.iconCircle}>
          <Text style={styles.icon}>📍</Text>
        </View>
        <View>
          <Text style={styles.sectionTitle}>Dirección de Entrega</Text>
          <Text style={styles.sectionSubtitle}>¿Dónde deseas recibir tu pedido?</Text>
        </View>
      </View>

      {/* Destinatario */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Nombre de quien recibe *</Text>
        <TextInput
          style={styles.input}
          value={recipient}
          onChangeText={setRecipient}
          placeholder="Ej. Ana Morales"
          placeholderTextColor="#A89F95"
        />
      </View>

      {/* Teléfono */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Teléfono de contacto / WhatsApp *</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="Ej. 70012345"
          placeholderTextColor="#A89F95"
          keyboardType="phone-pad"
        />
      </View>

      {/* Ciudad / Departamento */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Ciudad / Departamento *</Text>
        <View style={styles.cityChips}>
          {BOLIVIA_CITIES.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.cityChip, city === c && styles.cityChipActive]}
              onPress={() => setCity(c)}
              activeOpacity={0.7}
            >
              <Text style={[styles.cityChipText, city === c && styles.cityChipTextActive]}>
                {c}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Dirección */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Dirección exacta (Calle, Nro., Zona, Referencia) *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={address}
          onChangeText={setAddress}
          placeholder="Ej. Av. San Martín #450, Equipetrol, frente al hotel Los Tajibos"
          placeholderTextColor="#A89F95"
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Notas adicionales */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Instrucciones para el repartidor (opcional)</Text>
        <TextInput
          style={[styles.input, { minHeight: 44 }]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Ej. Dejar en recepción o timbre 3B"
          placeholderTextColor="#A89F95"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F0ECE8',
    shadowColor: '#1C1510',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FAF5EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  icon: {
    fontSize: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1510',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#8C7D70',
    marginTop: 1,
  },
  formGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4A3E34',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#E8E2DA',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1C1510',
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  cityChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cityChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#E8E2DA',
  },
  cityChipActive: {
    backgroundColor: '#1C1510',
    borderColor: '#1C1510',
  },
  cityChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#635345',
  },
  cityChipTextActive: {
    color: '#FFFFFF',
  },
});
