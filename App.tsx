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
import { AlertProvider } from './src/shared/context/AlertContext';
import { TenantProvider } from './src/shared/context/TenantContext';
import AdminNavigator from './src/shared/layouts/AdminNavigator';
import SaasSuperAdminScreen from './src/pages/admin/SaasSuperAdminScreen';
import { notificationService } from './src/services/notification.service';

// Screens
import LoginScreen from './src/modules/users-security/use-cases/CU01-gestionar-acceso/screens/LoginScreen';
import RegisterScreen from './src/modules/users-security/use-cases/CU02-gestionar-perfil/screens/RegisterScreen';
import ProfileScreen from './src/modules/users-security/use-cases/CU02-gestionar-perfil/screens/ProfileScreen';
import ForgotPasswordScreen from './src/modules/users-security/use-cases/CU03-gestionar-contrasena/screens/ForgotPasswordScreen';
import ResetPasswordScreen from './src/modules/users-security/use-cases/CU03-gestionar-contrasena/screens/ResetPasswordScreen';
import CatalogScreen from './src/modules/catalog/use-cases/CU08-consultar-catalogo-productos/screens/CatalogScreen';
import { ProductDetailScreen } from './src/modules/catalog/use-cases/CU09-consultar-detalle-disponibilidad/screens/ProductDetailScreen';
import RecommendationsScreen from './src/modules/catalog/use-cases/CU12-obtener-recomendaciones-ia/screens/RecommendationsScreen';
import {
  CartScreen,
  CheckoutScreen,
  MyPurchasesScreen,
} from './src/modules/sales-billing';
import WishlistScreen from './src/modules/shop/use-cases/CU12-lista-deseos/screens/WishlistScreen';
import BranchesScreen from './src/modules/branches-inventory/use-cases/CU14-consultar-sucursales/screens/BranchesScreen';
import { MyReservationsScreen } from './src/modules/reservations';
import { VirtualFittingScreen } from './src/modules/mobile-experience';

// Tipos para las rutas
type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
  Profile: undefined;
  Cart: undefined;
  Checkout: undefined;
  MyPurchases: undefined;
  Wishlist: undefined;
  ProductDetail: { id_producto: number; product?: any };
  Recommendations: undefined;
  Branches: { selectMode?: boolean; onSelectBranch?: (branch: any) => void } | undefined;
  MyReservations: undefined;
  VirtualFitting: { id_producto?: number; productId?: number; variantId?: number } | undefined;
  ForgotPassword: undefined;
  ResetPassword: { email?: string; token?: string } | undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();

// Pantalla de carga
function LoadingScreen() {
  return (
    <View style={loadingStyles.container}>
      <Image source={require('./src/assets/logo-fashionstore.png')} style={loadingStyles.logoImage} resizeMode="contain" />
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
  const { isAuthenticated, isLoading, user, rol, isGuest, isSuperAdmin } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  // 1. Super Administrador del SaaS FashionStore (CU04 / CU05 / Monitoreo / ML)
  if (isAuthenticated && isSuperAdmin) {
    return <SaasSuperAdminScreen />;
  }

  const isClient = (rol?.nombre || '').toLowerCase().trim() === 'cliente';
  const isStaff = Boolean(user?.empleado) || (Boolean(rol?.nombre) && !isClient);

  // 2. Personal / Empleado de boutique (Admin, Cajero, Encargado, etc.)
  if (isAuthenticated && isStaff) {
    return <AdminNavigator />;
  }

  // 3. Usuario no autenticado -> Pantalla inicial única y obligatoria: LOGIN
  if (!isAuthenticated) {
    return (
      <RootStack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Login">
        <RootStack.Screen name="Login" component={LoginScreen} />
        <RootStack.Screen name="Register" component={RegisterScreen} />
        <RootStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <RootStack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      </RootStack.Navigator>
    );
  }

  // 4. Cliente autenticado -> Catálogo exclusivo de la boutique descubierta por su correo
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Home">
      <RootStack.Screen name="Home" component={CatalogScreen} />
      <RootStack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <RootStack.Screen name="Recommendations" component={RecommendationsScreen} />
      <RootStack.Screen name="Cart" component={CartScreen} />
      <RootStack.Screen name="Checkout" component={CheckoutScreen} />
      <RootStack.Screen name="MyPurchases" component={MyPurchasesScreen} />
      <RootStack.Screen name="Wishlist" component={WishlistScreen} />
      <RootStack.Screen name="Branches" component={BranchesScreen} />
      <RootStack.Screen name="Profile" component={ProfileScreen} />
      <RootStack.Screen name="MyReservations" component={MyReservationsScreen} />
      <RootStack.Screen name="VirtualFitting" component={VirtualFittingScreen} />
    </RootStack.Navigator>
  );
}

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  React.useEffect(() => {
    notificationService.requestUserPermission().then(async (granted) => {
      if (granted) {
        await notificationService.syncDeviceTokenWithBackend();
      }
    });
    const cleanup = notificationService.initializeListeners();
    return cleanup;
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AlertProvider>
        <TenantProvider>
          <AuthProvider>
            <ShopProvider>
              <NavigationContainer>
                <RootNavigator />
              </NavigationContainer>
            </ShopProvider>
          </AuthProvider>
        </TenantProvider>
      </AlertProvider>
    </SafeAreaProvider>
  );
}

export default App;
