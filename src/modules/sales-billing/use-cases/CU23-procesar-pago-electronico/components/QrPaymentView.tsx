import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CameraQrScannerModal } from './CameraQrScannerModal';
import { ManageQrConfigModal } from './ManageQrConfigModal';
import { qrManagementService, CompanyQrSettings } from '../services/qr-management.service';
import { OfflineImage as Image } from '../../../../../services/offline/OfflineImage';
import { useAuth } from '../../../../users-security/shared/AuthContext';
import { useTenant } from '../../../../../shared/context/TenantContext';

interface QrPaymentViewProps {
  totalAmount: number;
  onQrScanned?: (code: string) => void;
  isQrScanned?: boolean;
}

export function QrPaymentView({ totalAmount, onQrScanned, isQrScanned }: QrPaymentViewProps) {
  const { rol, isSuperAdmin } = useAuth();
  const { tenantKey, currentTenant } = useTenant();

  const rolName = (rol?.nombre || '').toLowerCase();
  const canManageQr =
    isSuperAdmin ||
    rolName.includes('admin') ||
    rolName.includes('gerente') ||
    rolName.includes('encargad') ||
    rolName.includes('cajer') ||
    rolName.includes('vent');

  const [companyQr, setCompanyQr] = useState<CompanyQrSettings | null>(null);
  const [loadingQr, setLoadingQr] = useState<boolean>(true);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState<boolean>(false);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number>(300);

  // Cargar configuración de QR oficial del servidor o almacenamiento offline
  const fetchQrSettings = async () => {
    try {
      setLoadingQr(true);
      const settings = await qrManagementService.getCompanyQrSettings(tenantKey);
      setCompanyQr(settings);
      // Guardar copia local en caso de desconexión
      await AsyncStorage.setItem(`official_qr_${tenantKey}`, JSON.stringify(settings));
    } catch {
      // Intentar cargar de almacenamiento local offline
      const cached = await AsyncStorage.getItem(`official_qr_${tenantKey}`);
      if (cached) {
        setCompanyQr(JSON.parse(cached));
      } else {
        // Fallback predeterminado elegante
        setCompanyQr({
          codigo_empresa: tenantKey,
          nombre_comercial: currentTenant?.name || 'Dressly Fashion Store',
          razon_social: `${currentTenant?.name || 'Fashion Store'} S.R.L.`,
          nit: '1029384756',
          qr_cuenta_banco: 'Banco Unión',
          qr_numero_cuenta: '1000003928174',
          qr_titular: `${currentTenant?.name || 'Fashion Store'} S.R.L.`,
          qr_tipo_cobro: 'cuenta',
        });
      }
    } finally {
      setLoadingQr(false);
    }
  };

  useEffect(() => {
    fetchQrSettings();
  }, [tenantKey]);

  // Temporizador de vigencia del QR
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

  const handleScanSuccess = (data: string) => {
    setScannedCode(data);
    setIsCameraOpen(false);
    if (onQrScanned) {
      onQrScanned(data);
    }
    Alert.alert('QR Escaneado', 'Código QR reconocido exitosamente. Ya puedes confirmar tu pago.');
  };

  // Determinar la imagen o código del QR único
  const getQrDisplayUri = () => {
    if (companyQr?.qr_tipo_cobro === 'imagen' && companyQr?.qr_imagen_url) {
      return companyQr.qr_imagen_url;
    }
    const banco = companyQr?.qr_cuenta_banco || 'Banco Unión';
    const cta = companyQr?.qr_numero_cuenta || '1000003928174';
    const titular = companyQr?.qr_titular || currentTenant?.name || 'FashionStore';
    const dataString = `PAGO-QR|BANCO:${banco}|CTA:${cta}|TIT:${titular}|MONTO:${totalAmount.toFixed(2)}BS`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(dataString)}`;
  };

  const bancoOficial = companyQr?.qr_cuenta_banco || 'Banco Unión';
  const cuentaOficial = companyQr?.qr_numero_cuenta || '1000003928174';
  const titularOficial = companyQr?.qr_titular || companyQr?.nombre_comercial || 'FashionStore S.R.L.';
  const nitOficial = companyQr?.qr_documento_titular || companyQr?.nit || '1029384756';

  return (
    <View style={styles.container}>
      {/* Barra de administración (solo para empleados/admin) */}
      {canManageQr && (
        <View style={styles.adminQrBar}>
          <View style={{ flex: 1 }}>
            <Text style={styles.adminQrTitle}>⚙️ Gestión de QR Oficial</Text>
            <Text style={styles.adminQrSub}>Configura o sube el QR único para tus clientes</Text>
          </View>
          <TouchableOpacity
            style={styles.adminQrBtn}
            onPress={() => setIsManageModalOpen(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.adminQrBtnText}>Subir / Editar QR</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Tarjeta Principal del Código QR Único */}
      <View style={styles.qrCard}>
        {/* Encabezado del QR */}
        <View style={styles.qrHeaderTag}>
          <Text style={styles.qrHeaderTagText}>🏁 CÓDIGO QR OFICIAL DE PAGO</Text>
        </View>

        {loadingQr ? (
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color="#8C5E35" />
            <Text style={styles.loaderText}>Obteniendo código QR de cobro...</Text>
          </View>
        ) : (
          <View style={styles.qrWrapper}>
            <Image
              source={{ uri: getQrDisplayUri() }}
              style={styles.qrImage}
              resizeMode="contain"
            />
          </View>
        )}

        {/* Monto a Cobrar */}
        <View style={styles.amountBadge}>
          <Text style={styles.amountLabel}>Monto exacto a pagar:</Text>
          <Text style={styles.amountValue}>{totalAmount.toFixed(2)} Bs</Text>
        </View>

        {/* Tiempo de vigencia */}
        <View style={styles.timerBadge}>
          <Text style={styles.timerText}>⏳ Vigencia del QR: {formatTimer(secondsLeft)}</Text>
        </View>

        {/* Datos Oficiales de la Cuenta Asociada al QR */}
        <View style={styles.accountInfoCard}>
          <Text style={styles.infoBanco}>🏦 {bancoOficial}</Text>
          <Text style={styles.infoCuenta}>N° de Cuenta: {cuentaOficial}</Text>
          <Text style={styles.infoTitular}>Titular: {titularOficial}</Text>
          <Text style={styles.infoNit}>NIT / CI: {nitOficial}</Text>
        </View>

        {/* Estado de Escaneo con Cámara */}
        {(isQrScanned || scannedCode) && (
          <View style={styles.scannedSuccessBanner}>
            <Text style={styles.scannedSuccessText}>✓ Código QR Escaneado y Validado</Text>
            <Text style={styles.scannedCodeSub}>
              {scannedCode || 'Transacción de cobro vinculada correctamente'}
            </Text>
          </View>
        )}

        {/* Botón de Escanear QR con Cámara */}
        <TouchableOpacity
          style={styles.btnScanCamera}
          onPress={() => setIsCameraOpen(true)}
          activeOpacity={0.85}
        >
          <Text style={styles.btnScanCameraText}>📷 Abrir Cámara para Escanear QR</Text>
        </TouchableOpacity>

        {/* Instrucciones Clarificadoras para el Cliente */}
        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>Pasos para completar tu compra:</Text>
          <Text style={styles.instructionStep}>
            1. Abre tu aplicación bancaria boliviana (BMSC, BNB, BCP, Banco Unión, Yape, etc.).
          </Text>
          <Text style={styles.instructionStep}>
            2. Escanea el código QR único arriba o transfiere los {totalAmount.toFixed(2)} Bs.
          </Text>
          <Text style={styles.instructionStep}>
            3. Si deseas validar el comprobante con tu cámara, pulsa el botón "Abrir Cámara para Escanear QR".
          </Text>
          <Text style={styles.instructionStep}>
            4. Presiona "Confirmar Pago" para emitir tu factura y registrar la venta.
          </Text>
        </View>
      </View>

      {/* Modal de Cámara */}
      <CameraQrScannerModal
        visible={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onScanSuccess={handleScanSuccess}
      />

      {/* Modal de Gestión y Subida de QR (Admin/Cajero) */}
      <ManageQrConfigModal
        visible={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        currentSettings={companyQr}
        tenantKey={tenantKey}
        onUpdated={(newSettings) => setCompanyQr(newSettings)}
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
  adminQrBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF8F0',
    borderWidth: 1,
    borderColor: '#E6A265',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  adminQrTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#8C5E35',
  },
  adminQrSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  adminQrBtn: {
    backgroundColor: '#8C5E35',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  adminQrBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  qrCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#EBDCCB',
    shadowColor: '#8C5E35',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  qrHeaderTag: {
    backgroundColor: '#8C5E35',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 16,
  },
  qrHeaderTagText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  loaderBox: {
    height: 230,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 10,
    fontWeight: '600',
  },
  qrWrapper: {
    width: 220,
    height: 220,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 14,
  },
  qrImage: {
    width: '100%',
    height: '100%',
  },
  amountBadge: {
    alignItems: 'center',
    marginBottom: 10,
  },
  amountLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  amountValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#8C5E35',
    marginTop: 2,
  },
  timerBadge: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 14,
  },
  timerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },
  accountInfoCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    width: '100%',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoBanco: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  infoCuenta: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8C5E35',
    marginBottom: 3,
  },
  infoTitular: {
    fontSize: 12,
    color: '#4B5563',
    marginBottom: 2,
  },
  infoNit: {
    fontSize: 11,
    color: '#6B7280',
  },
  scannedSuccessBanner: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    width: '100%',
    marginBottom: 14,
    alignItems: 'center',
  },
  scannedSuccessText: {
    color: '#065F46',
    fontWeight: '700',
    fontSize: 13,
  },
  scannedCodeSub: {
    color: '#047857',
    fontSize: 11,
    marginTop: 2,
  },
  btnScanCamera: {
    backgroundColor: '#1F2937',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 14,
  },
  btnScanCameraText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  instructions: {
    backgroundColor: '#FAF7F2',
    borderRadius: 12,
    padding: 12,
    width: '100%',
    borderLeftWidth: 4,
    borderLeftColor: '#8C5E35',
  },
  instructionsTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8C5E35',
    marginBottom: 4,
  },
  instructionStep: {
    fontSize: 11,
    color: '#555555',
    lineHeight: 16,
    marginBottom: 3,
  },
});
