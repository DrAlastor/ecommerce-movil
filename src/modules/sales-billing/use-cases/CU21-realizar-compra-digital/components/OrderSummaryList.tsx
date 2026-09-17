import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

interface OrderSummaryListProps {
  cart: any[];
  formatPrice: (price: number) => string;
}

export function OrderSummaryList({ cart, formatPrice }: OrderSummaryListProps) {
  return (
    <View style={styles.card}>
      <View style={styles.sectionHeader}>
        <View style={styles.iconCircle}>
          <Text style={styles.icon}>🛍️</Text>
        </View>
        <View>
          <Text style={styles.sectionTitle}>Resumen de Artículos</Text>
          <Text style={styles.sectionSubtitle}>
            {cart.length} {cart.length === 1 ? 'producto en orden' : 'productos en orden'}
          </Text>
        </View>
      </View>

      <View style={styles.itemList}>
        {cart.map((item, index) => (
          <View
            key={`${item.product.id}-${index}`}
            style={[styles.itemRow, index > 0 && styles.itemBorderTop]}
          >
            {item.product.image ? (
              <Image
                source={{ uri: item.product.image }}
                style={styles.itemImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.itemImage, styles.noImage]}>
                <Text style={styles.noImageText}>👗</Text>
              </View>
            )}

            <View style={styles.itemDetails}>
              <Text style={styles.itemName} numberOfLines={2}>
                {item.product.name}
              </Text>
              <View style={styles.itemMeta}>
                <Text style={styles.itemQty}>Cant: {item.quantity}</Text>
                {item.selectedSize && (
                  <Text style={styles.itemVariant}>Talla: {item.selectedSize}</Text>
                )}
                {item.selectedColor && (
                  <Text style={styles.itemVariant}>Color: {item.selectedColor}</Text>
                )}
              </View>
            </View>

            <Text style={styles.itemPrice}>
              {formatPrice(item.product.price * item.quantity)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F0ECE8',
    shadowColor: '#1C1510',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FAF5EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  icon: {
    fontSize: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1510',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#8C7D70',
    marginTop: 1,
  },
  itemList: {
    marginTop: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  itemBorderTop: {
    borderTopWidth: 1,
    borderTopColor: '#F5F2EE',
  },
  itemImage: {
    width: 52,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F7F4F0',
  },
  noImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    fontSize: 18,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    paddingRight: 8,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1510',
    lineHeight: 17,
  },
  itemMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  itemQty: {
    fontSize: 11,
    color: '#8C7D70',
    fontWeight: '600',
  },
  itemVariant: {
    fontSize: 11,
    color: '#635345',
    backgroundColor: '#FAF5EE',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8C5E35',
  },
});
