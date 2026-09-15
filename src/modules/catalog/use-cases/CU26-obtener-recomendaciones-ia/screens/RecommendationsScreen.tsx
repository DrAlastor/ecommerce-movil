import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MobileRecommendationCard } from '../components/MobileRecommendationCard';
import { RecommendationSearchBox } from '../components/RecommendationSearchBox';
import { useMobileRecommendations } from '../hooks/useMobileRecommendations';
import type { MobileRecommendedProduct } from '../services/recommendations.service';

export default function RecommendationsScreen({ navigation }: any) {
  const recommendations = useMobileRecommendations();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Recomendado para ti</Text>
          <Text style={styles.subtitle}>
            {recommendations.source === 'ai' ? 'Servicio de IA' : 'Motor local del MVP'}
          </Text>
        </View>
      </View>

      <RecommendationSearchBox
        prompt={recommendations.prompt}
        loading={recommendations.loading}
        onChangePrompt={recommendations.setPrompt}
        onSubmit={recommendations.submitPrompt}
      />

      {recommendations.loading && !recommendations.refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#111827" />
          <Text style={styles.centerText}>Generando recomendaciones...</Text>
        </View>
      ) : recommendations.errorMessage ? (
        <View style={styles.center}>
          <Text style={styles.errorTitle}>No pudimos recomendar prendas</Text>
          <Text style={styles.centerText}>{recommendations.errorMessage}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => recommendations.loadRecommendations()}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={recommendations.products}
          keyExtractor={(item: MobileRecommendedProduct) => item.id_producto.toString()}
          renderItem={({ item }) => (
            <MobileRecommendationCard
              item={item}
              onPress={() => navigation.navigate('ProductDetail', { id_producto: item.id_producto, product: item })}
            />
          )}
          numColumns={2}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.row}
          initialNumToRender={6}
          maxToRenderPerBatch={8}
          windowSize={5}
          removeClippedSubviews={true}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={recommendations.refreshing}
              onRefresh={() => recommendations.loadRecommendations(true)}
              colors={['#111827']}
            />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.errorTitle}>Sin recomendaciones disponibles</Text>
              <Text style={styles.centerText}>Prueba con otra búsqueda o vuelve más tarde.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F5F1' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: { fontSize: 20, fontWeight: '800', color: '#111827' },
  title: { fontSize: 18, fontWeight: '800', color: '#111827' },
  subtitle: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  list: { padding: 12 },
  row: { justifyContent: 'space-between' },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  centerText: { marginTop: 8, color: '#6B7280', fontSize: 13, textAlign: 'center' },
  errorTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  retryButton: {
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: '#111827',
  },
  retryText: { color: '#FFFFFF', fontWeight: '700' },
});
