import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { mobilePosService } from '../services/pos.service';
import type {
  POSBranch,
  POSProduct,
  POSProductVariant,
  POSCartItem,
  POSClientResult,
  PaymentConfirmationResult,
} from '../types/pos.types';
import { OfflineImage as Image } from '../../../../../services/offline/OfflineImage';
import { CameraQrScannerModal } from '../../CU23-procesar-pago-electronico/components/CameraQrScannerModal';
import { ManageQrConfigModal } from '../../CU23-procesar-pago-electronico/components/ManageQrConfigModal';
import { qrManagementService, CompanyQrSettings } from '../../CU23-procesar-pago-electronico/services/qr-management.service';
import { useTenant } from '../../../../../shared/context/TenantContext';

export default function MobilePosScreen({ navigation }: any) {
  const [branches, setBranches] = useState<POSBranch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<number | undefined>(undefined);
  const [products, setProducts] = useState<POSProduct[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [searchProduct, setSearchProduct] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Carrito de ventas POS
  const [cart, setCart] = useState<POSCartItem[]>([]);

  // Datos del Cliente y Facturación
  const [clientSearch, setClientSearch] = useState('');
  const [clientResults, setClientResults] = useState<POSClientResult[]>([]);
  const [selectedClient, setSelectedClient] = useState<POSClientResult | null>(null);
  const [isSearchingClient, setIsSearchingClient] = useState(false);
  const [nitFactura, setNitFactura] = useState('0');
  const [razonSocialFactura, setRazonSocialFactura] = useState('Consumidor Final');

  // Modal de Pago y Facturación
  const [isCheckoutModalVisible, setIsCheckoutModalVisible] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'tarjeta' | 'qr'>('efectivo');
  const [cashReceived, setCashReceived] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Gestión de QR Oficial
  const { tenantKey, currentTenant } = useTenant();
  const [companyQr, setCompanyQr] = useState<CompanyQrSettings | null>(null);
  const [isManageQrOpen, setIsManageQrOpen] = useState(false);

  useEffect(() => {
    qrManagementService.getCompanyQrSettings(tenantKey).then(setCompanyQr).catch(() => {});
  }, [tenantKey]);

  // Recibo de Venta Exitosa
  const [saleReceipt, setSaleReceipt] = useState<PaymentConfirmationResult | null>(null);

  // Cargar Sucursales
  useEffect(() => {
    mobilePosService.getBranches().then((data) => {
      setBranches(data);
      if (data.length > 0 && selectedBranchId === undefined) {
        setSelectedBranchId(data[0].id_sucursal);
      }
    }).catch(console.warn);
  }, []);

  // Cargar Productos según sucursal
  const loadProducts = useCallback(async () => {
    if (!selectedBranchId) return;
    try {
      setIsLoadingProducts(true);
      const data = await mobilePosService.getProducts({
        id_sucursal: selectedBranchId,
        search: searchProduct.trim() || undefined,
      });
      setProducts(data);
    } catch (err) {
      console.warn('Error cargando prendas POS:', err);
    } finally {
      setIsLoadingProducts(false);
    }
  }, [selectedBranchId, searchProduct]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Búsqueda de cliente
  const handleSearchClients = async (text: string) => {
    setClientSearch(text);
    if (text.trim().length < 2) {
      setClientResults([]);
      return;
    }
    try {
      setIsSearchingClient(true);
      const res = await mobilePosService.searchClients(text);
      setClientResults(res);
    } catch {
      setClientResults([]);
    } finally {
      setIsSearchingClient(false);
    }
  };

  const handleSelectClient = (c: POSClientResult) => {
    setSelectedClient(c);
    setNitFactura(c.ci || '0');
    setRazonSocialFactura(c.nombre_completo);
    setClientSearch('');
    setClientResults([]);
  };

  const handleSetConsumerFinal = () => {
    setSelectedClient(null);
    setNitFactura('0');
    setRazonSocialFactura('Consumidor Final');
    setClientSearch('');
    setClientResults([]);
  };

  // Agregar Variante a la Venta
  const handleAddToCart = (product: POSProduct, variant: POSProductVariant) => {
    if (variant.stock_disponible <= 0) {
      Alert.alert('Sin Stock', 'No quedan unidades disponibles de esta variante en esta sucursal.');
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.id_producto_variante === variant.id_producto_variante);
      if (existing) {
        if (existing.cantidad >= variant.stock_disponible) {
          Alert.alert('Tope de Stock', `Solo hay ${variant.stock_disponible} unidades disponibles.`);
          return prev;
        }
        return prev.map((item) =>
          item.id_producto_variante === variant.id_producto_variante
            ? {
                ...item,
                cantidad: item.cantidad + 1,
                subtotal: (item.cantidad + 1) * item.precio_unitario,
              }
            : item,
        );
      } else {
        const newItem: POSCartItem = {
          id_producto_variante: variant.id_producto_variante,
          id_producto: product.id_producto,
          nombre_producto: product.nombre,
          imagen: product.imagen,
          sku: variant.sku,
          talla: variant.talla,
          color: variant.color,
          color_hex: variant.color_hex,
          cantidad: 1,
          precio_regular: variant.precio_regular,
          precio_unitario: variant.precio_final,
          descuento_unitario: variant.precio_regular - variant.precio_final,
          subtotal: variant.precio_final,
          stock_max: variant.stock_disponible,
        };
        return [...prev, newItem];
      }
    });
  };

  const handleUpdateQuantity = (variantId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id_producto_variante === variantId) {
            const newQty = item.cantidad + delta;
            if (newQty <= 0) return null;
            if (newQty > item.stock_max) {
              Alert.alert('Stock Máximo', `Máximo disponible: ${item.stock_max}`);
              return item;
            }
            return {
              ...item,
              cantidad: newQty,
              subtotal: newQty * item.precio_unitario,
            };
          }
          return item;
        })
        .filter(Boolean) as POSCartItem[],
    );
  };

  const handleRemoveFromCart = (variantId: number) => {
    setCart((prev) => prev.filter((item) => item.id_producto_variante !== variantId));
  };

  const totalVenta = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.subtotal, 0);
  }, [cart]);

  const totalPrendas = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.cantidad, 0);
  }, [cart]);

  const cambioCalculado = useMemo(() => {
    const received = parseFloat(cashReceived) || 0;
    return Math.max(0, received - totalVenta);
  }, [cashReceived, totalVenta]);

  // Confirmar Venta y Facturar
  const handleProcessSale = async () => {
    if (!selectedBranchId) return;
    if (cart.length === 0) {
      Alert.alert('Venta Vacía', 'Agrega al menos una prenda para registrar la venta.');
      return;
    }

    if (paymentMethod === 'efectivo') {
      const received = parseFloat(cashReceived) || 0;
      if (received < totalVenta) {
        Alert.alert('Monto Insuficiente', `El total es de ${totalVenta.toFixed(2)} Bs y se ingresó ${received.toFixed(2)} Bs.`);
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const res = await mobilePosService.registerSale({
        id_sucursal: selectedBranchId,
        items: cart.map((c) => ({
          id_producto_variante: c.id_producto_variante,
          cantidad: c.cantidad,
        })),
        metodo_pago: paymentMethod,
        monto_recibido: paymentMethod === 'efectivo' ? parseFloat(cashReceived) : totalVenta,
        id_cliente: selectedClient?.id_cliente,
        cliente_ci: nitFactura,
        cliente_nombre: razonSocialFactura,
        nit_factura: nitFactura,
        razon_social_factura: razonSocialFactura,
      });

      setSaleReceipt(res);
      setIsCheckoutModalVisible(false);
      setCart([]);
      setCashReceived('');
      loadProducts(); // actualizar stock
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || err?.message || 'No se pudo procesar la venta');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>💳 Registrar Venta Presencial (POS)</Text>
          <Text style={styles.headerSubtitle}>Vende prendas en mostrador y emite facturas con NIT</Text>
        </View>
        <TouchableOpacity
          style={styles.historyBtn}
          onPress={() => navigation?.navigate('SalesHistory')}
        >
          <Text style={styles.historyBtnText}>📋 Historial</Text>
        </TouchableOpacity>
      </View>

      {/* Selector de Sucursal */}
      {branches.length > 1 && (
        <View style={styles.branchRow}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={branches}
            keyExtractor={(item) => String(item.id_sucursal)}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.branchPill,
                  selectedBranchId === item.id_sucursal && styles.branchPillActive,
                ]}
                onPress={() => setSelectedBranchId(item.id_sucursal)}
              >
                <Text
                  style={[
                    styles.branchPillText,
                    selectedBranchId === item.id_sucursal && styles.branchPillTextActive,
                  ]}
                >
                  📍 {item.nombre}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Barra de Búsqueda de Productos y Escáner QR/Código */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar prenda o código SKU..."
          placeholderTextColor="#8C8C8C"
          value={searchProduct}
          onChangeText={setSearchProduct}
        />
        {searchProduct.length > 0 && (
          <TouchableOpacity onPress={() => setSearchProduct('')} style={{ padding: 6 }}>
            <Text style={{ color: '#999' }}>✕</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.btnScannerTrigger}
          onPress={() => setIsScannerOpen(true)}
          activeOpacity={0.8}
        >
          <Text style={{ fontSize: 18 }}>📷</Text>
        </TouchableOpacity>
      </View>

      {/* Grid de Productos con Variantes */}
      <View style={{ flex: 1 }}>
        {isLoadingProducts ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#1A1A1A" />
            <Text style={styles.loadingText}>Consultando stock disponible...</Text>
          </View>
        ) : products.length === 0 ? (
          <View style={styles.centerContainer}>
            <Text style={{ fontSize: 36, marginBottom: 8 }}>📦</Text>
            <Text style={styles.emptyTitle}>Sin prendas disponibles</Text>
            <Text style={styles.emptySub}>No hay existencias para la búsqueda o sucursal seleccionada.</Text>
          </View>
        ) : (
          <FlatList
            data={products}
            keyExtractor={(item) => String(item.id_producto)}
            contentContainerStyle={styles.productList}
            renderItem={({ item }) => (
              <View style={styles.productCard}>
                <View style={styles.productMainRow}>
                  {item.imagen ? (
                    <Image source={{ uri: item.imagen }} style={styles.productThumb} />
                  ) : (
                    <View style={[styles.productThumb, styles.productThumbPlaceholder]}>
                      <Text style={{ fontSize: 18 }}>👗</Text>
                    </View>
                  )}
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.productName}>{item.nombre}</Text>
                    <Text style={styles.productCategory}>{item.categoria}</Text>
                    <Text style={styles.productPrice}>{item.precio_base.toFixed(2)} Bs</Text>
                  </View>
                </View>

                {/* Variantes en stock */}
                <Text style={styles.variantsLabel}>Tallas y colores en sucursal:</Text>
                <View style={styles.variantChips}>
                  {item.variantes.map((v) => (
                    <TouchableOpacity
                      key={v.id_producto_variante}
                      style={[
                        styles.variantChip,
                        v.stock_disponible <= 0 && styles.variantChipDisabled,
                      ]}
                      onPress={() => handleAddToCart(item, v)}
                      disabled={v.stock_disponible <= 0}
                    >
                      <Text
                        style={[
                          styles.variantChipText,
                          v.stock_disponible <= 0 && styles.variantChipTextDisabled,
                        ]}
                      >
                        {v.talla} • {v.color} ({v.stock_disponible})
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          />
        )}
      </View>

      {/* Barra Inferior del Carrito POS */}
      {cart.length > 0 && (
        <View style={styles.cartFooter}>
          <View style={styles.cartFooterInfo}>
            <Text style={styles.cartFooterQty}>
              🛒 {totalPrendas} {totalPrendas === 1 ? 'prenda' : 'prendas'}
            </Text>
            <Text style={styles.cartFooterTotal}>
              Total: {totalVenta.toFixed(2)} Bs
            </Text>
          </View>
          <TouchableOpacity
            style={styles.btnCharge}
            onPress={() => setIsCheckoutModalVisible(true)}
          >
            <Text style={styles.btnChargeText}>Cobrar ➔</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Modal de Cobro y Emisión de Factura */}
      <Modal
        visible={isCheckoutModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsCheckoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Emitir Venta y Factura</Text>
              <TouchableOpacity onPress={() => setIsCheckoutModalVisible(false)} style={{ padding: 6 }}>
                <Text style={{ fontSize: 18, color: '#666' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Cliente y Factura */}
              <View style={styles.sectionBox}>
                <Text style={styles.sectionTitle}>Datos de Facturación</Text>
                
                {/* Buscador de cliente registrado */}
                <View style={styles.clientSearchRow}>
                  <TextInput
                    style={styles.clientSearchInput}
                    placeholder="Buscar por CI, NIT o nombre..."
                    placeholderTextColor="#999"
                    value={clientSearch}
                    onChangeText={handleSearchClients}
                  />
                  <TouchableOpacity
                    style={styles.btnConsumerFinal}
                    onPress={handleSetConsumerFinal}
                  >
                    <Text style={styles.btnConsumerFinalText}>Consumidor Final</Text>
                  </TouchableOpacity>
                </View>

                {isSearchingClient && <ActivityIndicator size="small" color="#1A1A1A" style={{ marginVertical: 6 }} />}

                {clientResults.length > 0 && (
                  <View style={styles.clientResultsBox}>
                    {clientResults.slice(0, 4).map((c) => (
                      <TouchableOpacity
                        key={c.id_cliente}
                        style={styles.clientResultItem}
                        onPress={() => handleSelectClient(c)}
                      >
                        <Text style={styles.clientResultName}>{c.nombre_completo}</Text>
                        <Text style={styles.clientResultSub}>CI/NIT: {c.ci || 'Sin CI'}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>NIT / C.I.:</Text>
                  <TextInput
                    style={styles.inputField}
                    value={nitFactura}
                    onChangeText={setNitFactura}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Razón Social / Nombre:</Text>
                  <TextInput
                    style={styles.inputField}
                    value={razonSocialFactura}
                    onChangeText={setRazonSocialFactura}
                  />
                </View>
              </View>

              {/* Prendas en la Venta */}
              <View style={styles.sectionBox}>
                <Text style={styles.sectionTitle}>Resumen de Prendas ({cart.length})</Text>
                {cart.map((item) => (
                  <View key={item.id_producto_variante} style={styles.cartRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cartItemTitle}>{item.nombre_producto}</Text>
                      <Text style={styles.cartItemSub}>{item.talla} • {item.color}</Text>
                      <Text style={styles.cartItemPrice}>{item.precio_unitario.toFixed(2)} Bs c/u</Text>
                    </View>
                    <View style={styles.qtyControls}>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => handleUpdateQuantity(item.id_producto_variante, -1)}
                      >
                        <Text style={styles.qtyBtnText}>-</Text>
                      </TouchableOpacity>
                      <Text style={styles.qtyText}>{item.cantidad}</Text>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => handleUpdateQuantity(item.id_producto_variante, 1)}
                      >
                        <Text style={styles.qtyBtnText}>+</Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.cartItemTotal}>{item.subtotal.toFixed(2)} Bs</Text>
                  </View>
                ))}
              </View>

              {/* Método de Cobro */}
              <View style={styles.sectionBox}>
                <Text style={styles.sectionTitle}>Método de Pago</Text>
                <View style={styles.paymentTabs}>
                  {(['efectivo', 'qr', 'tarjeta'] as const).map((m) => (
                    <TouchableOpacity
                      key={m}
                      style={[styles.payTab, paymentMethod === m && styles.payTabActive]}
                      onPress={() => setPaymentMethod(m)}
                    >
                      <Text style={[styles.payTabText, paymentMethod === m && styles.payTabTextActive]}>
                        {m === 'efectivo' ? '💵 Efectivo' : m === 'qr' ? '🏁 QR Simple' : '💳 Tarjeta'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {paymentMethod === 'efectivo' && (
                  <View style={styles.cashBox}>
                    <Text style={styles.inputLabel}>Monto recibido del cliente (Bs):</Text>
                    <TextInput
                      style={styles.cashInput}
                      placeholder={totalVenta.toFixed(2)}
                      placeholderTextColor="#AAA"
                      keyboardType="numeric"
                      value={cashReceived}
                      onChangeText={setCashReceived}
                    />
                    <View style={styles.changeRow}>
                      <Text style={styles.changeLabel}>Cambio a devolver:</Text>
                      <Text style={styles.changeValue}>{cambioCalculado.toFixed(2)} Bs</Text>
                    </View>
                  </View>
                )}

                {paymentMethod === 'qr' && (
                  <View style={styles.qrPromptBox}>
                    <Text style={styles.qrPromptTitle}>Cobro con Código QR Oficial</Text>
                    <Text style={styles.qrPromptSub}>
                      Muestra este QR al cliente para transferir {totalVenta.toFixed(2)} Bs directamente desde su banca móvil.
                    </Text>

                    {/* QR Único Mostrado al Cliente */}
                    <View style={styles.posQrDisplayWrapper}>
                      <Image
                        source={{
                          uri:
                            companyQr?.qr_tipo_cobro === 'imagen' && companyQr?.qr_imagen_url
                              ? companyQr.qr_imagen_url
                              : `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                                  `PAGO-POS|BANCO:${companyQr?.qr_cuenta_banco || 'Banco Unión'}|CTA:${
                                    companyQr?.qr_numero_cuenta || '1000003928174'
                                  }|TIT:${
                                    companyQr?.qr_titular || currentTenant?.name || 'FashionStore'
                                  }|MONTO:${totalVenta.toFixed(2)}BS`
                                )}`,
                        }}
                        style={styles.posQrImage}
                        resizeMode="contain"
                      />
                    </View>

                    <Text style={styles.posQrBankInfo}>
                      🏦 {companyQr?.qr_cuenta_banco || 'Banco Unión'} • Cta: {companyQr?.qr_numero_cuenta || '1000003928174'}
                    </Text>
                    <Text style={styles.posQrTitularInfo}>
                      Titular: {companyQr?.qr_titular || currentTenant?.name || 'FashionStore'}
                    </Text>

                    {/* Botón para Configurar o Subir QR desde el POS */}
                    <TouchableOpacity
                      style={styles.btnConfigPosQr}
                      onPress={() => setIsManageQrOpen(true)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.btnConfigPosQrText}>⚙️ Cambiar / Subir Imagen de QR</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {paymentMethod === 'tarjeta' && (
                  <View style={styles.qrPromptBox}>
                    <Text style={styles.qrPromptTitle}>Cobro con Terminal / Stripe</Text>
                    <Text style={styles.qrPromptSub}>
                      Pase la tarjeta del cliente por el POS físico o use la pasarela oficial.
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.modalTotalBanner}>
                <Text style={styles.bannerLabel}>Total a Facturar:</Text>
                <Text style={styles.bannerAmount}>{totalVenta.toFixed(2)} Bs</Text>
              </View>

              {/* Botón de Confirmación */}
              <TouchableOpacity
                style={[styles.btnConfirmSale, isSubmitting && { opacity: 0.6 }]}
                onPress={handleProcessSale}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.btnConfirmSaleText}>
                    Confirmar Cobro y Emitir Factura
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Recibo de Factura Emitida */}
      {saleReceipt && (
        <Modal visible={true} transparent={true} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.receiptBox}>
              <Text style={styles.receiptCheck}>✓</Text>
              <Text style={styles.receiptTitle}>¡Venta y Factura Emitida!</Text>
              <Text style={styles.receiptCode}>Comprobante #{saleReceipt.codigo_venta}</Text>

              <View style={styles.receiptDetails}>
                <Text style={styles.receiptRow}>
                  <Text style={{ fontWeight: '700' }}>Cliente: </Text>
                  {saleReceipt.cliente?.nombre_completo || 'Consumidor Final'}
                </Text>
                <Text style={styles.receiptRow}>
                  <Text style={{ fontWeight: '700' }}>NIT/CI: </Text>
                  {saleReceipt.factura?.nit_cliente || '0'}
                </Text>
                <Text style={styles.receiptRow}>
                  <Text style={{ fontWeight: '700' }}>Sucursal: </Text>
                  {saleReceipt.sucursal?.nombre}
                </Text>
                <Text style={styles.receiptRow}>
                  <Text style={{ fontWeight: '700' }}>Método de Pago: </Text>
                  {saleReceipt.pago?.metodo?.toUpperCase()}
                </Text>
                <Text style={styles.receiptRow}>
                  <Text style={{ fontWeight: '700' }}>Total Pagado: </Text>
                  {saleReceipt.total.toFixed(2)} Bs
                </Text>
                {saleReceipt.pago?.cambio !== undefined && (
                  <Text style={styles.receiptRow}>
                    <Text style={{ fontWeight: '700' }}>Cambio entregado: </Text>
                    {saleReceipt.pago.cambio.toFixed(2)} Bs
                  </Text>
                )}
                {saleReceipt.factura?.numero_factura && (
                  <Text style={styles.receiptRow}>
                    <Text style={{ fontWeight: '700' }}>N° Factura: </Text>
                    {saleReceipt.factura.numero_factura}
                  </Text>
                )}
              </View>

              <TouchableOpacity
                style={styles.btnCloseReceipt}
                onPress={() => setSaleReceipt(null)}
              >
                <Text style={styles.btnCloseReceiptText}>Cerrar y Nueva Venta</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Escáner de Código/QR de Prenda con Cámara */}
      <CameraQrScannerModal
        visible={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={(code) => {
          setIsScannerOpen(false);
          setSearchProduct(code);
        }}
      />

      {/* Modal para que Admin/Cajero configure y suba el QR */}
      <ManageQrConfigModal
        visible={isManageQrOpen}
        onClose={() => setIsManageQrOpen(false)}
        currentSettings={companyQr}
        tenantKey={tenantKey}
        onUpdated={(newSettings) => setCompanyQr(newSettings)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  btnScannerTrigger: {
    padding: 8,
    marginLeft: 4,
    backgroundColor: '#FAF5EE',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8E3DC',
  },
  container: {
    flex: 1,
    backgroundColor: '#F9F8F6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EDEBE8',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1C1510',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#7C7267',
    marginTop: 2,
  },
  historyBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F3EFEA',
    borderWidth: 1,
    borderColor: '#E8E4DF',
  },
  historyBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8C5E35',
  },
  branchRow: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0ECE8',
  },
  branchPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3EFEA',
    marginRight: 8,
  },
  branchPillActive: {
    backgroundColor: '#1C1510',
  },
  branchPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#554A40',
  },
  branchPillTextActive: {
    color: '#FFFFFF',
  },
  searchBar: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAE6DF',
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    height: 42,
    fontSize: 13,
    color: '#1C1510',
  },
  productList: {
    padding: 16,
    paddingBottom: 90,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EFEBE6',
  },
  productMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productThumb: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  productThumbPlaceholder: {
    backgroundColor: '#F3EFEA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1510',
  },
  productCategory: {
    fontSize: 11,
    color: '#777',
    marginTop: 1,
  },
  productPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: '#8C5E35',
    marginTop: 2,
  },
  variantsLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8C8379',
    marginTop: 10,
    marginBottom: 6,
  },
  variantChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  variantChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#F8F5F1',
    borderWidth: 1,
    borderColor: '#E8E3DC',
  },
  variantChipDisabled: {
    opacity: 0.35,
    backgroundColor: '#EBEBEB',
  },
  variantChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1C1510',
  },
  variantChipTextDisabled: {
    color: '#888',
  },
  cartFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1C1510',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  cartFooterInfo: {},
  cartFooterQty: {
    color: '#C7B9AA',
    fontSize: 12,
  },
  cartFooterTotal: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  btnCharge: {
    backgroundColor: '#8C5E35',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  btnChargeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1510',
  },
  emptySub: {
    fontSize: 12,
    color: '#777',
    textAlign: 'center',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1C1510',
  },
  sectionBox: {
    backgroundColor: '#FAF8F5',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EFEBE6',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1C1510',
    marginBottom: 8,
  },
  clientSearchRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  clientSearchInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8E3DC',
    paddingHorizontal: 10,
    fontSize: 12,
    color: '#1C1510',
  },
  btnConsumerFinal: {
    backgroundColor: '#EFEBE6',
    borderRadius: 8,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  btnConsumerFinalText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#554A40',
  },
  clientResultsBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8E3DC',
    marginBottom: 8,
  },
  clientResultItem: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0ECE8',
  },
  clientResultName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C1510',
  },
  clientResultSub: {
    fontSize: 10,
    color: '#888',
  },
  inputGroup: {
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
    marginBottom: 2,
  },
  inputField: {
    height: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8E3DC',
    paddingHorizontal: 10,
    fontSize: 13,
    color: '#1C1510',
  },
  cartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EDEBE8',
  },
  cartItemTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C1510',
  },
  cartItemSub: {
    fontSize: 10,
    color: '#777',
  },
  cartItemPrice: {
    fontSize: 11,
    color: '#8C5E35',
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    gap: 6,
  },
  qtyBtn: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: '#EFEBE6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnText: {
    fontWeight: '800',
    fontSize: 14,
    color: '#1C1510',
  },
  qtyText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cartItemTotal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1C1510',
    width: 65,
    textAlign: 'right',
  },
  paymentTabs: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  payTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#EFEBE6',
    alignItems: 'center',
  },
  payTabActive: {
    backgroundColor: '#8C5E35',
  },
  payTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6E6259',
  },
  payTabTextActive: {
    color: '#FFFFFF',
  },
  cashBox: {
    marginTop: 6,
  },
  cashInput: {
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#8C5E35',
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1510',
  },
  changeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  changeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#554A40',
  },
  changeValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#065F46',
  },
  qrPromptBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E8E3DC',
    alignItems: 'center',
  },
  qrPromptTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#8C5E35',
  },
  qrPromptSub: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
    textAlign: 'center',
    marginBottom: 8,
  },
  posQrDisplayWrapper: {
    width: 170,
    height: 170,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
  },
  posQrImage: {
    width: '100%',
    height: '100%',
  },
  posQrBankInfo: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 4,
  },
  posQrTitularInfo: {
    fontSize: 11,
    color: '#4B5563',
    marginTop: 2,
  },
  btnConfigPosQr: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#8C5E35',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  btnConfigPosQrText: {
    color: '#8C5E35',
    fontSize: 11,
    fontWeight: '700',
  },
  modalTotalBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderTopWidth: 1,
    borderTopColor: '#EDEBE8',
  },
  bannerLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1C1510',
  },
  bannerAmount: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1C1510',
  },
  btnConfirmSale: {
    backgroundColor: '#065F46',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  btnConfirmSaleText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  receiptBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 20,
    alignItems: 'center',
  },
  receiptCheck: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#D1FAE5',
    color: '#065F46',
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 52,
    marginBottom: 12,
  },
  receiptTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1C1510',
  },
  receiptCode: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8C5E35',
    marginTop: 2,
    marginBottom: 14,
  },
  receiptDetails: {
    width: '100%',
    backgroundColor: '#FAF8F5',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    gap: 4,
  },
  receiptRow: {
    fontSize: 13,
    color: '#444',
  },
  btnCloseReceipt: {
    backgroundColor: '#1C1510',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  btnCloseReceiptText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
