import { Alert } from 'react-native';
import { useShop } from '../../../../../shared/context/ShopContext';

export function useCartScreen(navigation: any) {
  const { cart, removeFromCart, updateQuantity, clearCart, cartTotal, cartItemCount } = useShop();

  const formatPrice = (price: number) => `${price.toFixed(2)} Bs`;

  const handleConfirmClear = () => {
    Alert.alert(
      'Vaciar Carrito',
      '¿Estás seguro de que deseas eliminar todas las prendas de tu bolsa?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Vaciar', style: 'destructive', onPress: clearCart },
      ]
    );
  };

  const handleProceedToCheckout = () => {
    if (cart.length === 0) {
      Alert.alert('Bolsa Vacía', 'Agrega prendas a tu carrito antes de proceder al pago.');
      return;
    }
    navigation.navigate('Checkout');
  };

  return {
    cart,
    cartTotal,
    cartItemCount,
    formatPrice,
    updateQuantity,
    removeFromCart,
    handleConfirmClear,
    handleProceedToCheckout,
  };
}
