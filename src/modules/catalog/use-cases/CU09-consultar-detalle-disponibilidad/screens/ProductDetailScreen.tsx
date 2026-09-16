import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useMobileProductDetail } from '../hooks/useMobileProductDetail';
import { MobileProductGallery } from '../components/MobileProductGallery';
import { MobileVariantSelector } from '../components/MobileVariantSelector';
import { MobileBranchStockSheet } from '../components/MobileBranchStockSheet';
import { MobileSizeGuideModal } from '../components/MobileSizeGuideModal';
import { VirtualFittingButton } from '../components/VirtualFittingButton';
import { useShop } from '../../../../../shared/context/ShopContext';

interface ProductDetailScreenProps {
  route?: { params?: { id_producto?: number } };
  navigation?: any;
  productId?: number;
}

export const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({
  route,
  navigation,
  productId: propId,
}) => {
  const effectiveId = propId || route?.params?.id_producto || 1;
  const { cartItemCount, wishlistCount } = useShop();

  const {
    product,
    loading,
    errorMessage,
    selectedColorId,
    setSelectedColorId,
    selectedTallaId,
    setSelectedTallaId,
    selectedVariant,
    quantity,
    setQuantity,
    activeImageIndex,
    setActiveImageIndex,
    sizeGuideVisible,
    setSizeGuideVisible,
    branchStockVisible,
    setBranchStockVisible,
    currentPrice,
    originalPrice,
    hasDiscount,
    isAvailable,
    isFavorited,
    fetchProduct,
    handleAddToCart,
    handleToggleWishlist,
  } = useMobileProductDetail(effectiveId);

  if (loading) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#111827" />
          <Text style={styles.loadingText}>Cargando prenda...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (errorMessage || !product) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Error al cargar la prenda</Text>
          <Text style={styles.errorDesc}>{errorMessage || 'No se encontró la información del producto.'}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchProduct}>
            <Text style={styles.retryBtnText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleAdd = () => {
    handleAddToCart();
    Alert.alert('Bolsa de compras', `"${product.nombre}" añadido a la bolsa.`);
  };

  return (
    <SafeAreaView style={styles.screen}>
      {/* Top Floating Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.headerCircleBtn}
          onPress={() => (navigation ? navigation.goBack() : null)}
          activeOpacity={0.8}
        >
          <Text style={styles.headerBtnIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.topHeaderRight}>
          <TouchableOpacity
            style={styles.headerCircleBtn}
            onPress={handleToggleWishlist}
            activeOpacity={0.8}
          >
            <Text style={[styles.headerBtnIcon, isFavorited ? styles.heartActive : styles.heartInactive]}>
              ♥
            </Text>
            {wishlistCount > 0 && (
              <View style={styles.headerBadge}>
                <Text style={styles.headerBadgeText}>{wishlistCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerCircleBtn}
            onPress={() => navigation && navigation.navigate('Cart')}
            activeOpacity={0.8}
          >
            <Text style={styles.headerBtnIcon}>🛒</Text>
            {cartItemCount > 0 && (
              <View style={styles.headerBadge}>
                <Text style={styles.headerBadgeText}>{cartItemCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Galería */}
        <MobileProductGallery
          images={product.imagenes}
          activeImageIndex={activeImageIndex}
          onSelectImage={setActiveImageIndex}
          hasDiscount={hasDiscount}
          discountPercent={product.descuento_porcentaje}
          has3DModel={Boolean(selectedVariant?.modelo_3d_url || product.tiene_modelo_3d)}
        />

        <View style={styles.bodyContent}>
          {/* Categoría y Colección */}
          <View style={styles.metaRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{product.categoria.nombre}</Text>
            </View>
            {product.coleccion && (
              <View style={styles.collectionBadge}>
                <Text style={styles.collectionBadgeText}>{product.coleccion.nombre}</Text>
              </View>
            )}
          </View>

          {/* Título */}
          <Text style={styles.title}>{product.nombre}</Text>

          {/* SKU */}
          {selectedVariant && (
            <Text style={styles.skuText}>SKU: {selectedVariant.sku}</Text>
          )}

          {/* Precio */}
          <View style={styles.priceRow}>
            <Text style={styles.currentPrice}>Bs {currentPrice.toFixed(2)}</Text>
            {hasDiscount && (
              <Text style={styles.originalPrice}>Bs {originalPrice.toFixed(2)}</Text>
            )}
          </View>

          {/* Selectores de Talla y Color */}
          <MobileVariantSelector
            colores={product.colores_disponibles}
            tallas={product.tallas_disponibles}
            variantes={product.variantes}
            selectedColorId={selectedColorId}
            selectedTallaId={selectedTallaId}
            hasSizeGuide={product.guia_tallas.length > 0}
            onSelectColor={setSelectedColorId}
            onSelectTalla={setSelectedTallaId}
            onOpenSizeGuide={() => setSizeGuideVisible(true)}
          />

          {/* Vestidor Virtual 3D */}
          <VirtualFittingButton
            model3dUrl={selectedVariant?.modelo_3d_url}
          />

          {/* Disponibilidad en Tiendas trigger */}
          <TouchableOpacity
            style={styles.branchStockTrigger}
            onPress={() => setBranchStockVisible(true)}
            activeOpacity={0.8}
          >
            <View style={styles.branchTriggerLeft}>
              <Text style={styles.branchStoreIcon}>🏬</Text>
              <Text style={styles.branchTriggerText}>Disponibilidad en Tiendas Físicas</Text>
            </View>
            <View style={styles.branchTriggerRight}>
              <Text style={styles.branchTriggerCount}>
                {selectedVariant?.disponibilidad_sucursales.filter((s) => s.disponible).length || 0} tiendas
              </Text>
              <Text style={styles.branchChevron}>›</Text>
            </View>
          </TouchableOpacity>

          {/* Descripción */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionHeader}>Descripción</Text>
            <Text style={styles.descriptionText}>
              {product.descripcion || 'Prenda exclusiva confeccionada bajo altos estándares de calidad y diseño.'}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.quantityWrap}>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1 || !isAvailable}
          >
            <Text style={[styles.qtySign, quantity <= 1 && styles.qtySignDisabled]}>−</Text>
          </TouchableOpacity>
          <Text style={styles.qtyText}>{quantity}</Text>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => setQuantity(quantity + 1)}
            disabled={!isAvailable}
          >
            <Text style={[styles.qtySign, !isAvailable && styles.qtySignDisabled]}>+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.addToCartBtn, !isAvailable && styles.addToCartBtnDisabled]}
          onPress={handleAdd}
          disabled={!isAvailable}
          activeOpacity={0.85}
        >
          <Text style={styles.bagIcon}>🛍️</Text>
          <Text style={styles.addToCartBtnText}>
            {isAvailable ? `Agregar • Bs ${(currentPrice * quantity).toFixed(2)}` : 'Agotado'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal Guía de Tallas */}
      <MobileSizeGuideModal
        visible={sizeGuideVisible}
        categoryName={product.categoria.nombre}
        guideItems={product.guia_tallas}
        onClose={() => setSizeGuideVisible(false)}
      />

      {/* Bottom Sheet Disponibilidad Sucursales */}
      <MobileBranchStockSheet
        visible={branchStockVisible}
        sucursales={selectedVariant?.disponibilidad_sucursales || []}
        selectedTalla={selectedVariant?.talla.codigo}
        selectedColor={selectedVariant?.color.nombre}
        onClose={() => setBranchStockVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
  },
  errorIcon: {
    fontSize: 42,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  errorDesc: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: '#111827',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  topHeader: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 20,
  },
  topHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerCircleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  headerBtnIcon: {
    fontSize: 20,
    color: '#111827',
    fontWeight: '700',
  },
  headerBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#DC2626',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  headerBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  heartInactive: {
    color: '#6B7280',
  },
  heartActive: {
    color: '#DC2626',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  bodyContent: {
    padding: 16,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
    textTransform: 'uppercase',
  },
  collectionBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  collectionBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#92400E',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 28,
  },
  skuText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
    marginBottom: 10,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
    marginBottom: 6,
  },
  currentPrice: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  originalPrice: {
    fontSize: 16,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  branchStockTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginVertical: 12,
  },
  branchTriggerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  branchStoreIcon: {
    fontSize: 16,
  },
  branchTriggerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  branchTriggerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  branchTriggerCount: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
  branchChevron: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: '600',
  },
  descriptionSection: {
    marginTop: 10,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 20,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 8,
  },
  quantityWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    height: 48,
    paddingHorizontal: 4,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtySign: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  qtySignDisabled: {
    color: '#9CA3AF',
  },
  qtyText: {
    width: 28,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  addToCartBtn: {
    flex: 1,
    height: 48,
    backgroundColor: '#111827',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  bagIcon: {
    fontSize: 16,
  },
  addToCartBtnDisabled: {
    backgroundColor: '#9CA3AF',
  },
  addToCartBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
