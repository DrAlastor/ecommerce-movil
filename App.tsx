/**
 * Dressly Fashion Store — Mobile App
 * Módulo: Usuarios y Seguridad (CU01)
 */

import React from 'react';
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
  Image,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './src/modules/users-security/AuthContext';
import LoginScreen from './src/modules/users-security/LoginScreen';

// Tipos para las rutas
type RootStackParamList = {
  Home: undefined;
  Login: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();

// Pantalla placeholder del catálogo/home del cliente
function HomeScreen({ navigation }: any) {
  const { logout, user, rol, isAuthenticated } = useAuth();

  return (
    <View style={homeStyles.container}>
      <View style={homeStyles.content}>
        <Image source={require('./src/assets/logo.png')} style={homeStyles.logoImage} resizeMode="contain" />
        
        <View style={homeStyles.divider} />
        
        {isAuthenticated ? (
          <>
            <Text style={homeStyles.welcome}>
              ¡Bienvenido, {user?.email}!
            </Text>
            <Text style={homeStyles.role}>
              Rol: {rol?.nombre || 'Cliente'}
            </Text>
            <TouchableOpacity
              style={homeStyles.logoutButton}
              onPress={logout}
              activeOpacity={0.8}
            >
              <Text style={homeStyles.logoutText}>Cerrar sesión</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={homeStyles.welcome}>
              ¡Bienvenido a Dressly!
            </Text>
            <Text style={homeStyles.role}>
              Explora nuestra nueva colección
            </Text>
            <TouchableOpacity
              style={homeStyles.loginButton}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.8}
            >
              <Text style={homeStyles.logoutText}>Iniciar sesión</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const homeStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F5F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    padding: 32,
  },
  logoImage: {
    width: 200,
    height: 120,
    marginBottom: 20,
  },
  divider: {
    width: 40,
    height: 2,
    backgroundColor: '#C4956A',
    marginBottom: 24,
  },
  welcome: {
    fontSize: 16,
    color: '#1A1A1A',
    marginBottom: 4,
  },
  role: {
    fontSize: 14,
    color: '#6B6B6B',
    marginBottom: 32,
  },
  logoutButton: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
  },
  loginButton: {
    backgroundColor: '#C4956A',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
});

// Pantalla de carga
function LoadingScreen() {
  return (
    <View style={loadingStyles.container}>
      <Image source={require('./src/assets/logo.png')} style={loadingStyles.logoImage} resizeMode="contain" />
      <ActivityIndicator
        size="large"
        color="#1A1A1A"
        style={loadingStyles.spinner}
      />
    </View>
  );
}

const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F5F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 160,
    height: 100,
    marginBottom: 20,
  },
  spinner: {
    marginTop: 8,
  },
});

// Navegación basada en estado de autenticación
function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="Home" component={HomeScreen} />
      {!isAuthenticated && (
        <RootStack.Screen name="Login" component={LoginScreen} />
      )}
    </RootStack.Navigator>
  );
}

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AuthProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default App;
