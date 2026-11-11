import React from 'react';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { OfflineImage as Image } from '../../services/offline/OfflineImage';
import AdminDashboardScreen from '../../pages/admin/AdminDashboardScreen';
import ProfileScreen from '../../modules/users-security/use-cases/CU02-gestionar-perfil/screens/ProfileScreen';
import CatalogScreen from '../../modules/catalog/use-cases/CU08-consultar-catalogo-productos/screens/CatalogScreen';
import { ProductDetailScreen } from '../../modules/catalog/use-cases/CU09-consultar-detalle-disponibilidad/screens/ProductDetailScreen';
import RecommendationsScreen from '../../modules/catalog/use-cases/CU12-obtener-recomendaciones-ia/screens/RecommendationsScreen';
import {
  CartScreen,
  CheckoutScreen,
  MyPurchasesScreen,
  MobilePosScreen,
  SalesHistoryScreen,
} from '../../modules/sales-billing';
import WishlistScreen from '../../modules/shop/use-cases/CU12-lista-deseos/screens/WishlistScreen';
import BranchesScreen from '../../modules/branches-inventory/use-cases/CU14-consultar-sucursales/screens/BranchesScreen';
import { ManageBranchReservationsScreen } from '../../modules/reservations';
import { ReportsDashboardScreen } from '../../modules/reports-dashboard';
import { VirtualFittingScreen } from '../../modules/mobile-experience';
import { useAuth } from '../../modules/users-security/shared/AuthContext';
import { useTenant } from '../context/TenantContext';

const Drawer = createDrawerNavigator();

function CustomDrawerContent(props: any) {
  const { user, rol, logout } = useAuth();
  const { currentTenant, openSelector } = useTenant();

  return (
    <View style={styles.container}>
      <DrawerContentScrollView {...props}>
        {/* Selector de Boutique Activa */}
        <TouchableOpacity
          style={styles.tenantBadgeBtn}
          onPress={openSelector}
          activeOpacity={0.8}
        >
          <Image
            source={currentTenant.localLogo}
            style={styles.tenantDrawerLogo}
            resizeMode="cover"
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.tenantDrawerName} numberOfLines={1}>{currentTenant.name}</Text>
            <Text style={styles.tenantDrawerSwitch}>Cambiar Tienda ▾</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.drawerHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(user?.empleado?.nombre?.[0] || user?.email?.[0] || 'U').toUpperCase()}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.empleado?.nombre} {user?.empleado?.apellido}</Text>
          <Text style={styles.userRole}>{rol?.nombre || 'Personal'}</Text>
        </View>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutButton} onPress={logout} activeOpacity={0.8}>
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function AdminNavigator() {
  const { rol, isSuperAdmin } = useAuth();
  const rolName = (rol?.nombre || '').toLowerCase().trim();

  const isAdmin = isSuperAdmin || rolName.includes('admin') || rolName.includes('super');
  const isManager = isAdmin || rolName.includes('encargad') || rolName.includes('gerente');
  const isCashier = isManager || rolName.includes('cajer') || rolName.includes('vent');

  return (
    <Drawer.Navigator
      drawerContent={CustomDrawerContent}
      initialRouteName={isCashier && !isManager ? 'POS' : 'Dashboard'}
      screenOptions={{
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerTintColor: '#1A1A1A',
        headerTitleStyle: { fontWeight: 'bold' },
        drawerActiveBackgroundColor: '#1A1A1A',
        drawerActiveTintColor: '#FFFFFF',
        drawerInactiveTintColor: '#666666',
        drawerLabelStyle: { fontSize: 14, fontWeight: '600' },
      }}
    >
      {/* 1. Panel de Control (Admin, Encargado y Cajero) */}
      <Drawer.Screen
        name="Dashboard"
        component={AdminDashboardScreen}
        options={{ title: '📊 Panel de Control' }}
      />

      {/* 2. Registrar Venta Presencial (POS) (Cajero, Encargado, Admin) */}
      {isCashier && (
        <Drawer.Screen
          name="POS"
          component={MobilePosScreen}
          options={{ title: '💳 Registrar Venta Presencial' }}
        />
      )}

      {/* 3. Gestión de Reservas de Prendas (Cajero, Encargado, Admin) */}
      {isCashier && (
        <Drawer.Screen
          name="ManageReservations"
          component={ManageBranchReservationsScreen}
          options={{ title: '📅 Gestión de Reservas' }}
        />
      )}

      {/* 4. Módulo de Reportes e Inteligencia (Dashboard, Genéricos, QBE, Voz, ML) (Admin y Encargado) */}
      {(isAdmin || isManager) && (
        <Drawer.Screen
          name="Reports"
          component={ReportsDashboardScreen}
          options={{ title: '📈 Reportes e Inteligencia' }}
        />
      )}

      {/* 5. Catálogo de Prendas */}
      <Drawer.Screen
        name="Catalog"
        component={CatalogScreen}
        options={{ title: '👗 Catálogo de Prendas', headerShown: false }}
      />

      {/* 6. Historial de Facturación y Ventas */}
      {isCashier && (
        <Drawer.Screen
          name="SalesHistory"
          component={SalesHistoryScreen}
          options={{ title: '🛍️ Historial de Facturación' }}
        />
      )}

      {/* 7. Asistente IA / Estilos */}
      <Drawer.Screen
        name="Recommendations"
        component={RecommendationsScreen}
        options={{ title: '✨ Asistente IA / Estilos' }}
      />

      {/* 8. Sucursales */}
      <Drawer.Screen
        name="Branches"
        component={BranchesScreen}
        options={{ title: '📍 Nuestras Sucursales', headerShown: false }}
      />

      {/* 9. Mi Perfil */}
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: '👤 Mi Perfil' }}
      />

      {/* Rutas internas navegables (ocultas en el Drawer) */}
      <Drawer.Screen
        name="Cart"
        component={CartScreen}
        options={{
          drawerItemStyle: { display: 'none' },
          title: '🛒 Bolsa de Compras',
        }}
      />
      <Drawer.Screen
        name="MyPurchases"
        component={MyPurchasesScreen}
        options={{
          drawerItemStyle: { display: 'none' },
          title: '🛍️ Mis Compras',
        }}
      />
      <Drawer.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{
          drawerItemStyle: { display: 'none' },
          headerShown: false,
        }}
      />
      <Drawer.Screen
        name="Wishlist"
        component={WishlistScreen}
        options={{
          drawerItemStyle: { display: 'none' },
          title: '♥ Mis Favoritos',
        }}
      />
      <Drawer.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{
          drawerItemStyle: { display: 'none' },
          headerShown: false,
        }}
      />
      <Drawer.Screen
        name="VirtualFitting"
        component={VirtualFittingScreen}
        options={{
          drawerItemStyle: { display: 'none' },
          headerShown: false,
        }}
      />
      <Drawer.Screen
        name="Home"
        component={CatalogScreen}
        options={{
          drawerItemStyle: { display: 'none' },
          headerShown: false,
        }}
      />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tenantBadgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 8,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAE6DF',
  },
  tenantDrawerLogo: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EAE6DF',
  },
  tenantDrawerName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1510',
  },
  tenantDrawerSwitch: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8C5E35',
    marginTop: 1,
  },
  drawerHeader: {
    padding: 20,
    backgroundColor: '#F8F5F1',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1C1510',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C1510',
    marginBottom: 3,
  },
  userRole: {
    fontSize: 13,
    color: '#8C5E35',
    fontWeight: '700',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EAEAEA',
    backgroundColor: '#FFFFFF',
  },
  logoutButton: {
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
  },
  logoutText: {
    color: '#DC3545',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
