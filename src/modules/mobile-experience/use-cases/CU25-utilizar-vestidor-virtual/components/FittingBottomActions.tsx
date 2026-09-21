import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

interface FittingBottomActionsProps {
  onAddToCart: () => void;
  onReserve: () => void;
  onRecalibrate: () => void;
  showLandmarks: boolean;
  onToggleLandmarks: () => void;
  isAddingToCart?: boolean;
  disabled?: boolean;
  finalPrice?: number;
}

export const FittingBottomActions: React.FC<FittingBottomActionsProps> = ({
  onAddToCart,
  onReserve,
  onRecalibrate,
  showLandmarks,
  onToggleLandmarks,
  isAddingToCart = false,
  disabled = false,
  finalPrice,
}) => {
  return (
    <View style={styles.container}>
      {/* Botones secundarios de RA */}
      <View style={styles.secondaryRow}>
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={onRecalibrate}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryBtnIcon}>↺</Text>
          <Text style={styles.secondaryBtnText}>Recalibrar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryBtn, showLandmarks && styles.secondaryBtnActive]}
          onPress={onToggleLandmarks}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryBtnIcon}>{showLandmarks ? '👁️' : '🕶️'}</Text>
          <Text
            style={[
              styles.secondaryBtnText,
              showLandmarks && styles.secondaryBtnTextActive,
            ]}
          >
            {showLandmarks ? 'Ocultar Puntos' : 'Ver Puntos'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Botones principales de Compra y Reserva */}
      <View style={styles.primaryRow}>
        <TouchableOpacity
          style={[styles.reserveBtn, disabled && styles.btnDisabled]}
          onPress={onReserve}
          disabled={disabled}
          activeOpacity={0.85}
        >
          <Text style={styles.reserveBtnIcon}>📅</Text>
          <Text style={styles.reserveBtnText}>Reservar en Tienda</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.cartBtn, (disabled || isAddingToCart) && styles.btnDisabled]}
          onPress={onAddToCart}
          disabled={disabled || isAddingToCart}
          activeOpacity={0.85}
        >
          {isAddingToCart ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.cartBtnIcon}>🛍️</Text>
              <Text style={styles.cartBtnText}>
                {finalPrice !== undefined
                  ? `Bolsa • Bs ${finalPrice.toFixed(2)}`
                  : 'Agregar a la Bolsa'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EBEBEB',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 8,
  },
  secondaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 10,
  },
  secondaryBtn: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  secondaryBtnActive: {
    borderColor: '#C4956A',
    backgroundColor: '#FAF5EF',
  },
  secondaryBtnIcon: {
    fontSize: 13,
  },
  secondaryBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4B5563',
  },
  secondaryBtnTextActive: {
    color: '#92400E',
    fontWeight: '700',
  },
  primaryRow: {
    flexDirection: 'row',
    gap: 10,
  },
  reserveBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#1A1A1A',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  reserveBtnIcon: {
    fontSize: 15,
  },
  reserveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  cartBtn: {
    flex: 1.4,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#1A1A1A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  cartBtnIcon: {
    fontSize: 15,
  },
  cartBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  btnDisabled: {
    opacity: 0.5,
  },
});

export default FittingBottomActions;
