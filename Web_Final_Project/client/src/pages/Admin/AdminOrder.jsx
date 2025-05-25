import React, { useState, useEffect, useRef } from 'react';
import {
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
  getOrderById,
  createOrder,
  getAllUsers,
  getAllProducts
} from '../../services/adminService';
import './AdminOrder.css';
import { useReactToPrint } from 'react-to-print';
import {
  FaSearch,
  FaSpinner,
  FaCheck,
  FaTimes,
  FaArrowLeft,
  FaArrowRight,
  FaSortUp,
  FaSortDown,
  FaTrash,
  FaEye,
  FaEdit,
  FaUser,
  FaBox,
  FaShippingFast,
  FaClipboardCheck,
  FaBan,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaDollarSign,
  FaMapMarkerAlt,
  FaCreditCard,
  FaFilePdf,
  FaPrint,
  FaPlus,
  FaMinus
} from 'react-icons/fa';

const AdminOrder = () => {
  // State for orders and UI
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);
  const [sortField, setSortField] = useState('placedAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Add Order state
  const [showAddOrderModal, setShowAddOrderModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [newOrderData, setNewOrderData] = useState({
    user: '',
    items: [{ product: '', quantity: 1, price: 0 }],
    totalAmount: 0,
    shippingAddress: '',
    paymentMethod: 'COD',
    orderStatus: 'pending'
  });
  const [formErrors, setFormErrors] = useState({});

  // Reference for the printable content
  const orderDetailsPrintRef = useRef(null);

  // Handle print functionality
  const handlePrint = useReactToPrint({
    contentRef: orderDetailsPrintRef,
    documentTitle: `Order_${selectedOrder?._id || 'Details'}`,
    onAfterPrint: () => console.log('Print completed')
  });

  // Order status options
  const statusOptions = [
    { value: 'pending', label: 'Pending', icon: <FaExclamationTriangle /> },
    { value: 'confirmed', label: 'Confirmed', icon: <FaCheck /> },
    { value: 'shipped', label: 'Shipped', icon: <FaShippingFast /> },
    { value: 'delivered', label: 'Delivered', icon: <FaClipboardCheck /> },
    { value: 'cancelled', label: 'Cancelled', icon: <FaBan /> }
  ];

  // Fetch all orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await getAllOrders();
        setOrders(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setErrorMessage('Failed to load orders. Please try again.');
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Fetch users and products for the add order form
  useEffect(() => {
    const fetchUsersAndProducts = async () => {
      try {
        const [usersData, productsData] = await Promise.all([
          getAllUsers(),
          getAllProducts()
        ]);
        setUsers(usersData);
        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching users and products:', error);
        setErrorMessage('Failed to load users and products. Please try again.');
      }
    };

    // Only fetch when the add order modal is opened
    if (showAddOrderModal) {
      fetchUsersAndProducts();
    }
  }, [showAddOrderModal]);

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get sorted and filtered orders
  const getSortedAndFilteredOrders = () => {
    let filteredOrders = [...orders];

    // Apply status filter
    if (statusFilter !== 'all') {
      filteredOrders = filteredOrders.filter(order => order.orderStatus === statusFilter);
    }

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filteredOrders = filteredOrders.filter(order =>
        (order.user && order.user.name && order.user.name.toLowerCase().includes(searchLower)) ||
        (order._id && order._id.toLowerCase().includes(searchLower)) ||
        (order.shippingAddress && order.shippingAddress.toLowerCase().includes(searchLower))
      );
    }

    // Apply sorting
    filteredOrders.sort((a, b) => {
      let aValue, bValue;

      switch (sortField) {
        case 'placedAt':
          aValue = new Date(a.placedAt || 0).getTime();
          bValue = new Date(b.placedAt || 0).getTime();
          break;
        case 'totalAmount':
          aValue = a.totalAmount || 0;
          bValue = b.totalAmount || 0;
          break;
        case 'status':
          aValue = a.orderStatus || '';
          bValue = b.orderStatus || '';
          break;
        case 'customer':
          aValue = (a.user && a.user.name) || '';
          bValue = (b.user && b.user.name) || '';
          break;
        default:
          aValue = a[sortField] || '';
          bValue = b[sortField] || '';
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filteredOrders;
  };

  // Get current orders for pagination
  const sortedAndFilteredOrders = getSortedAndFilteredOrders();
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = sortedAndFilteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(sortedAndFilteredOrders.length / ordersPerPage);

  // View order details
  const viewOrderDetails = async (orderId) => {
    try {
      setLoading(true);
      const orderData = await getOrderById(orderId);
      setSelectedOrder(orderData);
      setShowOrderDetails(true);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching order details:', error);
      setErrorMessage('Failed to load order details. Please try again.');
      setLoading(false);
    }
  };

  // Open status update modal
  const openStatusModal = (order) => {
    setCurrentOrderId(order._id);
    setNewStatus(order.orderStatus || 'pending');
    setShowStatusModal(true);
  };

  // Open delete confirmation modal
  const openDeleteModal = (orderId) => {
    setCurrentOrderId(orderId);
    setShowDeleteModal(true);
  };

  // Update order status
  const handleUpdateStatus = async () => {
    try {
      setLoading(true);
      await updateOrderStatus(currentOrderId, { status: newStatus });

      // Update the orders list
      setOrders(orders.map(order =>
        order._id === currentOrderId
          ? { ...order, orderStatus: newStatus }
          : order
      ));

      setShowStatusModal(false);
      setSuccessMessage('Order status updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
      setLoading(false);
    } catch (error) {
      console.error('Error updating order status:', error);
      setErrorMessage('Failed to update order status. Please try again.');
      setLoading(false);
    }
  };

  // Delete order
  const handleDeleteOrder = async () => {
    try {
      setLoading(true);
      await deleteOrder(currentOrderId);

      // Remove the deleted order from the list
      setOrders(orders.filter(order => order._id !== currentOrderId));

      setShowDeleteModal(false);
      setSuccessMessage('Order deleted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
      setLoading(false);
    } catch (error) {
      console.error('Error deleting order:', error);
      setErrorMessage('Failed to delete order. Please try again.');
      setLoading(false);
    }
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'confirmed': return 'status-confirmed';
      case 'shipped': return 'status-shipped';
      case 'delivered': return 'status-delivered';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FaExclamationTriangle />;
      case 'confirmed': return <FaCheck />;
      case 'shipped': return <FaShippingFast />;
      case 'delivered': return <FaClipboardCheck />;
      case 'cancelled': return <FaBan />;
      default: return <FaExclamationTriangle />;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle add order form input changes
  const handleAddOrderChange = (e) => {
    const { name, value } = e.target;
    setNewOrderData({
      ...newOrderData,
      [name]: value
    });

    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  // Handle item changes in the add order form
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...newOrderData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };

    // If product changed, update the price
    if (field === 'product' && value) {
      const selectedProduct = products.find(p => p._id === value);
      if (selectedProduct) {
        updatedItems[index].price = selectedProduct.price;
      }
    }

    // Calculate total amount
    const totalAmount = updatedItems.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);

    setNewOrderData({
      ...newOrderData,
      items: updatedItems,
      totalAmount
    });

    // Clear errors
    if (formErrors[`items[${index}].${field}`]) {
      const newErrors = { ...formErrors };
      delete newErrors[`items[${index}].${field}`];
      setFormErrors(newErrors);
    }
  };

  // Add a new item to the order
  const addOrderItem = () => {
    setNewOrderData({
      ...newOrderData,
      items: [...newOrderData.items, { product: '', quantity: 1, price: 0 }]
    });
  };

  // Remove an item from the order
  const removeOrderItem = (index) => {
    if (newOrderData.items.length === 1) {
      return; // Don't remove the last item
    }

    const updatedItems = newOrderData.items.filter((_, i) => i !== index);

    // Recalculate total amount
    const totalAmount = updatedItems.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);

    setNewOrderData({
      ...newOrderData,
      items: updatedItems,
      totalAmount
    });
  };

  // Validate the add order form
  const validateAddOrderForm = () => {
    const errors = {};

    if (!newOrderData.user) {
      errors.user = 'Please select a customer';
    }

    if (!newOrderData.shippingAddress) {
      errors.shippingAddress = 'Shipping address is required';
    }

    newOrderData.items.forEach((item, index) => {
      if (!item.product) {
        errors[`items[${index}].product`] = 'Please select a product';
      }

      if (!item.quantity || item.quantity < 1) {
        errors[`items[${index}].quantity`] = 'Quantity must be at least 1';
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit the add order form
  const handleAddOrderSubmit = async (e) => {
    e.preventDefault();

    if (!validateAddOrderForm()) {
      return;
    }

    try {
      setLoading(true);

      const orderData = {
        ...newOrderData,
        // Format items to match the backend expectations
        items: newOrderData.items.map(item => ({
          product: item.product,
          quantity: parseInt(item.quantity),
          price: parseFloat(item.price)
        }))
      };

      const response = await createOrder(orderData);

      // Add the new order to the list
      setOrders([response.order, ...orders]);

      // Reset form and close modal
      setNewOrderData({
        user: '',
        items: [{ product: '', quantity: 1, price: 0 }],
        totalAmount: 0,
        shippingAddress: '',
        paymentMethod: 'COD',
        orderStatus: 'pending'
      });
      setShowAddOrderModal(false);

      setSuccessMessage('Order created successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error creating order:', error);
      setErrorMessage('Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-orders-container">
      <div className="admin-orders-header">
        <h1>Order Management</h1>
        <p>View and manage all customer orders</p>
      </div>

      {/* Success and Error Messages */}
      {successMessage && (
        <div className="success-message">
          <FaCheck /> {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="error-message">
          <FaTimes /> {errorMessage}
        </div>
      )}

      {/* Search and Filter */}
      <div className="admin-orders-actions">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by customer name or order ID..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="search-input"
          />
        </div>
        <div className="actions-right">
          <div className="status-filter">
            <label>Filter by Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All Orders</option>
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <button
            className="add-order-btn"
            onClick={() => setShowAddOrderModal(true)}
          >
            <FaPlus /> Add Order
          </button>
        </div>
      </div>

      {/* Orders Table */}
      {loading && !orders.length ? (
        <div className="loading-container">
          <FaSpinner className="spinner" />
          <p>Loading orders...</p>
        </div>
      ) : (
        <>
          <div className="orders-table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('_id')}>
                    Order ID
                    {sortField === '_id' && (
                      sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />
                    )}
                  </th>
                  <th onClick={() => handleSort('customer')}>
                    Customer
                    {sortField === 'customer' && (
                      sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />
                    )}
                  </th>
                  <th onClick={() => handleSort('placedAt')}>
                    Date
                    {sortField === 'placedAt' && (
                      sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />
                    )}
                  </th>
                  <th onClick={() => handleSort('totalAmount')}>
                    Total
                    {sortField === 'totalAmount' && (
                      sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />
                    )}
                  </th>
                  <th onClick={() => handleSort('status')}>
                    Status
                    {sortField === 'status' && (
                      sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />
                    )}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.length > 0 ? (
                  currentOrders.map(order => (
                    <tr key={order._id}>
                      <td>{order._id}</td>
                      <td>{order.user ? order.user.name : 'N/A'}</td>
                      <td>{formatDate(order.placedAt)}</td>
                      <td>${order.totalAmount ? order.totalAmount.toFixed(2) : '0.00'}</td>
                      <td>
                        <span className={`status-badge ${getStatusBadgeClass(order.orderStatus)}`}>
                          {getStatusIcon(order.orderStatus)} {order.orderStatus}
                        </span>
                      </td>
                      <td className="action-buttons">
                        <button
                          className="view-btn"
                          onClick={() => viewOrderDetails(order._id)}
                          title="View Order Details"
                        >
                          <FaEye />
                        </button>
                        <button
                          className="edit-btn"
                          onClick={() => openStatusModal(order)}
                          title="Update Status"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => openDeleteModal(order._id)}
                          title="Delete Order"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="no-orders">
                      {searchTerm || statusFilter !== 'all'
                        ? 'No orders match your search criteria'
                        : 'No orders found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Pagination */}
      {sortedAndFilteredOrders.length > 0 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            <FaArrowLeft /> Previous
          </button>
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next <FaArrowRight />
          </button>
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="modal-backdrop">
          <div className="order-details-modal">
            <div className="modal-header">
              <h2>Order Details</h2>
              <button className="close-btn" onClick={() => setShowOrderDetails(false)}>
                <FaTimes />
              </button>
            </div>

            {/* Printable content */}
            <div className="modal-body printable-content" ref={orderDetailsPrintRef}>
              {/* This header only shows when printing */}
              <div className="printable-header">
                <h1>Order Invoice</h1>
                <p>Order ID: {selectedOrder._id}</p>
                <p>Date: {formatDate(selectedOrder.placedAt)}</p>
              </div>

              <div className="order-info-section">
                <h3>Order Information</h3>
                <div className="order-info-grid">
                  <div className="info-item">
                    <span className="info-label"><FaCalendarAlt /> Order Date:</span>
                    <span className="info-value">{formatDate(selectedOrder.placedAt)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label"><FaDollarSign /> Total Amount:</span>
                    <span className="info-value">${selectedOrder.totalAmount ? selectedOrder.totalAmount.toFixed(2) : '0.00'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label"><FaMapMarkerAlt /> Shipping Address:</span>
                    <span className="info-value">{selectedOrder.shippingAddress || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label"><FaCreditCard /> Payment Method:</span>
                    <span className="info-value">{selectedOrder.paymentMethod || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Status:</span>
                    <span className={`status-badge ${getStatusBadgeClass(selectedOrder.orderStatus)}`}>
                      {getStatusIcon(selectedOrder.orderStatus)} {selectedOrder.orderStatus}
                    </span>
                  </div>
                </div>
              </div>

              <div className="customer-info-section">
                <h3>Customer Information</h3>
                {selectedOrder.user ? (
                  <div className="customer-info-grid">
                    <div className="info-item">
                      <span className="info-label"><FaUser /> Name:</span>
                      <span className="info-value">{selectedOrder.user.name}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Email:</span>
                      <span className="info-value">{selectedOrder.user.email}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Phone:</span>
                      <span className="info-value">{selectedOrder.user.phone || 'N/A'}</span>
                    </div>
                  </div>
                ) : (
                  <p>Customer information not available</p>
                )}
              </div>

              <div className="order-items-section">
                <h3>Order Items</h3>
                <table className="order-items-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                      selectedOrder.items.map((item, index) => (
                        <tr key={index}>
                          <td>
                            <div className="product-info">
                              {item.product && (
                                <>
                                  <div className="product-image">
                                    {item.product.images && item.product.images.length > 0 ? (
                                      <>
                                        <img
                                          src={
                                            item.product.images[0].startsWith('http')
                                              ? item.product.images[0]
                                              : `http://localhost:5000/uploads/${item.product.images[0]}`
                                          }
                                          alt={`Product: ${item.product.name || 'Product Image'}`}
                                          onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.style.display = 'none';
                                            // Instead of trying to set innerHTML, we'll add a class to the parent
                                            e.target.parentNode.classList.add('show-fallback-icon');
                                          }}
                                        />
                                        <FaBox className="fallback-icon" />
                                      </>
                                    ) : (
                                      <FaBox className="no-image-icon" />
                                    )}
                                  </div>
                                  <div className="product-details">
                                    <p className="product-name">{item.product.name || 'Unknown Product'}</p>
                                    <p className="product-code">{item.product.productCode || 'N/A'}</p>
                                  </div>
                                </>
                              )}
                            </div>
                          </td>
                          <td>${item.price ? item.price.toFixed(2) : '0.00'}</td>
                          <td>{item.quantity}</td>
                          <td>${(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="no-items">No items in this order</td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="3" className="total-label">Total:</td>
                      <td className="total-value">${selectedOrder.totalAmount ? selectedOrder.totalAmount.toFixed(2) : '0.00'}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            <div className="modal-footer">
              <button className="export-pdf-btn" onClick={handlePrint}>
                <FaFilePdf /> Export as PDF
              </button>
              <button className="primary-btn" onClick={() => openStatusModal(selectedOrder)}>
                Update Status
              </button>
              <button className="secondary-btn" onClick={() => setShowOrderDetails(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {showStatusModal && (
        <div className="modal-backdrop">
          <div className="status-modal">
            <div className="modal-header">
              <h2>Update Order Status</h2>
              <button className="close-btn" onClick={() => setShowStatusModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="status-options">
                <label>Select New Status:</label>
                <div className="status-radio-group">
                  {statusOptions.map(option => (
                    <div key={option.value} className="status-radio-option">
                      <input
                        type="radio"
                        id={`status-${option.value}`}
                        name="orderStatus"
                        value={option.value}
                        checked={newStatus === option.value}
                        onChange={() => setNewStatus(option.value)}
                      />
                      <label htmlFor={`status-${option.value}`} className={`status-label ${getStatusBadgeClass(option.value)}`}>
                        {option.icon} {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="primary-btn" onClick={handleUpdateStatus} disabled={loading}>
                {loading ? <FaSpinner className="spinner" /> : 'Update Status'}
              </button>
              <button className="secondary-btn" onClick={() => setShowStatusModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-backdrop">
          <div className="delete-modal">
            <div className="modal-header">
              <h2>Confirm Deletion</h2>
              <button className="close-btn" onClick={() => setShowDeleteModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <p className="delete-warning">
                <FaExclamationTriangle /> Are you sure you want to delete this order? This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button className="delete-confirm-btn" onClick={handleDeleteOrder} disabled={loading}>
                {loading ? <FaSpinner className="spinner" /> : 'Delete Order'}
              </button>
              <button className="secondary-btn" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Order Modal */}
      {showAddOrderModal && (
        <div className="modal-backdrop">
          <div className="add-order-modal">
            <div className="modal-header">
              <h2>Create New Order</h2>
              <button className="close-btn" onClick={() => setShowAddOrderModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <form className="add-order-form" onSubmit={handleAddOrderSubmit}>
                {/* Customer Selection */}
                <div className="form-group">
                  <label>Customer</label>
                  <select
                    name="user"
                    value={newOrderData.user}
                    onChange={handleAddOrderChange}
                    className={formErrors.user ? 'error' : ''}
                  >
                    <option value="">Select a customer</option>
                    {users.map(user => (
                      <option key={user._id} value={user._id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                  {formErrors.user && <div className="error-message">{formErrors.user}</div>}
                </div>

                {/* Shipping Address */}
                <div className="form-group">
                  <label>Shipping Address</label>
                  <textarea
                    name="shippingAddress"
                    value={newOrderData.shippingAddress}
                    onChange={handleAddOrderChange}
                    placeholder="Enter shipping address"
                    className={formErrors.shippingAddress ? 'error' : ''}
                  />
                  {formErrors.shippingAddress && <div className="error-message">{formErrors.shippingAddress}</div>}
                </div>

                {/* Payment Method */}
                <div className="form-group">
                  <label>Payment Method</label>
                  <select
                    name="paymentMethod"
                    value={newOrderData.paymentMethod}
                    onChange={handleAddOrderChange}
                  >
                    <option value="COD">Cash on Delivery</option>
                    <option value="Online">Online Payment</option>
                  </select>
                </div>

                {/* Order Status */}
                <div className="form-group">
                  <label>Order Status</label>
                  <select
                    name="orderStatus"
                    value={newOrderData.orderStatus}
                    onChange={handleAddOrderChange}
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Order Items */}
                <div className="form-group">
                  <label>Order Items</label>
                  <div className="order-items-container">
                    {newOrderData.items.map((item, index) => (
                      <div key={index} className="order-item">
                        <div className="item-row">
                          <div className="item-field">
                            <label>Product</label>
                            <select
                              value={item.product}
                              onChange={(e) => handleItemChange(index, 'product', e.target.value)}
                              className={formErrors[`items[${index}].product`] ? 'error' : ''}
                            >
                              <option value="">Select a product</option>
                              {products.map(product => (
                                <option key={product._id} value={product._id}>
                                  {product.name} (${product.price?.toFixed(2)})
                                </option>
                              ))}
                            </select>
                            {formErrors[`items[${index}].product`] && (
                              <div className="error-message">{formErrors[`items[${index}].product`]}</div>
                            )}
                          </div>
                          <div className="item-field">
                            <label>Quantity</label>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                              className={formErrors[`items[${index}].quantity`] ? 'error' : ''}
                            />
                            {formErrors[`items[${index}].quantity`] && (
                              <div className="error-message">{formErrors[`items[${index}].quantity`]}</div>
                            )}
                          </div>
                          <div className="item-field">
                            <label>Price</label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.price}
                              onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                              disabled
                            />
                          </div>
                          <div className="item-field">
                            <label>Subtotal</label>
                            <div className="subtotal">${(item.price * item.quantity).toFixed(2)}</div>
                          </div>
                          <div className="item-actions">
                            <button
                              type="button"
                              className="remove-item-btn"
                              onClick={() => removeOrderItem(index)}
                              disabled={newOrderData.items.length === 1}
                            >
                              <FaMinus />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="add-item-btn"
                      onClick={addOrderItem}
                    >
                      <FaPlus /> Add Another Item
                    </button>
                  </div>
                </div>

                {/* Order Total */}
                <div className="order-total">
                  <div className="total-label">Total Amount:</div>
                  <div className="total-value">${newOrderData.totalAmount.toFixed(2)}</div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="primary-btn" onClick={handleAddOrderSubmit} disabled={loading}>
                {loading ? <FaSpinner className="spinner" /> : 'Create Order'}
              </button>
              <button className="secondary-btn" onClick={() => setShowAddOrderModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrder;
