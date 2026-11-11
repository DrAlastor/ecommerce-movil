import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../modules/users-security/shared/AuthContext';
import { useTenant } from './TenantContext';
import type { ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Product, CartItem } from '../../types/shop.types';
import { CartService } from '../../modules/sales-billing/services/cart.service';

interface ShopContextType {
  cart: CartItem[];
  wishlist: number[];
  wishlistProducts: Product[];
  wishlistCount: number;
  addToCart: (product: Product, quantity?: number, size?: string, color?: string, variantId?: number) => void;
  removeFromCart: (productId: number, variantId?: number) => void;
  updateQuantity: (productId: number, quantity: number, variantId?: number) => void;
  clearCart: () => void;
  syncCartWithBackend: () => Promise<void>;
  toggleWishlist: (productId: number, product?: Product) => void;
  isInWishlist: (productId: number) => boolean;
  cartTotal: number;
  cartItemCount: number;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const { tenantKey } = useTenant();
  
  const storageSuffix = user ? `_user_${user.id_usuario}` : '_guest';
  const cartKey = `${tenantKey}_cart${storageSuffix}`;
  const wishlistKey = `${tenantKey}_wishlist${storageSuffix}`;
  const wishlistProductsKey = `${tenantKey}_wishlist_prods${storageSuffix}`;

  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);

  // Cargar estado inicial y al cambiar de usuario
  useEffect(() => {
    if (isLoading) return;

    const loadState = async () => {
      try {
        const savedCart = await AsyncStorage.getItem(cartKey);
        const savedWishlist = await AsyncStorage.getItem(wishlistKey);
        const savedProds = await AsyncStorage.getItem(wishlistProductsKey);
        setCart(savedCart ? JSON.parse(savedCart) : []);
        setWishlist(savedWishlist ? JSON.parse(savedWishlist) : []);
        setWishlistProducts(savedProds ? JSON.parse(savedProds) : []);
        setLoadedKey(cartKey);
      } catch (error) {
        console.error('Error loading shop state', error);
        setCart([]);
        setWishlist([]);
        setWishlistProducts([]);
        setLoadedKey(cartKey);
      }
    };

    if (loadedKey !== cartKey) {
      loadState();
    }
  }, [cartKey, loadedKey, isLoading]);

  // Guardar estado cada vez que cambie
  useEffect(() => {
    if (loadedKey === cartKey) {
      AsyncStorage.setItem(cartKey, JSON.stringify(cart)).catch(() => {});
    }
  }, [cart, cartKey, loadedKey]);

  useEffect(() => {
    if (loadedKey === cartKey) {
      AsyncStorage.setItem(wishlistKey, JSON.stringify(wishlist)).catch(() => {});
      AsyncStorage.setItem(wishlistProductsKey, JSON.stringify(wishlistProducts)).catch(() => {});
    }
  }, [wishlist, wishlistProducts, wishlistKey, wishlistProductsKey, loadedKey]);

  const addToCart = useCallback((product: Product, quantity = 1, size?: string, color?: string, variantId?: number) => {
    const selectedSize = size || (product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined);
    const selectedColor = color || (product.colors && product.colors.length > 0 ? product.colors[0] : undefined);

    setCart((prev) => {
      const existingItem = prev.find(
        (item) =>
          item.product.id === product.id &&
          (variantId ? item.variantId === variantId : item.selectedSize === selectedSize && item.selectedColor === selectedColor)
      );

      if (existingItem) {
        return prev.map((item) =>
          item === existingItem
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...prev, { product, quantity, selectedSize, selectedColor, variantId }];
    });

    // Si el usuario está autenticado, sincronizamos con el backend en segundo plano
    if (user) {
      if (variantId) {
        CartService.addToCart({ id_producto_variante: variantId, cantidad: quantity }).catch(() => {});
      } else {
        CartService.addToCart({ id_producto: product.id, cantidad: quantity }).catch(() => {});
      }
    }
  }, [user]);

  const removeFromCart = useCallback((productId: number, variantId?: number) => {
    setCart((prev) =>
      prev.filter((item) => {
        if (variantId && item.variantId) {
          return item.variantId !== variantId;
        }
        return item.product.id !== productId;
      })
    );
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number, variantId?: number) => {
    if (quantity < 1) {
      removeFromCart(productId, variantId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        const matches = variantId && item.variantId
          ? item.variantId === variantId
          : item.product.id === productId;
        return matches ? { ...item, quantity } : item;
      })
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
    if (user) {
      CartService.clearCart().catch(() => {});
    }
  }, [user]);

  const syncCartWithBackend = useCallback(async () => {
    if (!user || cart.length === 0) return;
    try {
      await CartService.clearCart().catch(() => {});
      for (const item of cart) {
        if (item.variantId) {
          await CartService.addToCart({
            id_producto_variante: item.variantId,
            cantidad: item.quantity,
          }).catch(() => {});
        } else {
          await CartService.addToCart({
            id_producto: item.product.id,
            cantidad: item.quantity,
          }).catch(() => {});
        }
      }
    } catch (err) {
      console.warn('Error syncing cart with backend:', err);
    }
  }, [user, cart]);

  const toggleWishlist = useCallback((productId: number, product?: Product) => {
    setWishlist((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      } else {
        return [...prev, productId];
      }
    });

    setWishlistProducts((prev) => {
      const exists = prev.some((p) => p.id === productId);
      if (exists) {
        return prev.filter((p) => p.id !== productId);
      } else if (product) {
        return [...prev, product];
      }
      return prev;
    });
  }, []);

  const isInWishlist = useCallback((productId: number) => {
    return wishlist.includes(productId);
  }, [wishlist]);

  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  }, [cart]);

  const cartItemCount = useMemo(() => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  }, [cart]);

  const wishlistCount = useMemo(() => {
    return wishlist.length;
  }, [wishlist]);

  const value = useMemo(
    () => ({
      cart,
      wishlist,
      wishlistProducts,
      wishlistCount,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      syncCartWithBackend,
      toggleWishlist,
      isInWishlist,
      cartTotal,
      cartItemCount,
    }),
    [
      cart,
      wishlist,
      wishlistProducts,
      wishlistCount,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      syncCartWithBackend,
      toggleWishlist,
      isInWishlist,
      cartTotal,
      cartItemCount,
    ]
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (context === undefined) {
    throw new Error('useShop debe usarse dentro de un ShopProvider');
  }
  return context;
};
