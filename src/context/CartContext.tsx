"use client";

import { createContext, useContext, useState, useEffect } from 'react';

interface CartItem {
  _id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  selectedColor?: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  quantity?: number;
  selectedColor?: string;
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string, selectedColor?: string) => void;
  updateQuantity: (productId: string, quantity: number, selectedColor?: string) => void;
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
      const existingItem = currentItems.find(
        (item) => item._id === product._id && item.selectedColor === product.selectedColor
      );
      let newItems;

      if (existingItem) {
        // If item exists with the same color, add the new quantity to the existing quantity
        const newQuantity = existingItem.quantity + (product.quantity || 1);
        newItems = currentItems.map((item) =>
          item._id === product._id && item.selectedColor === product.selectedColor
            ? { ...item, quantity: newQuantity }
            : item
        );
      } else {
        // If item doesn't exist or has a different color, add it as a new item
        newItems = [...currentItems, { ...product, quantity: product.quantity || 1 }];
      }

      localStorage.setItem('cart', JSON.stringify(newItems));
      updateTotals(newItems);
      return newItems;
    });
  };

  const removeFromCart = (productId: string, selectedColor?: string) => {
    setItems((currentItems) => {
      const newItems = currentItems.filter(
        (item) => !(item._id === productId && item.selectedColor === selectedColor)
      );
      localStorage.setItem('cart', JSON.stringify(newItems));
      updateTotals(newItems);
      return newItems;
    });
  };

  const updateQuantity = (productId: string, quantity: number, selectedColor?: string) => {
    if (quantity < 1) return;

    setItems((currentItems) => {
      const newItems = currentItems.map((item) =>
        item._id === productId && item.selectedColor === selectedColor
          ? { ...item, quantity }
          : item
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