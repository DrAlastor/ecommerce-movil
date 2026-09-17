import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import type { CartItem } from '../types/cart.types';

interface CartItemCardProps {
  item: CartItem;
  formatPrice: (price: number) => string;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
}

export function CartItemCard({ item, formatPrice, onUpdateQuantity, onRemove }: CartItemCardProps) {
  return (
    <View style={styles.cartItem}>
      {item.product.image ? (
        <Image source={{ uri: item.product.image }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={[styles.image, styles.noImage]}>
          <Text style={styles.noImageText}>👗</Text>
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>
          {item.product.name}
        </Text>

        <Text style={styles.price}>{formatPrice(item.product.price)}</Text>

        {(item.selectedSize || item.selectedColor) && (
          <View style={styles.variantsRow}>
            {item.selectedSize && (
              <View style={styles.variantBadge}>
                <Text style={styles.variantText}>Talla: {item.selectedSize}</Text>
              </View>
            )}
            {item.selectedColor && (
              <View style={styles.variantBadge}>
                <Text style={styles.variantText}>Color: {item.selectedColor}</Text>
              </View>
            )}
          </View>
        )}

        {/* Controles de cantidad instantáneos */}
        <View style={styles.bottomRow}>
          <View style={styles.controls}>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
              activeOpacity={0.6}
            >
              <Text style={styles.qtyBtnText}>−</Text>
            </TouchableOpacity>

            <Text style={styles.qty}>{item.quantity}</Text>

            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
              activeOpacity={0.6}
            >
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.itemTotal}>
            {formatPrice(item.product.price * item.quantity)}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.removeBtn}
        onPress={() => onRemove(item.product.id)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.removeBtnText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F0ECE8',
    shadowColor: '#1C1510',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    position: 'relative',
  },
  image: {
    width: 88,
    height: 105,
    borderRadius: 12,
    backgroundColor: '#F7F4F0',
  },
  noImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    fontSize: 28,
  },
  info: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1510',
    paddingRight: 20,
    lineHeight: 18,
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8C5E35',
    marginTop: 3,
  },
  variantsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 4,
  },
  variantBadge: {
    backgroundColor: '#F7F4F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  variantText: {
    fontSize: 11,
    color: '#6E6259',
    fontWeight: '500',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF8F5',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8E2DA',
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  qtyBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C1510',
    lineHeight: 18,
  },
  qty: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1510',
    paddingHorizontal: 12,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1510',
  },
  removeBtn: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FAF8F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeBtnText: {
    fontSize: 13,
    color: '#A89F95',
    fontWeight: 'bold',
  },
});
