import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { qrManagementService, CompanyQrSettings } from '../services/qr-management.service';
import { OfflineImage as Image } from '../../../../../services/offline/OfflineImage';
import { galleryPickerService } from '../../../../../services/galleryPicker.service';

interface ManageQrConfigModalProps {
  visible: boolean;
  onClose: () => void;
  currentSettings?: CompanyQrSettings | null;
  tenantKey: string;
  onUpdated: (newSettings: CompanyQrSettings) => void;
}

const PRESET_BANCOS = [
  'Banco Unión',
  'Banco de Crédito (BCP)',
  'Banco Mercantil Santa Cruz',
  'Banco Nacional de Bolivia (BNB)',
  'Banco FIE',
  'Banco Ganadero',
  'Banco Bisa',
  'Banco Económico',
  'Banco Solidario (BancoSol)',
  'Billetera Tigo Money / Yape',
];

export function ManageQrConfigModal({
  visible,
  onClose,
  currentSettings,
  tenantKey,
  onUpdated,
}: ManageQrConfigModalProps) {
  const [banco, setBanco] = useState(currentSettings?.qr_cuenta_banco || 'Banco Unión');
  const [numeroCuenta, setNumeroCuenta] = useState(currentSettings?.qr_numero_cuenta || '');
  const [titular, setTitular] = useState(
    currentSettings?.qr_titular || currentSettings?.nombre_comercial || 'FashionStore S.R.L.'
  );
  const [docTitular, setDocTitular] = useState(
    currentSettings?.qr_documento_titular || currentSettings?.nit || ''
  );
  const [tipoCobro, setTipoCobro] = useState<'cuenta' | 'imagen'>(
    (currentSettings?.qr_tipo_cobro as any) || 'cuenta'
  );
  const [qrImageUrl, setQrImageUrl] = useState<string>(currentSettings?.qr_imagen_url || '');
  const [saving, setSaving] = useState(false);
  const [isOpeningGallery, setIsOpeningGallery] = useState(false);

  // Generador dinámico de URL para preview de QR usando qrserver API
  const generatePreviewUrl = () => {
    if (tipoCobro === 'imagen' && qrImageUrl) {
      return qrImageUrl;
    }
    const cleanAccount = numeroCuenta.trim() || '1000003928174';
    const cleanTitular = titular.trim() || 'FashionStore S.R.L.';
    const qrText = encodeURIComponent(`PAGO-FS|BANCO:${banco}|CTA:${cleanAccount}|TIT:${cleanTitular}|DOC:${docTitular}`);
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${qrText}`;
  };

  const handlePickFromGallery = async () => {
    try {
      setIsOpeningGallery(true);
      const res = await galleryPickerService.pickQrImageFromGallery();
      if (!res.cancelled && res.dataUrl) {
        setQrImageUrl(res.dataUrl);
        setTipoCobro('imagen');
        Alert.alert(
          '¡Imagen QR Seleccionada!',
          'Se ha cargado la imagen del código QR de tu galería. Ahora puedes guardarla para que aparezca a todos los clientes.'
        );
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo abrir la galería del teléfono.');
    } finally {
      setIsOpeningGallery(false);
    }
  };

  const handleSave = async () => {
    if (!numeroCuenta.trim() && tipoCobro === 'cuenta') {
      Alert.alert('Campo Requerido', 'Por favor ingresa el número de cuenta bancaria o celular.');
      return;
    }
    if (!qrImageUrl.trim() && tipoCobro === 'imagen') {
      Alert.alert('QR Requerido', 'Por favor selecciona la imagen del código QR desde tu galería.');
      return;
    }

    setSaving(true);
    try {
      const updated = await qrManagementService.updateCompanyQr(
        {
          qr_cuenta_banco: banco,
          qr_numero_cuenta: numeroCuenta.trim(),
          qr_titular: titular.trim(),
          qr_documento_titular: docTitular.trim(),
          qr_tipo_cobro: tipoCobro,
          qr_imagen_url: qrImageUrl.trim(),
        },
        tenantKey
      );

      Alert.alert(
        '¡QR Oficial Guardado!',
        'El código QR oficial ha sido actualizado con éxito en el servidor. Ahora todos los clientes verán este QR único al pagar.'
      );
      onUpdated(updated);
      onClose();
    } catch (err: any) {
      Alert.alert(
        'Error al Guardar',
        err.response?.data?.message || err.message || 'No se pudo guardar la configuración del QR.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>⚙️ Configurar QR Oficial de Cobro</Text>
              <Text style={styles.subtitle}>
                Define el código QR único que verán tus clientes al pagar
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Modalidad de QR */}
            <Text style={styles.label}>Modalidad del Código QR:</Text>
            <View style={styles.modeRow}>
              <TouchableOpacity
                style={[styles.modeTab, tipoCobro === 'imagen' && styles.modeTabActive]}
                onPress={() => setTipoCobro('imagen')}
              >
                <Text style={[styles.modeTabText, tipoCobro === 'imagen' && styles.modeTabTextActive]}>
                  🖼️ Subir QR de Galería
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeTab, tipoCobro === 'cuenta' && styles.modeTabActive]}
                onPress={() => setTipoCobro('cuenta')}
              >
                <Text style={[styles.modeTabText, tipoCobro === 'cuenta' && styles.modeTabTextActive]}>
                  🏦 Generar con N° Cuenta
                </Text>
              </TouchableOpacity>
            </View>

            {/* Opción Imagen de Galería (Principal) */}
            {tipoCobro === 'imagen' && (
              <View style={styles.galleryCardSection}>
                <Text style={styles.galleryInstructions}>
                  Selecciona la foto o captura del código QR de tu banco desde el almacenamiento de tu teléfono:
                </Text>

                <TouchableOpacity
                  style={styles.btnOpenGallery}
                  onPress={handlePickFromGallery}
                  disabled={isOpeningGallery}
                  activeOpacity={0.85}
                >
                  {isOpeningGallery ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.btnOpenGalleryText}>
                      🖼️ Abrir Galería y Elegir Foto del QR
                    </Text>
                  )}
                </TouchableOpacity>

                {qrImageUrl ? (
                  <View style={styles.selectedImageBanner}>
                    <Text style={styles.selectedImageText}>✓ Imagen de QR cargada correctamente</Text>
                    <TouchableOpacity onPress={() => setQrImageUrl('')}>
                      <Text style={styles.removeImageText}>Quitar</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>
            )}

            {/* Banco */}
            <Text style={styles.label}>Entidad Financiera o Billetera:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bankScroll}>
              {PRESET_BANCOS.map((b) => (
                <TouchableOpacity
                  key={b}
                  style={[styles.bankChip, banco === b && styles.bankChipActive]}
                  onPress={() => setBanco(b)}
                >
                  <Text style={[styles.bankChipText, banco === b && styles.bankChipTextActive]}>
                    {b}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Número de Cuenta */}
            <Text style={styles.label}>Número de Cuenta / Celular (Yape/Tigo):</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 1000003928174 o 71234567"
              placeholderTextColor="#999"
              value={numeroCuenta}
              onChangeText={setNumeroCuenta}
              keyboardType="numeric"
            />

            {/* Titular */}
            <Text style={styles.label}>Titular de la Cuenta:</Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre del titular o Razón Social"
              placeholderTextColor="#999"
              value={titular}
              onChangeText={setTitular}
            />

            {/* NIT / CI */}
            <Text style={styles.label}>NIT o Cédula de Identidad del Titular:</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 1029384756"
              placeholderTextColor="#999"
              value={docTitular}
              onChangeText={setDocTitular}
            />

            {/* Vista previa del QR que verá el cliente */}
            <View style={styles.previewBox}>
              <Text style={styles.previewTitle}>Vista Previa del QR para Clientes</Text>
              <Text style={styles.previewSub}>
                Este es el único QR oficial que se le mostrará al cliente
              </Text>
              <View style={styles.qrImageContainer}>
                <Image
                  source={{ uri: generatePreviewUrl() }}
                  style={styles.qrImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.previewBank}>{banco}</Text>
              <Text style={styles.previewAccount}>Cta: {numeroCuenta || '1000003928174'}</Text>
              <Text style={styles.previewTitular}>Titular: {titular}</Text>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={saving}>
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
              {saving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.saveBtnText}>💾 Publicar QR Oficial</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '100%',
    maxHeight: '92%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FAF7F2',
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#2B2B2B',
  },
  subtitle: {
    fontSize: 12,
    color: '#7C6A59',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  closeBtnText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#8C5E35',
  },
  body: {
    padding: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6,
    marginTop: 10,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
  },
  modeTabActive: {
    borderColor: '#8C5E35',
    backgroundColor: '#FFF8F0',
  },
  modeTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  modeTabTextActive: {
    color: '#8C5E35',
    fontWeight: '800',
  },
  galleryCardSection: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1.5,
    borderColor: '#EBDCCB',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  galleryInstructions: {
    fontSize: 12,
    color: '#554A40',
    marginBottom: 10,
    lineHeight: 16,
  },
  btnOpenGallery: {
    backgroundColor: '#8C5E35',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnOpenGalleryText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  selectedImageBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  selectedImageText: {
    color: '#065F46',
    fontWeight: '700',
    fontSize: 12,
  },
  removeImageText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 12,
  },
  bankScroll: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  bankChip: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
  },
  bankChipActive: {
    backgroundColor: '#8C5E35',
    borderColor: '#8C5E35',
  },
  bankChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  bankChipTextActive: {
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  previewBox: {
    backgroundColor: '#FDFBF7',
    borderWidth: 1.5,
    borderColor: '#EBDCCB',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 20,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#8C5E35',
  },
  previewSub: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 12,
  },
  qrImageContainer: {
    width: 200,
    height: 200,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  qrImage: {
    width: '100%',
    height: '100%',
  },
  previewBank: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 10,
  },
  previewAccount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8C5E35',
    marginTop: 2,
  },
  previewTitular: {
    fontSize: 12,
    color: '#4B5563',
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#fff',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#4B5563',
    fontWeight: '700',
    fontSize: 14,
  },
  saveBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#8C5E35',
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
});
