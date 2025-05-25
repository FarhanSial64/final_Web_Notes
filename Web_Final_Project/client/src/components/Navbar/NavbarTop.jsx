import React, { useState, useEffect, useRef } from 'react';
import { FaHeart, FaShoppingCart, FaUser, FaSearch, FaTrash } from 'react-icons/fa';
import useCategories from '../../hooks/useCategories';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';
import CartDrawer from '../cart/CartDrawer';

const NavbarTop = ({ onSearch }) => {
  const categories = useCategories();
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showWishlistDrawer, setShowWishlistDrawer] = useState(false);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const userMenuRef = useRef(null);
  const wishlistRef = useRef(null);
  const cartRef = useRef(null);
  const navigate = useNavigate();

  // Use the auth context instead of local state
  const { isAuthenticated, logout } = useAuth();
  const { wishlistItems, removeItem } = useWishlist();
  const { cartItems, cartTotal, removeItem: removeCartItem } = useCart();

  // Debug: Log cart items when NavbarTop renders
  console.log('NavbarTop rendering with cartItems:', cartItems);
  console.log('CartItems length in NavbarTop:', cartItems?.length);
  console.log('Authentication status:', isAuthenticated);

  const handleProfile = () => {
    navigate('/ProfilePage');
  };

  const handleLogout = () => {
    logout(); // Use the logout function from AuthContext
    navigate('/');
  };

  const handleSearch = () => {
    onSearch({
      search: searchText.trim(),
      category: selectedCategory
    });
  };

  const handleOutsideClick = (e) => {
    if (
      userMenuRef.current && !userMenuRef.current.contains(e.target) &&
      wishlistRef.current && !wishlistRef.current.contains(e.target) &&
      cartRef.current && !cartRef.current.contains(e.target)
    ) {
      setShowUserMenu(false);
      setShowWishlistDrawer(false);
      setShowCartDrawer(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Function to navigate to the wishlist page on click
  const handleWishlistClick = () => {
    navigate('/wishlist');
    setShowWishlistDrawer(false);  // Close drawer if the wishlist page is navigated
  };

  // Function to navigate to the cart page on click
  const handleCartClick = () => {
    navigate('/cart');
    setShowCartDrawer(false);  // Close drawer if the cart page is navigated
  };

  // Function to stop event propagation when clicking the trash icon
  const handleTrashClick = (e, productId) => {
    e.stopPropagation(); // Stop the event from propagating to the parent div
    removeItem(productId); // Remove the item from wishlist
  };

  // Function to handle removing cart item
  const handleRemoveCartItem = (e, productId) => {
    if (e) e.stopPropagation(); // Stop the event from propagating to the parent div if event exists
    console.log('Removing cart item with ID:', productId);
    removeCartItem(productId); // Remove the item from cart
  };

  return (
    <div className="navbar-top">
      <div className="logo">🛒 Farmart</div>

      <div className="search-bar">
        <select className="category-dropdown" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
          {categories.map((cat, index) => (
            <option key={index} value={cat}>{cat}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="I'm searching for..."
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <button className="search-btn" onClick={handleSearch}><FaSearch /></button>
      </div>

      <div className="support">
        📞 8 800 332 65-66<br /><span>Support 24/7</span>
      </div>

      <div className="icons">
        {/* User menu */}
        <div className="icon user" onClick={() => setShowUserMenu(prev => !prev)}>
          <FaUser />
          {showUserMenu && (
            <div className="user-dropdown" ref={userMenuRef}>
              {isAuthenticated ? (
                <>
                  <div className="dropdown-item" onClick={handleProfile}>👤 Manage Profile</div>
                  <div className="dropdown-item" onClick={handleLogout}>🚪 Logout</div>
                </>
              ) : (
                <>
                  <div className="dropdown-item" onClick={() => navigate('/login')}>🔐 Login</div>
                  <div className="dropdown-item" onClick={() => navigate('/signup')}>📝 Signup</div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Wishlist icon and drawer */}
        <div
          className="icon heart"
          onClick={handleWishlistClick} // Clicking the icon will navigate to /wishlist
          onMouseEnter={() => {
            if (isAuthenticated) setShowWishlistDrawer(true); // Show drawer on hover
          }}
          onMouseLeave={() => setShowWishlistDrawer(false)} // Hide drawer when mouse leaves
        >
          <FaHeart />
          <span className="badge">{wishlistItems.length}</span>

          {showWishlistDrawer && (
            <div className="wishlist-drawer" ref={wishlistRef}>
              <h4>❤️ My Wishlist</h4>
              {wishlistItems.length === 0 ? (
                <p style={{ padding: '10px', textAlign: 'center' }}>Your wishlist is empty.</p>
              ) : (
                <ul>
                  {wishlistItems.map(product => (
                    <li key={product._id}>
                      <img
                        src={
                          product.images && product.images.length > 0
                            ? product.images[0].startsWith('http')
                              ? product.images[0]
                              : `http://localhost:5000/uploads/${product.images[0]}`
                            : 'https://via.placeholder.com/150'
                        }
                        alt={product.name}
                      />
                      <span>{product.name}</span>
                      <button onClick={(e) => handleTrashClick(e, product._id)}><FaTrash /></button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Cart icon and drawer */}
        <div
          className="icon cart"
          onClick={handleCartClick}
          onMouseEnter={() => {
            if (isAuthenticated) setShowCartDrawer(true);
          }}
          onMouseLeave={() => setShowCartDrawer(false)}
        >
          <FaShoppingCart />
          <span className="badge">{cartItems.length}</span>

          {showCartDrawer && (
            <div className="cart-drawer-container" ref={cartRef}>
              <CartDrawer
                isOpen={showCartDrawer}
                cartItems={cartItems}
                onRemove={handleRemoveCartItem}
                cartTotal={cartTotal}
              />
            </div>
          )}
        </div>

        <div className="cart-total">Your Cart: ₹{(cartTotal || 0).toFixed(2)}</div>
      </div>
    </div>
  );
};

export default NavbarTop;
