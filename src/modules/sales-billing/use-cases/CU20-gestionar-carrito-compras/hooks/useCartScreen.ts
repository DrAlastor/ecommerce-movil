/**
 * @caso-de-uso CU20 — Gestionar carrito de compras
 * @subsistema Ventas, Pagos y Compras
 * @capa Control (presentación) — Aplicación móvil
 * @responsabilidad Coordina estado, validaciones y acciones de la interfaz antes de delegar la operación al servicio o API.
 * @secuencia Cliente -> carrito -> controlador de carrito -> servicio de carrito -> Carrito/DetalleCarrito/Variante/Inventario.
 */
import { useShop } from '../../../../../shared/context/ShopContext';
import { useAlert } from '../../../../../shared/context/AlertContext';
import { useAuth } from '../../../../users-security/shared/AuthContext';

export function useCartScreen(navigation: any) {
  const { cart, removeFromCart, updateQuantity, clearCart, cartTotal, cartItemCount } = useShop();
  const { showAlert, showConfirm } = useAlert();
  const { isAuthenticated } = useAuth();

  const formatPrice = (price: number) => `${price.toFixed(2)} Bs`;

  const handleConfirmClear = () => {
    showConfirm({
      title: 'Vaciar Bolsa',
      message: '¿Estás seguro de que deseas eliminar todas las prendas de tu bolsa de compras?',
      type: 'warning',
      primaryButtonText: 'Vaciar Bolsa',
      secondaryButtonText: 'Cancelar',
      onConfirm: clearCart,
    });
  };

  const handleProceedToCheckout = () => {
    if (cart.length === 0) {
      showAlert({
        title: 'Bolsa Vacía',
        message: 'Agrega prendas a tu carrito antes de proceder a la pasarela de pago.',
        type: 'warning',
      });
      return;
    }

    if (!isAuthenticated) {
      showConfirm({
        title: 'Iniciar Sesión Requerido',
        message: 'Para procesar tu pago de forma segura y asociar tu pedido a tu cuenta, por favor inicia sesión o crea tu cuenta en Dressly.',
        type: 'warning',
        primaryButtonText: 'Iniciar Sesión',
        secondaryButtonText: 'Continuar mirando',
        onConfirm: () => navigation.navigate('Login'),
      });
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
