/**
 * @caso-de-uso CU21 — Realizar compra digital
 * @subsistema Ventas, Pagos y Compras
 * @capa Boundary — Aplicación móvil
 * @responsabilidad Implementa una parte reutilizable de la interfaz de Aplicación móvil y comunica eventos al controlador de presentación.
 * @secuencia Cliente -> checkout -> controlador de compra -> servicios de compra y pago -> Venta/DetalleVenta/Pago/Inventario.
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import type { MobileBranch } from '../../../../branches-inventory/use-cases/CU14-consultar-sucursales/types';

interface BranchPickupSelectorProps {
  branches: MobileBranch[];
  selectedBranchId: number | null;
  onSelectBranch: (id: number) => void;
  recipient: string;
  setRecipient: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  pickupNotes: string;
  setPickupNotes: (val: string) => void;
  isLoading: boolean;
}

export function BranchPickupSelector({
  branches,
  selectedBranchId,
  onSelectBranch,
  recipient,
  setRecipient,
  phone,
  setPhone,
  pickupNotes,
  setPickupNotes,
  isLoading,
}: BranchPickupSelectorProps) {
  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.sectionHeader}>
        <View style={styles.iconCircle}>
          <Text style={styles.icon}>🏪</Text>
        </View>
        <View>
          <Text style={styles.sectionTitle}>Punto de Recojo en Tienda</Text>
          <Text style={styles.sectionSubtitle}>Selecciona la boutique para retirar tu compra</Text>
        </View>
      </View>

      {/* Lista de Sucursales */}
      <Text style={styles.inputLabel}>Seleccionar Sucursal Dressly *</Text>

      {isLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color="#8C5E35" />
          <Text style={styles.loadingText}>Cargando boutiques disponibles...</Text>
        </View>
      ) : branches.length === 0 ? (
        <View style={styles.emptyBranchesBox}>
          <Text style={styles.emptyBranchesText}>
            No se encontraron sucursales activas en este momento.
          </Text>
        </View>
      ) : (
        <View style={styles.branchesList}>
          {branches.map((b) => {
            const isSelected = selectedBranchId === b.id_sucursal;
            return (
              <TouchableOpacity
                key={b.id_sucursal}
                style={[styles.branchCard, isSelected && styles.branchCardSelected]}
                onPress={() => onSelectBranch(b.id_sucursal)}
                activeOpacity={0.7}
              >
                <View style={styles.branchHeaderRow}>
                  <View style={styles.branchNameRow}>
                    <Text style={[styles.branchName, isSelected && styles.branchNameSelected]}>
                      {b.nombre}
                    </Text>
                    {b.ciudad && (
                      <View style={styles.cityBadge}>
                        <Text style={styles.cityBadgeText}>{b.ciudad.nombre}</Text>
                      </View>
                    )}
                  </View>

                  <View
                    style={[
                      styles.radioOuter,
                      isSelected && styles.radioOuterSelected,
                    ]}
                  >
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                </View>

                <Text style={styles.branchAddress}>{b.direccion}</Text>

                <View style={styles.branchMetaRow}>
                  <Text style={styles.branchHours}>
                    🕒 {b.hora_apertura?.substring(0, 5) || '09:00'} -{' '}
                    {b.hora_cierre?.substring(0, 5) || '20:00'}
                  </Text>
                  {b.telefono && (
                    <Text style={styles.branchPhone}>📞 {b.telefono}</Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Datos de la persona que retira */}
      <View style={styles.divider} />

      <Text style={styles.subSectionTitle}>Datos de quien retira en boutique</Text>

      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>Nombre completo de quien retira *</Text>
        <TextInput
          style={styles.textInput}
          value={recipient}
          onChangeText={setRecipient}
          placeholder="Ej. Ana Morales"
          placeholderTextColor="#A89F95"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>Teléfono de contacto / WhatsApp *</Text>
        <TextInput
          style={styles.textInput}
          value={phone}
          onChangeText={setPhone}
          placeholder="Ej. 70012345"
          placeholderTextColor="#A89F95"
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>Indicaciones para el personal de boutique (Opcional)</Text>
        <TextInput
          style={[styles.textInput, styles.notesInput]}
          value={pickupNotes}
          onChangeText={setPickupNotes}
          placeholder="Ej. Retiraré el viernes por la tarde, pedir empaque para regalo..."
          placeholderTextColor="#A89F95"
          multiline
          numberOfLines={2}
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
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F0ECE8',
    shadowColor: '#1C1510',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FAF5EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1510',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#7D7065',
    marginTop: 2,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3B332C',
    marginBottom: 8,
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    color: '#8C5E35',
  },
  emptyBranchesBox: {
    padding: 14,
    backgroundColor: '#FAF8F5',
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyBranchesText: {
    fontSize: 13,
    color: '#7D7065',
    textAlign: 'center',
  },
  branchesList: {
    gap: 10,
    marginBottom: 6,
  },
  branchCard: {
    backgroundColor: '#FAF8F5',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#EFEAE4',
  },
  branchCardSelected: {
    backgroundColor: '#FDFBF7',
    borderColor: '#8C5E35',
  },
  branchHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  branchNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  branchName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1510',
  },
  branchNameSelected: {
    color: '#8C5E35',
    fontWeight: '800',
  },
  cityBadge: {
    backgroundColor: '#EFEAE4',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  cityBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7D7065',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D4C9BD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: '#8C5E35',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#8C5E35',
  },
  branchAddress: {
    fontSize: 12,
    color: '#5C5046',
    marginBottom: 6,
    lineHeight: 16,
  },
  branchMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  branchHours: {
    fontSize: 11,
    color: '#7D7065',
  },
  branchPhone: {
    fontSize: 11,
    color: '#7D7065',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0ECE8',
    marginVertical: 16,
  },
  subSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1C1510',
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  formGroup: {
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#E8E2DA',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1C1510',
  },
  notesInput: {
    minHeight: 55,
    textAlignVertical: 'top',
  },
});
