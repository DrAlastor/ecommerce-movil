import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useAuth } from '../../modules/users-security/shared/AuthContext';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

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

export default function AdminDashboardScreen({ navigation }: any) {
  const { user, rol, funciones } = useAuth();
  const [modalData, setModalData] = useState<{
    visible: boolean;
    title: string;
    description: string;
    isWebOnly: boolean;
  } | null>(null);

  // Filtrar funciones activas (acceso !== 'Ninguno')
  const allowedFunciones = funciones.filter(f => {
    const access = (f.nivel_acceso || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    return access !== 'ninguno' && access !== '';
  });

  // Agrupar funciones por módulo
  const modulesMap = new Map<string, typeof allowedFunciones>();
  allowedFunciones.forEach(f => {
    if (!modulesMap.has(f.modulo)) modulesMap.set(f.modulo, []);
    modulesMap.get(f.modulo)!.push(f);
  });

  const handleFunctionPress = (f: { nombre: string; modulo: string; nivel_acceso: string }) => {
    const norm = f.nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    const modNorm = f.modulo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

    // 1. Catálogo y prendas (CU10 / CU11)
    if (norm.includes('catalogo') || norm.includes('producto') || norm.includes('categoria') || norm.includes('variante') || modNorm.includes('catalogo')) {
      if (navigation?.navigate) {
        navigation.navigate('Catalog');
        return;
      }
    }

    // 2. IA y recomendaciones (CU26)
    if (norm.includes('ia') || norm.includes('recomendacion') || norm.includes('vestidor') || modNorm.includes('ia') || modNorm.includes('realidad')) {
      if (navigation?.navigate) {
        navigation.navigate('Recommendations');
        return;
      }
    }

    // 3. Perfil y usuario (CU03 / CU04)
    if (norm.includes('perfil') || norm.includes('contrasena')) {
      if (navigation?.navigate) {
        navigation.navigate('Profile');
        return;
      }
    }

    // 4. Funciones Web (Gestión masiva, proveedores, inventario, reportes)
    setModalData({
      visible: true,
      title: f.nombre,
      description: `Esta funcionalidad de gestión avanzada (${f.modulo}) está habilitada con nivel de acceso "${f.nivel_acceso || 'Lectura'}" en la plataforma Web ERP de FashionStore.\n\nEn esta versión móvil tienes habilitado el acceso al Catálogo Comercial de Prendas (CU10/CU11), Consulta de Stock en Sucursales y Asistente de Estilos con IA (CU26).`,
      isWebOnly: true,
    });
  };

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
            Bienvenido al panel móvil interno. Selecciona cualquier función asignada para navegar o consultar su estado.
          </Text>
        </View>

        {/* Accesos Rápidos Principales Móviles */}
        <View style={styles.quickAccessSection}>
          <Text style={styles.quickAccessTitle}>Accesos Rápidos Directos</Text>
          <View style={styles.quickGrid}>
            <TouchableOpacity
              style={styles.quickCard}
              activeOpacity={0.78}
              onPress={() => navigation?.navigate('Catalog')}
            >
              <View style={[styles.quickIconCircle, { backgroundColor: '#F4ECE1' }]}>
                <Text style={{ fontSize: 22 }}>👗</Text>
              </View>
              <Text style={styles.quickCardTitle}>Catálogo</Text>
              <Text style={styles.quickCardSub}>CU10 / CU11</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickCard}
              activeOpacity={0.78}
              onPress={() => navigation?.navigate('Recommendations')}
            >
              <View style={[styles.quickIconCircle, { backgroundColor: '#EDE9FE' }]}>
                <Text style={{ fontSize: 22 }}>✨</Text>
              </View>
              <Text style={styles.quickCardTitle}>Estilos IA</Text>
              <Text style={styles.quickCardSub}>CU26</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickCard}
              activeOpacity={0.78}
              onPress={() => navigation?.navigate('Profile')}
            >
              <View style={[styles.quickIconCircle, { backgroundColor: '#E0F2FE' }]}>
                <Text style={{ fontSize: 22 }}>👤</Text>
              </View>
              <Text style={styles.quickCardTitle}>Mi Perfil</Text>
              <Text style={styles.quickCardSub}>CU03 / CU04</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickCard}
              activeOpacity={0.78}
              onPress={() => navigation?.navigate('Cart')}
            >
              <View style={[styles.quickIconCircle, { backgroundColor: '#DCFCE7' }]}>
                <Text style={{ fontSize: 22 }}>🛒</Text>
              </View>
              <Text style={styles.quickCardTitle}>Mi Bolsa</Text>
              <Text style={styles.quickCardSub}>Compras</Text>
            </TouchableOpacity>
          </View>
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
          <Text style={styles.sectionTitle}>Tus Módulos y Funciones Autorizadas</Text>
          <Text style={styles.sectionSubtitle}>
            Toca cualquiera de las funciones para acceder o consultar su disponibilidad:
          </Text>

          {modulesMap.size === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={{ fontSize: 32, marginBottom: 8 }}>🔒</Text>
              <Text style={styles.emptyTitle}>Sin funciones configuradas</Text>
              <Text style={styles.emptyText}>
                No tienes funciones operativas adicionales configuradas para este rol.
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
                      {funcs.length} {funcs.length === 1 ? 'función' : 'funciones'} autorizadas
                    </Text>
                  </View>
                </View>

                <View style={styles.functionList}>
                  {funcs.map((f) => (
                    <TouchableOpacity
                      key={f.nombre}
                      style={styles.functionItem}
                      activeOpacity={0.72}
                      onPress={() => handleFunctionPress(f)}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        <Text style={styles.functionDot}>•</Text>
                        <Text style={styles.functionName}>{f.nombre}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
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
                        <Text style={styles.chevronIcon}>›</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))
          )}
        </View>

      </ScrollView>

      {/* Modal Informativo para Operaciones */}
      {modalData && (
        <Modal
          visible={modalData.visible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalData(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalIcon}>💻</Text>
                <Text style={styles.modalTitle}>{modalData.title}</Text>
              </View>
              <Text style={styles.modalDescription}>{modalData.description}</Text>
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalSecondaryBtn}
                  onPress={() => setModalData(null)}
                >
                  <Text style={styles.modalSecondaryBtnText}>Cerrar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalPrimaryBtn}
                  onPress={() => {
                    setModalData(null);
                    navigation?.navigate('Catalog');
                  }}
                >
                  <Text style={styles.modalPrimaryBtnText}>Ir al Catálogo</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
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
  chevronIcon: {
    fontSize: 18,
    color: '#9CA3AF',
    fontWeight: 'bold',
    marginLeft: 2,
  },
  quickAccessSection: {
    marginBottom: 20,
  },
  quickAccessTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 10,
  },
  quickGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  quickCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  quickIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  quickCardTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  quickCardSub: {
    fontSize: 10,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  modalIcon: {
    fontSize: 28,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    flex: 1,
  },
  modalDescription: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalSecondaryBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  modalSecondaryBtnText: {
    color: '#4B5563',
    fontWeight: '600',
    fontSize: 14,
  },
  modalPrimaryBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#1A1A1A',
  },
  modalPrimaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});
