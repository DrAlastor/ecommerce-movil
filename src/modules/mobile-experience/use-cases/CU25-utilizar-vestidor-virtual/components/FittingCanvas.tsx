import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import type {
  ArVariant,
  SilhouetteConfig,
  FittingTransform,
  FittingViewMode,
  PoseAngle,
} from '../types/virtual-fitting.types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface FittingCanvasProps {
  variant: ArVariant | null;
  productName: string;
  categoryName: string;
  silhouette: SilhouetteConfig;
  transform: FittingTransform;
  viewMode: FittingViewMode;
  showLandmarks: boolean;
  onSetViewMode: (mode: FittingViewMode) => void;
  onSetAngle: (angle: PoseAngle) => void;
  onSetBodyType: (type: SilhouetteConfig['bodyType']) => void;
  onAdjustScale: (delta: number) => void;
  onAdjustOffsetY: (delta: number) => void;
  onResetAdjustments: () => void;
}

export const FittingCanvas: React.FC<FittingCanvasProps> = ({
  variant,
  productName,
  categoryName,
  silhouette,
  transform,
  viewMode,
  showLandmarks,
  onSetViewMode,
  onSetAngle,
  onSetBodyType,
  onAdjustScale,
  onAdjustOffsetY,
  onResetAdjustments,
}) => {
  const garmentImageUrl =
    variant?.imagen_url ||
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80';

  const garmentColorHex = variant?.color.codigo_hex || '#FFFFFF';

  // Proporciones dinámicas según talla (XS..XL)
  const tallaSizeFactor = React.useMemo(() => {
    const code = (variant?.talla.codigo || 'M').toUpperCase();
    if (code.includes('XS')) return 0.92;
    if (code.includes('S')) return 0.96;
    if (code.includes('M')) return 1.0;
    if (code.includes('L')) return 1.05;
    if (code.includes('XL')) return 1.1;
    return 1.0;
  }, [variant?.talla.codigo]);

  const effectiveScale = transform.scale * tallaSizeFactor;

  return (
    <View style={styles.canvasContainer}>
      {/* Barra superior de Modos y Badge RA */}
      <View style={styles.topControlsBar}>
        <View style={styles.viewModeToggle}>
          <TouchableOpacity
            style={[styles.modeBtn, viewMode === 'avatar-3d' && styles.modeBtnActive]}
            onPress={() => onSetViewMode('avatar-3d')}
            activeOpacity={0.8}
          >
            <Text style={[styles.modeBtnText, viewMode === 'avatar-3d' && styles.modeBtnTextActive]}>
              🧍 Avatar 3D
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, viewMode === 'photo-2d' && styles.modeBtnActive]}
            onPress={() => onSetViewMode('photo-2d')}
            activeOpacity={0.8}
          >
            <Text style={[styles.modeBtnText, viewMode === 'photo-2d' && styles.modeBtnTextActive]}>
              🖼️ Foto 2D
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.arBadge}>
          <Text style={styles.arBadgeDot}>●</Text>
          <Text style={styles.arBadgeText}>RA EN VIVO</Text>
        </View>
      </View>

      {/* Escenario central de prueba virtual */}
      <View style={styles.stageViewport}>
        {/* Cuadrícula de calibración de fondo */}
        <View style={styles.gridOverlay}>
          <View style={styles.gridLineHorizontal} />
          <View style={[styles.gridLineHorizontal, { top: '50%' }]} />
          <View style={[styles.gridLineHorizontal, { top: '75%' }]} />
          <View style={styles.gridLineVertical} />
        </View>

        {/* 1. Silueta / Avatar base */}
        {viewMode === 'avatar-3d' && (
          <View
            style={[
              styles.avatarContainer,
              {
                transform: [
                  {
                    rotate:
                      silhouette.currentAngle === 'three-quarter'
                        ? '8deg'
                        : silhouette.currentAngle === 'profile'
                        ? '22deg'
                        : '0deg',
                  },
                ],
              },
            ]}
          >
            {/* Cabeza */}
            <View style={styles.avatarHead} />
            {/* Cuello */}
            <View style={styles.avatarNeck} />
            {/* Hombros */}
            <View
              style={[
                styles.avatarShoulders,
                silhouette.bodyType === 'male' && { width: 175 },
                silhouette.bodyType === 'female' && { width: 148 },
              ]}
            />
            {/* Torso */}
            <View
              style={[
                styles.avatarTorso,
                silhouette.bodyType === 'male' && { width: 110, height: 110 },
                silhouette.bodyType === 'female' && { width: 92, height: 110 },
              ]}
            />
            {/* Piernas superiores */}
            <View style={styles.avatarLegs}>
              <View style={styles.avatarLeg} />
              <View style={styles.avatarLeg} />
            </View>
          </View>
        )}

        {/* 2. Capa de la prenda superpuesta */}
        <View
          style={[
            styles.garmentWrapper,
            {
              transform: [
                { translateY: transform.offsetY },
                { scale: effectiveScale },
                { rotate: `${transform.rotation}deg` },
              ],
            },
          ]}
        >
          <Image
            source={{ uri: garmentImageUrl }}
            style={styles.garmentImage}
            resizeMode="contain"
          />

          {/* Sutil halo del color seleccionado para realzar contraste en el vestidor */}
          <View
            style={[
              styles.colorTintHalo,
              {
                borderColor: garmentColorHex,
                backgroundColor: `${garmentColorHex}12`,
              },
            ]}
          />
        </View>

        {/* 3. Puntos de anclaje corporal anatómicos (Landmarks) */}
        {showLandmarks && (
          <View style={styles.landmarksLayer} pointerEvents="none">
            {/* Hombro Izquierdo */}
            <View style={[styles.landmarkPoint, { top: '33%', left: '26%' }]}>
              <View style={styles.landmarkCore} />
              <Text style={styles.landmarkTag}>H. Izq</Text>
            </View>

            {/* Hombro Derecho */}
            <View style={[styles.landmarkPoint, { top: '33%', right: '26%' }]}>
              <View style={styles.landmarkCore} />
              <Text style={styles.landmarkTag}>H. Der</Text>
            </View>

            {/* Pecho central */}
            <View style={[styles.landmarkPoint, { top: '44%', alignSelf: 'center' }]}>
              <View style={[styles.landmarkCore, { backgroundColor: '#3B82F6' }]} />
              <Text style={styles.landmarkTag}>Torso ({variant?.talla.codigo || 'M'})</Text>
            </View>

            {/* Cintura / Cadera */}
            <View style={[styles.landmarkPoint, { top: '58%', alignSelf: 'center' }]}>
              <View style={[styles.landmarkCore, { backgroundColor: '#EC4899' }]} />
              <Text style={styles.landmarkTag}>Cadera</Text>
            </View>
          </View>
        )}

        {/* Controles flotantes en pantalla: Ángulo de rotación */}
        <View style={styles.angleSelectorFloat}>
          {(['front', 'three-quarter', 'profile'] as PoseAngle[]).map((angle) => (
            <TouchableOpacity
              key={angle}
              style={[
                styles.angleBtn,
                silhouette.currentAngle === angle && styles.angleBtnActive,
              ]}
              onPress={() => onSetAngle(angle)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.angleBtnText,
                  silhouette.currentAngle === angle && styles.angleBtnTextActive,
                ]}
              >
                {angle === 'front' ? 'Frente' : angle === 'three-quarter' ? '3/4' : 'Perfil'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Controles de micro-ajuste táctil a la derecha */}
        <View style={styles.adjustControlsFloat}>
          <TouchableOpacity
            style={styles.adjustBtn}
            onPress={() => onAdjustOffsetY(-6)}
            activeOpacity={0.8}
          >
            <Text style={styles.adjustBtnText}>▲</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.adjustBtn}
            onPress={() => onAdjustOffsetY(6)}
            activeOpacity={0.8}
          >
            <Text style={styles.adjustBtnText}>▼</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.adjustBtn}
            onPress={() => onAdjustScale(0.04)}
            activeOpacity={0.8}
          >
            <Text style={styles.adjustBtnText}>＋</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.adjustBtn}
            onPress={() => onAdjustScale(-0.04)}
            activeOpacity={0.8}
          >
            <Text style={styles.adjustBtnText}>−</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.adjustBtn, styles.resetBtn]}
            onPress={onResetAdjustments}
            activeOpacity={0.8}
          >
            <Text style={styles.resetBtnText}>↺</Text>
          </TouchableOpacity>
        </View>

        {/* Selector de silueta: Mujer / Hombre / Neutro */}
        <View style={styles.bodyTypeSelectorFloat}>
          {(['female', 'male', 'neutral'] as const).map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.bodyTypeChip,
                silhouette.bodyType === type && styles.bodyTypeChipActive,
              ]}
              onPress={() => onSetBodyType(type)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.bodyTypeChipText,
                  silhouette.bodyType === type && styles.bodyTypeChipTextActive,
                ]}
              >
                {type === 'female' ? '👩 Mujer' : type === 'male' ? '👨 Hombre' : '👤 Neutro'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Info overlay de calce en la base de la pantalla */}
        <View style={styles.fitInfoBar}>
          <Text style={styles.fitInfoTitle}>
            {productName} • <Text style={{ color: '#C4956A' }}>{categoryName}</Text>
          </Text>
          <Text style={styles.fitInfoSubtitle}>
            Escala: {(effectiveScale * 100).toFixed(0)}% • Calce {silhouette.fitPreference.toUpperCase()}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  canvasContainer: {
    backgroundColor: '#16181D',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2D323F',
    marginHorizontal: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 6,
  },
  topControlsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: 'rgba(25, 28, 36, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#2D323F',
  },
  viewModeToggle: {
    flexDirection: 'row',
    backgroundColor: '#0F1115',
    borderRadius: 10,
    padding: 3,
  },
  modeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  modeBtnActive: {
    backgroundColor: '#C4956A',
  },
  modeBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  modeBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  arBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10B981',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  arBadgeDot: {
    color: '#10B981',
    fontSize: 8,
    marginRight: 4,
  },
  arBadgeText: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  stageViewport: {
    width: '100%',
    height: 380,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1D24',
    overflow: 'hidden',
  },
  gridOverlay: {
    ...StyleSheet.absoluteFill,
    opacity: 0.12,
  },
  gridLineHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '25%',
    height: 1,
    backgroundColor: '#FFFFFF',
  },
  gridLineVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    width: 1,
    backgroundColor: '#FFFFFF',
  },
  avatarContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  avatarHead: {
    width: 48,
    height: 60,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.45)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginBottom: 4,
  },
  avatarNeck: {
    width: 18,
    height: 14,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 3,
  },
  avatarShoulders: {
    width: 156,
    height: 18,
    borderTopWidth: 2.5,
    borderColor: 'rgba(196, 149, 106, 0.7)',
    borderRadius: 8,
  },
  avatarTorso: {
    width: 98,
    height: 110,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  avatarLegs: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 2,
  },
  avatarLeg: {
    width: 32,
    height: 70,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  garmentWrapper: {
    position: 'absolute',
    width: 220,
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  garmentImage: {
    width: '100%',
    height: '100%',
  },
  colorTintHalo: {
    ...StyleSheet.absoluteFill,
    borderRadius: 20,
    borderWidth: 1,
  },
  landmarksLayer: {
    ...StyleSheet.absoluteFill,
    zIndex: 3,
  },
  landmarkPoint: {
    position: 'absolute',
    alignItems: 'center',
  },
  landmarkCore: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  landmarkTag: {
    fontSize: 9,
    color: '#F3F4F6',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    marginTop: 2,
    fontWeight: '600',
  },
  angleSelectorFloat: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'column',
    gap: 6,
    zIndex: 4,
  },
  angleBtn: {
    backgroundColor: 'rgba(15, 17, 21, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  angleBtnActive: {
    backgroundColor: '#C4956A',
    borderColor: '#C4956A',
  },
  angleBtnText: {
    color: '#D1D5DB',
    fontSize: 10,
    fontWeight: '600',
  },
  angleBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  adjustControlsFloat: {
    position: 'absolute',
    right: 12,
    top: 12,
    flexDirection: 'column',
    gap: 6,
    zIndex: 4,
  },
  adjustBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(15, 17, 21, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adjustBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  resetBtn: {
    borderColor: '#C4956A',
  },
  resetBtnText: {
    color: '#C4956A',
    fontSize: 15,
    fontWeight: 'bold',
  },
  bodyTypeSelectorFloat: {
    position: 'absolute',
    bottom: 42,
    flexDirection: 'row',
    gap: 8,
    zIndex: 4,
  },
  bodyTypeChip: {
    backgroundColor: 'rgba(15, 17, 21, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bodyTypeChipActive: {
    backgroundColor: '#374151',
    borderColor: '#C4956A',
  },
  bodyTypeChipText: {
    color: '#9CA3AF',
    fontSize: 10,
    fontWeight: '600',
  },
  bodyTypeChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  fitInfoBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 17, 21, 0.92)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#2D323F',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 4,
  },
  fitInfoTitle: {
    color: '#F9FAFB',
    fontSize: 11,
    fontWeight: '700',
  },
  fitInfoSubtitle: {
    color: '#9CA3AF',
    fontSize: 10,
    fontWeight: '500',
  },
});

export default FittingCanvas;
