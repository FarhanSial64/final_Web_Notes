import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getOrderHistory, cancelOrder } from '../../services/orderService';
import { FaSpinner, FaBox, FaShippingFast, FaCheck, FaTimes, FaBan, FaHome, FaShoppingBag } from 'react-icons/fa';
import './OrderHistory.css';

const OrderHistory = () => {
  // Helper function to calculate order total if totalAmount is not available
  const calculateOrderTotal = (order) => {
    if (!order || !order.items || !Array.isArray(order.items)) return 0;

    return order.items.reduce((total, item) => {
      const itemPrice = item.price || (item.product && item.product.price) || 0;
      return total + (itemPrice * item.quantity);
    }, 0);
  };

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [cancelSuccess, setCancelSuccess] = useState(null);
  const [cancelError, setCancelError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await getOrderHistory();
        console.log('Order history data received:', data);
        setOrders(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching order history:', err);
        setError('Failed to load order history. Please try again later.');
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FaBox className="status-icon pending" />;
      case 'confirmed':
        return <FaBox className="status-icon confirmed" />;
      case 'shipped':
        return <FaShippingFast className="status-icon shipped" />;
      case 'delivered':
        return <FaCheck className="status-icon delivered" />;
      case 'cancelled':
        return <FaTimes className="status-icon cancelled" />;
      default:
        return <FaBox className="status-icon" />;
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Function to handle order cancellation
  const handleCancelOrder = async (orderId) => {
    try {
      // Reset previous messages
      setCancelSuccess(null);
      setCancelError(null);

      // Set the cancelling order ID to show loading state
      setCancellingOrderId(orderId);

      // Call the API to cancel the order
      await cancelOrder(orderId);

      // Update the orders list with the cancelled order
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === orderId
            ? { ...order, orderStatus: 'cancelled' }
            : order
        )
      );

      // Show success message
      setCancelSuccess(`Order #${orderId.substring(0, 8)} has been cancelled successfully.`);

      // Clear the cancelling state
      setCancellingOrderId(null);
    } catch (err) {
      console.error('Failed to cancel order:', err);
      setCancelError(err?.response?.data?.message || 'Failed to cancel order. Please try again.');
      setCancellingOrderId(null);
    }
  };

  if (loading) {
    return (
      <div className="order-history-page loading">
        {/* Navigation Bar */}
        <div className="order-history-nav">
          <div className="nav-links">
            <Link to="/" className="nav-link">
              <FaHome /> Home
            </Link>
            <Link to="/products" className="nav-link">
              <FaShoppingBag /> Products
            </Link>
          </div>
        </div>

        <FaSpinner className="spinner" />
        <p>Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-history-page error">
        {/* Navigation Bar */}
        <div className="order-history-nav">
          <div className="nav-links">
            <Link to="/" className="nav-link">
              <FaHome /> Home
            </Link>
            <Link to="/products" className="nav-link">
              <FaShoppingBag /> Products
            </Link>
          </div>
        </div>

        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="order-history-page">
      {/* Navigation Bar */}
      <div className="order-history-nav">
        <div className="nav-links">
          <Link to="/" className="nav-link">
            <FaHome /> Home
          </Link>
          <Link to="/products" className="nav-link">
            <FaShoppingBag /> Products
          </Link>
        </div>
      </div>

      <h2>Your Order History</h2>

      {/* Success message */}
      {cancelSuccess && (
        <div className="success-message">
          <FaCheck className="success-icon" /> {cancelSuccess}
        </div>
      )}

      {/* Error message */}
      {cancelError && (
        <div className="error-message">
          <FaTimes className="error-icon" /> {cancelError}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="no-orders">
          <p>You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => {
            // Skip rendering if order is invalid
            if (!order || !order._id) {
              console.warn('Invalid order data:', order);
              return null;
            }

            return (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div className="order-id">
                    <span>Order ID:</span> #{order._id.substring(0, 8)}
                  </div>
                  <div className="order-date">
                    <span>Placed on:</span> {formatDate(order.placedAt || new Date())}
                  </div>
                  <div className="order-status">
                    {getStatusIcon(order.orderStatus)}
                    <span>{order.orderStatus || 'Unknown'}</span>
                  </div>
                </div>

              <div className="order-items">
                {order.items && order.items.map(item => {
                  // Skip rendering if product is null or undefined
                  if (!item || !item.product) {
                    console.warn('Missing product data in order item:', item);
                    return null;
                  }

                  return (
                    <div key={item.product._id || `item-${Math.random()}`} className="order-item">
                      <img
                        src={
                          item.product && item.product.images && item.product.images.length > 0
                            ? item.product.images[0].startsWith('http')
                              ? item.product.images[0]
                              : `http://localhost:5000/uploads/${item.product.images[0]}`
                            : 'https://via.placeholder.com/150'
                        }
                        alt={item.product && item.product.name ? item.product.name : 'Product'}
                      />
                      <div className="item-details">
                        <div className="item-name">{item.product && item.product.name ? item.product.name : 'Product'}</div>
                        <div className="item-price-qty">
                          <span className="item-price">₹{(item.price || (item.product && item.product.price) || 0).toFixed(2)}</span>
                          <span className="item-qty">× {item.quantity || 1}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="order-footer">
                <div className="order-total">
                  <span>Total:</span> ₹{(order.totalAmount || calculateOrderTotal(order) || 0).toFixed(2)}
                </div>

                {/* Cancel button - only show for pending orders */}
                {order.orderStatus === 'pending' && (
                  <button
                    className="cancel-order-btn"
                    onClick={() => handleCancelOrder(order._id)}
                    disabled={cancellingOrderId === order._id}
                  >
                    {cancellingOrderId === order._id ? (
                      <>
                        <FaSpinner className="spinner-icon" /> Cancelling...
                      </>
                    ) : (
                      <>
                        <FaBan className="cancel-icon" /> Cancel Order
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
