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

interface VoiceAssistantModalProps {
  visible: boolean;
  onClose: () => void;
  onVoiceResult: (text: string) => void;
  lastReplyText?: string;
  isProcessing?: boolean;
}

export function VoiceAssistantModal({
  visible,
  onClose,
  onVoiceResult,
  lastReplyText,
  isProcessing = false,
}: VoiceAssistantModalProps) {
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcribedText, setTranscribedText] = useState<string>('');
  const webViewRef = useRef<any>(null);

  const WebViewComponent = useMemo(() => getWebViewComponent(), []);

  useEffect(() => {
    if (visible && Platform.OS === 'android') {
      PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO)
        .then((result) => {
          setHasMicPermission(result === PermissionsAndroid.RESULTS.GRANTED);
        })
        .catch(() => setHasMicPermission(false));
    } else if (visible) {
      setHasMicPermission(true);
    }
  }, [visible]);

  // Si hay una respuesta nueva de IA, indicarle al WebView que la sintetice por voz
  useEffect(() => {
    if (visible && lastReplyText && webViewRef.current) {
      const escaped = JSON.stringify(lastReplyText);
      webViewRef.current.injectJavaScript(`
        if (window.speakText) {
          window.speakText(${escaped});
        }
        true;
      `);
    }
  }, [lastReplyText, visible]);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'SPEECH_START') {
        setIsListening(true);
      } else if (data.type === 'SPEECH_END') {
        setIsListening(false);
      } else if (data.type === 'SPEECH_RESULT') {
        const text = data.text;
        setTranscribedText(text);
        if (text && text.trim().length > 0) {
          onVoiceResult(text.trim());
        }
      } else if (data.type === 'ERROR') {
        setIsListening(false);
      }
    } catch {
      // ignore
    }
  };

  const handleStartListening = () => {
    setTranscribedText('');
    setIsListening(true);
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        if (window.startListening) {
          window.startListening();
        }
        true;
      `);
    }
  };

  const handleStopListening = () => {
    setIsListening(false);
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        if (window.stopListening) {
          window.stopListening();
        }
        true;
      `);
    }
  };

  const voiceEngineHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
      <style>
        body {
          margin: 0;
          padding: 0;
          background: transparent;
          font-family: -apple-system, Roboto, sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          overflow: hidden;
        }
        .mic-core {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #1A1A1A;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
          transition: all 0.3s ease;
        }
        .pulse {
          animation: wave 1.4s infinite ease-in-out;
          background: #9C6B40;
        }
        @keyframes wave {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(156,107,64, 0.6); }
          50% { transform: scale(1.12); box-shadow: 0 0 0 20px rgba(156,107,64, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(156,107,64, 0); }
        }
        .bars {
          display: flex;
          gap: 4px;
          margin-top: 16px;
          height: 32px;
          align-items: center;
        }
        .bar {
          width: 4px;
          height: 12px;
          background: #9C6B40;
          border-radius: 2px;
          animation: sound 1s infinite alternate ease-in-out;
        }
        .bar:nth-child(2) { animation-delay: 0.2s; height: 20px; }
        .bar:nth-child(3) { animation-delay: 0.4s; height: 28px; }
        .bar:nth-child(4) { animation-delay: 0.1s; height: 16px; }
        .bar:nth-child(5) { animation-delay: 0.3s; height: 24px; }
        @keyframes sound {
          0% { height: 6px; }
          100% { height: 32px; }
        }
      </style>
    </head>
    <body>
      <div id="mic" class="mic-core">🎙️</div>
      <div id="bars" class="bars" style="display:none;">
        <div class="bar"></div>
        <div class="bar"></div>
        <div class="bar"></div>
        <div class="bar"></div>
        <div class="bar"></div>
      </div>

      <script>
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        let recognition = null;

        function sendMsg(type, payload) {
          if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type, ...payload }));
          }
        }

        if (SpeechRec) {
          recognition = new SpeechRec();
          recognition.lang = 'es-BO';
          recognition.continuous = false;
          recognition.interimResults = false;

          recognition.onstart = function() {
            document.getElementById('mic').classList.add('pulse');
            document.getElementById('bars').style.display = 'flex';
            sendMsg('SPEECH_START');
          };

          recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            sendMsg('SPEECH_RESULT', { text: transcript });
          };

          recognition.onerror = function(err) {
            document.getElementById('mic').classList.remove('pulse');
            document.getElementById('bars').style.display = 'none';
            sendMsg('ERROR', { error: err.error });
          };

          recognition.onend = function() {
            document.getElementById('mic').classList.remove('pulse');
            document.getElementById('bars').style.display = 'none';
            sendMsg('SPEECH_END');
          };
        }

        window.startListening = function() {
          if (recognition) {
            try {
              recognition.start();
            } catch(e) {
              console.log(e);
            }
          }
        };

        window.stopListening = function() {
          if (recognition) {
            try {
              recognition.stop();
            } catch(e) {}
          }
        };

        window.speakText = function(text) {
          if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utter = new SpeechSynthesisUtterance(text);
            utter.lang = 'es-ES';
            utter.rate = 1.0;
            utter.pitch = 1.05;
            window.speechSynthesis.speak(utter);
          }
        };

        // Iniciar reconocimiento automáticamente al cargar
        setTimeout(function() {
          window.startListening();
        }, 300);
      </script>
    </body>
    </html>
  `;

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.cardHeader}>
            <Text style={styles.title}>🎙️ Asistente de Voz IA</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            Habla con claridad a tu teléfono. Tu consulta será analizada por el modelo de inteligencia de negocios:
          </Text>

          {/* Motor Web Audio / Reconocimiento */}
          {WebViewComponent ? (
            <View style={styles.webviewWrapper}>
              <WebViewComponent
                ref={webViewRef}
                source={{ html: voiceEngineHtml }}
                onMessage={handleMessage}
                style={{ flex: 1, backgroundColor: 'transparent' }}
                allowsInlineMediaPlayback={true}
                mediaPlaybackRequiresUserAction={false}
                originWhitelist={['*']}
              />
            </View>
          ) : (
            <View style={styles.fallbackBox}>
              <ActivityIndicator size="large" color="#9C6B40" />
            </View>
          )}

          {/* Estado actual */}
          <View style={styles.statusBox}>
            {isProcessing ? (
              <View style={styles.rowCenter}>
                <ActivityIndicator size="small" color="#1A1A1A" style={{ marginRight: 8 }} />
                <Text style={styles.statusText}>Procesando análisis inteligente...</Text>
              </View>
            ) : isListening ? (
              <Text style={[styles.statusText, { color: '#9C6B40', fontWeight: 'bold' }]}>
                🔴 Escuchando tu voz... Habla ahora
              </Text>
            ) : (
              <Text style={styles.statusText}>
                {transcribedText ? `"${transcribedText}"` : 'Toca el micrófono para comenzar'}
              </Text>
            )}
          </View>

          {/* Botones de Control */}
          <View style={styles.buttonRow}>
            {isListening ? (
              <TouchableOpacity style={styles.btnStop} onPress={handleStopListening}>
                <Text style={styles.btnStopText}>⏹️ Detener Dictado</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.btnStart} onPress={handleStartListening}>
                <Text style={styles.btnStartText}>🎙️ Hablar Nuevamente</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Sugerencias Rápidas */}
          <Text style={styles.quickLabel}>O toca una pregunta frecuente por voz:</Text>
          <View style={styles.chipsContainer}>
            {[
              '¿Cuánto se vendió hoy?',
              '¿Prendas más vendidas?',
              '¿Hay alertas de stock?',
            ].map((q, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.chip}
                onPress={() => {
                  setTranscribedText(q);
                  onVoiceResult(q);
                }}
              >
                <Text style={styles.chipText}>💬 {q}</Text>
              </TouchableOpacity>
            ))}
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
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  closeBtn: {
    padding: 6,
  },
  closeBtnText: {
    fontSize: 18,
    color: '#888',
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
    marginBottom: 12,
  },
  webviewWrapper: {
    width: '100%',
    height: 160,
    backgroundColor: '#FAF8F5',
    borderRadius: 16,
    overflow: 'hidden',
  },
  fallbackBox: {
    width: '100%',
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBox: {
    marginTop: 14,
    padding: 10,
    backgroundColor: '#F3EFEA',
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 42,
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 13,
    color: '#333',
    textAlign: 'center',
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  btnStart: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnStartText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  btnStop: {
    flex: 1,
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnStopText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  quickLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#888',
    marginTop: 14,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    backgroundColor: '#FAF5EE',
    borderWidth: 1,
    borderColor: '#EFE6D9',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  chipText: {
    fontSize: 11,
    color: '#6F4E28',
    fontWeight: '600',
  },
});

