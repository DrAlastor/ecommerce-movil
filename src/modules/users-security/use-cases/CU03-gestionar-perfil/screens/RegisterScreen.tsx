import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, Alert, ScrollView } from 'react-native';
import axios from 'axios';

export default function RegisterScreen({ navigation }: any) {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
    setErrorMsg('');
  };

  const handleRegister = async () => {
    if (!formData.nombre || !formData.apellido || !formData.email || !formData.password) {
      setErrorMsg('Por favor, completa todos los campos requeridos.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden.');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      // Usar la IP de localhost para emuladores Android (10.0.2.2) o Wi-Fi
      // Si se prueba en dispositivo físico, cambiar a la IP del servidor backend.
      const API_URL = 'http://10.0.2.2:3000/auth/register'; 
      
      await axios.post(API_URL, {
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        password: formData.password,
      });

      Alert.alert('Éxito', 'Cuenta creada exitosamente. Por favor inicia sesión.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (err: any) {
      if (err.response) {
        setErrorMsg(err.response.data.message || 'Error al crear la cuenta.');
      } else {
        setErrorMsg('Error de conexión con el servidor.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← Volver</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Crear Cuenta</Text>
          <Text style={styles.subtitle}>Únete a Dressly y descubre tu estilo.</Text>

          {errorMsg ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          <View style={styles.formGroup}>
            <Text style={styles.label}>Nombre *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. Ana"
              value={formData.nombre}
              onChangeText={(val) => handleChange('nombre', val)}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Apellido *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. Gómez"
              value={formData.apellido}
              onChangeText={(val) => handleChange('apellido', val)}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Correo Electrónico *</Text>
            <TextInput
              style={styles.input}
              placeholder="tu@correo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={formData.email}
              onChangeText={(val) => handleChange('email', val)}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Contraseña *</Text>
            <TextInput
              style={styles.input}
              placeholder="Mínimo 6 caracteres"
              secureTextEntry
              value={formData.password}
              onChangeText={(val) => handleChange('password', val)}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Confirmar Contraseña *</Text>
            <TextInput
              style={styles.input}
              placeholder="Repite tu contraseña"
              secureTextEntry
              value={formData.confirmPassword}
              onChangeText={(val) => handleChange('confirmPassword', val)}
            />
          </View>

          <TouchableOpacity style={styles.registerBtn} onPress={handleRegister} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.registerBtnText}>Crear cuenta</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Ya tienes una cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginText}>Inicia Sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { flexGrow: 1 },
  header: { padding: 16 },
  backBtn: { paddingVertical: 8 },
  backText: { fontSize: 16, color: '#1A1A1A' },
  content: { flex: 1, paddingHorizontal: 24, paddingBottom: 40, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 8, fontFamily: 'Georgia' },
  subtitle: { fontSize: 15, color: '#6B6B6B', marginBottom: 24 },
  errorBox: { backgroundColor: '#FEE2E2', padding: 12, borderRadius: 8, marginBottom: 16 },
  errorText: { color: '#DC2626', fontSize: 14 },
  formGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', color: '#1A1A1A', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#E8E8E8', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, backgroundColor: '#F9FAFB', color: '#1A1A1A' },
  registerBtn: { backgroundColor: '#1A1A1A', borderRadius: 8, paddingVertical: 16, alignItems: 'center', marginTop: 16 },
  registerBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { color: '#6B6B6B', fontSize: 15 },
  loginText: { color: '#1A1A1A', fontSize: 15, fontWeight: 'bold' },
});
