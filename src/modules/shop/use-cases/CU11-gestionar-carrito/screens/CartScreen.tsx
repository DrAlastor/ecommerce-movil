import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { useShop } from '../../../../../shared/context/ShopContext';

export default function CartScreen({ navigation }: any) {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useShop();

  const formatPrice = (price: number) => `${price.toFixed(2)} Bs`;

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.product.image }} style={styles.image} resizeMode="cover" />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{item.product.name}</Text>
        <Text style={styles.price}>{formatPrice(item.product.price)}</Text>
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.btn}
            onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
          >
            <Text style={styles.btnText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.qty}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.btn}
            onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
          >
            <Text style={styles.btnText}>+</Text>
          </TouchableOpacity>
        </View>
        {(item.selectedSize || item.selectedColor) && (
          <Text style={styles.variants}>
            {item.selectedSize && `Talla: ${item.selectedSize}`} {item.selectedColor && `Color: ${item.selectedColor}`}
          </Text>
        )}
      </View>
      <TouchableOpacity style={styles.removeBtn} onPress={() => removeFromCart(item.product.id)}>
        <Text style={styles.removeText}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Tu Carrito</Text>
        <View style={{ width: 60 }} />
      </View>

      {cart.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Tu carrito está vacío</Text>
          <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.shopBtnText}>Explorar Productos</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cart}
            keyExtractor={(item) => item.product.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatPrice(cartTotal)}</Text>
            </View>
            <TouchableOpacity style={styles.checkoutBtn}>
              <Text style={styles.checkoutText}>Proceder al Pago</Text>
            </TouchableOpacity>
          </View>
        </>
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
  cartItem: { flexDirection: 'row', backgroundColor: '#FFFFFF', padding: 12, borderRadius: 8, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  image: { width: 80, height: 100, borderRadius: 6, backgroundColor: '#E8E8E8' },
  info: { flex: 1, marginLeft: 12, justifyContent: 'space-between' },
  name: { fontSize: 14, color: '#1A1A1A', fontWeight: '500' },
  price: { fontSize: 16, color: '#C4956A', fontWeight: 'bold', marginTop: 4 },
  controls: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  btn: { width: 30, height: 30, borderWidth: 1, borderColor: '#E8E8E8', borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  btnText: { fontSize: 18, color: '#1A1A1A' },
  qty: { marginHorizontal: 16, fontSize: 16, fontWeight: '500' },
  variants: { fontSize: 12, color: '#6B6B6B', marginTop: 6 },
  removeBtn: { padding: 4 },
  removeText: { fontSize: 18, color: '#9B9B9B' },
  footer: { backgroundColor: '#FFFFFF', padding: 20, borderTopWidth: 1, borderTopColor: '#E8E8E8' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  totalLabel: { fontSize: 18, color: '#6B6B6B' },
  totalValue: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A' },
  checkoutBtn: { backgroundColor: '#C4956A', paddingVertical: 16, borderRadius: 8, alignItems: 'center' },
  checkoutText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }
});
