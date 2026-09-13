import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { useShop } from '../../../../../shared/context/ShopContext';
import { PRODUCTS } from '../../../../../data/mockProducts';

export default function WishlistScreen({ navigation }: any) {
  const { wishlist, toggleWishlist, addToCart } = useShop();

  const formatPrice = (price: number) => `${price.toFixed(2)} Bs`;

  const wishlistProducts = PRODUCTS.filter((p) => wishlist.includes(p.id));

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.productCard}>
      <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
      <TouchableOpacity style={styles.removeBtn} onPress={() => toggleWishlist(item.id)}>
        <Text style={styles.removeText}>✕</Text>
      </TouchableOpacity>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.price}>{formatPrice(item.price)}</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => addToCart(item, 1)}>
          <Text style={styles.addBtnText}>Al Carrito</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Mis Favoritos</Text>
        <View style={{ width: 60 }} />
      </View>

      {wishlistProducts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No tienes productos favoritos</Text>
          <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.shopBtnText}>Explorar Productos</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={wishlistProducts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          numColumns={2}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F5F1' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E8E8E8' },
  backText: { fontSize: 16, color: '#1A1A1A' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 16, color: '#6B6B6B', marginBottom: 20 },
  shopBtn: { backgroundColor: '#1A1A1A', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  shopBtnText: { color: '#FFFFFF', fontWeight: '500', fontSize: 16 },
  list: { padding: 16 },
  row: { justifyContent: 'space-between' },
  productCard: { width: '48%', backgroundColor: '#FFFFFF', borderRadius: 8, marginBottom: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  image: { width: '100%', height: 200, backgroundColor: '#E8E8E8' },
  removeBtn: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(255,255,255,0.8)', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  removeText: { fontSize: 14, color: '#1A1A1A', fontWeight: 'bold' },
  info: { padding: 12 },
  name: { fontSize: 14, color: '#1A1A1A', marginBottom: 4, height: 40 },
  price: { fontSize: 16, fontWeight: '600', color: '#C4956A', marginBottom: 12 },
  addBtn: { backgroundColor: '#1A1A1A', paddingVertical: 8, borderRadius: 4, alignItems: 'center' },
  addBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' }
});
