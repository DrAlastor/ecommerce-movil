import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';

interface BranchesHeaderProps {
  isSelectMode: boolean;
  onGoBack: () => void;
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onClearSearch: () => void;
}

export const BranchesHeader: React.FC<BranchesHeaderProps> = React.memo(({
  isSelectMode,
  onGoBack,
  searchQuery,
  onSearchChange,
  onClearSearch,
}) => {
  return (
    <View style={styles.headerContainer}>
      {/* Barra superior de navegación */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onGoBack}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        <View style={styles.navTitleContainer}>
          <Text style={styles.navTitle}>
            {isSelectMode ? 'Seleccionar Sucursal' : 'Nuestras Sucursales'}
          </Text>
          <Text style={styles.navSubtitle}>Dressly Fashion Store</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Buscador de sucursal */}
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre, zona o ciudad..."
          placeholderTextColor="#999999"
          value={searchQuery}
          onChangeText={onSearchChange}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={onClearSearch} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {isSelectMode && (
        <View style={styles.selectModeNotice}>
          <Text style={styles.selectModeNoticeText}>
            💡 Toca la sucursal donde deseas retirar o probar tus prendas.
          </Text>
        </View>
      )}
    </View>
  );
});

BranchesHeader.displayName = 'BranchesHeader';

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ECE7E0',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F5EFEB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 26,
    color: '#1A1A1A',
    lineHeight: 30,
    marginTop: -2,
  },
  navTitleContainer: {
    alignItems: 'center',
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  navSubtitle: {
    fontSize: 12,
    color: '#8C827A',
    fontWeight: '500',
    marginTop: 1,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F5F1',
    borderRadius: 22,
    marginHorizontal: 16,
    marginTop: 6,
    paddingHorizontal: 14,
    height: 42,
    borderWidth: 1,
    borderColor: '#ECE7E0',
  },
  searchIcon: {
    fontSize: 15,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1A1A1A',
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
  },
  clearButtonText: {
    fontSize: 13,
    color: '#8C827A',
  },
  selectModeNotice: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: '#FAF4ED',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5D5C4',
  },
  selectModeNoticeText: {
    fontSize: 12,
    color: '#6E4929',
    fontWeight: '600',
    textAlign: 'center',
  },
});
