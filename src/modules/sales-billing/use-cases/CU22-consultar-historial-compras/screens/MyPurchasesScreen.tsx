import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useMyPurchases } from '../hooks/useMyPurchases';
import { PurchaseFilterTabs } from '../components/PurchaseFilterTabs';
import { PurchaseOrderCard } from '../components/PurchaseOrderCard';
import { PurchaseReceiptModal } from '../components/PurchaseReceiptModal';
import { PurchasesEmptyState } from '../components/PurchasesEmptyState';

export default function MyPurchasesScreen({ navigation }: any) {
  const {
    purchases,
    isLoading,
    isRefreshing,
    selectedFilter,
    setSelectedFilter,
    selectedReceipt,
    setSelectedReceipt,
    handleRefresh,
    formatPrice,
  } = useMyPurchases();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.backBtn}
        >
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis Compras y Facturas</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Pestañas de Filtro */}
      <PurchaseFilterTabs
        selectedFilter={selectedFilter}
        onSelectFilter={setSelectedFilter}
      />

      {/* Lista de Compras o Loading */}
      {isLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#8C5E35" />
          <Text style={styles.loadingText}>Cargando tus compras...</Text>
        </View>
      ) : (
        <FlatList
          data={purchases}
          keyExtractor={(item) => item.id_venta.toString()}
          renderItem={({ item }) => (
            <PurchaseOrderCard
              item={item}
              formatPrice={formatPrice}
              onViewReceipt={setSelectedReceipt}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#8C5E35"
              colors={['#8C5E35']}
            />
          }
          ListEmptyComponent={
            <PurchasesEmptyState onStartShopping={() => navigation.navigate('Home')} />
          }
        />
      )}

      {/* Modal de Comprobante / Factura Digital */}
      <PurchaseReceiptModal
        receipt={selectedReceipt}
        formatPrice={formatPrice}
        onClose={() => setSelectedReceipt(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0ECE8',
  },
  backBtn: {
    paddingVertical: 4,
  },
  backText: {
    fontSize: 13,
    color: '#8C5E35',
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1510',
    letterSpacing: 0.3,
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: '#8C7D70',
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
});
