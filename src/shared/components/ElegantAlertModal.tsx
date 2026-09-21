import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface ElegantAlertModalProps {
  visible: boolean;
  type?: AlertType;
  title: string;
  message: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  onPrimaryPress: () => void;
  onSecondaryPress?: () => void;
  onClose?: () => void;
}

export const ElegantAlertModal: React.FC<ElegantAlertModalProps> = ({
  visible,
  type = 'info',
  title,
  message,
  primaryButtonText = 'Entendido',
  secondaryButtonText,
  onPrimaryPress,
  onSecondaryPress,
  onClose,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return '✨';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success':
        return '#10B981';
      case 'error':
        return '#EF4444';
      case 'warning':
        return '#F59E0B';
      case 'info':
      default:
        return '#C4956A';
    }
  };

  const getIconBg = () => {
    switch (type) {
      case 'success':
        return 'rgba(16, 185, 129, 0.12)';
      case 'error':
        return 'rgba(239, 68, 68, 0.12)';
      case 'warning':
        return 'rgba(245, 158, 11, 0.12)';
      case 'info':
      default:
        return 'rgba(196, 149, 106, 0.12)';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose || onPrimaryPress}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Top Decorative Line */}
          <View style={[styles.topLine, { backgroundColor: getIconColor() }]} />

          {/* Icon Circle */}
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: getIconBg(), borderColor: getIconColor() },
            ]}
          >
            <Text style={[styles.iconText, { color: getIconColor() }]}>
              {getIcon()}
            </Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Buttons */}
          <View style={styles.buttonRow}>
            {secondaryButtonText && onSecondaryPress && (
              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={onSecondaryPress}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryBtnText}>{secondaryButtonText}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.primaryBtn,
                type === 'error' && styles.primaryBtnError,
                type === 'success' && styles.primaryBtnSuccess,
              ]}
              onPress={onPrimaryPress}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryBtnText}>{primaryButtonText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 17, 21, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: Math.min(SCREEN_WIDTH - 48, 380),
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  topLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconText: {
    fontSize: 26,
    fontWeight: '800',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  message: {
    fontSize: 14,
    color: '#555555',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 22,
    paddingHorizontal: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },
  secondaryBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4B5563',
  },
  primaryBtn: {
    flex: 1.4,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryBtnError: {
    backgroundColor: '#1A1A1A',
  },
  primaryBtnSuccess: {
    backgroundColor: '#10B981',
  },
  primaryBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});

export default ElegantAlertModal;
