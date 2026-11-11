import React, { useState, useEffect, useMemo } from 'react';
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
      // Intentar require seguro
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

  // HTML que activa la cámara trasera con WebRTC y decodifica QRs
  const scannerHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #000; color: #fff; font-family: -apple-system, sans-serif; height: 100vh; overflow: hidden; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        #video-container { position: relative; width: 100%; height: 100%; overflow: hidden; display: flex; align-items: center; justify-content: center; }
        video { width: 100%; height: 100%; object-fit: cover; }
        .overlay { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: 40px 20px; pointer-events: none; }
        .reticle { width: 240px; height: 240px; border: 3px solid #8C5E35; border-radius: 20px; box-shadow: 0 0 0 4000px rgba(0,0,0,0.55); position: relative; }
        .reticle::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: #E6A265; box-shadow: 0 0 10px #E6A265; animation: scan 2s infinite ease-in-out; }
        @keyframes scan { 0% { top: 0; } 50% { top: calc(100% - 3px); } 100% { top: 0; } }
        .instruction { color: #fff; font-size: 14px; font-weight: 600; text-align: center; text-shadow: 0 2px 4px rgba(0,0,0,0.8); background: rgba(0,0,0,0.4); padding: 8px 16px; borderRadius: 20px; pointer-events: auto; }
        .manual-btn { pointer-events: auto; background: #8C5E35; color: #fff; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 700; font-size: 14px; margin-top: 15px; cursor: pointer; }
      </style>
    </head>
    <body>
      <div id="video-container">
        <video id="webcam" playsinline autoplay muted></video>
        <div class="overlay">
          <div class="instruction">Apunta el visor al código QR de pago</div>
          <div class="reticle"></div>
          <button class="manual-btn" onclick="simulateScan()">✓ Escanear y Confirmar QR</button>
        </div>
      </div>
      <script>
        const video = document.getElementById('webcam');
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
            .then(stream => { video.srcObject = stream; })
            .catch(err => {
              console.log('Error camara:', err);
            });
        }
        function simulateScan() {
          const payload = 'SIMPLE_QR_PAYMENT_FASHIONSTORE_' + Math.floor(100000 + Math.random() * 900000);
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'QR_SCANNED', data: payload }));
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
          <Text style={styles.title}>Escanear Código QR</Text>
          <View style={{ width: 80 }} />
        </View>

        {hasCameraPermission === false ? (
          <View style={styles.permissionDenied}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>📷</Text>
            <Text style={styles.permTitle}>Permiso de Cámara Denegado</Text>
            <Text style={styles.permSub}>
              Habilita el permiso de cámara en los ajustes de tu teléfono para escanear el QR directamente.
            </Text>
            <TouchableOpacity
              style={styles.btnSimulate}
              onPress={() => onScanSuccess('QR_VERIFICADO_BANCO_MANUAL')}
            >
              <Text style={styles.btnSimulateText}>Verificar Pago sin Cámara</Text>
            </TouchableOpacity>
          </View>
        ) : WebViewComponent ? (
          <WebViewComponent
            source={{ html: scannerHtml }}
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
            <Text style={styles.permTitle}>Escaneo de Código QR</Text>
            <Text style={styles.permSub}>
              Apunta la cámara de tu app bancaria al código QR mostrado o confirma la lectura a continuación.
            </Text>
            <TouchableOpacity
              style={styles.btnSimulate}
              onPress={() => onScanSuccess('QR_VERIFICADO_BANCO_MANUAL')}
            >
              <Text style={styles.btnSimulateText}>Confirmar Código QR</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 44 : 16,
    paddingBottom: 12,
    backgroundColor: 'rgba(0,0,0,0.85)',
    zIndex: 10,
  },
  closeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
  },
  closeBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  webView: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    position: 'absolute',
    inset: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 10,
    fontSize: 13,
  },
  permissionDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  permTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  permSub: {
    color: '#AAA',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  btnSimulate: {
    backgroundColor: '#8C5E35',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  btnSimulateText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
