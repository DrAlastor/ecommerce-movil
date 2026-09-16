import React from 'react';
import { View, Image, StyleSheet, Dimensions, TouchableOpacity, Text } from 'react-native';

const { width } = Dimensions.get('window');

interface MobileProductGalleryProps {
  images: Array<{ id_imagen_producto: number; url: string; texto_alternativo: string | null }>;
  activeImageIndex: number;
  onSelectImage: (index: number) => void;
  hasDiscount: boolean;
  discountPercent: number;
  has3DModel: boolean;
}

export const MobileProductGallery: React.FC<MobileProductGalleryProps> = ({
  images,
  activeImageIndex,
  onSelectImage,
  hasDiscount,
  discountPercent,
  has3DModel,
}) => {
  const activeImage = images[activeImageIndex] || images[0] || {
    url: 'https://fashionstorestorage.blob.core.windows.net/productos/hero-model.jpg',
  };

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: activeImage.url }}
        style={styles.mainImage}
        resizeMode="cover"
      />

      <View style={styles.badgesContainer}>
        {hasDiscount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{discountPercent}%</Text>
          </View>
        )}
        {has3DModel && (
          <View style={styles.badge3D}>
            <Text style={styles.badge3DIcon}>📦</Text>
            <Text style={styles.badge3DText}>3D Ready</Text>
          </View>
        )}
      </View>

      {images.length > 1 && (
        <View style={styles.paginationDots}>
          {images.map((_, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => onSelectImage(idx)}
              style={[
                styles.dot,
                idx === activeImageIndex && styles.activeDot,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width,
    height: width * 1.15,
    backgroundColor: '#F3F4F6',
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  badgesContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'column',
    gap: 6,
    zIndex: 10,
  },
  discountBadge: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  badge3D: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badge3DIcon: {
    fontSize: 12,
  },
  badge3DText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 11,
  },
  paginationDots: {
    position: 'absolute',
    bottom: 14,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeDot: {
    width: 20,
    backgroundColor: '#111827',
  },
});
