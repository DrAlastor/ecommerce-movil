import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useMobileBranches } from '../hooks/useMobileBranches';
import { BranchesHeader } from '../components/BranchesHeader';
import { CityChips } from '../components/CityChips';
import { BranchCard } from '../components/BranchCard';
import type { MobileBranch } from '../types';

export default function BranchesScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  // Modo selección para CU16 (Reservas de prendas)
  const isSelectMode = Boolean(route.params?.selectMode);
  const onSelectBranch = route.params?.onSelectBranch;

  const {
    branches,
    cities,
    filteredBranches,
    isLoading,
    isRefreshing,
    errorMessage,
    selectedCityId,
    setSelectedCityId,
    searchQuery,
    setSearchQuery,
    loadData,
    handleCall,
    handleOpenMaps,
    handleResetFilters,
  } = useMobileBranches();

  const handleSelect = useCallback((branch: MobileBranch) => {
    if (isSelectMode && onSelectBranch) {
      onSelectBranch(branch);
      navigation.goBack();
    }
  }, [isSelectMode, onSelectBranch, navigation]);

  const renderBranchItem = useCallback(({ item }: { item: MobileBranch }) => (
    <BranchCard
      branch={item}
      isSelectMode={isSelectMode}
      onSelectBranch={handleSelect}
      onOpenMaps={handleOpenMaps}
      onCall={handleCall}
    />
  ), [isSelectMode, handleSelect, handleOpenMaps, handleCall]);

  const keyExtractor = useCallback((item: MobileBranch) => item.id_sucursal.toString(), []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header Superior con Buscador */}
      <BranchesHeader
        isSelectMode={isSelectMode}
        onGoBack={() => navigation.goBack()}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onClearSearch={() => setSearchQuery('')}
      />

      {/* Selector de Ciudades Horizontal */}
      <CityChips
        cities={cities}
        totalBranches={branches.length}
        selectedCityId={selectedCityId}
        onSelectCity={setSelectedCityId}
      />

      {/* Estados de Carga / Error / Lista */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#C4956A" />
          <Text style={styles.loadingText}>Localizando sucursales...</Text>
        </View>
      ) : errorMessage ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Error al cargar sucursales</Text>
          <Text style={styles.errorMessage}>{errorMessage}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadData(false)}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredBranches}
          keyExtractor={keyExtractor}
          renderItem={renderBranchItem}
          contentContainerStyle={styles.listContent}
          initialNumToRender={6}
          maxToRenderPerBatch={8}
          windowSize={5}
          removeClippedSubviews={true}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => loadData(true)}
              colors={['#C4956A']}
              tintColor="#C4956A"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🏬</Text>
              <Text style={styles.emptyTitle}>No encontramos sucursales</Text>
              <Text style={styles.emptySubtitle}>
                No hay establecimientos que coincidan con la búsqueda o ciudad seleccionada.
              </Text>
              <TouchableOpacity
                style={styles.resetFiltersButton}
                onPress={handleResetFilters}
              >
                <Text style={styles.resetFiltersButtonText}>Ver todas las sucursales</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F5F1',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 14,
    fontSize: 15,
    color: '#666666',
    fontWeight: '500',
  },
  errorIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 18,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#1C1510',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
    opacity: 0.6,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#777777',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  resetFiltersButton: {
    backgroundColor: '#1C1510',
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 25,
  },
  resetFiltersButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
