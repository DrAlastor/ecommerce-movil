import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CameraQrScannerModal } from './CameraQrScannerModal';
import { OfflineImage as Image } from '../../../../../services/offline/OfflineImage';

export interface BankAccountOption {
  id: string;
  name: string;
  banco: string;
  cuenta: string;
  titular: string;
  color: string;
  badge: string;
}

export const BANK_QR_ACCOUNTS: BankAccountOption[] = [
  {
    id: 'yape',
    name: 'Yape / BCP',
    banco: 'Banco de Crédito (BCP)',
    cuenta: 'Cel: 71234567 • Cta: 201-5093821',
    titular: 'FashionStore S.R.L.',
    color: '#7C3AED',
    badge: 'Yape Móvil',
  },
  {
    id: 'bmsc',
    name: 'QR Simple (BMSC)',
    banco: 'Mercantil Santa Cruz',
    cuenta: 'Cta Cte: 4010-892341-01',
    titular: 'FashionStore S.R.L. (NIT: 1029384756)',
    color: '#0D9488',
    badge: 'QR Simple',
  },
  {
    id: 'bnb',
    name: 'BNB Móvil',
    banco: 'Banco Nacional de Bolivia',
    cuenta: 'Cta: 150-0294810-01',
    titular: 'FashionStore Bolivia',
    color: '#2563EB',
    badge: 'BNB',
  },
  {
    id: 'tigo',
    name: 'Tigo Money',
    banco: 'Tigo Money Billetera',
    cuenta: 'Línea: 78901234',
    titular: 'FashionStore Retail',
    color: '#EA580C',
    badge: 'Billetera',
  },
];

interface QrPaymentViewProps {
  totalAmount: number;
  onQrScanned?: (code: string) => void;
  isQrScanned?: boolean;
}

