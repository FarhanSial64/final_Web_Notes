import React, { createContext, useContext, useState, useEffect } from 'react';
import { getWishlist, addToWishlist, removeFromWishlist } from '../services/wishlistService';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();
export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        // Only fetch wishlist if user is authenticated
        if (!isAuthenticated) {
          setWishlistItems([]);
          return;
        }

        setLoading(true);
        const data = await getWishlist();
        // ✅ Now we store full product objects
        setWishlistItems(data.items || []);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load wishlist', err);
        setLoading(false);
        // If there's an authentication error, the axios interceptor will handle it
      }
    };

    fetchWishlist();
  }, [isAuthenticated]);

  const addItem = async (productId) => {
    try {
      const data = await addToWishlist(productId);
      setWishlistItems(data.items || []);
    } catch (err) {
      console.error('Failed to add item to wishlist:', err);
    }
  };

  const removeItem = async (productId) => {
    try {
      const data = await removeFromWishlist(productId);
      setWishlistItems(data.items || []);
    } catch (err) {
      console.error('Failed to remove item from wishlist:', err);
    }
  };

  const isWishlisted = (productId) => wishlistItems.some(item => item._id === productId);

  return (
    <WishlistContext.Provider
      value={{ wishlistItems, addItem, removeItem, isWishlisted, loading }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
