import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { mobileMyReservationsService } from '../services/my-reservations.service';
import type {
  MyReservationListItem,
  ReservationReceipt,
} from '../types/my-reservations.types';
import { MobileReservationReceiptModal } from '../../CU17-realizar-reserva-prendas/components/MobileReservationReceiptModal';

interface MyReservationsScreenProps {
  navigation?: any;
}

export const MyReservationsScreen: React.FC<MyReservationsScreenProps> = ({
  navigation,
}) => {
  const [activeTab, setActiveTab] = useState<'activas' | 'historicas'>('activas');
  const [reservations, setReservations] = useState<MyReservationListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedReceipt, setSelectedReceipt] = useState<ReservationReceipt | null>(null);

  useEffect(() => {
    loadReservations();
  }, [activeTab]);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const data = await mobileMyReservationsService.getMyReservations(activeTab);
      setReservations(data);
    } catch (err: any) {
      console.error('Error fetching my reservations in mobile:', err);
      if (err.response?.status === 401) {
        Alert.alert('Sesión Expirada', 'Inicia sesión para ver tus reservas.', [
          { text: 'Ir a Login', onPress: () => navigation?.navigate?.('Login') },
        ]);
        return;
      }
      Alert.alert('Error', 'No se pudieron consultar tus reservas.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadReservations();
  };

  const handleOpenReceipt = async (res: MyReservationListItem) => {
    try {
      const fullReceipt = await mobileMyReservationsService.getReservationById(res.id_reserva);
      setSelectedReceipt(fullReceipt);
    } catch (err) {
      // Fallback
      setSelectedReceipt({
        comprobante: {
          id_reserva: res.id_reserva,
          codigo: res.codigo,
          estado: res.estado,
          fecha_reserva: res.fecha_reserva,
          horario_estimado: res.horario_estimado || '',
          fecha_limite: res.fecha_limite,
          observaciones: res.observaciones,
          dias_vigencia: 2,
        },
        sucursal: {
          id_sucursal: res.sucursal.id_sucursal,
          nombre: res.sucursal.nombre,
          direccion: res.sucursal.direccion,
          telefono: res.sucursal.telefono || '',
          horario: res.sucursal.horario,
          ciudad: res.sucursal.ciudad,
        },
        resumen: {
          total_prendas: res.total_prendas,
          total_estimado: res.total_estimado,
        },
        items: res.items,
        instrucciones: [
          'Presenta este comprobante en mostrador.',
          'Prendas apartadas por 48 horas sin costo.',
          'Pruébatelas en tienda antes de decidir tu compra.',
        ],
      });
    }
  };

  const handleCancelReservation = (res: MyReservationListItem) => {
    Alert.alert(
      '¿Cancelar Reserva?',
      `¿Deseas cancelar la reserva ${res.codigo} en ${res.sucursal.nombre}? Las prendas volverán a estar disponibles en tienda.`,
      [
        { text: 'No, mantener', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              const resp = await mobileMyReservationsService.cancelReservation(
                res.id_reserva,
                'Cancelada por el cliente desde la app',
              );
              Alert.alert('Reserva Cancelada', resp.mensaje);
              loadReservations();
            } catch (err: any) {
              const msg = err.response?.data?.message || 'No se pudo cancelar.';
              Alert.alert('Error', msg);
            }
          },
        },
      ],
    );
  };

  const getStatusColor = (estado: string) => {
    const e = estado.toLowerCase();
    if (e === 'pendiente') return { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' };
    if (e === 'confirmada') return { bg: '#E0F2FE', text: '#0369A1', border: '#BAE6FD' };
    if (e === 'preparada') return { bg: '#E0E7FF', text: '#3730A3', border: '#C7D2FE' };
    if (e === 'completada') return { bg: '#ECFDF5', text: '#065F46', border: '#A7F3D0' };
    if (e === 'cancelada') return { bg: '#FEF2F2', text: '#991B1B', border: '#FECACA' };
    return { bg: '#F1F5F9', text: '#475569', border: '#CBD5E1' };
  };

  return (
    <SafeAreaView style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            if (navigation?.canGoBack?.()) {
              navigation.goBack();
            } else {
              navigation?.navigate?.('Home');
            }
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.backBtnText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis Reservas</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'activas' && styles.tabBtnActive]}
          onPress={() => setActiveTab('activas')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabBtnText,
              activeTab === 'activas' && styles.tabBtnTextActive,
            ]}
          >
            Reservas Activas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'historicas' && styles.tabBtnActive]}
          onPress={() => setActiveTab('historicas')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabBtnText,
              activeTab === 'historicas' && styles.tabBtnTextActive,
            ]}
          >
            Historial
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#1C1917" />
          <Text style={styles.loadingText}>Cargando reservas...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollList}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {reservations.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🛍️</Text>
              <Text style={styles.emptyTitle}>
                {activeTab === 'activas'
                  ? 'No tienes reservas activas'
                  : 'No tienes historial de reservas'}
              </Text>
              <Text style={styles.emptySubtitle}>
                Aparta prendas disponibles desde el catálogo para probártelas en sucursal sin costo previo.
              </Text>
              <TouchableOpacity
                style={styles.exploreBtn}
                onPress={() => navigation?.navigate?.('Home')}
                activeOpacity={0.85}
              >
                <Text style={styles.exploreBtnText}>Explorar Catálogo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            reservations.map((res) => {
              const statusStyle = getStatusColor(res.estado);
              const formattedDate = new Date(res.fecha_reserva).toLocaleDateString('es-BO', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              });
              const formattedLimit = new Date(res.fecha_limite).toLocaleDateString('es-BO', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <View key={res.id_reserva} style={styles.reservationCard}>
                  {/* Card Top */}
                  <View style={styles.cardTopRow}>
                    <View>
                      <Text style={styles.resCode}>{res.codigo}</Text>
                      <Text style={styles.resDate}>{formattedDate}</Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: statusStyle.bg,
                          borderColor: statusStyle.border,
                        },
                      ]}
                    >
                      <Text style={[styles.statusText, { color: statusStyle.text }]}>
                        {res.estado}
                      </Text>
                    </View>
                  </View>

                  {/* Sucursal */}
                  <View style={styles.branchBox}>
                    <Text style={styles.branchName}>🏬 {res.sucursal.nombre}</Text>
                    <Text style={styles.branchAddress}>
                      📍 {res.sucursal.direccion} ({res.sucursal.ciudad})
                    </Text>
                    <Text style={styles.branchHours}>
                      🕒 {res.sucursal.horario}
                    </Text>
                  </View>

                  {/* Prendas */}
                  <View style={styles.itemsBox}>
                    {res.items.map((item) => (
                      <View key={item.id_detalle_reserva} style={styles.itemRow}>
                        {item.imagen_url ? (
                          <Image source={{ uri: item.imagen_url }} style={styles.itemImg} />
                        ) : (
                          <View style={styles.itemImgFallback}>
                            <Text>👗</Text>
                          </View>
                        )}
                        <View style={styles.itemInfo}>
                          <Text style={styles.itemName} numberOfLines={1}>
                            {item.producto_nombre}
                          </Text>
                          <Text style={styles.itemSub}>
                            Talla: {item.talla} • Color: {item.color_nombre}
                          </Text>
                        </View>
                        <Text style={styles.itemPrice}>
                          {item.cantidad} x Bs {item.precio_estimado.toFixed(2)}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Vigencia */}
                  {(res.estado === 'Pendiente' || res.estado === 'Confirmada') && (
                    <View style={styles.validityRow}>
                      <Text style={styles.validityLabel}>⏳ Vigente hasta:</Text>
                      <Text style={styles.validityDate}>{formattedLimit}</Text>
                    </View>
                  )}

                  {/* Card Bottom / Actions */}
                  <View style={styles.cardBottomRow}>
                    <View>
                      <Text style={styles.totalLabel}>Total Referencial:</Text>
                      <Text style={styles.totalPrice}>
                        Bs {res.total_estimado.toFixed(2)}
                      </Text>
                    </View>

                    <View style={styles.actionsRow}>
                      <TouchableOpacity
                        style={styles.voucherBtn}
                        onPress={() => handleOpenReceipt(res)}
                        activeOpacity={0.75}
                      >
                        <Text style={styles.voucherBtnText}>Ver Ticket</Text>
                      </TouchableOpacity>

                      {res.es_cancelable && (
                        <TouchableOpacity
                          style={styles.cancelBtn}
                          onPress={() => handleCancelReservation(res)}
                          activeOpacity={0.75}
                        >
                          <Text style={styles.cancelBtnText}>Cancelar</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}

      {/* Modal de Ticket / QR Comprobante */}
      <MobileReservationReceiptModal
        visible={Boolean(selectedReceipt)}
        receipt={selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E7E5E4',
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    fontSize: 28,
    color: '#1C1917',
    marginTop: -4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1C1917',
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E7E5E4',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: '#1C1917',
  },
  tabBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#78716C',
  },
  tabBtnTextActive: {
    color: '#1C1917',
    fontWeight: '800',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: '#78716C',
  },
  scrollList: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1917',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#78716C',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  exploreBtn: {
    backgroundColor: '#1C1917',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  reservationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E7E5E4',
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  resCode: {
    fontSize: 15,
    fontWeight: '900',
    color: '#1C1917',
    fontFamily: 'monospace',
  },
  resDate: {
    fontSize: 11,
    color: '#78716C',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  branchBox: {
    backgroundColor: '#FAFAF9',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  branchName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#292524',
    marginBottom: 2,
  },
  branchAddress: {
    fontSize: 11,
    color: '#57534E',
  },
  branchHours: {
    fontSize: 11,
    color: '#78716C',
    marginTop: 2,
  },
  itemsBox: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F5F5F4',
    paddingVertical: 8,
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  itemImg: {
    width: 36,
    height: 44,
    borderRadius: 6,
    marginRight: 8,
  },
  itemImgFallback: {
    width: 36,
    height: 44,
    borderRadius: 6,
    backgroundColor: '#E7E5E4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C1917',
  },
  itemSub: {
    fontSize: 10,
    color: '#78716C',
  },
  itemPrice: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1C1917',
  },
  validityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFBEB',
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  validityLabel: {
    fontSize: 11,
    color: '#92400E',
    fontWeight: '600',
  },
  validityDate: {
    fontSize: 11,
    color: '#92400E',
    fontWeight: '800',
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  totalLabel: {
    fontSize: 10,
    color: '#78716C',
    fontWeight: '600',
  },
  totalPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1C1917',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  voucherBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  voucherBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C1917',
  },
  cancelBtn: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
});
