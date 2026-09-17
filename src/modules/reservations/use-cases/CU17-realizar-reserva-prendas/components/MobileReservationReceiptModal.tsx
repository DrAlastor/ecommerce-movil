import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import type { ReservationReceipt } from '../types/reservation.types';

interface MobileReservationReceiptModalProps {
  visible: boolean;
  receipt: ReservationReceipt | null;
  onClose: () => void;
  onViewMyReservations?: () => void;
}

export const MobileReservationReceiptModal: React.FC<MobileReservationReceiptModalProps> = ({
  visible,
  receipt,
  onClose,
  onViewMyReservations,
}) => {
  if (!receipt) return null;

  const formattedLimitDate = new Date(receipt.comprobante.fecha_limite).toLocaleDateString(
    'es-BO',
    {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    },
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Text style={styles.checkIcon}>✓</Text>
            </View>
            <Text style={styles.title}>¡Reserva Confirmada!</Text>
            <Text style={styles.subtitle}>
              Tus prendas fueron apartadas temporalmente en tienda.
            </Text>
          </View>

          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* Ticket Card */}
            <View style={styles.ticketCard}>
              <View style={styles.ticketHeader}>
                <View>
                  <Text style={styles.ticketCodeLabel}>CÓDIGO DE RESERVA</Text>
                  <Text style={styles.ticketCode}>{receipt.comprobante.codigo}</Text>
                </View>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{receipt.comprobante.estado}</Text>
                </View>
              </View>

              {/* Simulated Barcode */}
              <View style={styles.barcodeSection}>
                <View style={styles.barcodeLinesRow}>
                  {Array.from({ length: 32 }).map((_, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.barcodeBar,
                        {
                          width: idx % 4 === 0 ? 3 : idx % 2 === 0 ? 2 : 1,
                          marginRight: 2,
                        },
                      ]}
                    />
                  ))}
                </View>
                <Text style={styles.barcodeText}>{receipt.comprobante.codigo}</Text>
              </View>

              {/* Sucursal de Retiro */}
              <View style={styles.infoCard}>
                <Text style={styles.sectionHeading}>🏬 Sucursal de Retiro</Text>
                <Text style={styles.branchName}>{receipt.sucursal.nombre}</Text>
                <Text style={styles.branchDetail}>
                  📍 {receipt.sucursal.direccion} ({receipt.sucursal.ciudad})
                </Text>
                <Text style={styles.branchDetail}>
                  🕒 Horario: {receipt.sucursal.horario}
                </Text>
                {receipt.sucursal.telefono ? (
                  <Text style={styles.branchDetail}>
                    📞 Teléfono: {receipt.sucursal.telefono}
                  </Text>
                ) : null}
              </View>

              {/* Vigencia */}
              <View style={styles.dateRow}>
                <Text style={styles.dateLabel}>⏳ Vigente Hasta (48h):</Text>
                <Text style={styles.dateValue}>{formattedLimitDate}</Text>
              </View>

              {/* Prendas */}
              <View style={styles.itemsSection}>
                <Text style={styles.sectionHeading}>
                  👗 Prendas Apartadas ({receipt.resumen.total_prendas})
                </Text>
                {receipt.items.map((item) => (
                  <View key={item.id_detalle_reserva} style={styles.itemRow}>
                    {item.imagen_url ? (
                      <Image
                        source={{ uri: item.imagen_url }}
                        style={styles.itemImg}
                      />
                    ) : (
                      <View style={styles.itemImgFallback}>
                        <Text style={{ fontSize: 16 }}>👚</Text>
                      </View>
                    )}
                    <View style={styles.itemDetails}>
                      <Text style={styles.itemName} numberOfLines={1}>
                        {item.producto_nombre}
                      </Text>
                      <Text style={styles.itemSpecs}>
                        Talla: {item.talla} • Color: {item.color_nombre}
                      </Text>
                      <Text style={styles.itemQty}>
                        Cant: {item.cantidad} • Bs {item.subtotal_estimado.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Instrucciones */}
              <View style={styles.instructionsBox}>
                <Text style={styles.instructionTitle}>ℹ️ Información Importante:</Text>
                <Text style={styles.instructionText}>
                  • Acude a la sucursal seleccionada con este comprobante o tu código.
                </Text>
                <Text style={styles.instructionText}>
                  • Pruébate las prendas en tienda antes de decidir tu compra.
                </Text>
                <Text style={styles.instructionText}>
                  • El pago se realiza únicamente si decides llevártelas.
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Botón de Cierre */}
          <View style={styles.footer}>
            {onViewMyReservations && (
              <TouchableOpacity
                style={styles.viewReservationsBtn}
                onPress={() => {
                  onClose();
                  onViewMyReservations();
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.viewReservationsBtnText}>Ver Mis Reservas</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.85}>
              <Text style={styles.closeBtnText}>Entendido / Volver a la Tienda</Text>
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
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 24,
  },
  header: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#DCFCE7',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  checkIcon: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#065F46',
  },
  subtitle: {
    fontSize: 13,
    color: '#047857',
    marginTop: 2,
    textAlign: 'center',
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  ticketCard: {
    backgroundColor: '#FAFAF9',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E7E5E4',
    padding: 16,
    marginBottom: 16,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ticketCodeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#78716C',
    letterSpacing: 0.5,
  },
  ticketCode: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1C1917',
    fontFamily: 'monospace',
  },
  statusBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
    textTransform: 'uppercase',
  },
  barcodeSection: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7E5E4',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    marginVertical: 10,
  },
  barcodeLinesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 34,
  },
  barcodeBar: {
    height: 34,
    backgroundColor: '#1C1917',
  },
  barcodeText: {
    fontSize: 11,
    color: '#78716C',
    marginTop: 4,
    letterSpacing: 1,
  },
  infoCard: {
    marginTop: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E7E5E4',
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1917',
    marginBottom: 6,
  },
  branchName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#292524',
    marginBottom: 2,
  },
  branchDetail: {
    fontSize: 12,
    color: '#57534E',
    marginTop: 2,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E7E5E4',
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#78716C',
  },
  dateValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  itemsSection: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E7E5E4',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  itemImg: {
    width: 40,
    height: 48,
    borderRadius: 6,
    marginRight: 10,
  },
  itemImgFallback: {
    width: 40,
    height: 48,
    borderRadius: 6,
    backgroundColor: '#E7E5E4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1C1917',
  },
  itemSpecs: {
    fontSize: 11,
    color: '#78716C',
    marginTop: 1,
  },
  itemQty: {
    fontSize: 11,
    fontWeight: '700',
    color: '#292524',
    marginTop: 2,
  },
  instructionsBox: {
    marginTop: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
  },
  instructionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
  },
  instructionText: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  viewReservationsBtn: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  viewReservationsBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  closeBtn: {
    backgroundColor: '#1C1917',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
