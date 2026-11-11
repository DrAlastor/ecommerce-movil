/**
 * @caso-de-uso CU25 — Utilizar vestidor virtual
 * @subsistema Experiencia Móvil
 * @capa Boundary — Aplicación móvil
 * @responsabilidad Representa la pantalla principal de Aplicación móvil; compone la interfaz e inicia las acciones del caso de uso.
 * @secuencia Cliente -> vestidor virtual -> controlador de experiencia -> servicios de cámara y renderizado -> Producto/Variante/Recursos 3D.
 */
import React, { useState, useEffect, useMemo } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Platform,
  PermissionsAndroid,
  TurboModuleRegistry,
  NativeModules,
} from 'react-native';
import { useMobileVirtualFitting } from '../hooks/useMobileVirtualFitting';
import { CalibrationStep } from '../components/CalibrationStep';
import { FittingCanvas } from '../components/FittingCanvas';
import { FittingVariantSelector } from '../components/FittingVariantSelector';
import { FittingBottomActions } from '../components/FittingBottomActions';
import {
  MobileReservationModal,
  MobileReservationReceiptModal,
  type ReservationReceipt,
} from '../../../../reservations';
import { useAuth } from '../../../../users-security/shared/AuthContext';
import { useShop } from '../../../../../shared/context/ShopContext';
import { ElegantAlertModal } from '../../../../../shared/components/ElegantAlertModal';
import { offlineStatus, subscribeOffline } from '../../../../../services/offline/connectivity';

const isNativeWebViewAvailable = () => {
  try {
    const hasTurbo = TurboModuleRegistry.get ? TurboModuleRegistry.get('RNCWebViewModule') : null;
    const hasLegacy = (NativeModules as any).RNCWebView || (NativeModules as any).RNC_WEBVIEW;
    return Boolean(hasTurbo || hasLegacy);
  } catch {
    return false;
  }
};

const getWebViewComponent = () => {
  try {
    if (!isNativeWebViewAvailable()) {
      return null;
    }
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('react-native-webview').WebView;
  } catch (err) {
    console.warn('WebView native module could not be loaded:', err);
    return null;
  }
};

interface VirtualFittingScreenProps {
  route?: {
    params?: {
      id_producto?: number;
      productId?: number;
      variantId?: number;
    };
  };
  navigation?: any;
}

