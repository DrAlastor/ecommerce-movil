import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useCartScreen } from '../hooks/useCartScreen';
import { CartItemCard } from '../components/CartItemCard';
import { CartSummaryFooter } from '../components/CartSummaryFooter';
import { CartBenefitsBanner } from '../components/CartBenefitsBanner';
import { CartEmptyState } from '../components/CartEmptyState';

export default function CartScreen({ navigation }: any) {
  const {
    cart,
    cartTotal,
    cartItemCount,
    formatPrice,
    updateQuantity,
    removeFromCart,
    handleConfirmClear,
    handleProceedToCheckout,
  } = useCartScreen(navigation);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF8F5" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>Bolsa de Compras</Text>
          <Text style={styles.headerSubtitle}>
            {cartItemCount} {cartItemCount === 1 ? 'artículo' : 'artículos'}
          </Text>
        </View>

        {cart.length > 0 ? (
          <TouchableOpacity onPress={handleConfirmClear} style={styles.clearBtn}>
            <Text style={styles.clearText}>Vaciar</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 44 }} />
        )}
      </View>

      {cart.length === 0 ? (
        <CartEmptyState onExplore={() => navigation.navigate('Home')} />
      ) : (
        <View style={styles.content}>
          <FlatList
            data={cart}
            keyExtractor={(item) =>
              `${item.product.id}-${item.selectedSize || ''}-${item.selectedColor || ''}`
            }
            renderItem={({ item }) => (
              <CartItemCard
                item={item}
                formatPrice={formatPrice}
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
              />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={<CartBenefitsBanner />}
          />

          <CartSummaryFooter
            cartTotal={cartTotal}
            formatPrice={formatPrice}
            onProceedToCheckout={handleProceedToCheckout}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0ECE8',
  },
  backButton: {
    padding: 6,
  },
  backIcon: {
    fontSize: 22,
    color: '#1C1510',
    fontWeight: '600',
  },
  titleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1C1510',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#8C7D70',
    marginTop: 1,
  },
  clearBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearText: {
    color: '#C0392B',
    fontSize: 13,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
});
