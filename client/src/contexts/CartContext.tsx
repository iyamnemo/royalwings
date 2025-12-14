import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { MenuItem } from '../types/menu';
import { Cart, CartItem, CartContextType } from '../types/cart';
import { useAuth } from './AuthContext';
import { menuService } from '../services/menuService';

const TAX_RATE = 0.12; // 12% TAX RATE

type CartAction =
  | { type: 'ADD_ITEM'; payload: { menuItem: MenuItem; quantity?: number; notes?: string; selectedFlavor?: string } }
  | { type: 'REMOVE_ITEM'; payload: { itemId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { itemId: string; quantity: number } }
  | { type: 'UPDATE_NOTES'; payload: { itemId: string; notes: string } }
  | { type: 'CLEAR_CART' };

const calculateCartTotals = (items: CartItem[]): { subtotal: number; tax: number; total: number } => {
  const subtotal = items.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;
  return { subtotal, tax, total };
};

const cartReducer = (state: Cart, action: CartAction): Cart => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { menuItem, quantity = 1, notes = '', selectedFlavor } = action.payload;
      const itemId = selectedFlavor ? `${menuItem.id}_${selectedFlavor}` : menuItem.id;
      
      // Check available stock (considering existing cart items)
      const existingQuantityInCart = state.items.find(item => item.id === itemId)?.quantity || 0;
      const availableStock = (menuItem.stockCount ?? 0) - existingQuantityInCart;
      
      if (quantity > availableStock) {
        console.warn(`Cannot add ${quantity} items. Only ${Math.max(0, availableStock)} available.`);
        // Don't add the item if there's no stock
        return state;
      }
      
      const existingItemIndex = state.items.findIndex(
        item => item.id === itemId
      );

      let newItems: CartItem[];
      if (existingItemIndex >= 0) {
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newItems = [...state.items, { id: itemId, menuItem, quantity, notes, selectedFlavor }];
      }

      return {
        ...state,
        items: newItems,
        ...calculateCartTotals(newItems),
      };
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id !== action.payload.itemId);
      return {
        ...state,
        items: newItems,
        ...calculateCartTotals(newItems),
      };
    }

    case 'UPDATE_QUANTITY': {
      const { itemId, quantity } = action.payload;
      const cartItem = state.items.find(item => item.id === itemId);
      
      if (!cartItem) return state;
      
      // Check available stock
      const availableStock = cartItem.menuItem.stockCount ?? 0;
      
      if (quantity > availableStock) {
        console.warn(`Cannot update to ${quantity} items. Only ${availableStock} available.`);
        // Keep the old quantity if trying to set it higher than available
        return state;
      }
      
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        const newItems = state.items.filter(item => item.id !== itemId);
        return {
          ...state,
          items: newItems,
          ...calculateCartTotals(newItems),
        };
      }
      
      const newItems = state.items.map(item =>
        item.id === itemId
          ? { ...item, quantity }
          : item
      );
      return {
        ...state,
        items: newItems,
        ...calculateCartTotals(newItems),
      };
    }

    case 'UPDATE_NOTES': {
      const newItems = state.items.map(item =>
        item.id === action.payload.itemId
          ? { ...item, notes: action.payload.notes }
          : item
      );
      return {
        ...state,
        items: newItems,
        ...calculateCartTotals(newItems),
      };
    }

    case 'CLEAR_CART':
      return {
        items: [],
        subtotal: 0,
        tax: 0,
        total: 0,
      };

    default:
      return state;
  }
};

const initialCart: Cart = {
  items: [],
  subtotal: 0,
  tax: 0,
  total: 0,
};

const getInitialCart = (userId?: string): Cart => {
  if (typeof window !== 'undefined') {
    const cartKey = userId ? `cart_${userId}` : 'cart';
    const savedCart = localStorage.getItem(cartKey);
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart) as Cart;
        if (parsedCart.items && Array.isArray(parsedCart.items)) {
          return parsedCart;
        }
      } catch (error) {
        console.error('Failed to parse cart from localStorage:', error);
      }
    }
  }
  return initialCart;
};

const CartContext = createContext<CartContextType | null>(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [cart, dispatch] = useReducer(cartReducer, initialCart, () => getInitialCart(currentUser?.uid));

  useEffect(() => {
    const newCart = getInitialCart(currentUser?.uid);
    dispatch({ type: 'CLEAR_CART' });
    if (newCart.items.length > 0) {
      newCart.items.forEach(item => {
        dispatch({ 
          type: 'ADD_ITEM', 
          payload: { 
            menuItem: item.menuItem, 
            quantity: item.quantity, 
            notes: item.notes,
            selectedFlavor: item.selectedFlavor
          } 
        });
      });
    }
  }, [currentUser?.uid]);

  useEffect(() => {
    const cartKey = currentUser?.uid ? `cart_${currentUser.uid}` : 'cart';
    localStorage.setItem(cartKey, JSON.stringify(cart));
  }, [cart, currentUser?.uid]);

  const addToCart = (menuItem: MenuItem, quantity = 1, notes = '', selectedFlavor?: string) => {
    dispatch({ type: 'ADD_ITEM', payload: { menuItem, quantity, notes, selectedFlavor } });
  };

  const removeFromCart = (itemId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { itemId } });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { itemId, quantity } });
  };

  const updateNotes = (itemId: string, notes: string) => {
    dispatch({ type: 'UPDATE_NOTES', payload: { itemId, notes } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateNotes,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};