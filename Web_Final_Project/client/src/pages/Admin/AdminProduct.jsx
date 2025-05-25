import React, { useState, useEffect } from 'react';
import {
  getAllProducts,
  restockProduct,
  getLowStockProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  uploadImage
} from '../../services/adminService';
import './AdminProduct.css';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaSpinner,
  FaCheck,
  FaTimes,
  FaArrowLeft,
  FaArrowRight,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaBoxOpen,
  FaWarehouse
} from 'react-icons/fa';

const AdminProduct = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [formData, setFormData] = useState({
    productCode: '',
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    images: []
  });
  const [restockData, setRestockData] = useState({
    productId: '',
    quantity: 1
  });
  const [formErrors, setFormErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [lowStockThreshold] = useState(10);
  const [lowStockProducts, setLowStockProducts] = useState([]);

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
    fetchLowStockProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const productsData = await getAllProducts();
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
      setErrorMessage('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchLowStockProducts = async () => {
    try {
      const lowStockData = await getLowStockProducts(lowStockThreshold);
      setLowStockProducts(lowStockData);
    } catch (error) {
      console.error('Error fetching low stock products:', error);
    }
  };

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Get sorted products
  const getSortedProducts = () => {
    const sortableProducts = [...products];
    if (sortConfig.key) {
      sortableProducts.sort((a, b) => {
        if (a[sortConfig.key] === null) return 1;
        if (b[sortConfig.key] === null) return -1;
        if (a[sortConfig.key] === b[sortConfig.key]) return 0;

        const aValue = typeof a[sortConfig.key] === 'string'
          ? a[sortConfig.key].toLowerCase()
          : a[sortConfig.key];
        const bValue = typeof b[sortConfig.key] === 'string'
          ? b[sortConfig.key].toLowerCase()
          : b[sortConfig.key];

        if (sortConfig.direction === 'ascending') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }
    return sortableProducts;
  };

  // Filter products based on search term - focus on product name for real-time search
  const filteredProducts = getSortedProducts().filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'price' || name === 'stock' ? parseFloat(value) : value
    });

    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    // Validate files
    const validFiles = files.filter(file => {
      const isValidType = file.type.match('image.*');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB max

      if (!isValidType) {
        setErrorMessage('Please select only image files (JPEG, PNG, etc.)');
        setTimeout(() => setErrorMessage(''), 3000);
      }

      if (!isValidSize) {
        setErrorMessage('Image file is too large. Please select images smaller than 5MB.');
        setTimeout(() => setErrorMessage(''), 3000);
      }

      return isValidType && isValidSize;
    });

    if (validFiles.length === 0) return;

    // Add new files to existing files
    setImageFiles(prevFiles => [...prevFiles, ...validFiles]);

    // Create preview URLs for new files and add to existing previews
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setImagePreview(prevPreviews => [...prevPreviews, ...newPreviews]);
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.productCode) errors.productCode = 'Product code is required';
    if (!formData.name) errors.name = 'Name is required';
    if (!formData.price) errors.price = 'Price is required';
    if (formData.price <= 0) errors.price = 'Price must be greater than 0';
    if (!formData.stock && formData.stock !== 0) errors.stock = 'Stock is required';
    if (formData.stock < 0) errors.stock = 'Stock cannot be negative';
    if (!formData.category) errors.category = 'Category is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle add product
  const handleAddProduct = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      // Upload images first if any
      let imageUrls = [];
      if (imageFiles.length > 0) {
        imageUrls = await uploadImages(imageFiles);
      }

      // Create product with image URLs
      const productData = {
        ...formData,
        images: imageUrls
      };

      const newProduct = await addProduct(productData);

      setProducts([...products, newProduct]);
      setShowAddModal(false);
      resetForm();
      setSuccessMessage('Product added successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error adding product:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to add product');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Upload images to server
  const uploadImages = async (files) => {
    const uploadPromises = files.map(async (file) => {
      return await uploadImage(file);
    });

    return Promise.all(uploadPromises);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      productCode: '',
      name: '',
      description: '',
      price: '',
      stock: '',
      category: '',
      images: []
    });

    // Clear image files and previews
    setImageFiles([]);

    // Revoke any object URLs to prevent memory leaks
    imagePreview.forEach(preview => {
      if (preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    });

    setImagePreview([]);
    setFormErrors({});
  };

  // Handle edit product
  const handleEditProduct = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      // Upload new images if any
      let imageUrls = [...formData.images];
      if (imageFiles.length > 0) {
        const newImageUrls = await uploadImages(imageFiles);
        imageUrls = [...imageUrls, ...newImageUrls];
      }

      // Update product with image URLs
      const productData = {
        ...formData,
        images: imageUrls
      };

      const updatedProduct = await updateProduct(currentProduct._id, productData);

      setProducts(products.map(product =>
        product._id === currentProduct._id ? updatedProduct : product
      ));
      setShowEditModal(false);
      resetForm();
      setSuccessMessage('Product updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating product:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to update product');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete product
  const handleDeleteProduct = async () => {
    try {
      setLoading(true);

      await deleteProduct(currentProduct._id);

      setProducts(products.filter(product => product._id !== currentProduct._id));
      setShowDeleteModal(false);
      setSuccessMessage('Product deleted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting product:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to delete product');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Handle restock product
  const handleRestockProduct = async () => {
    try {
      setLoading(true);

      await restockProduct(restockData.productId, parseInt(restockData.quantity));

      // Update product in state
      const updatedProducts = [...products];
      const productIndex = updatedProducts.findIndex(p => p._id === restockData.productId);

      if (productIndex !== -1) {
        updatedProducts[productIndex].stock += parseInt(restockData.quantity);
        setProducts(updatedProducts);
      }

      setShowRestockModal(false);
      setSuccessMessage('Product restocked successfully');
      setTimeout(() => setSuccessMessage(''), 3000);

      // Refresh low stock products
      fetchLowStockProducts();
    } catch (error) {
      console.error('Error restocking product:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to restock product');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Handle removing an image from preview
  const handleRemoveImage = (index) => {
    // Create new arrays without the removed image
    const newImageFiles = [...imageFiles];
    const newImagePreview = [...imagePreview];
    const newFormImages = [...formData.images];

    // If it's a new uploaded file (not yet saved)
    if (index >= formData.images.length) {
      const fileIndex = index - formData.images.length;
      newImageFiles.splice(fileIndex, 1);
      newImagePreview.splice(index, 1);
    } else {
      // It's an existing image
      newFormImages.splice(index, 1);
      newImagePreview.splice(index, 1);
    }

    // Update state
    setImageFiles(newImageFiles);
    setImagePreview(newImagePreview);
    setFormData({
      ...formData,
      images: newFormImages
    });
  };

  // Open edit modal with product data
  const openEditModal = (product) => {
    setCurrentProduct(product);
    setFormData({
      productCode: product.productCode || '',
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      stock: product.stock || 0,
      category: product.category || '',
      images: product.images || []
    });

    // Reset image files for new uploads
    setImageFiles([]);

    // Set image preview if product has images
    if (product.images && product.images.length > 0) {
      const previews = product.images.map(image => {
        if (image.startsWith('http')) {
          return image;
        } else {
          return `http://localhost:5000/uploads/${image}`;
        }
      });
      setImagePreview(previews);
    } else {
      setImagePreview([]);
    }

    setShowEditModal(true);
  };

  // Open delete modal with product data
  const openDeleteModal = (product) => {
    setCurrentProduct(product);
    setShowDeleteModal(true);
  };

  // Open restock modal with product data
  const openRestockModal = (product) => {
    setCurrentProduct(product);
    setRestockData({
      productId: product._id,
      quantity: 1
    });
    setShowRestockModal(true);
  };

  // Get sort icon based on sort config
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <FaSort />;
    }
    return sortConfig.direction === 'ascending' ? <FaSortUp /> : <FaSortDown />;
  };

  return (
    <div className="admin-products-container">
      <div className="admin-products-header">
        <h1>Product Management</h1>
        <p>Manage your product inventory</p>
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

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="low-stock-alert">
          <FaWarehouse /> {lowStockProducts.length} products are low on stock (below {lowStockThreshold} units)
        </div>
      )}

      {/* Search and Add Product */}
      <div className="admin-products-actions">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search products by name..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              // Reset to first page when searching
              setCurrentPage(1);
            }}
            className="search-input"
          />
        </div>
        <button
          className="add-product-btn"
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
        >
          <FaPlus /> Add Product
        </button>
      </div>

      {/* Products Table */}
      {loading && !products.length ? (
        <div className="loading-container">
          <FaSpinner className="spinner" />
          <p>Loading products...</p>
        </div>
      ) : (
        <>
          <div className="products-table-container">
            <table className="products-table">
              <thead>
                <tr>
                  <th onClick={() => requestSort('productCode')}>
                    Product Code {getSortIcon('productCode')}
                  </th>
                  <th onClick={() => requestSort('name')}>
                    Name {getSortIcon('name')}
                  </th>
                  <th onClick={() => requestSort('category')}>
                    Category {getSortIcon('category')}
                  </th>
                  <th onClick={() => requestSort('price')}>
                    Price {getSortIcon('price')}
                  </th>
                  <th onClick={() => requestSort('stock')}>
                    Stock {getSortIcon('stock')}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentProducts.length > 0 ? (
                  currentProducts.map(product => (
                    <tr key={product._id} className={product.stock <= lowStockThreshold ? 'low-stock-row' : ''}>
                      <td>{product.productCode || 'N/A'}</td>
                      <td>{product.name || 'N/A'}</td>
                      <td>{product.category || 'N/A'}</td>
                      <td>${product.price?.toFixed(2) || '0.00'}</td>
                      <td>
                        <div className={product.stock <= lowStockThreshold ? 'low-stock' : ''}>
                          {product.stock || 0}
                          {product.stock <= lowStockThreshold && (
                            <span className="low-stock-badge">Low</span>
                          )}
                        </div>
                      </td>
                      <td className="action-buttons">
                        <button
                          className="edit-btn"
                          onClick={() => openEditModal(product)}
                          title="Edit Product"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="restock-btn"
                          onClick={() => openRestockModal(product)}
                          title="Restock Product"
                        >
                          <FaBoxOpen />
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => openDeleteModal(product)}
                          title="Delete Product"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="no-products">
                      {searchTerm ? 'No products match your search' : 'No products found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredProducts.length > productsPerPage && (
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
        </>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Product</h2>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setShowAddModal(false)}
                aria-label="Close"
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleAddProduct}>
              <div className="form-group">
                <label>Product Code</label>
                <input
                  type="text"
                  name="productCode"
                  value={formData.productCode}
                  onChange={handleChange}
                  placeholder="Enter product code"
                  className={formErrors.productCode ? 'error' : ''}
                />
                {formErrors.productCode && <span className="error-text">{formErrors.productCode}</span>}
              </div>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter product name"
                  className={formErrors.name ? 'error' : ''}
                />
                {formErrors.name && <span className="error-text">{formErrors.name}</span>}
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter product description"
                  className={formErrors.description ? 'error' : ''}
                />
                {formErrors.description && <span className="error-text">{formErrors.description}</span>}
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label>Price</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="Enter price"
                    step="0.01"
                    min="0"
                    className={formErrors.price ? 'error' : ''}
                  />
                  {formErrors.price && <span className="error-text">{formErrors.price}</span>}
                </div>
                <div className="form-group half">
                  <label>Stock</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    placeholder="Enter stock quantity"
                    min="0"
                    className={formErrors.stock ? 'error' : ''}
                  />
                  {formErrors.stock && <span className="error-text">{formErrors.stock}</span>}
                </div>
              </div>
              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="Enter product category"
                  className={formErrors.category ? 'error' : ''}
                />
                {formErrors.category && <span className="error-text">{formErrors.category}</span>}
              </div>
              <div className="form-group">
                <label>Images</label>
                <input
                  type="file"
                  name="images"
                  onChange={handleImageUpload}
                  accept="image/*"
                  multiple
                  className="file-input"
                />
                <div className="image-preview-container">
                  {imagePreview.map((src, index) => (
                    <div key={index} className="image-preview">
                      <img src={src} alt={`Preview ${index}`} />
                      <div className="remove-image" onClick={() => handleRemoveImage(index)}>×</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddModal(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? <FaSpinner className="spinner" /> : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Product</h2>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setShowEditModal(false)}
                aria-label="Close"
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleEditProduct}>
              <div className="form-group">
                <label>Product Code</label>
                <input
                  type="text"
                  name="productCode"
                  value={formData.productCode}
                  onChange={handleChange}
                  placeholder="Enter product code"
                  className={formErrors.productCode ? 'error' : ''}
                />
                {formErrors.productCode && <span className="error-text">{formErrors.productCode}</span>}
              </div>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter product name"
                  className={formErrors.name ? 'error' : ''}
                />
                {formErrors.name && <span className="error-text">{formErrors.name}</span>}
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter product description"
                  className={formErrors.description ? 'error' : ''}
                />
                {formErrors.description && <span className="error-text">{formErrors.description}</span>}
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label>Price</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="Enter price"
                    step="0.01"
                    min="0"
                    className={formErrors.price ? 'error' : ''}
                  />
                  {formErrors.price && <span className="error-text">{formErrors.price}</span>}
                </div>
                <div className="form-group half">
                  <label>Stock</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    placeholder="Enter stock quantity"
                    min="0"
                    className={formErrors.stock ? 'error' : ''}
                  />
                  {formErrors.stock && <span className="error-text">{formErrors.stock}</span>}
                </div>
              </div>
              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="Enter product category"
                  className={formErrors.category ? 'error' : ''}
                />
                {formErrors.category && <span className="error-text">{formErrors.category}</span>}
              </div>
              <div className="form-group">
                <label>Current Images</label>
                <div className="image-preview-container">
                  {imagePreview.map((src, index) => (
                    <div key={index} className="image-preview">
                      <img src={src} alt={`Preview ${index}`} />
                      <div className="remove-image" onClick={() => handleRemoveImage(index)}>×</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Add More Images</label>
                <input
                  type="file"
                  name="images"
                  onChange={handleImageUpload}
                  accept="image/*"
                  multiple
                  className="file-input"
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowEditModal(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? <FaSpinner className="spinner" /> : 'Update Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Product Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content delete-modal">
            <div className="modal-header">
              <h2>Delete Product</h2>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setShowDeleteModal(false)}
                aria-label="Close"
              >
                <FaTimes />
              </button>
            </div>
            <p>Are you sure you want to delete the product <strong>{currentProduct?.name}</strong>?</p>
            <p className="warning-text">This action cannot be undone.</p>
            <div className="modal-actions">
              <button type="button" onClick={() => setShowDeleteModal(false)} className="cancel-btn">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteProduct}
                className="delete-confirm-btn"
                disabled={loading}
              >
                {loading ? <FaSpinner className="spinner" /> : 'Delete Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restock Product Modal */}
      {showRestockModal && (
        <div className="modal-overlay">
          <div className="modal-content restock-modal">
            <div className="modal-header">
              <h2>Restock Product</h2>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setShowRestockModal(false)}
                aria-label="Close"
              >
                <FaTimes />
              </button>
            </div>
            <p>Add stock to <strong>{currentProduct?.name}</strong></p>
            <p>Current stock: <strong>{currentProduct?.stock || 0}</strong></p>
            <div className="form-group">
              <label>Quantity to Add</label>
              <input
                type="number"
                value={restockData.quantity}
                onChange={(e) => setRestockData({ ...restockData, quantity: e.target.value })}
                min="1"
                className="restock-input"
              />
            </div>
            <div className="modal-actions">
              <button type="button" onClick={() => setShowRestockModal(false)} className="cancel-btn">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRestockProduct}
                className="submit-btn"
                disabled={loading || restockData.quantity < 1}
              >
                {loading ? <FaSpinner className="spinner" /> : 'Restock Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProduct;