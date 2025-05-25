import React, { useState } from 'react';
import { FaTrash, FaShoppingCart, FaArrowRight, FaSpinner, FaCheck } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { placeOrder } from '../../services/orderService';
import './CartDrawer.css';

const CartDrawer = ({ isOpen, cartItems, onRemove, cartTotal }) => {
  const navigate = useNavigate();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError] = useState(null);

  // Debug: Log cart items when component renders or updates
  console.log('CartDrawer rendering with cartItems:', cartItems);
  console.log('CartItems length:', cartItems?.length);

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      setOrderError('Your cart is empty. Add items before checkout.');
      return;
    }

    try {
      setIsPlacingOrder(true);
      setOrderError(null);

      // Call the order service to place the order
      const response = await placeOrder();

      // Show success message
      setOrderSuccess(true);

      // Reset after 2 seconds and redirect to order history
      setTimeout(() => {
        setOrderSuccess(false);
        setIsPlacingOrder(false);
        navigate('/orders/history');
      }, 2000);

    } catch (error) {
      setOrderError(error?.response?.data?.message || 'Failed to place order. Please try again.');
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className={`cart-drawer ${isOpen ? 'open' : ''}`}>
      <div className="drawer-header">
        <h4>🛒 My Cart</h4>
        <span onClick={() => navigate('/cart')} className="view-all">View All</span>
      </div>
      <div className="drawer-items">
        {!cartItems || cartItems.length === 0 ? (
          <div className="empty-msg">Your cart is empty.</div>
        ) : (
          <>
            <ul>
              {cartItems.map(item => {
                // Debug: Log each item as we map through it
                console.log('Rendering cart item:', item);

                // Check if item.product exists
                if (!item.product) {
                  console.warn('Item has no product property:', item);
                  return null;
                }

                return (
                  <li key={item.product._id} className="cart-item">
                    <img
                      src={
                        item.product.images && item.product.images.length > 0
                          ? item.product.images[0].startsWith('http')
                            ? item.product.images[0]
                            : `http://localhost:5000/uploads/${item.product.images[0]}`
                          : 'https://via.placeholder.com/150'
                      }
                      alt={item.product.name}
                    />
                    <div className="item-details">
                      <span className="item-name">{item.product.name}</span>
                      <div className="item-price-qty">
                        <span className="item-price">₹{(item.product.price || 0).toFixed(2)}</span>
                        <span className="item-qty">× {item.quantity}</span>
                      </div>
                    </div>
                    <button
                      className="remove-btn"
                      onClick={(e) => {
                        console.log('Remove button clicked for product:', item.product._id);
                        onRemove(e, item.product._id);
                      }}
                      disabled={isPlacingOrder}
                    >
                      <FaTrash />
                    </button>
                  </li>
                );
              })}
            </ul>

            {orderError && (
              <div className="order-error">
                {orderError}
              </div>
            )}

            <div className="cart-summary">
              <div className="cart-total">
                <span>Total:</span>
                <span>₹{(cartTotal || 0).toFixed(2)}</span>
              </div>
              <button
                className={`checkout-btn ${isPlacingOrder ? 'loading' : ''} ${orderSuccess ? 'success' : ''}`}
                onClick={handleCheckout}
                disabled={isPlacingOrder || orderSuccess || cartItems.length === 0}
              >
                {isPlacingOrder ? (
                  <>
                    <FaSpinner className="spinner-icon" />
                    Processing...
                  </>
                ) : orderSuccess ? (
                  <>
                    <FaCheck className="success-icon" />
                    Order Placed!
                  </>
                ) : (
                  <>
                    <FaShoppingCart className="checkout-icon" />
                    Confirm Order
                    <FaArrowRight className="arrow-icon" />
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
