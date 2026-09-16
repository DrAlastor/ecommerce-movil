import React from 'react';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AdminDashboardScreen from '../../pages/admin/AdminDashboardScreen';
import ProfileScreen from '../../modules/users-security/use-cases/CU02-gestionar-perfil/screens/ProfileScreen';
import CatalogScreen from '../../modules/catalog/use-cases/CU08-consultar-catalogo-productos/screens/CatalogScreen';
import { ProductDetailScreen } from '../../modules/catalog/use-cases/CU09-consultar-detalle-disponibilidad/screens/ProductDetailScreen';
import RecommendationsScreen from '../../modules/catalog/use-cases/CU12-obtener-recomendaciones-ia/screens/RecommendationsScreen';
import CartScreen from '../../modules/shop/use-cases/CU11-gestionar-carrito/screens/CartScreen';
import WishlistScreen from '../../modules/shop/use-cases/CU12-lista-deseos/screens/WishlistScreen';
import BranchesScreen from '../../modules/branches-inventory/screens/BranchesScreen';
import { useAuth } from '../../modules/users-security/shared/AuthContext';


const Drawer = createDrawerNavigator();

function CustomDrawerContent(props: any) {
  const { user, rol, logout } = useAuth();

  return (
    <View style={styles.container}>
      <DrawerContentScrollView {...props}>
        <View style={styles.drawerHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(user?.empleado?.nombre?.[0] || user?.email?.[0] || 'U').toUpperCase()}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.empleado?.nombre} {user?.empleado?.apellido}</Text>
          <Text style={styles.userRole}>{rol?.nombre}</Text>
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
  return (
    <Drawer.Navigator
      drawerContent={CustomDrawerContent}
      screenOptions={{
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerTintColor: '#1A1A1A',
        headerTitleStyle: { fontWeight: 'bold' },
        drawerActiveBackgroundColor: '#1A1A1A',
        drawerActiveTintColor: '#FFFFFF',
        drawerInactiveTintColor: '#666666',
        drawerLabelStyle: { fontSize: 15, fontWeight: '500' },
      }}
    >
      <Drawer.Screen 
        name="Dashboard" 
        component={AdminDashboardScreen} 
        options={{ title: '📊 Panel de Control' }} 
      />

      {/* CU08: Consultar catálogo de productos */}
      <Drawer.Screen 
        name="Catalog" 
        component={CatalogScreen} 
        options={{ title: '👗 Catálogo de Prendas', headerShown: false }} 
      />

      {/* CU12: Obtener recomendaciones de prendas mediante IA */}
      <Drawer.Screen 
        name="Recommendations" 
        component={RecommendationsScreen} 
        options={{ title: '✨ Asistente IA / Estilos' }} 
      />

      {/* CU02: Registrar y gestionar perfil de cliente */}
      <Drawer.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: '👤 Mi Perfil' }} 
      />

      {/* CU14: Consultar sucursales */}
      <Drawer.Screen 
        name="Branches" 
        component={BranchesScreen} 
        options={{ title: '📍 Nuestras Sucursales', headerShown: false }} 
      />


      <Drawer.Screen 
        name="Cart" 
        component={CartScreen} 
        options={{ title: '🛒 Bolsa de Compras' }} 
      />

      <Drawer.Screen 
        name="Wishlist" 
        component={WishlistScreen} 
        options={{ title: '♥ Mis Favoritos' }} 
      />

      {/* CU09: Detalle de producto (navegable desde catálogo) */}
      <Drawer.Screen 
        name="ProductDetail" 
        component={ProductDetailScreen} 
        options={{ 
          title: 'Detalle de Prenda',
          drawerItemStyle: { display: 'none' },
          headerShown: false,
        }} 
      />

      {/* Alias para navegación interna */}
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
  drawerHeader: {
    padding: 20,
    backgroundColor: '#F8F5F1',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: '#6B6B6B',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#EAEAEA',
    backgroundColor: '#FFFFFF',
  },
  logoutButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  logoutText: {
    color: '#DC3545',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
