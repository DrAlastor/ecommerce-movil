import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  BranchAvailability,
  ReservationReceipt,
} from '../types/reservation.types';
import { mobileReservationService } from '../services/reservation.service';

interface MobileReservationModalProps {
  visible: boolean;
  onClose: () => void;
  product: {
    id_producto: number;
    nombre: string;
    precio_base: number;
    imagenes?: Array<{ url: string; es_principal?: boolean }>;
  };
  selectedVariant: {
    id_producto_variante: number;
    sku: string;
    precio_adicional?: number;
    talla: { codigo: string };
    color: { nombre: string; codigo_hex?: string | null };
    imagen_url?: string | null;
  } | null;
  onReservationSuccess: (receipt: ReservationReceipt) => void;
  onRequireLogin?: () => void;
}

export const MobileReservationModal: React.FC<MobileReservationModalProps> = ({
  visible,
  onClose,
  product,
  selectedVariant,
  onReservationSuccess,
  onRequireLogin,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [branches, setBranches] = useState<BranchAvailability[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedDateOption, setSelectedDateOption] = useState<'today' | 'tomorrow' | 'after'>('tomorrow');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (visible && selectedVariant) {
      setQuantity(1);
      setNotes('');
      loadBranches(selectedVariant.id_producto_variante);
    }
  }, [visible, selectedVariant]);

  const loadBranches = async (variantId: number) => {
    try {
      setLoading(true);
      const res = await mobileReservationService.getBranchAvailability(variantId);
      setBranches(res.sucursales);

      const firstWithStock = res.sucursales.find((s) => s.stock_disponible > 0);
      if (firstWithStock) {
        setSelectedBranchId(firstWithStock.id_sucursal);
      } else if (res.sucursales.length > 0) {
        setSelectedBranchId(res.sucursales[0].id_sucursal);
      }
    } catch (err) {
      console.error('Error fetching branches in mobile:', err);
      Alert.alert('Error', 'No se pudieron consultar las sucursales disponibles.');
    } finally {
      setLoading(false);
    }
  };

  if (!selectedVariant) return null;

  const selectedBranch = branches.find((b) => b.id_sucursal === selectedBranchId);
  const maxStock = selectedBranch ? selectedBranch.stock_disponible : 0;
  const hasStock = maxStock > 0;

  const handleQtyMinus = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleQtyPlus = () => {
    if (quantity < maxStock) setQuantity(quantity + 1);
  };

  const getTargetDateIso = () => {
    const d = new Date();
    if (selectedDateOption === 'tomorrow') {
      d.setDate(d.getDate() + 1);
    } else if (selectedDateOption === 'after') {
      d.setDate(d.getDate() + 2);
    }
    return d.toISOString();
  };

  const handleConfirm = async () => {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) {
      Alert.alert(
        'Iniciar Sesión',
        'Debes iniciar sesión con tu cuenta de cliente para reservar prendas.',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Ir a Iniciar Sesión',
            onPress: () => {
              onClose();
              if (onRequireLogin) onRequireLogin();
            },
          },
        ],
      );
      return;
    }

    if (!selectedBranchId) {
      Alert.alert('Atención', 'Selecciona una sucursal.');
      return;
    }

    if (!hasStock) {
      Alert.alert('Sin existencias', 'Esta sucursal no tiene stock disponible.');
      return;
    }

    try {
      setSubmitting(true);
      const receipt = await mobileReservationService.createReservation({
        id_sucursal: selectedBranchId,
        id_producto_variante: selectedVariant.id_producto_variante,
        cantidad: quantity,
        fecha_visita: getTargetDateIso(),
        observaciones: notes.trim() || undefined,
      });

      onReservationSuccess(receipt);
    } catch (err: any) {
      console.error('Error creating reservation in mobile:', err);
      const msg =
        err.response?.data?.message ||
        'No se pudo completar la reserva. Intenta nuevamente.';
      Alert.alert('No se pudo reservar', msg);
    } finally {
      setSubmitting(false);
    }
  };

  const unitPrice =
    Number(product.precio_base || 0) + Number(selectedVariant.precio_adicional || 0);

  const previewImg =
    selectedVariant.imagen_url ||
    product.imagenes?.find((i) => i.es_principal)?.url ||
    product.imagenes?.[0]?.url;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Encabezado */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Reservar Prenda</Text>
              <Text style={styles.headerSubtitle}>
                Aparta tu talla para probártela en tienda física
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeIconBtn}>
              <Text style={styles.closeIconText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* Prenda Card */}
            <View style={styles.productCard}>
              {previewImg ? (
                <Image source={{ uri: previewImg }} style={styles.productImg} />
              ) : (
                <View style={styles.productImgFallback}>
                  <Text style={{ fontSize: 22 }}>👗</Text>
                </View>
              )}
              <View style={styles.productInfo}>
                <Text style={styles.productTitle} numberOfLines={1}>
                  {product.nombre}
                </Text>
                <Text style={styles.productSpecs}>
                  Talla: {selectedVariant.talla.codigo} • Color: {selectedVariant.color.nombre}
                </Text>
                <Text style={styles.productPrice}>
                  Bs {unitPrice.toFixed(2)} c/u
                </Text>
              </View>
            </View>

            {/* Selector de Sucursal */}
            <Text style={styles.fieldLabel}>🏬 Selecciona Sucursal con Stock:</Text>
            {loading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="small" color="#1C1917" />
                <Text style={styles.loadingText}>Consultando stock en tiendas...</Text>
              </View>
            ) : branches.length === 0 ? (
              <Text style={styles.emptyText}>No hay sucursales activas registradas.</Text>
            ) : (
              <View style={styles.branchesList}>
                {branches.map((b) => {
                  const isSelected = b.id_sucursal === selectedBranchId;
                  const available = b.stock_disponible > 0;
                  return (
                    <TouchableOpacity
                      key={b.id_sucursal}
                      style={[
                        styles.branchItem,
                        isSelected && styles.branchItemSelected,
                        !available && styles.branchItemDisabled,
                      ]}
                      onPress={() => setSelectedBranchId(b.id_sucursal)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.branchHeaderRow}>
                        <Text style={styles.branchName}>{b.nombre}</Text>
                        <View
                          style={[
                            styles.stockPill,
                            available ? styles.stockPillIn : styles.stockPillOut,
                          ]}
                        >
                          <Text
                            style={[
                              styles.stockPillText,
                              available ? styles.stockPillTextIn : styles.stockPillTextOut,
                            ]}
                          >
                            {available ? `${b.stock_disponible} disp.` : 'Agotado'}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.branchSubText}>
                        📍 {b.direccion} ({b.ciudad})
                      </Text>
                      <Text style={styles.branchSubText}>
                        🕒 {b.hora_apertura} - {b.hora_cierre}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* Cantidad y Fecha */}
            <View style={styles.rowTwoCols}>
              {/* Cantidad */}
              <View style={styles.col}>
                <Text style={styles.fieldLabel}>Cantidad:</Text>
                <View style={styles.stepperWrap}>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={handleQtyMinus}
                    disabled={quantity <= 1 || !hasStock}
                  >
                    <Text style={styles.stepperSign}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.stepperValue}>{quantity}</Text>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={handleQtyPlus}
                    disabled={quantity >= maxStock || !hasStock}
                  >
                    <Text style={styles.stepperSign}>+</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.hintText}>
                  {hasStock ? `Máx. ${maxStock}` : 'Sin stock'}
                </Text>
              </View>

              {/* Fecha Prevista */}
              <View style={styles.col}>
                <Text style={styles.fieldLabel}>Día de visita:</Text>
                <View style={styles.dateChipsRow}>
                  <TouchableOpacity
                    style={[
                      styles.dateChip,
                      selectedDateOption === 'today' && styles.dateChipSelected,
                    ]}
                    onPress={() => setSelectedDateOption('today')}
                  >
                    <Text
                      style={[
                        styles.dateChipText,
                        selectedDateOption === 'today' && styles.dateChipTextSelected,
                      ]}
                    >
                      Hoy
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.dateChip,
                      selectedDateOption === 'tomorrow' && styles.dateChipSelected,
                    ]}
                    onPress={() => setSelectedDateOption('tomorrow')}
                  >
                    <Text
                      style={[
                        styles.dateChipText,
                        selectedDateOption === 'tomorrow' && styles.dateChipTextSelected,
                      ]}
                    >
                      Mañana
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.dateChip,
                      selectedDateOption === 'after' && styles.dateChipSelected,
                    ]}
                    onPress={() => setSelectedDateOption('after')}
                  >
                    <Text
                      style={[
                        styles.dateChipText,
                        selectedDateOption === 'after' && styles.dateChipTextSelected,
                      ]}
                    >
                      En 2 días
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Observaciones */}
            <Text style={styles.fieldLabel}>Observaciones (opcional):</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Ej: Llegaré al final de la tarde..."
              value={notes}
              onChangeText={setNotes}
              maxLength={150}
            />

            {/* Política */}
            <View style={styles.policyBox}>
              <Text style={styles.policyText}>
                🛡️ Apartado temporal por 48 horas sin costo alguno. El pago se efectúa en tienda únicamente si te la llevas.
              </Text>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <View style={styles.footerInfo}>
              <Text style={styles.subtotalLabel}>Total Referencial:</Text>
              <Text style={styles.subtotalPrice}>
                Bs {(unitPrice * quantity).toFixed(2)}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.confirmBtn,
                (!hasStock || submitting) && styles.confirmBtnDisabled,
              ]}
              onPress={handleConfirm}
              disabled={!hasStock || submitting}
              activeOpacity={0.85}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.confirmBtnText}>Confirmar Reserva</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '88%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  closeIconBtn: {
    padding: 6,
  },
  closeIconText: {
    fontSize: 18,
    color: '#9CA3AF',
    fontWeight: '700',
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#FAFAF9',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E7E5E4',
  },
  productImg: {
    width: 54,
    height: 64,
    borderRadius: 8,
  },
  productImgFallback: {
    width: 54,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#E7E5E4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1917',
  },
  productSpecs: {
    fontSize: 12,
    color: '#78716C',
    marginTop: 2,
  },
  productPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1C1917',
    marginTop: 3,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 6,
    marginTop: 4,
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
  },
  emptyText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  branchesList: {
    gap: 8,
    marginBottom: 14,
  },
  branchItem: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 10,
    backgroundColor: '#FFFFFF',
  },
  branchItemSelected: {
    borderColor: '#1C1917',
    backgroundColor: '#FAFAF9',
  },
  branchItemDisabled: {
    opacity: 0.5,
  },
  branchHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  branchName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  stockPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  stockPillIn: {
    backgroundColor: '#ECFDF5',
  },
  stockPillOut: {
    backgroundColor: '#FEF2F2',
  },
  stockPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  stockPillTextIn: {
    color: '#065F46',
  },
  stockPillTextOut: {
    color: '#991B1B',
  },
  branchSubText: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  rowTwoCols: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  col: {
    flex: 1,
  },
  stepperWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    height: 40,
    width: 100,
    justifyContent: 'space-between',
  },
  stepperBtn: {
    paddingHorizontal: 12,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperSign: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
  },
  stepperValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  hintText: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 2,
  },
  dateChipsRow: {
    flexDirection: 'row',
    gap: 4,
    height: 40,
    alignItems: 'center',
  },
  dateChip: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  dateChipSelected: {
    backgroundColor: '#1C1917',
    borderColor: '#1C1917',
  },
  dateChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
  },
  dateChipTextSelected: {
    color: '#FFFFFF',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: '#111827',
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  policyBox: {
    backgroundColor: '#F0FDF4',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  policyText: {
    fontSize: 11,
    color: '#166534',
    lineHeight: 15,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  footerInfo: {
    flexDirection: 'column',
  },
  subtotalLabel: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  subtotalPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  confirmBtn: {
    backgroundColor: '#1C1917',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    minWidth: 150,
    alignItems: 'center',
  },
  confirmBtnDisabled: {
    backgroundColor: '#D1D5DB',
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
