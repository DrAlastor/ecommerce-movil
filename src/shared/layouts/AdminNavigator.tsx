import React from 'react';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import AdminDashboardScreen from '../../pages/admin/AdminDashboardScreen';
import ProfileScreen from '../../modules/users-security/use-cases/CU03-gestionar-perfil/screens/ProfileScreen';
import { useAuth } from '../../modules/users-security/shared/AuthContext';

const Drawer = createDrawerNavigator();

function CustomDrawerContent(props: any) {
  const { user, rol, logout } = useAuth();

  return (
    <View style={{ flex: 1 }}>
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
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function AdminNavigator() {
  const { hasPermission } = useAuth();

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
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
        options={{ title: 'Panel de Control' }} 
      />
      
      {/* CU03: Gestionar Perfil */}
      <Drawer.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'Mi Perfil' }} 
      />

    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
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
