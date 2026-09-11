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
import { AuthProvider, useAuth } from './src/modules/users-security/shared/AuthContext';
import LoginScreen from './src/modules/users-security/use-cases/CU01-iniciar-sesion/screens/LoginScreen';

// Tipos para las rutas
type RootStackParamList = {
  Home: undefined;
  Login: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();

import CatalogScreen from './src/modules/catalog/use-cases/CU10-consultar-catalogo-productos/screens/CatalogScreen';

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
      <RootStack.Screen name="Home" component={CatalogScreen} />
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
