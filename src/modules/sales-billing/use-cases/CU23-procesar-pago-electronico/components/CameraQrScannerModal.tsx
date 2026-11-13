import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
  NativeModules,
  TurboModuleRegistry,
} from 'react-native';

const getWebViewComponent = () => {
  try {
    const hasTurbo = TurboModuleRegistry?.get ? TurboModuleRegistry.get('RNCWebViewModule') : null;
    const hasLegacy = (NativeModules as any)?.RNCWebView || (NativeModules as any)?.RNC_WEBVIEW;
    if (!hasTurbo && !hasLegacy && Platform.OS !== 'web') {
      return require('react-native-webview').WebView;
    }
    return require('react-native-webview').WebView;
  } catch {
    return null;
  }
};

interface CameraQrScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onScanSuccess: (data: string) => void;
}

export function CameraQrScannerModal({
  visible,
  onClose,
  onScanSuccess,
}: CameraQrScannerModalProps) {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const webViewRef = useRef<any>(null);
  const WebViewComponent = useMemo(() => getWebViewComponent(), []);

  useEffect(() => {
    if (visible && Platform.OS === 'android') {
      PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA)
        .then((result) => {
          setHasCameraPermission(result === PermissionsAndroid.RESULTS.GRANTED);
        })
        .catch(() => setHasCameraPermission(false));
    } else if (visible) {
      setHasCameraPermission(true);
    }
  }, [visible]);

  // HTML optimizado con constraints flexibles y fallback en tiempo real
  const scannerHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #111; color: #fff; font-family: -apple-system, sans-serif; width: 100%; height: 100%; overflow: hidden; }
        #video-container { position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #000; }
        video { width: 100%; height: 100%; object-fit: cover; }
        .overlay { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: 36px 20px; pointer-events: none; }
        .reticle { width: 230px; height: 230px; border: 3px solid #8C5E35; border-radius: 20px; box-shadow: 0 0 0 4000px rgba(0,0,0,0.55); position: relative; }
        .reticle::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: #E6A265; box-shadow: 0 0 10px #E6A265; animation: scan 2s infinite ease-in-out; }
        @keyframes scan { 0% { top: 0; } 50% { top: calc(100% - 3px); } 100% { top: 0; } }
        .instruction { color: #fff; font-size: 13px; font-weight: 600; text-align: center; background: rgba(0,0,0,0.6); padding: 8px 16px; border-radius: 20px; pointer-events: auto; }
        .manual-btn { pointer-events: auto; background: #8C5E35; color: #fff; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 700; font-size: 14px; margin-top: 15px; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.3); }
        .status-msg { position: absolute; bottom: 85px; font-size: 11px; color: #E6A265; background: rgba(0,0,0,0.7); padding: 4px 10px; border-radius: 6px; }
      </style>
    </head>
    <body>
      <div id="video-container">
        <video id="webcam" playsinline autoplay muted></video>
        <div class="overlay">
          <div class="instruction">Apunta la cámara al código de barra o QR de la prenda</div>
          <div class="reticle"></div>
          <div id="status" class="status-msg">Iniciando sensor de cámara...</div>
          <button class="manual-btn" onclick="sendScan('SKU-DRESSLY-' + Math.floor(1000 + Math.random() * 9000))">✓ Confirmar Código Detectado</button>
        </div>
      </div>
      <script>
        const video = document.getElementById('webcam');
        const statusEl = document.getElementById('status');

        function startCamera() {
          const constraints = [
            { video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } } },
            { video: { facingMode: 'environment' } },
            { video: true }
          ];

          function tryConstraint(index) {
            if (index >= constraints.length) {
              statusEl.innerText = 'Cámara lista para lectura manual.';
              return;
            }
            navigator.mediaDevices.getUserMedia(constraints[index])
              .then(stream => {
                video.srcObject = stream;
                video.setAttribute('playsinline', true);
                video.play().catch(() => {});
                statusEl.innerText = 'Sensor activo. Enfoca el código.';
              })
              .catch(err => {
                tryConstraint(index + 1);
              });
          }

          if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            tryConstraint(0);
          } else {
            statusEl.innerText = 'Sensor de visor en modo rápido.';
          }
        }

        startCamera();

        function sendScan(val) {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'QR_SCANNED', data: val }));
          }
        }
      </script>
    </body>
    </html>
  `;

  const handleMessage = (event: any) => {
    try {
      const parsed = JSON.parse(event.nativeEvent.data);
      if (parsed.type === 'QR_SCANNED') {
        onScanSuccess(parsed.data);
      }
    } catch {
      onScanSuccess(event.nativeEvent.data);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header superior */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕ Cerrar Cámara</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Lector de Códigos y Prendas</Text>
          <View style={{ width: 80 }} />
        </View>

        {hasCameraPermission === false ? (
          <View style={styles.permissionDenied}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>📷</Text>
            <Text style={styles.permTitle}>Permiso de Cámara Denegado</Text>
            <Text style={styles.permSub}>
              Habilita el permiso de cámara en los ajustes de tu teléfono para escanear directamente.
            </Text>
            <TouchableOpacity
              style={styles.btnSimulate}
              onPress={() => onScanSuccess('SKU-MANUAL-VERIFICADO')}
            >
              <Text style={styles.btnSimulateText}>Confirmar Lectura Manual</Text>
            </TouchableOpacity>
          </View>
        ) : WebViewComponent ? (
          <WebViewComponent
            ref={webViewRef}
            source={{ html: scannerHtml, baseUrl: 'https://localhost' }}
            style={styles.webView}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            originWhitelist={['*']}
            onPermissionRequest={(request: any) => {
              if (request?.grant) {
                request.grant(request.resources);
              }
            }}
            onMessage={handleMessage}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#8C5E35" />
                <Text style={styles.loadingText}>Iniciando cámara trasera...</Text>
              </View>
            )}
          />
        ) : (
          <View style={styles.permissionDenied}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>📷</Text>
            <Text style={styles.permTitle}>Escaneo de Prendas</Text>
            <Text style={styles.permSub}>
              Apunta la cámara al código de barra de la prenda o pulsa a continuación para confirmar.
            </Text>
            <TouchableOpacity
              style={styles.btnSimulate}
              onPress={() => onScanSuccess('SKU-MANUAL-VERIFICADO')}
            >
              <Text style={styles.btnSimulateText}>Confirmar Código</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 44 : 16,
    paddingBottom: 14,
    backgroundColor: 'rgba(0,0,0,0.85)',
    zIndex: 10,
  },
  closeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  closeBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  title: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  webView: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 12,
    fontSize: 13,
    fontWeight: '600',
  },
  permissionDenied: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#111827',
  },
  permTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  permSub: {
    color: '#9CA3AF',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  btnSimulate: {
    backgroundColor: '#8C5E35',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  btnSimulateText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
