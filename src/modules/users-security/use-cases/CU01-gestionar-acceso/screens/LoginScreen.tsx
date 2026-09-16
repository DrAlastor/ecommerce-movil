import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useAuth } from '../../../shared/AuthContext';
import type { AxiosError } from 'axios';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen({ navigation }: any) {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [errorType, setErrorType] = useState<'error' | 'warning'>('error');

  const validateEmail = useCallback((value: string): boolean => {
    if (!value.trim()) {
      setEmailError('El correo electrónico es obligatorio');
      return false;
    }
    if (!EMAIL_REGEX.test(value.trim())) {
      setEmailError('El formato del correo no es válido');
      return false;
    }
    setEmailError('');
    return true;
  }, []);

  const validatePassword = useCallback((value: string): boolean => {
    if (!value) {
      setPasswordError('La contraseña es obligatoria');
      return false;
    }
    if (value.length < 6) {
      setPasswordError('Mínimo 6 caracteres');
      return false;
    }
    setPasswordError('');
    return true;
  }, []);

  const handleSubmit = async () => {
    setGeneralError('');

    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) return;

    setIsSubmitting(true);

    try {
      await login({ email: email.trim().toLowerCase(), password });
      // La navegación se maneja automáticamente por el AuthContext
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message?: string }>;

      if (axiosError.response) {
        const { status, data } = axiosError.response;

        if (status === 403) {
          setErrorType('warning');
          setGeneralError(data?.message || 'La cuenta se encuentra desactivada');
        } else if (status === 401) {
          setErrorType('error');
          setGeneralError('Credenciales inválidas. Verifica tu correo y contraseña.');
        } else if (status === 400) {
          setErrorType('error');
          const message = Array.isArray(data?.message)
            ? data.message[0]
            : data?.message || 'Datos incompletos';
          setGeneralError(message);
        } else {
          setErrorType('error');
          setGeneralError('Error del servidor. Inténtalo más tarde.');
        }
      } else if (axiosError.request) {
        setErrorType('error');
        setGeneralError('Error de conexión. Verifica tu internet.');
      } else {
        setErrorType('error');
        setGeneralError('Error inesperado. Inténtalo de nuevo.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Botón volver atrás */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('Home')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.backButtonText}>← Volver al inicio</Text>
        </TouchableOpacity>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image source={require('../../../../../assets/logo.png')} style={styles.logoImage} resizeMode="contain" />
        </View>

        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Bienvenido de vuelta</Text>
          <Text style={styles.headerSubtitle}>
            Inicia sesión para continuar
          </Text>
        </View>

        {/* Error general */}
        {generalError !== '' && (
          <View
            style={[
              styles.alertBox,
              errorType === 'warning' ? styles.alertWarning : styles.alertError,
            ]}
          >
            <Text
              style={[
                styles.alertText,
                errorType === 'warning'
                  ? styles.alertTextWarning
                  : styles.alertTextError,
              ]}
            >
              {generalError}
            </Text>
          </View>
        )}

        {/* Email */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Correo electrónico</Text>
          <View
            style={[
              styles.inputWrapper,
              emailError ? styles.inputWrapperError : null,
            ]}
          >
            <TextInput
              style={styles.input}
              placeholder="tu@correo.com"
              placeholderTextColor="#9B9B9B"
              value={email}
              onChangeText={text => {
                setEmail(text);
                if (emailError) validateEmail(text);
              }}
              onBlur={() => {
                if (email) validateEmail(email);
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isSubmitting}
              returnKeyType="next"
            />
          </View>
          {emailError !== '' && (
            <Text style={styles.fieldError}>{emailError}</Text>
          )}
        </View>

        {/* Contraseña */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Contraseña</Text>
          <View
            style={[
              styles.inputWrapper,
              passwordError ? styles.inputWrapperError : null,
            ]}
          >
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="Ingresa tu contraseña"
              placeholderTextColor="#9B9B9B"
              value={password}
              onChangeText={text => {
                setPassword(text);
                if (passwordError) validatePassword(text);
              }}
              onBlur={() => {
                if (password) validatePassword(password);
              }}
              secureTextEntry={!showPassword}
              editable={!isSubmitting}
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.eyeText}>
                {showPassword ? '🙈' : '👁️'}
              </Text>
            </TouchableOpacity>
          </View>
          {passwordError !== '' && (
            <Text style={styles.fieldError}>{passwordError}</Text>
          )}
        </View>

        {/* Olvidé contraseña */}
        <TouchableOpacity 
          style={styles.forgotButton}
          onPress={() => navigation.navigate('ForgotPassword')}
        >
          <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>

        {/* Botón submit */}
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <View style={styles.submitLoading}>
              <ActivityIndicator color="#FFFFFF" size="small" />
              <Text style={styles.submitText}>Iniciando sesión...</Text>
            </View>
          ) : (
            <Text style={styles.submitText}>Iniciar sesión</Text>
          )}
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>o</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Registro */}
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>¿No tienes una cuenta? </Text>
          <TouchableOpacity>
            <Text style={styles.registerLink}>Crear cuenta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F5F1',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 48,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoImage: {
    width: 200,
    height: 120,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  backButtonText: {
    color: '#6B6B6B',
    fontSize: 14,
    fontWeight: '500',
  },
  headerContainer: {
    marginBottom: 28,
  },
  headerTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 28,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B6B6B',
  },
  alertBox: {
    padding: 14,
    borderRadius: 8,
    marginBottom: 20,
  },
  alertError: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  alertWarning: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  alertText: {
    fontSize: 14,
    lineHeight: 20,
  },
  alertTextError: {
    color: '#991B1B',
  },
  alertTextWarning: {
    color: '#92400E',
  },
  inputGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    overflow: 'hidden',
  },
  inputWrapperError: {
    borderColor: '#DC3545',
  },
  input: {
    flex: 1,
    height: 52,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1A1A1A',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 14,
    padding: 4,
  },
  eyeText: {
    fontSize: 18,
  },
  fieldError: {
    fontSize: 12,
    color: '#DC3545',
    marginTop: 6,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 24,
    marginTop: -4,
  },
  forgotText: {
    fontSize: 14,
    color: '#6B6B6B',
  },
  submitButton: {
    backgroundColor: '#1A1A1A',
    height: 52,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    gap: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E8E8E8',
  },
  dividerText: {
    fontSize: 14,
    color: '#9B9B9B',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    fontSize: 14,
    color: '#6B6B6B',
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
});
