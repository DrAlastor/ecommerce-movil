import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Dimensions } from 'react-native';
import { useAuth } from '../../modules/users-security/shared/AuthContext';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

// Casos de uso exclusivos de la plataforma Web (no aplican para móvil)
const WEB_ONLY_FUNCTIONS = [
  'gestionar usuarios',
  'gestionar roles',
  'gestionar roles y permisos',
  'gestionar empleados',
];

const getModuleIcon = (modulo: string) => {
  const norm = modulo.toLowerCase();
  if (norm.includes('catálogo') || norm.includes('catalogo')) return '📦';
  if (norm.includes('inventario') || norm.includes('sucursal') || norm.includes('proveedor')) return '🏬';
  if (norm.includes('reserva')) return '📅';
  if (norm.includes('venta') || norm.includes('pago')) return '💳';
  if (norm.includes('reporte') || norm.includes('dashboard')) return '📊';
  if (norm.includes('ia') || norm.includes('realidad')) return '✨';
  return '📁';
};

export default function AdminDashboardScreen() {
  const { user, rol, funciones } = useAuth();

  // Filtrar funciones activas (acceso !== 'Ninguno') y excluir casos de uso exclusivamente web (CU05, CU06, CU07)
  const allowedFunciones = funciones.filter(f => {
    const access = (f.nivel_acceso || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    if (access === 'ninguno' || access === '') return false;
    
    const funcNameNorm = (f.nombre || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    if (WEB_ONLY_FUNCTIONS.some(webOnly => funcNameNorm.includes(webOnly))) {
      return false;
    }
    return true;
  });

  // Agrupar funciones por módulo
  const modulesMap = new Map<string, typeof allowedFunciones>();
  allowedFunciones.forEach(f => {
    if (!modulesMap.has(f.modulo)) modulesMap.set(f.modulo, []);
    modulesMap.get(f.modulo)!.push(f);
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Cabecera elegante */}
        <View style={styles.headerCard}>
          <View style={styles.badgeRow}>
            <View style={styles.onlineDot} />
            <Text style={styles.badgeText}>Sesión Activa: {rol?.nombre || 'Colaborador'}</Text>
          </View>
          <Text style={styles.greeting}>
            Hola, {user?.empleado?.nombre || user?.email} 👋
          </Text>
          <Text style={styles.subtitle}>
            Bienvenido al panel móvil interno. Aquí tienes acceso a tus funciones autorizadas según los permisos de tu cargo.
          </Text>
        </View>

        {/* Resumen de permisos */}
        <View style={styles.grid}>
          <View style={styles.card}>
            <View style={[styles.iconWrapper, { backgroundColor: '#F4ECE1' }]}>
              <Text style={{ fontSize: 20 }}>🏷️</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Rol Asignado</Text>
              <Text style={styles.cardValue} numberOfLines={1}>{rol?.nombre || 'Personal'}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={[styles.iconWrapper, { backgroundColor: '#E0F2FE' }]}>
              <Text style={{ fontSize: 20 }}>📂</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Módulos Habilitados</Text>
              <Text style={styles.cardValue}>{modulesMap.size} Módulos</Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={[styles.iconWrapper, { backgroundColor: '#DCFCE7' }]}>
              <Text style={{ fontSize: 20 }}>⚡</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Operaciones</Text>
              <Text style={styles.cardValue}>{allowedFunciones.length} Funciones</Text>
            </View>
          </View>

          {user?.empleado?.codigo_empleado && (
            <View style={styles.card}>
              <View style={[styles.iconWrapper, { backgroundColor: '#FEF08A' }]}>
                <Text style={{ fontSize: 20 }}>🪪</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Cód. Empleado</Text>
                <Text style={styles.cardValue}>{user.empleado.codigo_empleado}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Sección de Módulos y Funciones */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Tus Módulos Asignados</Text>
          <Text style={styles.sectionSubtitle}>
            Herramientas y funciones disponibles para tu rol en la versión móvil:
          </Text>

          {modulesMap.size === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={{ fontSize: 32, marginBottom: 8 }}>🔒</Text>
              <Text style={styles.emptyTitle}>Sin funciones móviles adicionales</Text>
              <Text style={styles.emptyText}>
                Tus permisos asignados corresponden a módulos de gestión web o no tienes funciones operativas adicionales configuradas.
              </Text>
            </View>
          ) : (
            Array.from(modulesMap.entries()).map(([modulo, funcs]) => (
              <View key={modulo} style={styles.moduleCard}>
                <View style={styles.moduleHeader}>
                  <Text style={{ fontSize: 20 }}>{getModuleIcon(modulo)}</Text>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.moduleTitle}>{modulo.replace('Gestión de ', '')}</Text>
                    <Text style={styles.moduleSubtitle}>
                      {funcs.length} {funcs.length === 1 ? 'función asignada' : 'funciones asignadas'}
                    </Text>
                  </View>
                </View>

                <View style={styles.functionList}>
                  {funcs.map((f) => (
                    <View key={f.nombre} style={styles.functionItem}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        <Text style={styles.functionDot}>•</Text>
                        <Text style={styles.functionName}>{f.nombre}</Text>
                      </View>
                      <View style={[
                        styles.accessBadge,
                        f.nivel_acceso?.toLowerCase() === 'edicion' ? styles.badgeEdicion : styles.badgeLectura
                      ]}>
                        <Text style={[
                          styles.accessBadgeText,
                          f.nivel_acceso?.toLowerCase() === 'edicion' ? styles.badgeEdicionText : styles.badgeLecturaText
                        ]}>
                          {f.nivel_acceso || 'Lectura'}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ))
          )}
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
  headerCard: {
    backgroundColor: '#1C1510',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(196, 149, 106, 0.3)',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(196, 149, 106, 0.25)',
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 10,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  badgeText: {
    color: '#EBD5BE',
    fontSize: 12,
    fontWeight: '600',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#D6CBC2',
    lineHeight: 18,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
  card: {
    width: isTablet ? '48%' : '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 11,
    color: '#6B6B6B',
    marginBottom: 2,
    fontWeight: '500',
  },
  cardValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 16,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 18,
  },
  moduleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EAE6DF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 2,
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0ECE6',
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  moduleSubtitle: {
    fontSize: 12,
    color: '#8C827A',
  },
  functionList: {
    gap: 8,
  },
  functionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAF8F5',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F0ECE6',
  },
  functionDot: {
    fontSize: 16,
    color: '#C4956A',
    marginRight: 8,
  },
  functionName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2E2722',
    flex: 1,
  },
  accessBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeEdicion: {
    backgroundColor: '#DCFCE7',
  },
  badgeEdicionText: {
    color: '#15803D',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  badgeLectura: {
    backgroundColor: '#E0F2FE',
  },
  badgeLecturaText: {
    color: '#0369A1',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  accessBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
});
