/**
 * @caso-de-uso CU21 — Realizar compra digital
 * @subsistema Ventas, Pagos y Compras
 * @capa Boundary — Aplicación móvil
 * @responsabilidad Implementa una parte reutilizable de la interfaz de Aplicación móvil y comunica eventos al controlador de presentación.
 * @secuencia Cliente -> checkout -> controlador de compra -> servicios de compra y pago -> Venta/DetalleVenta/Pago/Inventario.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export type DeliveryType = 'domicilio' | 'retiro_sucursal';

interface DeliveryMethodTabsProps {
  selectedType: DeliveryType;
  onSelectType: (type: DeliveryType) => void;
}

export function DeliveryMethodTabs({
  selectedType,
  onSelectType,
}: DeliveryMethodTabsProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>MÉTODO DE ENTREGA</Text>
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[
            styles.tabCard,
            selectedType === 'domicilio' && styles.tabCardActive,
          ]}
          onPress={() => onSelectType('domicilio')}
          activeOpacity={0.8}
        >
          <View style={styles.iconCircle}>
            <Text style={styles.tabIcon}>🚚</Text>
          </View>
          <View style={styles.tabTextContainer}>
            <Text
              style={[
                styles.tabTitle,
                selectedType === 'domicilio' && styles.tabTitleActive,
              ]}
            >
              Envío a Domicilio
            </Text>
            <Text style={styles.tabSubtitle}>A tu puerta</Text>
          </View>
          {selectedType === 'domicilio' && (
            <View style={styles.activeCheckCircle}>
              <Text style={styles.activeCheckText}>✓</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabCard,
            selectedType === 'retiro_sucursal' && styles.tabCardActive,
          ]}
          onPress={() => onSelectType('retiro_sucursal')}
          activeOpacity={0.8}
        >
          <View style={styles.iconCircle}>
            <Text style={styles.tabIcon}>🏪</Text>
          </View>
          <View style={styles.tabTextContainer}>
            <Text
              style={[
                styles.tabTitle,
                selectedType === 'retiro_sucursal' && styles.tabTitleActive,
              ]}
            >
              Recojo en Sucursal
            </Text>
            <Text style={styles.tabSubtitle}>Gratis en tienda</Text>
          </View>
          {selectedType === 'retiro_sucursal' && (
            <View style={styles.activeCheckCircle}>
              <Text style={styles.activeCheckText}>✓</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8C5E35',
    letterSpacing: 1,
    marginBottom: 8,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  tabCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1.5,
    borderColor: '#EFEAE4',
    shadowColor: '#1C1510',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  tabCardActive: {
    borderColor: '#8C5E35',
    backgroundColor: '#FDFBF7',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FAF8F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  tabIcon: {
    fontSize: 18,
  },
  tabTextContainer: {
    flex: 1,
  },
  tabTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3B332C',
  },
  tabTitleActive: {
    color: '#1C1510',
    fontWeight: '800',
  },
  tabSubtitle: {
    fontSize: 11,
    color: '#8C7E72',
    marginTop: 1,
  },
  activeCheckCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#8C5E35',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  activeCheckText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
});
