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
  SafeAreaView,
} from 'react-native';
import { mobilePosService } from '../services/pos.service';
import type { POSSaleHistoryItem } from '../types/pos.types';

export default function SalesHistoryScreen({ navigation }: any) {
  const [history, setHistory] = useState<POSSaleHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const loadHistory = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const data = await mobilePosService.getSalesHistory({
        search: search.trim() || undefined,
      });
      setHistory(data || []);
    } catch (err) {
      console.warn('Error cargando historial de ventas:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [search]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Volver al POS</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🛍️ Historial de Ventas y Facturas</Text>
        <Text style={styles.headerSubtitle}>Comprobantes físicos y digitales emitidos</Text>
      </View>

      {/* Buscador */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por código de venta o cliente..."
          placeholderTextColor="#8C8C8C"
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={() => loadHistory()}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} style={{ padding: 6 }}>
            <Text style={{ color: '#999' }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Lista */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#1A1A1A" />
          <Text style={styles.loadingText}>Cargando ventas registradas...</Text>
        </View>
      ) : history.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={{ fontSize: 40, marginBottom: 8 }}>🧾</Text>
          <Text style={styles.emptyTitle}>Sin ventas registradas</Text>
          <Text style={styles.emptySub}>No se encontraron comprobantes para el criterio de búsqueda.</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => String(item.id_venta)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => loadHistory(true)}
              colors={['#1A1A1A']}
            />
          }
          renderItem={({ item }) => (
            <View style={styles.saleCard}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.saleCode}>#{item.codigo_venta}</Text>
                  <Text style={styles.saleDate}>{item.fecha}</Text>
                </View>
                <View style={styles.paidBadge}>
                  <Text style={styles.paidBadgeText}>
                    {item.estado?.toUpperCase() || 'PAGADO'}
                  </Text>
                </View>
              </View>

              <View style={styles.cardBody}>
                <Text style={styles.clientText}>
                  👤 {item.cliente_nombre}
                  {item.cliente_ci ? ` • NIT/CI: ${item.cliente_ci}` : ''}
                </Text>
                <Text style={styles.subText}>
                  📍 {item.sucursal_nombre} • {item.items_count} {item.items_count === 1 ? 'prenda' : 'prendas'}
                </Text>
                <Text style={styles.methodText}>
                  Método: {item.metodo_pago?.toUpperCase()}
                  {item.factura_numero ? ` • Factura: ${item.factura_numero}` : ''}
                </Text>
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.totalLabel}>Total Facturado:</Text>
                <Text style={styles.totalValue}>{item.total.toFixed(2)} Bs</Text>
              </View>
            </View>
          )}
        />
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
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EDEBE8',
  },
  backBtn: {
    marginBottom: 6,
  },
  backBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8C5E35',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1C1510',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#7C7267',
    marginTop: 2,
  },
  searchBar: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 6,
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
    height: 42,
    fontSize: 13,
    color: '#1C1510',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  saleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EFEBE6',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  saleCode: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1C1510',
  },
  saleDate: {
    fontSize: 11,
    color: '#888',
    marginTop: 1,
  },
  paidBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  paidBadgeText: {
    color: '#065F46',
    fontSize: 10,
    fontWeight: '800',
  },
  cardBody: {
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#F5F2ED',
    gap: 2,
  },
  clientText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1510',
  },
  subText: {
    fontSize: 11,
    color: '#666',
  },
  methodText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8C5E35',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F5F2ED',
    marginTop: 6,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1510',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1510',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1510',
  },
  emptySub: {
    fontSize: 12,
    color: '#777',
    textAlign: 'center',
    marginTop: 4,
  },
});
