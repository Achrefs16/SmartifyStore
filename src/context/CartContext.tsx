"use client";

import { createContext, useContext, useState, useEffect } from 'react';

interface CartItem {
  _id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  quantity?: number;
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType>({
  items: [],
  totalItems: 0,
  totalPrice: 0,
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      setItems(parsedCart);
      updateTotals(parsedCart);
    }
  }, []);

  const updateTotals = (cartItems: CartItem[]) => {
    const total = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const price = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setTotalItems(total);
    setTotalPrice(price);
  };

  const addToCart = (product: Product) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item._id === product._id);
      let newItems;

      if (existingItem) {
        // If item exists, add the new quantity to the existing quantity
        const newQuantity = existingItem.quantity + (product.quantity || 1);
        newItems = currentItems.map((item) =>
          item._id === product._id
            ? { ...item, quantity: newQuantity }
            : item
        );
      } else {
        // If item doesn't exist, add it with the specified quantity or default to 1
        newItems = [...currentItems, { ...product, quantity: product.quantity || 1 }];
      }

      localStorage.setItem('cart', JSON.stringify(newItems));
      updateTotals(newItems);
      return newItems;
    });
  };

  const removeFromCart = (productId: string) => {
    setItems((currentItems) => {
      const newItems = currentItems.filter((item) => item._id !== productId);
      localStorage.setItem('cart', JSON.stringify(newItems));
      updateTotals(newItems);
      return newItems;
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;

    setItems((currentItems) => {
      const newItems = currentItems.map((item) =>
        item._id === productId ? { ...item, quantity } : item
      );
      localStorage.setItem('cart', JSON.stringify(newItems));
      updateTotals(newItems);
      return newItems;
    });
  };

  const clearCart = () => {
    setItems([]);
    setTotalItems(0);
    setTotalPrice(0);
    localStorage.removeItem('cart');
  };

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalPrice,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext); 