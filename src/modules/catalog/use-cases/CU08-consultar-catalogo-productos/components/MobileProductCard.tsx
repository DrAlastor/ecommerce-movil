import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useShop } from '../../../../../shared/context/ShopContext';
import type { MobileCatalogProduct } from '../../../services/catalog.service';
import type { Product } from '../../../../../types/shop.types';

interface MobileProductCardProps {
  item: MobileCatalogProduct;
  onPress: () => void;
  toShopProduct: (item: MobileCatalogProduct) => Product;
}

const MobileProductCardComponent: React.FC<MobileProductCardProps> = ({
  item,
  onPress,
  toShopProduct,
}) => {
  const { toggleWishlist, isInWishlist, addToCart } = useShop();
  const isFavorite = isInWishlist(item.id_producto);
  const shopProd = toShopProduct(item);

  return (
    <TouchableOpacity
      style={styles.productCard}
      activeOpacity={0.88}
      onPress={onPress}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri:
              item.imagen_principal ||
              'https://fashionstorestorage.blob.core.windows.net/productos/hero-model.jpg',
          }}
          style={styles.productImage}
          resizeMode="cover"
        />

        {/* Badge de Descuento */}
        {item.tiene_descuento && (
          <View style={styles.badgeSale}>
            <Text style={styles.badgeSaleText}>-{item.descuento_porcentaje}%</Text>
          </View>
        )}

        {/* Botón Favorito Limpio y Elegante */}
        <TouchableOpacity
          style={[styles.heartBtn, isFavorite && styles.heartBtnActive]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.8}
          onPress={() => toggleWishlist(item.id_producto, shopProd)}
        >
          <Text style={[styles.heartIcon, isFavorite ? styles.heartActive : styles.heartInactive]}>
            ♥
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.productInfo}>
        <Text style={styles.categorySubtext}>
          {item.categoria?.nombre || 'Prenda'} {item.genero ? `· ${item.genero}` : ''}
        </Text>

        <Text style={styles.productName} numberOfLines={2}>
          {item.nombre}
        </Text>

        {/* Precios */}
        <View style={styles.priceRow}>
          <Text style={styles.productPrice}>{item.precio_final.toFixed(2)} Bs</Text>
          {item.tiene_descuento && (
            <Text style={styles.oldPrice}>{item.precio_base.toFixed(2)} Bs</Text>
          )}
        </View>

        {/* Tallas disponibles */}
        {item.tallas_disponibles.length > 0 && (
          <Text style={styles.sizesText} numberOfLines={1}>
            {item.tallas_disponibles.map((t) => t.codigo).join(' ')}
          </Text>
        )}

        {/* Botón Agregar a Bolsa */}
        <TouchableOpacity
          style={styles.addToCartBtn}
          activeOpacity={0.85}
          onPress={() =>
            addToCart(
              shopProd,
              1,
              item.tallas_disponibles[0]?.codigo,
              item.colores_disponibles[0]?.nombre
            )
          }
        >
          <Text style={styles.addToCartText}>Agregar a bolsa</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export const MobileProductCard = React.memo(MobileProductCardComponent);

const styles = StyleSheet.create({
  productCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 190,
    backgroundColor: '#F3F4F6',
  },
  productImage: { width: '100%', height: '100%' },
  badgeSale: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#DC2626',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeSaleText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  heartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  heartBtnActive: {
    backgroundColor: '#FFFFFF',
  },
  heartIcon: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: -1,
  },
  heartInactive: {
    color: '#9CA3AF',
  },
  heartActive: {
    color: '#DC2626',
  },
  productInfo: { padding: 10 },
  categorySubtext: {
    fontSize: 10,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 2,
  },
  productName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 6,
    height: 34,
  },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  productPrice: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  oldPrice: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  sizesText: { fontSize: 10, color: '#6B7280', marginBottom: 8 },
  addToCartBtn: {
    backgroundColor: '#1A1A1A',
    paddingVertical: 7,
    borderRadius: 6,
    alignItems: 'center',
  },
  addToCartText: { color: '#FFFFFF', fontSize: 11, fontWeight: '600' },
});
