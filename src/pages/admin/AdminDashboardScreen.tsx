import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Dimensions } from 'react-native';
import { useAuth } from '../../modules/users-security/shared/AuthContext';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export default function AdminDashboardScreen() {
  const { user, rol } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <Text style={styles.greeting}>Hola, {user?.empleado?.nombre || user?.email} 👋</Text>
          <Text style={styles.subtitle}>
            Estás conectado como <Text style={styles.roleBold}>{rol?.nombre}</Text>. Aquí tienes un resumen de la actividad reciente.
          </Text>
        </View>

        <View style={styles.grid}>
          <View style={styles.card}>
            <View style={[styles.iconWrapper, { backgroundColor: '#E0F2FE' }]}>
              <Text style={{ fontSize: 24 }}>🛍️</Text>
            </View>
            <View>
              <Text style={styles.cardTitle}>Ventas de Hoy</Text>
              <Text style={styles.cardValue}>Bs. 1,240.00</Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={[styles.iconWrapper, { backgroundColor: '#FEF08A' }]}>
              <Text style={{ fontSize: 24 }}>📦</Text>
            </View>
            <View>
              <Text style={styles.cardTitle}>Pedidos Pendientes</Text>
              <Text style={styles.cardValue}>14</Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={[styles.iconWrapper, { backgroundColor: '#DCFCE7' }]}>
              <Text style={{ fontSize: 24 }}>👥</Text>
            </View>
            <View>
              <Text style={styles.cardTitle}>Nuevos Clientes</Text>
              <Text style={styles.cardValue}>+8</Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={[styles.iconWrapper, { backgroundColor: '#F3E8FF' }]}>
              <Text style={{ fontSize: 24 }}>📈</Text>
            </View>
            <View>
              <Text style={styles.cardTitle}>Visitas a la App</Text>
              <Text style={styles.cardValue}>842</Text>
            </View>
          </View>
        </View>

        <View style={styles.welcomeBox}>
          <Text style={styles.welcomeTitle}>Bienvenido al Panel Administrativo</Text>
          <Text style={styles.welcomeText}>
            Usa el menú lateral para gestionar los recursos de Dressly Fashion Store. 
            Este panel te proporciona acceso directo a los módulos a los que tienes permiso.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F5F1',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B6B6B',
    lineHeight: 20,
  },
  roleBold: {
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 32,
  },
  card: {
    width: isTablet ? '48%' : '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 14,
    color: '#6B6B6B',
    marginBottom: 4,
    fontWeight: '500',
  },
  cardValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  welcomeBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  welcomeText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 22,
  },
});