export const VirtualFittingScreen: React.FC<VirtualFittingScreenProps> = ({
  route,
  navigation,
}) => {
  const effectiveId = route?.params?.id_producto || route?.params?.productId || 1;
  const initialVariantId = route?.params?.variantId;
  const { isAuthenticated } = useAuth();
  const { addToCart: addToShopCart } = useShop();

  const WebViewComponent = useMemo(() => getWebViewComponent(), []);

  // Solicitar permisos de cámara en Android para el WebView AR en vivo
  useEffect(() => {
    const requestCamera = async () => {
      if (Platform.OS === 'android') {
        try {
          await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
            {
              title: 'Cámara para Vestidor Virtual',
              message: 'Dressly requiere permiso para utilizar la cámara y superponer las prendas en Realidad Aumentada sobre tu cuerpo.',
              buttonPositive: 'Permitir',
              buttonNegative: 'Cancelar',
            }
          );
        } catch (e) {
          console.warn('Error solicitando permisos de cámara:', e);
        }
      }
    };
    requestCamera();
  }, []);

  // Modo de motor: Si el binario de WebView aún no está compilado en la app, usar studio por defecto
  const [engineMode, setEngineMode] = useState<'camera' | 'studio'>(
    WebViewComponent ? 'camera' : 'studio'
  );
  const [offline, setOffline] = useState(offlineStatus().offline);
  useEffect(() => subscribeOffline(() => {
    const disconnected = offlineStatus().offline;
    setOffline(disconnected);
    if (disconnected) setEngineMode('studio');
  }), []);

  const {
    arData,
    selectedVariant,
    isLoading,
    errorMessage,
    phase,
    selectedTallaId,
    selectedColorId,
    setSelectedTallaId,
    setSelectedColorId,
    availableTallasForColor,
    availableColoresForTalla,
    silhouette,
    viewMode,
    setViewMode,
    showLandmarks,
    setShowLandmarks,
    transform,
    isAddingToCart,
    loadProductData,
    startFitting,
    recalibrate,
    setPoseAngle,
    setBodyType,
    adjustScale,
    adjustOffsetY,
    resetAdjustments,
    handleAddToCart,
  } = useMobileVirtualFitting({
    productId: effectiveId,
    initialVariantId,
  });

  // Estado de modales de Reserva CU17
  const [reservationVisible, setReservationVisible] = useState(false);
  const [receiptVisible, setReceiptVisible] = useState(false);
  const [receiptData, setReceiptData] = useState<ReservationReceipt | null>(null);

  // Alerta elegante
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    primaryText?: string;
    onPrimaryPress?: () => void;
  }>({
    visible: false,
    type: 'info',
    title: '',
    message: '',
  });

  const showAlert = (
    title: string,
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    primaryText = 'Entendido',
    onPrimaryPress?: () => void,
  ) => {
    setAlertConfig({
      visible: true,
      type,
      title,
      message,
      primaryText,
      onPrimaryPress,
    });
  };

  const closeAlert = () => {
    setAlertConfig((prev) => ({ ...prev, visible: false }));
  };

  // URL del vestidor virtual en Azure con la cámara y MediaPipe completos
  const liveArUrl = `https://proud-pond-01d50030f.6.azurestaticapps.net/virtual-fitting/${effectiveId}?embedded=true`;

  // Manejar mensajes enviados desde el WebView del vestidor virtual
  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'GO_BACK') {
        if (navigation) navigation.goBack();
      } else if (data.type === 'ADD_TO_CART') {
        addToShopCart(
          {
            id: data.productId,
            name: data.productName,
            price: data.price,
            category: 'Moda',
            categorySlug: 'moda',
            rating: 4.8,
            reviewsCount: 10,
            image: '',
          },
          1,
          data.size,
          data.color,
          data.variantId
        );
        showAlert(
          '¡Añadido a la Bolsa!',
          `"${data.productName}" se agregó a tu bolsa desde la cámara de RA.`,
          'success',
          'Ver Bolsa',
          () => navigation?.navigate('Cart')
        );
      }
    } catch (err) {
      console.warn('Error procesando mensaje WebView:', err);
    }
  };

  // Manejar adición al carrito
  const onAddToCartPress = async () => {
    const success = await handleAddToCart();
    if (success && arData && selectedVariant) {
      showAlert(
        '¡Añadido a la Bolsa!',
        `"${arData.producto.nombre}" en talla ${selectedVariant.talla.codigo} y color ${selectedVariant.color.nombre} se agregó correctamente a tu bolsa de compras.`,
        'success',
        'Ver Bolsa',
        () => {
          closeAlert();
          navigation?.navigate('Cart');
        },
      );
    }
  };

  // Manejar apertura de reserva
  const onReservePress = () => {
    if (!isAuthenticated) {
      showAlert(
        'Iniciar Sesión Requerido',
        'Debes iniciar sesión con tu cuenta para reservar prendas en nuestras sucursales físicas.',
        'warning',
        'Iniciar Sesión',
        () => {
          closeAlert();
          navigation?.navigate('Login');
        },
      );
      return;
    }
    setReservationVisible(true);
  };

  return (
    <SafeAreaView style={styles.screen}>
      {/* Barra de navegación superior */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => (navigation ? navigation.goBack() : null)}
          activeOpacity={0.8}
        >
          <Text style={styles.backButtonIcon}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Vestidor Virtual 3D</Text>
          <Text style={styles.headerSubtitle}>
            {arData?.producto.nombre || 'Prueba de prendas en RA'}
          </Text>
        </View>

        <View style={styles.headerRightSpacer} />
      </View>

      {/* Selector de Modo: Cámara en Vivo (RA) vs Avatar Studio */}
      <View style={styles.engineModeSelector}>
        <TouchableOpacity
          style={[styles.engineModeTab, engineMode === 'camera' && styles.engineModeTabActive]}
          onPress={() => setEngineMode('camera')}
          disabled={offline}
          activeOpacity={0.85}
        >
          <Text
            style={[
              styles.engineModeTabText,
              engineMode === 'camera' && styles.engineModeTabTextActive,
            ]}
          >
            📷 Cámara en Vivo (RA 3D/2D)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.engineModeTab, engineMode === 'studio' && styles.engineModeTabActive]}
          onPress={() => setEngineMode('studio')}
          activeOpacity={0.85}
        >
          <Text
            style={[
              styles.engineModeTabText,
              engineMode === 'studio' && styles.engineModeTabTextActive,
            ]}
          >
            🧍 Avatar Studio
          </Text>
        </TouchableOpacity>
      </View>

      {/* MODO 1: CÁMARA EN VIVO EN TIEMPO REAL (MEDIA PIPE + THREE.JS + CANVAS 2D) */}
      {engineMode === 'camera' && (
        <View style={styles.liveCameraContainer}>
          {WebViewComponent ? (
            <>
              <WebViewComponent
                source={{ uri: liveArUrl }}
                onError={() => setEngineMode('studio')}
                style={styles.webView}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                allowsInlineMediaPlayback={true}
                mediaPlaybackRequiresUserAction={false}
                originWhitelist={['*']}
                androidHardwareAccelerationDisabled={false}
                mixedContentMode="always"
                userAgent="Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36 DresslyMobileApp"
                onMessage={handleWebViewMessage}
                onPermissionRequest={(request: any) => {
                  if (request?.grant) {
                    request.grant(request.resources);
                  }
                }}
                startInLoadingState={true}
                renderLoading={() => (
                  <View style={styles.webViewLoading}>
                    <ActivityIndicator size="large" color="#C4956A" />
                    <Text style={styles.webViewLoadingText}>
                      Iniciando cámara y Realidad Aumentada 3D…
                    </Text>
                  </View>
                )}
              />

              {/* Floating badge for camera info */}
              <View style={styles.liveBadgeOverlay}>
                <View style={styles.liveIndicator}>
                  <View style={styles.pulseDot} />
                  <Text style={styles.liveText}>CÁMARA & POSE EN VIVO</Text>
                </View>
              </View>
            </>
          ) : (
            <View style={styles.rebuildNoticeCard}>
              <View style={styles.rebuildNoticeIconBadge}>
                <Text style={styles.rebuildNoticeIcon}>📷</Text>
              </View>
              <Text style={styles.rebuildNoticeTitle}>Cámara RA Nativa en la App</Text>
              <Text style={styles.rebuildNoticeDesc}>
                Para activar la cámara frontal y la Realidad Aumentada en tiempo real dentro de la app móvil, Android requiere compilar el binario nativo ejecutando en tu terminal:
              </Text>
              <View style={styles.codeSnippetBox}>
                <Text style={styles.codeSnippetText}>npm run android</Text>
              </View>
              <Text style={styles.rebuildNoticeTip}>
                Mientras compilas el binario, puedes probar las prendas con nuestro probador interactivo de alta precisión:
              </Text>
              <TouchableOpacity
                style={styles.switchToStudioBtn}
                onPress={() => setEngineMode('studio')}
                activeOpacity={0.85}
              >
                <Text style={styles.switchToStudioBtnText}>✨ Usar Probador Interactivo</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* MODO 2: AVATAR INTERACTIVO STUDIO (CALIBRACIÓN + CONTROLES TÁCTILES) */}
      {engineMode === 'studio' && (
        <>
          {/* 1. Estado de Carga */}
          {isLoading && (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#1A1A1A" />
              <Text style={styles.loadingTitle}>Cargando Vestidor Virtual…</Text>
              <Text style={styles.loadingDesc}>
                Obteniendo variantes y modelos tridimensionales de la prenda.
              </Text>
            </View>
          )}

          {/* 2. Estado de Error */}
          {!isLoading && (errorMessage || phase === 'error') && (
            <View style={styles.centerContainer}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorTitle}>No se pudo cargar el vestidor</Text>
              <Text style={styles.errorDesc}>
                {errorMessage || 'La prenda seleccionada no cuenta con modelos compatibles con RA.'}
              </Text>
              <TouchableOpacity
                style={styles.retryBtn}
                onPress={() => effectiveId && loadProductData(effectiveId)}
                activeOpacity={0.85}
              >
                <Text style={styles.retryBtnText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* 3. Fase de Calibración */}
          {!isLoading && phase === 'calibration' && (
            <CalibrationStep
              productName={arData?.producto.nombre}
              onStart={startFitting}
              onBack={() => (navigation ? navigation.goBack() : null)}
            />
          )}

          {/* 4. Fase de Prueba Activa en Vestidor */}
          {!isLoading && phase === 'fitting' && arData && (
            <View style={styles.mainFittingContainer}>
              <ScrollView
                style={styles.fittingScrollView}
                contentContainerStyle={styles.fittingScrollContent}
                showsVerticalScrollIndicator={false}
              >
                {/* Escenario de Prueba en Silueta / Avatar */}
                <FittingCanvas
                  variant={selectedVariant}
                  productName={arData.producto.nombre}
                  categoryName={arData.producto.categoria}
                  silhouette={silhouette}
                  transform={transform}
                  viewMode={viewMode}
                  showLandmarks={showLandmarks}
                  onSetViewMode={setViewMode}
                  onSetAngle={setPoseAngle}
                  onSetBodyType={setBodyType}
                  onAdjustScale={adjustScale}
                  onAdjustOffsetY={adjustOffsetY}
                  onResetAdjustments={resetAdjustments}
                />

                {/* Selector de Tallas y Colores compatibles con RA */}
                <FittingVariantSelector
                  product={arData.producto}
                  selectedVariant={selectedVariant}
                  tallas={availableTallasForColor}
                  colores={availableColoresForTalla}
                  selectedTallaId={selectedTallaId}
                  selectedColorId={selectedColorId}
                  onSelectTalla={setSelectedTallaId}
                  onSelectColor={setSelectedColorId}
                />
              </ScrollView>

              {/* Barra de Acciones Inferior Sticky */}
              <FittingBottomActions
                onAddToCart={onAddToCartPress}
                onReserve={onReservePress}
                onRecalibrate={recalibrate}
                showLandmarks={showLandmarks}
                onToggleLandmarks={() => setShowLandmarks((prev) => !prev)}
                isAddingToCart={isAddingToCart}
                disabled={!selectedVariant || selectedVariant.total_stock <= 0}
                finalPrice={selectedVariant?.precio_final}
              />
            </View>
          )}
        </>
      )}

      {/* Modal de Reserva CU17 */}
      {reservationVisible && arData && selectedVariant && (
        <MobileReservationModal
          visible={reservationVisible}
          onClose={() => setReservationVisible(false)}
          product={{
            id_producto: arData.producto.id_producto,
            nombre: arData.producto.nombre,
            precio_base: arData.producto.precio_base,
            imagenes: selectedVariant.imagen_url ? [{ url: selectedVariant.imagen_url }] : [],
          }}
          selectedVariant={selectedVariant}
          onReservationSuccess={(receipt) => {
            setReservationVisible(false);
            setReceiptData(receipt);
            setReceiptVisible(true);
          }}
          onRequireLogin={() => {
            setReservationVisible(false);
            navigation?.navigate('Login');
          }}
        />
      )}

      {/* Modal de Recibo de Reserva CU17 */}
      <MobileReservationReceiptModal
        visible={receiptVisible}
        receipt={receiptData}
        onClose={() => {
          setReceiptVisible(false);
          setReceiptData(null);
        }}
        onViewMyReservations={() => {
          setReceiptVisible(false);
          setReceiptData(null);
          navigation?.navigate('MyReservations');
        }}
      />

      {/* Alerta Elegante Premium */}
      <ElegantAlertModal
        visible={alertConfig.visible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        primaryButtonText={alertConfig.primaryText || 'Entendido'}
        onPrimaryPress={alertConfig.onPrimaryPress || closeAlert}
        onClose={closeAlert}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8F5F1',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EBEBEB',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonIcon: {
    fontSize: 18,
    color: '#1A1A1A',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#666666',
    marginTop: 1,
  },
  headerRightSpacer: {
    width: 36,
    height: 36,
  },
  engineModeSelector: {
    flexDirection: 'row',
    backgroundColor: '#ECE7E1',
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 8,
    borderRadius: 12,
    padding: 3,
  },
  engineModeTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  engineModeTabActive: {
    backgroundColor: '#1A1A1A',
  },
  engineModeTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666666',
  },
  engineModeTabTextActive: {
    color: '#FFFFFF',
  },
  liveCameraContainer: {
    flex: 1,
    backgroundColor: '#080C14',
    position: 'relative',
  },
  webView: {
    flex: 1,
    backgroundColor: '#080C14',
  },
  webViewLoading: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#080C14',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  webViewLoadingText: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 14,
    textAlign: 'center',
  },
  rebuildNoticeCard: {
    flex: 1,
    margin: 20,
    backgroundColor: '#12161F',
    borderRadius: 24,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(196, 149, 106, 0.3)',
  },
  rebuildNoticeIconBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(196, 149, 106, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#C4956A',
  },
  rebuildNoticeIcon: {
    fontSize: 32,
  },
  rebuildNoticeTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  rebuildNoticeDesc: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 14,
  },
  codeSnippetBox: {
    backgroundColor: '#0A0D14',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 16,
  },
  codeSnippetText: {
    color: '#38BDF8',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '700',
    fontSize: 14,
  },
  rebuildNoticeTip: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  switchToStudioBtn: {
    width: '100%',
    height: 48,
    backgroundColor: '#C4956A',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#C4956A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  switchToStudioBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  liveBadgeOverlay: {
    position: 'absolute',
    top: 10,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 17, 21, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  liveText: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  externalLinkIconBtn: {
    backgroundColor: 'rgba(15, 17, 21, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  externalLinkText: {
    color: '#E5E7EB',
    fontSize: 11,
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 16,
  },
  loadingDesc: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  errorIcon: {
    fontSize: 42,
    marginBottom: 12,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorDesc: {
    fontSize: 13,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  mainFittingContainer: {
    flex: 1,
  },
  fittingScrollView: {
    flex: 1,
  },
  fittingScrollContent: {
    paddingTop: 8,
    paddingBottom: 20,
  },
});

export default VirtualFittingScreen;
