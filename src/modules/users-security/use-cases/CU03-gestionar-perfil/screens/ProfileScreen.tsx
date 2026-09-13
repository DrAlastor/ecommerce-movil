import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, Alert, ScrollView } from 'react-native';
import api from '../../../../../services/api';
import { useAuth } from '../../../shared/AuthContext';

export default function ProfileScreen({ navigation }: any) {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    sexo: '',
    fecha_nacimiento: '',
    preferencias_estilo: '',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isEmpleado, setIsEmpleado] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/auth/profile');
        
        const cliente = response.data.user.cliente;
        const empleado = response.data.user.empleado;
        if (cliente) {
          setFormData({
            nombre: cliente.nombre || '',
            apellido: cliente.apellido || '',
            sexo: cliente.sexo || '',
            fecha_nacimiento: cliente.fecha_nacimiento ? cliente.fecha_nacimiento.split('T')[0] : '',
            preferencias_estilo: cliente.preferencias_estilo || '',
            telefono: '',
          });
        } else if (empleado) {
          setIsEmpleado(true);
          setFormData({
            nombre: empleado.nombre || '',
            apellido: empleado.apellido || '',
            sexo: '',
            fecha_nacimiento: '',
            preferencias_estilo: '',
            telefono: empleado.telefono || '',
          });
        }
      } catch (err: any) {
        Alert.alert('Error', 'No se pudo cargar el perfil');
        if (err.response?.status === 401) {
          logout();
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (authLoading) return;

    if (isAuthenticated) {
      fetchProfile();
    } else {
      navigation.replace('Login');
    }
  }, [isAuthenticated, authLoading, navigation, logout]);

  const handleChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload: any = {
        nombre: formData.nombre,
        apellido: formData.apellido,
      };

      if (isEmpleado) {
        payload.telefono = (formData as any).telefono;
      } else {
        payload.sexo = formData.sexo;
        payload.preferencias_estilo = formData.preferencias_estilo;
        if (formData.fecha_nacimiento) {
          payload.fecha_nacimiento = formData.fecha_nacimiento;
        }
      }

      await api.patch('/auth/profile', payload);
      Alert.alert('Éxito', 'Perfil actualizado exitosamente');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'No se pudo actualizar el perfil';
      Alert.alert('Error', Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSave = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert('Error', 'Las contraseñas nuevas no coinciden');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      Alert.alert('Error', 'La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsChangingPassword(true);
    try {
      await api.patch('/auth/password/change', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      Alert.alert('Éxito', 'Contraseña actualizada exitosamente');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'No se pudo cambiar la contraseña');
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1A1A1A" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mi Perfil</Text>
          <View style={{ width: 60 }} />
        </View>

        <View style={styles.content}>
          
          <View style={styles.emailCard}>
            <Text style={styles.emailLabel}>Correo Electrónico</Text>
            <Text style={styles.emailText}>{user?.email}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Datos Personales</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Nombre</Text>
              <TextInput
                style={styles.input}
                value={formData.nombre}
                onChangeText={(val) => handleChange('nombre', val)}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Apellido</Text>
              <TextInput
                style={styles.input}
                value={formData.apellido}
                onChangeText={(val) => handleChange('apellido', val)}
              />
            </View>

            {isEmpleado ? (
              <>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Teléfono</Text>
                  <TextInput
                    style={styles.input}
                    value={(formData as any).telefono || ''}
                    onChangeText={(val) => handleChange('telefono', val)}
                    keyboardType="phone-pad"
                  />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Carnet de Identidad (CI)</Text>
                  <TextInput
                    style={[styles.input, styles.disabledInput]}
                    value={user?.empleado?.ci || 'No disponible'}
                    editable={false}
                  />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Código de Empleado</Text>
                  <TextInput
                    style={[styles.input, styles.disabledInput]}
                    value={user?.empleado?.codigo_empleado || 'No disponible'}
                    editable={false}
                  />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Fecha de Contratación</Text>
                  <TextInput
                    style={[styles.input, styles.disabledInput]}
                    value={user?.empleado?.fecha_contratacion ? new Date(user.empleado.fecha_contratacion).toLocaleDateString() : 'No disponible'}
                    editable={false}
                  />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Estado</Text>
                  <TextInput
                    style={[styles.input, styles.disabledInput, { textTransform: 'capitalize' }]}
                    value={user?.empleado?.estado || 'No disponible'}
                    editable={false}
                  />
                </View>
              </>
            ) : (
              <>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Sexo (Masculino/Femenino/Otro)</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.sexo}
                    onChangeText={(val) => handleChange('sexo', val)}
                    placeholder="Ej. Femenino"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Fecha de Nacimiento (YYYY-MM-DD)</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.fecha_nacimiento}
                    onChangeText={(val) => handleChange('fecha_nacimiento', val)}
                    placeholder="Ej. 1995-08-24"
                  />
                </View>
              </>
            )}
          </View>

          {!isEmpleado && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Preferencias de Estilo</Text>
              <View style={styles.formGroup}>
                <Text style={styles.label}>¿Cuál es tu estilo?</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.preferencias_estilo}
                  onChangeText={(val) => handleChange('preferencias_estilo', val)}
                  placeholder="Ej. Minimalista, casual, elegante..."
                  multiline
                  numberOfLines={4}
                />
              </View>
            </View>
          )}

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={isSaving}>
            {isSaving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveBtnText}>Guardar Cambios de Perfil</Text>
            )}
          </TouchableOpacity>

          <View style={[styles.section, { marginTop: 24 }]}>
            <Text style={styles.sectionTitle}>Seguridad y Acceso</Text>
            <Text style={styles.sectionSubtitle}>Cambia tu contraseña para mantener tu cuenta segura.</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Contraseña Actual</Text>
              <TextInput
                style={styles.input}
                value={passwordData.currentPassword}
                onChangeText={(val) => setPasswordData({...passwordData, currentPassword: val})}
                secureTextEntry
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Nueva Contraseña</Text>
              <TextInput
                style={styles.input}
                value={passwordData.newPassword}
                onChangeText={(val) => setPasswordData({...passwordData, newPassword: val})}
                secureTextEntry
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Confirmar Nueva Contraseña</Text>
              <TextInput
                style={styles.input}
                value={passwordData.confirmPassword}
                onChangeText={(val) => setPasswordData({...passwordData, confirmPassword: val})}
                secureTextEntry
              />
            </View>
          </View>

          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: '#1A1A1A' }]} onPress={handlePasswordSave} disabled={isChangingPassword}>
            {isChangingPassword ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveBtnText}>Cambiar Contraseña</Text>
            )}
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F5F1' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F5F1' },
  scrollContent: { flexGrow: 1, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E8E8E8' },
  backBtn: { padding: 8, marginLeft: -8 },
  backText: { fontSize: 16, color: '#1A1A1A' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
  content: { padding: 16 },
  emailCard: { backgroundColor: '#E8E8E8', padding: 16, borderRadius: 8, marginBottom: 24 },
  emailLabel: { fontSize: 12, color: '#6B6B6B', marginBottom: 4 },
  emailText: { fontSize: 16, color: '#1A1A1A', fontWeight: '500' },
  section: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 8, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', paddingBottom: 8 },
  sectionSubtitle: { fontSize: 14, color: '#6B6B6B', marginBottom: 16 },
  formGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', color: '#6B6B6B', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#E8E8E8', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, backgroundColor: '#F9FAFB', color: '#1A1A1A' },
  disabledInput: { backgroundColor: '#EAEAEA', color: '#6B6B6B' },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  saveBtn: { backgroundColor: '#1A1A1A', borderRadius: 8, paddingVertical: 16, alignItems: 'center' },
  saveBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});
