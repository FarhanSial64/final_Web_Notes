import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCart, addToCart, updateCartItem, removeCartItem } from '../services/cartService';
import { useAuth } from './AuthContext';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  // Calculate total price whenever cart items change
  useEffect(() => {
    const total = cartItems.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);
    setCartTotal(total);
  }, [cartItems]);

  // Fetch cart whenever authentication state changes
  useEffect(() => {
    const fetchCart = async () => {
      try {
        // Only fetch cart if user is authenticated
        if (!isAuthenticated) {
          setCartItems([]);
          return;
        }

        setLoading(true);
        const data = await getCart();
        console.log('Cart data received from server:', data);

        // Check if data.items exists and is populated
        if (data && data.items) {
          console.log('Cart items:', data.items);
          setCartItems(data.items || []);
        } else {
          console.warn('No items found in cart data:', data);
          setCartItems([]);
        }

        setLoading(false);
      } catch (err) {
        console.error('Failed to load cart', err);
        setLoading(false);
        // If there's an authentication error, the axios interceptor will handle it
      }
    };

    fetchCart();
  }, [isAuthenticated]);

  // Add item to cart
  const addItem = async (productId, quantity = 1) => {
    try {
      setLoading(true);
      const data = await addToCart(productId, quantity);
      setCartItems(data.items || []);
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Failed to add item to cart:', err);
      setLoading(false);
      return false;
    }
  };

  // Update item quantity
  const updateItem = async (productId, quantity) => {
    try {
      setLoading(true);
      const data = await updateCartItem(productId, quantity);
      setCartItems(data.items || []);
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Failed to update cart item:', err);
      setLoading(false);
      return false;
    }
  };

  // Remove item from cart
  const removeItem = async (productId) => {
    try {
      setLoading(true);
      const data = await removeCartItem(productId);
      setCartItems(data.items || []);
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Failed to remove item from cart:', err);
      setLoading(false);
      return false;
    }
  };

  // Check if product is in cart
  const isInCart = (productId) => cartItems.some(item => item.product._id === productId);

  // Get quantity of product in cart
  const getItemQuantity = (productId) => {
    const item = cartItems.find(item => item.product._id === productId);
    return item ? item.quantity : 0;
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartTotal,
        loading,
        addItem,
        updateItem,
        removeItem,
        isInCart,
        getItemQuantity
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
