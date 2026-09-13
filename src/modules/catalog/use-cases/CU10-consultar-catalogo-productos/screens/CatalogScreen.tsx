import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useAuth } from '../../../../users-security/shared/AuthContext';
import { useShop } from '../../../../../shared/context/ShopContext';
import { PRODUCTS, CATEGORIES } from '../../../../../data/mockProducts';
import type { Product } from '../../../../../types/shop.types';
import FilterModal from '../components/FilterModal';

export default function CatalogScreen({ navigation }: any) {
  const { isAuthenticated, user, logout } = useAuth();
  const { cartItemCount, toggleWishlist, isInWishlist, addToCart } = useShop();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState<any>({});

  const filteredProducts = PRODUCTS.filter((product) => {
    // Filtrar por categoría
    if (selectedCategory !== 'all' && product.categorySlug !== selectedCategory) return false;
    
    // Filtros avanzados
    if (activeFilters.sizes && activeFilters.sizes.length > 0) {
      if (!product.sizes || !product.sizes.some((s: string) => activeFilters.sizes.includes(s))) return false;
    }
    if (activeFilters.colors && activeFilters.colors.length > 0) {
      if (!product.colors || !product.colors.some((c: string) => activeFilters.colors.includes(c))) return false;
    }
    if (activeFilters.minPrice && product.price < parseFloat(activeFilters.minPrice)) return false;
    if (activeFilters.maxPrice && product.price > parseFloat(activeFilters.maxPrice)) return false;
    
    return true;
  });

  const formatPrice = (price: number) => {
    return `${price.toFixed(2)} Bs`;
  };

  const handleApplyFilters = (filters: any) => {
    setActiveFilters(filters);
  };

  const renderProduct = ({ item }: { item: Product }) => {
    const isFavorite = isInWishlist(item.id);
    return (
      <View style={styles.productCard}>
        <View>
          <Image source={{ uri: item.image }} style={styles.productImage} resizeMode="cover" />
          <TouchableOpacity 
            style={styles.heartBtn} 
            onPress={() => toggleWishlist(item.id)}
          >
            <Text style={[styles.heartIcon, isFavorite && styles.heartActive]}>
              {isFavorite ? '♥' : '♡'}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
          
          <TouchableOpacity 
            style={styles.addToCartBtn} 
            onPress={() => addToCart(item, 1, item.sizes?.[0], item.colors?.[0])}
          >
            <Text style={styles.addToCartText}>Agregar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderCategory = ({ item }: { item: any }) => {
    const isSelected = selectedCategory === item.id;
    return (
      <TouchableOpacity
        style={[styles.categoryButton, isSelected && styles.categoryButtonSelected]}
        onPress={() => setSelectedCategory(item.id)}
      >
        <Text style={[styles.categoryText, isSelected && styles.categoryTextSelected]}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Navbar/Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dressly</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Wishlist')}>
            <Text style={styles.iconText}>♡</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Cart')}>
            <Text style={styles.iconText}>🛒</Text>
            {cartItemCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartItemCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          {isAuthenticated && (
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Profile')}>
              <Text style={styles.iconText}>👤</Text>
            </TouchableOpacity>
          )}
          {isAuthenticated ? (
            <TouchableOpacity onPress={logout} style={styles.authButton}>
              <Text style={styles.authButtonText}>Salir</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.authButton}>
              <Text style={styles.authButtonText}>Ingresar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Welcome Bar */}
      {isAuthenticated && (
        <View style={styles.welcomeBar}>
          <Text style={styles.welcomeText}>Hola, {user?.email}</Text>
        </View>
      )}

      {/* Filter and Categories Row */}
      <View style={styles.filterRow}>
        <TouchableOpacity style={styles.filterButton} onPress={() => setFilterModalVisible(true)}>
          <Text style={styles.filterButtonText}>Filtros ▾</Text>
        </TouchableOpacity>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item.id}
          renderItem={renderCategory}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {/* Products Grid */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProduct}
        numColumns={2}
        contentContainerStyle={styles.productsList}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
      />

      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={handleApplyFilters}
        currentFilters={activeFilters}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F5F1' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#E8E8E8', backgroundColor: '#FFFFFF' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', fontFamily: 'Georgia', color: '#1A1A1A' },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { marginLeft: 12, position: 'relative' },
  iconText: { fontSize: 22, color: '#1A1A1A' },
  badge: { position: 'absolute', top: -4, right: -6, backgroundColor: '#D9534F', borderRadius: 8, minWidth: 16, height: 16, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 },
  badgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' },
  authButton: { marginLeft: 16, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: '#1A1A1A' },
  authButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '500' },
  welcomeBar: { backgroundColor: '#FAF7F2', paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#E8E8E8' },
  welcomeText: { fontSize: 14, color: '#6B6B6B' },
  filterRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingVertical: 12, paddingLeft: 16 },
  filterButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#1A1A1A', marginRight: 12 },
  filterButtonText: { fontSize: 14, color: '#1A1A1A', fontWeight: '500' },
  categoriesList: { paddingRight: 16 },
  categoryButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F0F0F0', marginRight: 8 },
  categoryButtonSelected: { backgroundColor: '#1A1A1A' },
  categoryText: { fontSize: 14, color: '#6B6B6B' },
  categoryTextSelected: { color: '#FFFFFF', fontWeight: '500' },
  productsList: { padding: 16 },
  row: { justifyContent: 'space-between' },
  productCard: { width: '48%', backgroundColor: '#FFFFFF', borderRadius: 8, marginBottom: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  productImage: { width: '100%', height: 200, backgroundColor: '#E8E8E8' },
  heartBtn: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(255,255,255,0.8)', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  heartIcon: { fontSize: 18, color: '#9B9B9B', marginTop: -2 },
  heartActive: { color: '#D9534F' },
  productInfo: { padding: 12 },
  productName: { fontSize: 14, color: '#1A1A1A', marginBottom: 4, height: 40 },
  productPrice: { fontSize: 16, fontWeight: '600', color: '#C4956A', marginBottom: 12 },
  addToCartBtn: { backgroundColor: '#1A1A1A', paddingVertical: 8, borderRadius: 4, alignItems: 'center' },
  addToCartText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
});