export function QrPaymentView({ totalAmount, onQrScanned, isQrScanned }: QrPaymentViewProps) {
  const [selectedAccountId, setSelectedAccountId] = useState<string>('yape');
  const [displayMode, setDisplayMode] = useState<'cuenta' | 'subido'>('cuenta');
  const [savedQrImage, setSavedQrImage] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number>(300);

  // Cargar imagen de QR guardada si existe
  useEffect(() => {
    AsyncStorage.getItem('dressly_saved_qr_image').then((val) => {
      if (val) {
        setSavedQrImage(val);
      }
    }).catch(() => {});
  }, []);

  // Temporizador de vigencia
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 300));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const selectedAccount =
    BANK_QR_ACCOUNTS.find((a) => a.id === selectedAccountId) || BANK_QR_ACCOUNTS[0];

  const handleScanSuccess = (data: string) => {
    setScannedCode(data);
    setIsCameraOpen(false);
    if (onQrScanned) {
      onQrScanned(data);
    }
    Alert.alert('QR Escaneado', 'Código QR reconocido exitosamente. Ya puedes confirmar tu pago.');
  };

  return (
    <View style={styles.container}>
      {/* Selector de Cuentas Bancarias */}
      <Text style={styles.sectionLabel}>Selecciona la Cuenta o Banco:</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.accountTabs}
      >
        {BANK_QR_ACCOUNTS.map((acc) => (
          <TouchableOpacity
            key={acc.id}
            style={[
              styles.accountTab,
              selectedAccountId === acc.id && styles.accountTabActive,
              { borderColor: acc.color },
            ]}
            onPress={() => setSelectedAccountId(acc.id)}
          >
            <View style={[styles.accountDot, { backgroundColor: acc.color }]} />
            <Text
              style={[
                styles.accountTabText,
                selectedAccountId === acc.id && styles.accountTabTextActive,
              ]}
            >
              {acc.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Switch: QR Cuenta vs Imagen Guardada */}
      {savedQrImage && (
        <View style={styles.modeSwitchBar}>
          <TouchableOpacity
            style={[styles.modeBtn, displayMode === 'cuenta' && styles.modeBtnActive]}
            onPress={() => setDisplayMode('cuenta')}
          >
            <Text style={[styles.modeBtnText, displayMode === 'cuenta' && styles.modeBtnTextActive]}>
              QR Dinámico de Cuenta
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, displayMode === 'subido' && styles.modeBtnActive]}
            onPress={() => setDisplayMode('subido')}
          >
            <Text style={[styles.modeBtnText, displayMode === 'subido' && styles.modeBtnTextActive]}>
              Imagen QR Oficial
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Tarjeta del Código QR */}
      <View style={styles.qrCard}>
        {displayMode === 'subido' && savedQrImage ? (
          <Image source={{ uri: savedQrImage }} style={styles.uploadedQrImage} resizeMode="contain" />
        ) : (
          <View style={styles.qrPlaceholder}>
            <View style={[styles.qrHeaderTag, { backgroundColor: selectedAccount.color }]}>
              <Text style={styles.qrHeaderTagText}>{selectedAccount.badge}</Text>
            </View>
            <Text style={styles.qrLargeIcon}>🏁</Text>
            <Text style={styles.qrCodeText}>PAGO SIMPLE QR</Text>
            <Text style={styles.qrAmountText}>{totalAmount.toFixed(2)} Bs</Text>
            <Text style={styles.qrAccountText}>{selectedAccount.cuenta}</Text>
          </View>
        )}

        {/* Tiempo de vigencia */}
        <View style={styles.timerBadge}>
          <Text style={styles.timerText}>⏳ Vigencia del QR: {formatTimer(secondsLeft)}</Text>
        </View>

        {/* Datos de la cuenta seleccionada */}
        <View style={styles.accountInfoCard}>
          <Text style={styles.infoBanco}>{selectedAccount.banco}</Text>
          <Text style={styles.infoCuenta}>{selectedAccount.cuenta}</Text>
          <Text style={styles.infoTitular}>Titular: {selectedAccount.titular}</Text>
        </View>

        {/* Estado de Escaneo con Cámara */}
        {(isQrScanned || scannedCode) && (
          <View style={styles.scannedSuccessBanner}>
            <Text style={styles.scannedSuccessText}>
              ✓ Código QR Escaneado y Validado
            </Text>
            <Text style={styles.scannedCodeSub}>
              {scannedCode || 'Transacción de cobro vinculada'}
            </Text>
          </View>
        )}

        {/* Botón de Escanear QR con Cámara */}
        <TouchableOpacity
          style={styles.btnScanCamera}
          onPress={() => setIsCameraOpen(true)}
          activeOpacity={0.85}
        >
          <Text style={styles.btnScanCameraText}>
            📷 Abrir Cámara para Escanear QR
          </Text>
        </TouchableOpacity>

        {/* Instrucciones */}
        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>Pasos para pagar:</Text>
          <Text style={styles.instructionStep}>
            1. Abre tu app bancaria (Yape, BMSC, BNB, BCP, etc.).
          </Text>
          <Text style={styles.instructionStep}>
            2. Transfiere {totalAmount.toFixed(2)} Bs al QR o cuenta indicada.
          </Text>
          <Text style={styles.instructionStep}>
            3. Puedes escanear tu comprobante con la cámara arriba y pulsar "Confirmar Pago".
          </Text>
        </View>
      </View>

      {/* Modal de Cámara */}
      <CameraQrScannerModal
        visible={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onScanSuccess={handleScanSuccess}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  sectionLabel: {
    alignSelf: 'flex-start',
    fontSize: 12,
    fontWeight: '700',
    color: '#8C5E35',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  accountTabs: {
    gap: 8,
    paddingBottom: 10,
  },
  accountTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1.5,
  },
  accountTabActive: {
    backgroundColor: '#F8F5F1',
  },
  accountDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  accountTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#444',
  },
  accountTabTextActive: {
    color: '#1C1510',
  },
  modeSwitchBar: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#FAF8F5',
    borderRadius: 10,
    padding: 3,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EFEBE6',
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 8,
  },
  modeBtnActive: {
    backgroundColor: '#8C5E35',
  },
  modeBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#666',
  },
  modeBtnTextActive: {
    color: '#FFFFFF',
  },
  qrCard: {
    width: '100%',
    backgroundColor: '#FAF8F5',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EFEBE6',
    alignItems: 'center',
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#1C1510',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    marginBottom: 12,
    position: 'relative',
  },
  qrHeaderTag: {
    position: 'absolute',
    top: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  qrHeaderTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  qrLargeIcon: {
    fontSize: 40,
    marginBottom: 4,
  },
  qrCodeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1C1510',
  },
  qrAmountText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#8C5E35',
    marginTop: 2,
  },
  qrAccountText: {
    fontSize: 9,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  uploadedQrImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  timerBadge: {
    backgroundColor: '#F3EFEA',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  timerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8C5E35',
  },
  accountInfoCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#EFEBE6',
    marginBottom: 12,
  },
  infoBanco: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1C1510',
  },
  infoCuenta: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8C5E35',
    marginTop: 2,
  },
  infoTitular: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  scannedSuccessBanner: {
    width: '100%',
    backgroundColor: '#D1FAE5',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    alignItems: 'center',
  },
  scannedSuccessText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#065F46',
  },
  scannedCodeSub: {
    fontSize: 10,
    color: '#047857',
    marginTop: 2,
  },
  btnScanCamera: {
    width: '100%',
    backgroundColor: '#1C1510',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  btnScanCameraText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  instructions: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F0ECE8',
  },
  instructionsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C1510',
    marginBottom: 4,
  },
  instructionStep: {
    fontSize: 11,
    color: '#6E6259',
    lineHeight: 16,
    marginBottom: 2,
  },
});
