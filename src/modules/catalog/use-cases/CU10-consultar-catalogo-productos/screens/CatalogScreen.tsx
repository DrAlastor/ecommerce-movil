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
import { PRODUCTS, CATEGORIES } from '../../../../../data/mockProducts';
import type { Product } from '../../../../../types/shop.types';

export default function CatalogScreen({ navigation }: any) {
  const { isAuthenticated, user, logout } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredProducts = PRODUCTS.filter(
    (product) => selectedCategory === 'all' || product.category === selectedCategory
  );

  const formatPrice = (price: number) => {
    return `${price.toFixed(2)} Bs`;
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      <Image source={{ uri: item.image }} style={styles.productImage} resizeMode="cover" />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
      </View>
    </View>
  );

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

      {/* Welcome Bar */}
      {isAuthenticated && (
        <View style={styles.welcomeBar}>
          <Text style={styles.welcomeText}>Hola, {user?.email}</Text>
        </View>
      )}

      {/* Categories Horizontal List */}
      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ id: 'all', name: 'Todas' }, ...CATEGORIES]}
          keyExtractor={(item) => item.id}
          renderItem={renderCategory}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {/* Products Grid */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={renderProduct}
        numColumns={2}
        contentContainerStyle={styles.productsList}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F5F1',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'Georgia', // Approximation of the quiet luxury brand
    color: '#1A1A1A',
  },
  authButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#1A1A1A',
  },
  authButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  welcomeBar: {
    backgroundColor: '#FAF7F2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  welcomeText: {
    fontSize: 14,
    color: '#6B6B6B',
  },
  categoriesContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
  },
  categoryButtonSelected: {
    backgroundColor: '#1A1A1A',
  },
  categoryText: {
    fontSize: 14,
    color: '#6B6B6B',
  },
  categoryTextSelected: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  productsList: {
    padding: 16,
  },
  row: {
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  productImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#E8E8E8',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    color: '#1A1A1A',
    marginBottom: 4,
    height: 40,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#C4956A',
  },
});
