import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getPublicApiUrl } from '@/lib/env';

export interface CartItem {
  id: string; // Unique ID for cart item (productId + variation hash)
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variation?: any;
  slug: string;
  originalPrice?: number;
  quantityDiscounts?: any[];
}

export interface WishlistItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  slug: string;
}

interface CartWishlistState {
  cart: CartItem[];
  wishlist: WishlistItem[];
  
  // Cart Actions
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  
  // Wishlist Actions
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (productId: string) => void;
  toggleWishlist: (item: WishlistItem) => void;
  isInWishlist: (productId: string) => boolean;

  // Sync Action
  syncWithBackend: () => Promise<void>;
}

export const useCartWishlistStore = create<CartWishlistState>()(
  persist(
    (set, get) => ({
      cart: [],
      wishlist: [],

      syncWithBackend: async () => {
        const userStr = localStorage.getItem("user");
        if (!userStr) return;
        
        try {
          const user = JSON.parse(userStr);
          const token = localStorage.getItem("token") || user.token;
          if (!token) return;

          const url = getPublicApiUrl().replace('/public', ''); // Assuming /api/cart is not under /public
          const res = await fetch(`${url}/cart/sync`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              cartItems: get().cart.map(item => ({
                productId: item.productId,
                customizationData: { 
                  ...item.variation, 
                  quantity: item.quantity,
                  price: item.price
                },
                image: item.image
              }))
            })
          });
          const json = await res.json();
          if (!json.success) console.error("Sync failed:", json.message);
        } catch (err) {
          console.error("Sync error:", err);
        }
      },

      addToCart: (newItem) => {
        const currentCart = get().cart;
        const existingItem = currentCart.find((item) => item.id === newItem.id);

        if (existingItem) {
          const newQty = existingItem.quantity + newItem.quantity;
          const basePrice = existingItem.originalPrice ?? existingItem.price;
          const discounts = existingItem.quantityDiscounts ?? [];
          let discountPercent = 0;
          if (Array.isArray(discounts)) {
            for (const d of discounts) {
              if (newQty >= d.minQuantity && d.discountPercent > discountPercent) {
                discountPercent = d.discountPercent;
              }
            }
          }
          const price = basePrice * (1 - discountPercent / 100);

          set({
            cart: currentCart.map((item) =>
              item.id === newItem.id
                ? { ...item, quantity: newQty, price }
                : item
            ),
          });
        } else {
          const basePrice = newItem.originalPrice ?? newItem.price;
          const discounts = newItem.quantityDiscounts ?? [];
          let discountPercent = 0;
          if (Array.isArray(discounts)) {
            for (const d of discounts) {
              if (newItem.quantity >= d.minQuantity && d.discountPercent > discountPercent) {
                discountPercent = d.discountPercent;
              }
            }
          }
          const price = basePrice * (1 - discountPercent / 100);

          set({ cart: [...currentCart, { ...newItem, price }] });
        }
        get().syncWithBackend();
      },

      removeFromCart: (id) => {
        set({ cart: get().cart.filter((item) => item.id !== id) });
        get().syncWithBackend();
      },

      updateQuantity: (id, quantity) => {
        if (quantity < 1) return;
        set({
          cart: get().cart.map((item) => {
            if (item.id === id) {
              const basePrice = item.originalPrice ?? item.price;
              const discounts = item.quantityDiscounts ?? [];
              let discountPercent = 0;
              if (Array.isArray(discounts)) {
                for (const d of discounts) {
                  if (quantity >= d.minQuantity && d.discountPercent > discountPercent) {
                    discountPercent = d.discountPercent;
                  }
                }
              }
              const price = basePrice * (1 - discountPercent / 100);
              return { ...item, quantity, price };
            }
            return item;
          }),
        });
        get().syncWithBackend();
      },

      clearCart: () => {
        set({ cart: [] });
        get().syncWithBackend();
      },

      addToWishlist: (item) => {
        const currentWishlist = get().wishlist;
        if (!currentWishlist.some((i) => i.productId === item.productId)) {
          set({ wishlist: [...currentWishlist, item] });
        }
      },

      removeFromWishlist: (productId) => {
        set({ wishlist: get().wishlist.filter((i) => i.productId !== productId) });
      },

      toggleWishlist: (item) => {
        const isIn = get().isInWishlist(item.productId);
        if (isIn) {
          get().removeFromWishlist(item.productId);
        } else {
          get().addToWishlist(item);
        }
      },

      isInWishlist: (productId) => {
        return get().wishlist.some((item) => item.productId === productId);
      },
    }),
    {
      name: 'epiclance-cart-wishlist',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
