import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { MobileRecommendedProduct } from '../services/recommendations.service';

interface MobileRecommendationCardProps {
  item: MobileRecommendedProduct;
  onPress: () => void;
}

const MobileRecommendationCardComponent: React.FC<MobileRecommendationCardProps> = ({ item, onPress }) => (
  <TouchableOpacity style={styles.card} activeOpacity={0.88} onPress={onPress}>
    <View style={styles.imageWrap}>
      <Image
        source={{
          uri: item.imagen_principal || 'https://fashionstorestorage.blob.core.windows.net/productos/hero-model.jpg',
        }}
        style={styles.image}
        resizeMode="cover"
      />
      {item.tiene_descuento && (
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>-{item.descuento_porcentaje}%</Text>
        </View>
      )}
    </View>
    <View style={styles.body}>
      <Text style={styles.category} numberOfLines={1}>
        {item.categoria?.nombre || 'Prenda'} {item.genero ? `· ${item.genero}` : ''}
      </Text>
      <Text style={styles.name} numberOfLines={2}>{item.nombre}</Text>
      <View style={styles.priceRow}>
        <Text style={styles.price}>{item.precio_final.toFixed(2)} Bs</Text>
        {item.tiene_descuento && <Text style={styles.oldPrice}>{item.precio_base.toFixed(2)} Bs</Text>}
      </View>
      <Text style={styles.reason} numberOfLines={3}>{item.razon_recomendacion}</Text>
    </View>
  </TouchableOpacity>
);

export const MobileRecommendationCard = React.memo(MobileRecommendationCardComponent);

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  imageWrap: {
    height: 178,
    backgroundColor: '#F3F4F6',
    position: 'relative',
  },
  image: { width: '100%', height: '100%' },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#DC2626',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  body: { padding: 10 },
  category: {
    fontSize: 10,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    fontWeight: '700',
    marginBottom: 3,
  },
  name: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    minHeight: 34,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    marginBottom: 6,
  },
  price: { fontSize: 15, fontWeight: '800', color: '#111827' },
  oldPrice: {
    fontSize: 11,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  reason: {
    fontSize: 11,
    lineHeight: 15,
    color: '#6B625C',
  },
});
