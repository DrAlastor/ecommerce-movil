/**
 * Dressly Fashion Store — Mobile App
 */
import 'react-native-gesture-handler';

import React from 'react';
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  View,
  useColorScheme,
  Image,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthProvider, useAuth } from './src/modules/users-security/shared/AuthContext';
import { ShopProvider } from './src/shared/context/ShopContext';
import AdminNavigator from './src/shared/layouts/AdminNavigator';

// Screens
import LoginScreen from './src/modules/users-security/use-cases/CU01-iniciar-sesion/screens/LoginScreen';
import RegisterScreen from './src/modules/users-security/use-cases/CU03-gestionar-perfil/screens/RegisterScreen';
import ProfileScreen from './src/modules/users-security/use-cases/CU03-gestionar-perfil/screens/ProfileScreen';
import ForgotPasswordScreen from './src/modules/users-security/use-cases/CU04-gestionar-contrasena/screens/ForgotPasswordScreen';
import ResetPasswordScreen from './src/modules/users-security/use-cases/CU04-gestionar-contrasena/screens/ResetPasswordScreen';
import CatalogScreen from './src/modules/catalog/use-cases/CU10-consultar-catalogo-productos/screens/CatalogScreen';
import CartScreen from './src/modules/shop/use-cases/CU11-gestionar-carrito/screens/CartScreen';
import WishlistScreen from './src/modules/shop/use-cases/CU12-lista-deseos/screens/WishlistScreen';

// Tipos para las rutas
type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
  Profile: undefined;
  Cart: undefined;
  Wishlist: undefined;
  ForgotPassword: undefined;
  ResetPassword: { email?: string; token?: string } | undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();

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

// Navegación principal
function RootNavigator() {
  const { isAuthenticated, isLoading, user, rol } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  const isClient = (rol?.nombre || '').toLowerCase().trim() === 'cliente';
  const isStaff = Boolean(user?.empleado) || (Boolean(rol?.nombre) && !isClient);

  // Si está autenticado y es personal/empleado, mostramos el Panel de Administración (Drawer)
  if (isAuthenticated && isStaff) {
    return <AdminNavigator />;
  }

  // Flujo normal para clientes o usuarios no autenticados
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="Home" component={CatalogScreen} />
      <RootStack.Screen name="Cart" component={CartScreen} />
      <RootStack.Screen name="Wishlist" component={WishlistScreen} />
      <RootStack.Screen name="Profile" component={ProfileScreen} />
      {!isAuthenticated && (
        <>
          <RootStack.Screen name="Login" component={LoginScreen} />
          <RootStack.Screen name="Register" component={RegisterScreen} />
          <RootStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <RootStack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        </>
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
        <ShopProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </ShopProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default App;
