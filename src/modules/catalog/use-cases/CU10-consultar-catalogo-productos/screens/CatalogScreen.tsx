import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../../../../users-security/shared/AuthContext';
import { useShop } from '../../../../../shared/context/ShopContext';
import { useMobileCatalog } from '../hooks/useMobileCatalog';
import { SearchHeader } from '../components/SearchHeader';
import { CategoryPills } from '../components/CategoryPills';
import { MobileProductCard } from '../components/MobileProductCard';
import FilterModal from '../components/FilterModal';
import type { MobileCatalogProduct } from '../../../services/catalog.service';

export default function CatalogScreen({ navigation }: any) {
  const { isAuthenticated, logout } = useAuth();
  const { cartItemCount, wishlistCount } = useShop();

  const {
    products,
    filterMeta,
    loading,
    refreshing,
    errorMessage,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    filterModalVisible,
    setFilterModalVisible,
    activeFilters,
    loadProducts,
    handleApplyFilters,
    handleResetFilters,
    toShopProduct,
  } = useMobileCatalog();

  const hasActiveFilters = Boolean(
    activeFilters.sizes?.length > 0 ||
    activeFilters.colors?.length > 0 ||
    activeFilters.onlySale ||
    activeFilters.minPrice ||
    activeFilters.maxPrice ||
    (activeFilters.gender && activeFilters.gender !== 'all')
  );

  const categoriesList = React.useMemo(() => [
    { id: 'all', name: 'Todos' },
    ...(filterMeta?.categorias.map((c: { id_categoria: number; nombre: string; total_productos: number }) => ({
      id: c.nombre,
      name: `${c.nombre} (${c.total_productos})`,
    })) || []),
  ], [filterMeta]);

  const handleProductPress = React.useCallback((item: MobileCatalogProduct) => {
    if (navigation?.navigate) {
      navigation.navigate('ProductDetail', {
        id_producto: item.id_producto,
        product: item,
      });
    }
  }, [navigation]);

  const renderProductItem = React.useCallback(({ item }: { item: MobileCatalogProduct }) => (
    <MobileProductCard
      item={item}
      toShopProduct={toShopProduct}
      onPress={() => handleProductPress(item)}
    />
  ), [toShopProduct, handleProductPress]);

  const keyExtractor = React.useCallback((item: MobileCatalogProduct) => item.id_producto.toString(), []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Superior */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dressly</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.iconBtn}
            activeOpacity={0.75}
            onPress={() => navigation.navigate('Recommendations')}
          >
            <Text style={styles.iconText}>IA</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            activeOpacity={0.75}
            onPress={() => navigation.navigate('Wishlist')}
          >
            <Text style={[styles.iconText, wishlistCount > 0 && { color: '#DC2626' }]}>♥</Text>
            {wishlistCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{wishlistCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            activeOpacity={0.75}
            onPress={() => navigation.navigate('Cart')}
          >
            <Text style={styles.iconText}>🛒</Text>
            {cartItemCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartItemCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          {isAuthenticated && (
            <TouchableOpacity
              style={styles.iconBtn}
              activeOpacity={0.75}
              onPress={() => navigation.navigate('Profile')}
            >
              <Text style={styles.iconText}>👤</Text>
            </TouchableOpacity>
          )}
          {isAuthenticated ? (
            <TouchableOpacity onPress={logout} style={styles.authButton} activeOpacity={0.8}>
              <Text style={styles.authButtonText}>Salir</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              style={styles.authButton}
              activeOpacity={0.8}
            >
              <Text style={styles.authButtonText}>Ingresar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Buscador */}
      <SearchHeader
        searchQuery={searchQuery}
        onChangeSearch={setSearchQuery}
        onClearSearch={() => setSearchQuery('')}
      />

      {/* Filtros y Categorías Horizontales */}
      <CategoryPills
        categories={categoriesList}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onOpenFilters={() => setFilterModalVisible(true)}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Contenido / Estado de Carga / Error */}
      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#1A1A1A" />
          <Text style={styles.loadingText}>Cargando catálogo de prendas...</Text>
        </View>
      ) : errorMessage ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{errorMessage}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadProducts()}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : products.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={{ fontSize: 40, marginBottom: 8 }}>👗</Text>
          <Text style={styles.emptyTitle}>No se encontraron prendas</Text>
          <Text style={styles.emptySubtext}>
            Prueba ajustando tus términos de búsqueda o limpiando los filtros seleccionados.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleResetFilters}>
            <Text style={styles.retryButtonText}>Restablecer filtros</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={keyExtractor}
          renderItem={renderProductItem}
          numColumns={2}
          contentContainerStyle={styles.productsList}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          initialNumToRender={6}
          maxToRenderPerBatch={8}
          windowSize={5}
          removeClippedSubviews={true}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadProducts(true)}
              colors={['#1A1A1A']}
            />
          }
        />
      )}

      {/* Modal de Filtros Avanzados */}
      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={handleApplyFilters}
        currentFilters={activeFilters}
        availableSizes={filterMeta?.tallas.map((t: { id_talla: number; codigo: string }) => t.codigo)}
        availableColors={filterMeta?.colores.map((c: { id_color: number; nombre: string; codigo_hex: string | null }) => c.nombre)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F5F1' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    backgroundColor: '#FFFFFF',
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', fontFamily: 'Georgia', color: '#1A1A1A' },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { marginLeft: 12, position: 'relative' },
  iconText: { fontSize: 20, color: '#1A1A1A' },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: '#DC2626',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' },
  authButton: {
    marginLeft: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#1A1A1A',
  },
  authButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  productsList: { padding: 12 },
  row: { justifyContent: 'space-between' },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: { marginTop: 12, fontSize: 14, color: '#6B7280' },
  errorText: { color: '#DC2626', fontSize: 14, textAlign: 'center', marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 4 },
  emptySubtext: { fontSize: 13, color: '#6B7280', textAlign: 'center', marginBottom: 16 },
  retryButton: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
});
