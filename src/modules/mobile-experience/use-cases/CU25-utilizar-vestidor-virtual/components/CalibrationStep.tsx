import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

interface CalibrationStepProps {
  onStart: () => void;
  onBack: () => void;
  productName?: string;
}

export const CalibrationStep: React.FC<CalibrationStepProps> = ({
  onStart,
  onBack,
  productName,
}) => {
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.card}>
        {/* Header Icon */}
        <View style={styles.iconCircle}>
          <Text style={styles.headerIcon}>👗</Text>
        </View>

        <Text style={styles.title}>Calibra tu Vestidor Virtual</Text>
        <Text style={styles.subtitle}>
          {productName ? `Preparando prueba para "${productName}"` : 'Prueba interactiva de prendas en tiempo real'}
        </Text>

        {/* Guía visual del cuerpo y silueta con puntos clave */}
        <View style={styles.silhouetteContainer}>
          <View style={styles.silhouetteBody}>
            {/* Cabeza */}
            <View style={styles.silHead} />
            {/* Cuello */}
            <View style={styles.silNeck} />
            {/* Hombros */}
            <View style={styles.silShoulders}>
              <View style={[styles.landmarkDot, styles.leftShoulder]}>
                <View style={styles.pulseRing} />
              </View>
              <View style={[styles.landmarkDot, styles.rightShoulder]}>
                <View style={styles.pulseRing} />
              </View>
            </View>
            {/* Torso */}
            <View style={styles.silTorso}>
              <View style={[styles.landmarkDot, styles.chestPoint]}>
                <View style={styles.pulseRing} />
              </View>
            </View>
            {/* Cadera */}
            <View style={styles.silHips}>
              <View style={[styles.landmarkDot, styles.leftHip]}>
                <View style={styles.pulseRing} />
              </View>
              <View style={[styles.landmarkDot, styles.rightHip]}>
                <View style={styles.pulseRing} />
              </View>
            </View>
          </View>

          {/* Labels de referencia anatómica */}
          <View style={styles.labelsOverlay}>
            <View style={[styles.labelBadge, { top: 32, left: 16 }]}>
              <Text style={styles.labelBadgeText}>Hombros</Text>
            </View>
            <View style={[styles.labelBadge, { top: 76, right: 16 }]}>
              <Text style={styles.labelBadgeText}>Pecho / Torso</Text>
            </View>
            <View style={[styles.labelBadge, { bottom: 20, left: 20 }]}>
              <Text style={styles.labelBadgeText}>Cintura y Cadera</Text>
            </View>
          </View>

          <View style={styles.scanStatusBadge}>
            <Text style={styles.scanStatusText}>✓ Puntos de referencia listos</Text>
          </View>
        </View>

        {/* Consejos de preparación */}
        <View style={styles.tipsList}>
          <View style={styles.tipItem}>
            <Text style={styles.tipIcon}>📱</Text>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Posición adecuada</Text>
              <Text style={styles.tipDesc}>
                Mantén el teléfono erguido a la altura del pecho para un mejor ángulo.
              </Text>
            </View>
          </View>

          <View style={styles.tipItem}>
            <Text style={styles.tipIcon}>💡</Text>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Buena iluminación</Text>
              <Text style={styles.tipDesc}>
                Ubícate en un espacio con luz frontal y fondo uniforme si es posible.
              </Text>
            </View>
          </View>

          <View style={styles.tipItem}>
            <Text style={styles.tipIcon}>🧍</Text>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Postura natural</Text>
              <Text style={styles.tipDesc}>
                Relaja los hombros para calcular la caída exacta de la tela sobre tu silueta.
              </Text>
            </View>
          </View>
        </View>

        {/* Disclaimer legal RN-M6-12 */}
        <View style={styles.disclaimerBox}>
          <Text style={styles.disclaimerText}>
            ℹ️ <Text style={{ fontWeight: '600' }}>Aviso importante (RN-M6-12):</Text> El vestidor
            virtual ofrece una representación visual de referencia estética. El calce y textura
            pueden variar según el tejido y tus medidas corporales exactas.
          </Text>
        </View>

        {/* Botones de acción */}
        <TouchableOpacity style={styles.startBtn} onPress={onStart} activeOpacity={0.85}>
          <Text style={styles.startBtnIcon}>✨</Text>
          <Text style={styles.startBtnText}>Comenzar Prueba Virtual</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.8}>
          <Text style={styles.backBtnText}>Volver al detalle del producto</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    alignItems: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FAF5EF',
    borderWidth: 1.5,
    borderColor: '#E8D8C8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  headerIcon: {
    fontSize: 28,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  silhouetteContainer: {
    width: '100%',
    height: 230,
    backgroundColor: '#1E2026',
    borderRadius: 16,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2F3442',
    marginBottom: 20,
  },
  silhouetteBody: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  silHead: {
    width: 38,
    height: 48,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginBottom: 4,
  },
  silNeck: {
    width: 14,
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
  },
  silShoulders: {
    width: 140,
    height: 20,
    borderTopWidth: 2.5,
    borderColor: '#C4956A',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  silTorso: {
    width: 86,
    height: 62,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    borderTopWidth: 0,
    borderRadius: 6,
    backgroundColor: 'rgba(196, 149, 106, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  silHips: {
    width: 104,
    height: 26,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  landmarkDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.5)',
  },
  leftShoulder: {},
  rightShoulder: {},
  chestPoint: {},
  leftHip: {},
  rightHip: {},
  labelsOverlay: {
    ...StyleSheet.absoluteFill,
  },
  labelBadge: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  labelBadgeText: {
    color: '#E0E7FF',
    fontSize: 10,
    fontWeight: '600',
  },
  scanStatusBadge: {
    position: 'absolute',
    bottom: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: '#10B981',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scanStatusText: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: '700',
  },
  tipsList: {
    width: '100%',
    marginBottom: 16,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tipIcon: {
    fontSize: 22,
    marginRight: 12,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  tipDesc: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
    lineHeight: 16,
  },
  disclaimerBox: {
    width: '100%',
    backgroundColor: '#F8F9FA',
    borderLeftWidth: 3,
    borderLeftColor: '#C4956A',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  disclaimerText: {
    fontSize: 11,
    color: '#666666',
    lineHeight: 16,
  },
  startBtn: {
    width: '100%',
    height: 52,
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  startBtnIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  startBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  backBtn: {
    paddingVertical: 10,
  },
  backBtnText: {
    color: '#666666',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default CalibrationStep;
