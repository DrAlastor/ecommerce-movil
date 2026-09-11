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
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './src/modules/users-security/AuthContext';
import LoginScreen from './src/modules/users-security/LoginScreen';

// Tipos para las rutas
type AuthStackParamList = {
  Login: undefined;
};

type AppStackParamList = {
  Home: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

// Pantalla placeholder del catálogo/home del cliente
function HomeScreen() {
  const { logout, user, rol } = useAuth();

  return (
    <View style={homeStyles.container}>
      <View style={homeStyles.content}>
        <Text style={homeStyles.logo}>Dressly</Text>
        <Text style={homeStyles.subtitle}>FASHION STORE</Text>
        <View style={homeStyles.divider} />
        <Text style={homeStyles.welcome}>
          ¡Bienvenido, {user?.email}!
        </Text>
        <Text style={homeStyles.role}>
          Rol: {rol?.nombre}
        </Text>
        <TouchableOpacity
          style={homeStyles.logoutButton}
          onPress={logout}
          activeOpacity={0.8}
        >
          <Text style={homeStyles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
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
  logo: {
    fontFamily: 'serif',
    fontSize: 36,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 11,
    color: '#9B9B9B',
    letterSpacing: 4,
    marginTop: 2,
    marginBottom: 24,
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
      <Text style={loadingStyles.logo}>Dressly</Text>
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
  logo: {
    fontFamily: 'serif',
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: 2,
    textTransform: 'uppercase',
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

  if (!isAuthenticated) {
    return (
      <AuthStack.Navigator screenOptions={{ headerShown: false }}>
        <AuthStack.Screen name="Login" component={LoginScreen} />
      </AuthStack.Navigator>
    );
  }

  return (
    <AppStack.Navigator screenOptions={{ headerShown: false }}>
      <AppStack.Screen name="Home" component={HomeScreen} />
    </AppStack.Navigator>
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
