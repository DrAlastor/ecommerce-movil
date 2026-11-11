import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useAuth } from '../../modules/users-security/shared/AuthContext';
import { useTenant } from './TenantContext';
import type { ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Product, CartItem } from '../../types/shop.types';
import api from '../../services/api';
import { reconcileCart } from '../../services/offline/cartDraft';
import type { RemoteCart } from '../../services/offline/cartDraft';
import { requireNetwork, setOfflineStatus, offlineStatus } from '../../services/offline/connectivity';

interface ShopContextType {
  cart: CartItem[];
  wishlist: number[];
  wishlistProducts: Product[];
  wishlistCount: number;
  addToCart: (product: Product, quantity?: number, size?: string, color?: string, variantId?: number) => void;
  removeFromCart: (productId: number, variantId?: number) => void;
  updateQuantity: (productId: number, quantity: number, variantId?: number) => void;
  clearCart: () => void;
  syncCartWithBackend: () => Promise<boolean>;
  toggleWishlist: (productId: number, product?: Product) => void;
  isInWishlist: (productId: number) => boolean;
  cartTotal: number;
  cartItemCount: number;
}
interface Draft { items: CartItem[]; dirty: boolean; revision: number }
const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const { tenantKey } = useTenant();
  const suffix = user ? `_user_${user.id_usuario}` : '_guest';
  const cartKey = `${tenantKey}_cart${suffix}`;
  const draftKey = `${cartKey}_offline_v1`;
  const wishlistKey = `${tenantKey}_wishlist${suffix}`;
  const wishlistProductsKey = `${tenantKey}_wishlist_prods${suffix}`;
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  const currentKey = useRef(draftKey);
  currentKey.current = draftKey;
  const draft = useRef<Draft>({ items: [], dirty: false, revision: 0 });
  const writes = useRef<Promise<void>>(Promise.resolve());
  const syncing = useRef<Promise<boolean> | null>(null);

  const report = useCallback((error: unknown) => {
    setOfflineStatus({ ...offlineStatus(), message: error instanceof Error ? error.message : 'No se pudieron guardar o sincronizar los cambios. Conservamos el carrito visible.' });
  }, []);
  const persist = useCallback((key: string, value: Draft) => {
    const serialized = JSON.stringify(value);
    const operation = writes.current.catch(() => {}).then(() => AsyncStorage.setItem(key, serialized));
    writes.current = operation;
    void operation.catch(report);
    return operation;
  }, [report]);

  useEffect(() => {
    if (isLoading) return;
    let active = true;
    setLoadedKey(null);
    setCart([]); setWishlist([]); setWishlistProducts([]);
    draft.current = { items: [], dirty: false, revision: 0 };
    void (async () => {
      await writes.current.catch(() => {});
      const raw = await AsyncStorage.getItem(draftKey);
      const legacy = raw ? null : await AsyncStorage.getItem(cartKey);
      const saved: Draft = raw ? JSON.parse(raw) : { items: legacy ? JSON.parse(legacy) : [], dirty: Boolean(legacy), revision: 0 };
      if (!Array.isArray(saved.items)) throw new Error('El carrito guardado no tiene un formato válido');
      const favorites = await AsyncStorage.getItem(wishlistKey);
      const products = await AsyncStorage.getItem(wishlistProductsKey);
      if (!active) return;
      draft.current = saved;
      setCart(saved.items);
      setWishlist(favorites ? JSON.parse(favorites) : []);
      setWishlistProducts(products ? JSON.parse(products) : []);
      setLoadedKey(draftKey);
      setRevision(saved.revision);
    })().catch(report);
    return () => { active = false; };
  }, [cartKey, draftKey, wishlistKey, wishlistProductsKey, isLoading, report]);

  const changeCart = useCallback((update: (items: CartItem[]) => CartItem[]) => {
    if (loadedKey !== draftKey || currentKey.current !== draftKey) { report(new Error('Espera a que termine de cargarse tu carrito')); return; }
    const next: Draft = { items: update(draft.current.items), dirty: true, revision: draft.current.revision + 1 };
    draft.current = next;
    setCart(next.items); setRevision(next.revision);
    void persist(draftKey, next);
  }, [loadedKey, draftKey, persist, report]);

  const syncCartWithBackend = useCallback(async (): Promise<boolean> => {
    if (!user) return false;
    if (loadedKey !== draftKey) throw new Error('El carrito todavía se está cargando');
    if (syncing.current) { await syncing.current; if (currentKey.current !== draftKey) throw new Error('La sesión cambió'); }
    const run = async () => {
      await requireNetwork();
      await writes.current;
      const snapshot = draft.current;
      const token = await AsyncStorage.getItem('accessToken');
      const raw = await AsyncStorage.getItem('authUser');
      if (!token || !raw || JSON.parse(raw).user.id_usuario !== user.id_usuario || currentKey.current !== draftKey) throw new Error('Inicia sesión para sincronizar este carrito');
      const config = { headers: { Authorization: `Bearer ${token}`, 'x-tenant-id': tenantKey } };
      const assertCurrent = async () => {
        if (currentKey.current !== draftKey || await AsyncStorage.getItem('accessToken') !== token) throw new Error('La sesión cambió durante la sincronización');
      };
      const result = await reconcileCart(snapshot.items, {
        get: async () => { await assertCurrent(); return (await api.get<RemoteCart>('/sales-billing/cart', config)).data; },
        resolve: async item => {
          await assertCurrent();
          const data = (await api.get(`/catalog/products/${item.product.id}`, config)).data;
          const variant = data.variantes.find((v: any) => (!item.selectedSize || v.talla.codigo === item.selectedSize) && (!item.selectedColor || v.color.nombre === item.selectedColor));
          if (!variant) throw new Error(`No se pudo verificar talla y color de ${item.product.name}`);
          return variant.id_producto_variante;
        },
        add: async (variant, quantity) => { await assertCurrent(); await api.post('/sales-billing/cart/items', { id_producto_variante: variant, cantidad: quantity }, config); },
        update: async (id, quantity) => { await assertCurrent(); await api.patch(`/sales-billing/cart/items/${id}`, { cantidad: quantity }, config); },
        remove: async id => { await assertCurrent(); await api.delete(`/sales-billing/cart/items/${id}`, config); },
      });
      await assertCurrent();
      if (draft.current.revision !== snapshot.revision) throw new Error('Tu carrito cambió durante la sincronización; vuelve a confirmar antes de comprar');
      const next = { items: result.items, dirty: false, revision: snapshot.revision + 1 };
      await persist(draftKey, next);
      if (currentKey.current !== draftKey || draft.current.revision !== snapshot.revision) throw new Error('Tu carrito cambió mientras se guardaba la confirmación. Reintenta antes de comprar.');
      draft.current = next;
      setCart(next.items); setRevision(next.revision);
      if (result.priceChanged) setOfflineStatus({ offline: false, message: 'Se actualizaron los precios del carrito. Revisa el total antes de confirmar tu compra.' });
      return result.priceChanged;
    };
    const operation = run();
    syncing.current = operation;
    try { return await operation; } finally { if (syncing.current === operation) syncing.current = null; }
  }, [user, loadedKey, draftKey, tenantKey, persist]);

  useEffect(() => {
    if (loadedKey !== draftKey || !user) return;
    const sync = () => { if (draft.current.dirty && !syncing.current) void syncCartWithBackend().catch(report); };
    const timer = setTimeout(sync, 700);
    const retry = setInterval(sync, 30000);
    const connection = NetInfo.addEventListener(state => { if (state.isConnected && state.isInternetReachable !== false) sync(); });
    const foreground = AppState.addEventListener('change', state => { if (state === 'active') sync(); });
    return () => { clearTimeout(timer); clearInterval(retry); connection(); foreground.remove(); };
  }, [loadedKey, draftKey, user, revision, syncCartWithBackend, report]);

  const addToCart = useCallback((product: Product, quantity = 1, size?: string, color?: string, variantId?: number) => {
    if (!Number.isSafeInteger(quantity) || quantity < 1) return;
    const selectedSize = size || product.sizes?.[0];
    const selectedColor = color || product.colors?.[0];
    changeCart(items => {
      const existing = items.find(item => item.product.id === product.id && (variantId ? item.variantId === variantId : item.selectedSize === selectedSize && item.selectedColor === selectedColor));
      return existing ? items.map(item => item === existing ? { ...item, quantity: item.quantity + quantity } : item) : [...items, { product, quantity, selectedSize, selectedColor, variantId }];
    });
  }, [changeCart]);
  const removeFromCart = useCallback((productId: number, variantId?: number) => changeCart(items => items.filter(item => variantId ? item.variantId !== variantId : item.product.id !== productId)), [changeCart]);
  const updateQuantity = useCallback((productId: number, quantity: number, variantId?: number) => {
    if (quantity < 1) { removeFromCart(productId, variantId); return; }
    if (!Number.isSafeInteger(quantity)) return;
    changeCart(items => items.map(item => (variantId ? item.variantId === variantId : item.product.id === productId) ? { ...item, quantity } : item));
  }, [changeCart, removeFromCart]);
  const clearCart = useCallback(() => changeCart(() => []), [changeCart]);

  useEffect(() => {
    if (loadedKey !== draftKey || currentKey.current !== draftKey) return;
    const values = [[wishlistKey, JSON.stringify(wishlist)], [wishlistProductsKey, JSON.stringify(wishlistProducts)]];
    const operation = writes.current.catch(() => {}).then(async () => { for (const [key, value] of values) await AsyncStorage.setItem(key, value); });
    writes.current = operation;
    void operation.catch(report);
  }, [wishlist, wishlistProducts, wishlistKey, wishlistProductsKey, loadedKey, draftKey, report]);
  const toggleWishlist = useCallback((productId: number, product?: Product) => {
    if (loadedKey !== draftKey) return;
    setWishlist(previous => previous.includes(productId) ? previous.filter(id => id !== productId) : [...previous, productId]);
    setWishlistProducts(previous => previous.some(item => item.id === productId) ? previous.filter(item => item.id !== productId) : product ? [...previous, product] : previous);
  }, [loadedKey, draftKey]);
  const isInWishlist = useCallback((productId: number) => wishlist.includes(productId), [wishlist]);
  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + Math.round(item.product.price * 100) * item.quantity, 0) / 100, [cart]);
  const cartItemCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const value = { cart, wishlist, wishlistProducts, wishlistCount: wishlist.length, addToCart, removeFromCart, updateQuantity, clearCart, syncCartWithBackend, toggleWishlist, isInWishlist, cartTotal, cartItemCount };
  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

export function useShop(): ShopContextType {
  const value = useContext(ShopContext);
  if (!value) throw new Error('useShop debe usarse dentro de un ShopProvider');
  return value;
}
