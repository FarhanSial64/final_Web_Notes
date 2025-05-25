import React, { useState, useEffect } from 'react';
import './ProductCard.css';
import StarIcon from '@mui/icons-material/Star';
import LinearProgress from '@mui/material/LinearProgress';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';

const ProductCard = ({ product }) => {
  const imageUrl =
    product.images?.[0]?.startsWith('http')
      ? product.images[0]
      : `http://localhost:5000/uploads/${product.images?.[0] || ''}`;

  const [quantity, setQuantity] = useState(1);
  const { wishlistItems, addItem, removeItem } = useWishlist();
  const { addItem: addToCart, isInCart, getItemQuantity } = useCart();

  const isWishlisted = wishlistItems.some(item => item._id === product._id);
  const [liked, setLiked] = useState(isWishlisted);
  const [inCart, setInCart] = useState(isInCart(product._id));
  const [cartLoading, setCartLoading] = useState(false);

  useEffect(() => {
    setLiked(isWishlisted);
  }, [isWishlisted]);

  useEffect(() => {
    setInCart(isInCart(product._id));
  }, [isInCart, product._id]);

  const totalAvailable = product.quantity || 100;
  const sold = product.sold || 0;
  const remaining = totalAvailable - sold;
  const progress = Math.round((sold / totalAvailable) * 100);

  const toggleWishlist = async () => {
    if (!localStorage.getItem('token')) {
      alert('Please log in to use wishlist.');
      return;
    }

    try {
      if (liked) {
        await removeItem(product._id);
      } else {
        await addItem(product._id);
      }
      setLiked(!liked); // Optimistically update UI
    } catch (err) {
      console.error('Wishlist error:', err);
      setLiked(prev => !prev); // Revert UI if error
    }
  };

  const handleAddToCart = async () => {
    if (!localStorage.getItem('token')) {
      alert('Please log in to add items to cart.');
      return;
    }

    // Check if product has a productCode
    if (!product.productCode) {
      alert('This product cannot be added to cart at this time.');
      return;
    }

    setCartLoading(true);
    try {
      await addToCart(product._id, quantity);
      setInCart(true);
      setCartLoading(false);
    } catch (err) {
      console.error('Cart error:', err);
      alert('Failed to add product to cart. Please try again.');
      setCartLoading(false);
    }
  };

  return (
    <div className="product-card">
      <div className="product-img-wrap">
        <img src={imageUrl} alt={product.name} />
      </div>

      <div className="product-info">
        <h4 className="product-name">{product.name}</h4>

        <div className="star-rating">
          {[...Array(5)].map((_, idx) => (
            <StarIcon key={idx} fontSize="small" style={{ color: '#FFD700' }} />
          ))}
        </div>

        {/* <p className="product-grammage">{product.weight || '500g'}</p> */}

        <div className="sales-progress">
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 8,
              borderRadius: 5,
              backgroundColor: '#e0e0e0',
              width: '100%',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#037878'
              }
            }}
          />
          <span className="progress-text">{sold}/{totalAvailable} sold</span>
        </div>

        <div className="quantity-control">
          <button onClick={() => quantity > 1 && setQuantity(q => q - 1)}>-</button>
          <span>{quantity}</span>
          <button onClick={() => quantity < remaining && setQuantity(q => q + 1)}>+</button>
          <span className="total-price">₹{(quantity * product.price).toFixed(2)}</span>
        </div>

        <div className="action-buttons">
          <button
            className={`add-cart-btn ${inCart ? 'in-cart' : ''} ${cartLoading ? 'loading' : ''}`}
            onClick={handleAddToCart}
            disabled={cartLoading}
          >
            <ShoppingCartIcon style={{ marginRight: '5px', fontSize: '16px' }} />
            {cartLoading ? 'Adding...' : inCart ? 'In Cart' : 'Add to Cart'}
          </button>
          <button
            className="wishlist-btn"
            title={liked ? 'Remove from Wishlist' : 'Add to Wishlist'}
            onClick={toggleWishlist}
          >
            {liked ? (
              <FavoriteIcon style={{ color: '#ff4081', fontSize: '22px' }} />
            ) : (
              <FavoriteBorderIcon style={{ color: '#004d4d', fontSize: '22px' }} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
