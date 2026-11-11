import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Modal,
  SafeAreaView,
  Alert,
} from 'react-native';
import { branchReservationsService } from '../services/branch-reservations.service';
import type {
  BranchReservation,
  BranchReservationsMetrics,
  StaffBranch,
} from '../types/branch-reservations.types';
import { OfflineImage as Image } from '../../../../../services/offline/OfflineImage';

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Pendiente: { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' },
  Preparada: { bg: '#DBEAFE', text: '#1E40AF', border: '#BFDBFE' },
  Atendida: { bg: '#E0E7FF', text: '#3730A3', border: '#C7D2FE' },
  Completada: { bg: '#D1FAE5', text: '#065F46', border: '#A7F3D0' },
  Cancelada: { bg: '#FEE2E2', text: '#991B1B', border: '#FECACA' },
  Expirada: { bg: '#F3F4F6', text: '#4B5563', border: '#E5E7EB' },
};

export default function ManageBranchReservationsScreen({ navigation }: any) {
  const [branches, setBranches] = useState<StaffBranch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<number | undefined>(undefined);
  const [reservations, setReservations] = useState<BranchReservation[]>([]);
  const [metrics, setMetrics] = useState<BranchReservationsMetrics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>('TODAS');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Detalle de reserva seleccionada
  const [selectedReservation, setSelectedReservation] = useState<BranchReservation | null>(null);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);

  // Cargar sucursales
  const loadBranches = useCallback(async () => {
    try {
      const data = await branchReservationsService.getMyBranches();
      setBranches(data);
      if (data.length > 0 && selectedBranchId === undefined) {
        setSelectedBranchId(data[0].id_sucursal);
      }
    } catch (error) {
      console.warn('Error cargando sucursales de reservas:', error);
    }
  }, [selectedBranchId]);

  // Cargar reservas
  const loadReservations = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const response = await branchReservationsService.getBranchReservations({
        id_sucursal: selectedBranchId,
        estado: statusFilter === 'TODAS' ? undefined : statusFilter,
        search: searchQuery.trim() || undefined,
      });

      setReservations(response.data || []);
      setMetrics(response.metrics || null);
    } catch (error) {
      console.warn('Error cargando reservas:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedBranchId, statusFilter, searchQuery]);

  useEffect(() => {
    loadBranches();
  }, [loadBranches]);

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  const handleUpdateStatus = async (
    reservation: BranchReservation,
    newStatus: 'Preparada' | 'Atendida' | 'Completada' | 'Cancelada',
  ) => {
    const actionLabel =
      newStatus === 'Preparada'
        ? 'preparar las prendas de esta reserva'
        : newStatus === 'Completada'
        ? 'marcar como entregada y completada'
        : newStatus === 'Cancelada'
        ? 'cancelar esta reserva'
        : 'actualizar el estado';

    Alert.alert(
      'Confirmar Acción',
      `¿Deseas ${actionLabel} (Cód: ${reservation.codigo})?`,
      [
        { text: 'Volver', style: 'cancel' },
        {
          text: 'Confirmar',
          style: newStatus === 'Cancelada' ? 'destructive' : 'default',
          onPress: async () => {
            try {
              setIsActionLoading(true);
              await branchReservationsService.updateReservationStatus(reservation.id_reserva, {
                estado: newStatus,
              });
              Alert.alert('Éxito', `Reserva actualizada a "${newStatus}"`);
              setSelectedReservation(null);
              loadReservations();
            } catch (err: any) {
              Alert.alert('Error', err?.response?.data?.message || err?.message || 'No se pudo actualizar');
            } finally {
              setIsActionLoading(false);
            }
          },
        },
      ],
    );
  };

  const renderReservationCard = ({ item }: { item: BranchReservation }) => {
    const statusTheme = STATUS_COLORS[item.estado] || STATUS_COLORS.Pendiente;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => setSelectedReservation(item)}
      >
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardCode}>#{item.codigo}</Text>
            <Text style={styles.cardDate}>{item.fecha_reserva}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusTheme.bg, borderColor: statusTheme.border },
            ]}
          >
            <Text style={[styles.statusText, { color: statusTheme.text }]}>
              {item.estado}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.clientName}>
            👤 {item.cliente.nombre_completo}
            {item.cliente.ci ? ` (CI: ${item.cliente.ci})` : ''}
          </Text>
          <Text style={styles.itemSummary}>
            👗 {item.total_prendas} {item.total_prendas === 1 ? 'prenda' : 'prendas'} • Total est: {item.total_estimado.toFixed(2)} Bs
          </Text>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.detailLink}>Ver prendas y gestionar ➔</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📅 Gestión de Reservas</Text>
        <Text style={styles.headerSubtitle}>Atención de pedidos y retiro en tienda</Text>
      </View>

      {/* Selector de Sucursales */}
      {branches.length > 1 && (
        <View style={styles.branchSelector}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={branches}
            keyExtractor={(item) => String(item.id_sucursal)}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.branchTab,
                  selectedBranchId === item.id_sucursal && styles.branchTabActive,
                ]}
                onPress={() => setSelectedBranchId(item.id_sucursal)}
              >
                <Text
                  style={[
                    styles.branchTabText,
                    selectedBranchId === item.id_sucursal && styles.branchTabTextActive,
                  ]}
                >
                  📍 {item.nombre}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Buscador */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por código de reserva o cliente..."
          placeholderTextColor="#8C8C8C"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={() => loadReservations()}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
            <Text style={{ color: '#999', fontSize: 16 }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Pestañas de Estado */}
      <View style={styles.tabsContainer}>
        {['TODAS', 'Pendiente', 'Preparada', 'Completada', 'Cancelada'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[styles.tab, statusFilter === status && styles.tabActive]}
            onPress={() => setStatusFilter(status)}
          >
            <Text
              style={[styles.tabText, statusFilter === status && styles.tabTextActive]}
            >
              {status === 'TODAS' ? 'Todas' : status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista de Reservas */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#1A1A1A" />
          <Text style={styles.loadingText}>Cargando reservas de la sucursal...</Text>
        </View>
      ) : reservations.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={{ fontSize: 44, marginBottom: 12 }}>📭</Text>
          <Text style={styles.emptyTitle}>No hay reservas encontradas</Text>
          <Text style={styles.emptySub}>
            No se encontraron reservas con el filtro o búsqueda seleccionada.
          </Text>
        </View>
      ) : (
        <FlatList
          data={reservations}
          keyExtractor={(item) => String(item.id_reserva)}
          renderItem={renderReservationCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => loadReservations(true)}
              colors={['#1A1A1A']}
            />
          }
        />
      )}

      {/* Modal Detalle y Acciones */}
      {selectedReservation && (
        <Modal
          visible={true}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setSelectedReservation(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalCode}>Reserva #{selectedReservation.codigo}</Text>
                  <Text style={styles.modalSub}>{selectedReservation.fecha_reserva}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setSelectedReservation(null)}
                  style={styles.modalCloseBtn}
                >
                  <Text style={{ fontSize: 18, color: '#666' }}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalClientBox}>
                <Text style={styles.modalClientTitle}>Cliente Titular:</Text>
                <Text style={styles.modalClientName}>
                  {selectedReservation.cliente.nombre_completo}
                </Text>
                {selectedReservation.cliente.ci && (
                  <Text style={styles.modalClientCi}>
                    C.I.: {selectedReservation.cliente.ci}
                  </Text>
                )}
                {selectedReservation.observaciones && (
                  <Text style={styles.modalObs}>
                    Nota: {selectedReservation.observaciones}
                  </Text>
                )}
              </View>

              <Text style={styles.prendasTitle}>Prendas reservadas:</Text>
              <FlatList
                data={selectedReservation.items}
                keyExtractor={(item) => String(item.id_detalle_reserva)}
                renderItem={({ item }) => (
                  <View style={styles.itemRow}>
                    {item.imagen_url ? (
                      <Image source={{ uri: item.imagen_url }} style={styles.itemThumb} />
                    ) : (
                      <View style={[styles.itemThumb, styles.itemThumbPlaceholder]}>
                        <Text style={{ fontSize: 18 }}>👗</Text>
                      </View>
                    )}
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.itemTitle}>{item.producto_nombre}</Text>
                      <Text style={styles.itemVariant}>
                        Talla: {item.talla} • Color: {item.color_nombre}
                      </Text>
                      <Text style={styles.itemPrice}>
                        {item.cantidad} x {item.precio_estimado.toFixed(2)} Bs = {item.subtotal_estimado.toFixed(2)} Bs
                      </Text>
                    </View>
                  </View>
                )}
                style={{ maxHeight: 220 }}
              />

              <View style={styles.modalTotalRow}>
                <Text style={styles.modalTotalLabel}>Total Estimado:</Text>
                <Text style={styles.modalTotalValue}>
                  {selectedReservation.total_estimado.toFixed(2)} Bs
                </Text>
              </View>

              {/* Botones de acción */}
              <View style={styles.modalActions}>
                {selectedReservation.estado === 'Pendiente' && (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.btnPrep]}
                    onPress={() => handleUpdateStatus(selectedReservation, 'Preparada')}
                    disabled={isActionLoading}
                  >
                    <Text style={styles.btnPrepText}>📦 Marcar Preparada</Text>
                  </TouchableOpacity>
                )}

                {(selectedReservation.estado === 'Pendiente' ||
                  selectedReservation.estado === 'Preparada') && (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.btnComplete]}
                    onPress={() => handleUpdateStatus(selectedReservation, 'Completada')}
                    disabled={isActionLoading}
                  >
                    <Text style={styles.btnCompleteText}>✓ Entregar al Cliente</Text>
                  </TouchableOpacity>
                )}

                {selectedReservation.estado !== 'Completada' &&
                  selectedReservation.estado !== 'Cancelada' && (
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.btnCancel]}
                      onPress={() => handleUpdateStatus(selectedReservation, 'Cancelada')}
                      disabled={isActionLoading}
                    >
                      <Text style={styles.btnCancelText}>✕ Cancelar Reserva</Text>
                    </TouchableOpacity>
                  )}
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
    backgroundColor: '#F9F8F6',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EDEBE8',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1C1510',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#7C7267',
    marginTop: 2,
  },
  branchSelector: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0ECE8',
  },
  branchTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F3EFEA',
    marginRight: 8,
  },
  branchTabActive: {
    backgroundColor: '#1C1510',
  },
  branchTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#554A40',
  },
  branchTabTextActive: {
    color: '#FFFFFF',
  },
  searchContainer: {
    marginHorizontal: 16,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAE6DF',
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 14,
    color: '#1C1510',
  },
  clearBtn: {
    padding: 6,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginVertical: 10,
    gap: 6,
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#EFEBE6',
  },
  tabActive: {
    backgroundColor: '#8C5E35',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6E6259',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EFEBE6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  cardCode: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1510',
  },
  cardDate: {
    fontSize: 11,
    color: '#8C8379',
    marginTop: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardBody: {
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#F5F2ED',
  },
  clientName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2B231D',
    marginBottom: 4,
  },
  itemSummary: {
    fontSize: 13,
    color: '#6E6259',
  },
  cardFooter: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F5F2ED',
    alignItems: 'flex-end',
  },
  detailLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8C5E35',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: '#666',
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1C1510',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: '#7C7267',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '88%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalCode: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1C1510',
  },
  modalSub: {
    fontSize: 12,
    color: '#777',
  },
  modalCloseBtn: {
    padding: 6,
  },
  modalClientBox: {
    backgroundColor: '#FAF8F5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EFEBE6',
  },
  modalClientTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8C5E35',
    textTransform: 'uppercase',
  },
  modalClientName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1510',
    marginTop: 2,
  },
  modalClientCi: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  modalObs: {
    fontSize: 12,
    color: '#92400E',
    marginTop: 4,
    fontStyle: 'italic',
  },
  prendasTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1510',
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0ECE8',
  },
  itemThumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
  },
  itemThumbPlaceholder: {
    backgroundColor: '#F3EFEA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1510',
  },
  itemVariant: {
    fontSize: 11,
    color: '#777',
  },
  itemPrice: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8C5E35',
    marginTop: 2,
  },
  modalTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#EDEBE8',
    marginTop: 8,
  },
  modalTotalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1510',
  },
  modalTotalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1C1510',
  },
  modalActions: {
    gap: 8,
    marginTop: 10,
    marginBottom: 10,
  },
  actionBtn: {
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  btnPrep: {
    backgroundColor: '#1E40AF',
  },
  btnPrepText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  btnComplete: {
    backgroundColor: '#065F46',
  },
  btnCompleteText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  btnCancel: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  btnCancelText: {
    color: '#991B1B',
    fontWeight: '700',
    fontSize: 14,
  },
});
