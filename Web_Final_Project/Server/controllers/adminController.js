const bcrypt = require('bcrypt');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Role = require('../models/Role');

// =================== USER MANAGEMENT ===================

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').populate('role');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get users' });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password').populate('role');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get user' });
  }
};

// Add new user (e.g., Salesman)
exports.addUser = async (req, res) => {
  try {
    console.log('Adding new user:', req.body);
    const { name, email, password, phone, role } = req.body;

    // Check if email already exists
    const existing = await User.findOne({ email });
    if (existing) {
      console.error(`Email already exists: ${email}`);
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Validate if the role exists
    let roleObj;
    if (role) {
      try {
        roleObj = await Role.findById(role);
        if (!roleObj) {
          // If role ID doesn't exist, try to find by name
          roleObj = await Role.findOne({ name: role });
          if (!roleObj) {
            console.error(`Role not found with ID or name: ${role}`);
            return res.status(400).json({ message: 'Invalid role provided' });
          }
        }
      } catch (roleErr) {
        console.error('Error validating role:', roleErr);
        return res.status(400).json({ message: 'Invalid role format' });
      }
    } else {
      // If no role provided, default to customer
      roleObj = await Role.findOne({ name: 'customer' });
      if (!roleObj) {
        console.error('Default customer role not found');
        return res.status(500).json({ message: 'Role setup error' });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with validated role
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      role: roleObj._id
    });

    await newUser.save();

    // Populate role for response
    const populatedUser = await User.findById(newUser._id).select('-password').populate('role');

    console.log('User added successfully:', populatedUser);
    res.status(201).json({ message: 'User added successfully', user: populatedUser });
  } catch (err) {
    console.error('Error adding user:', err);
    res.status(500).json({ message: 'Failed to add user' });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    console.log(`Updating user with ID: ${req.params.id}`, req.body);
    const { name, phone, role } = req.body;

    // Validate if the role exists
    let roleObj;
    if (role) {
      try {
        roleObj = await Role.findById(role);
        if (!roleObj) {
          // If role ID doesn't exist, try to find by name
          roleObj = await Role.findOne({ name: role });
          if (!roleObj) {
            console.error(`Role not found with ID or name: ${role}`);
            return res.status(400).json({ message: 'Invalid role provided' });
          }
        }
      } catch (roleErr) {
        console.error('Error validating role:', roleErr);
        return res.status(400).json({ message: 'Invalid role format' });
      }
    }

    // Prepare update object
    const updateData = {
      name,
      phone
    };

    // Only include role if it's valid
    if (roleObj) {
      updateData.role = roleObj._id;
    }

    console.log('Update data:', updateData);

    // Update the user
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password').populate('role');

    if (!user) {
      console.error(`User not found with ID: ${req.params.id}`);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User updated successfully:', user);
    res.json({ message: 'User updated successfully', user });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ message: 'Failed to update user' });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user' });
  }
};

// Get all roles
exports.getAllRoles = async (req, res) => {
  try {
    console.log('Getting all roles...');
    const roles = await Role.find();

    // If no roles found, create default roles
    if (roles.length === 0) {
      console.log('No roles found. Creating default roles...');
      const defaultRoles = [
        { name: 'admin', permissions: ['manage_users', 'manage_products', 'manage_orders'] },
        { name: 'customer', permissions: ['view_products', 'place_orders', 'view_own_orders'] },
        { name: 'salesman', permissions: ['view_products', 'manage_orders'] }
      ];

      const createdRoles = await Role.insertMany(defaultRoles);
      console.log('Default roles created successfully!');
      return res.json(createdRoles);
    }

    console.log(`Found ${roles.length} roles:`, roles);
    res.json(roles);
  } catch (err) {
    console.error('Error in getAllRoles:', err);
    res.status(500).json({ message: 'Failed to get roles' });
  }
};

// =================== PRODUCT MANAGEMENT ===================

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get products' });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get product' });
  }
};

// Add product
exports.addProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json({ message: 'Product added successfully', product });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add product' });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product updated successfully', product });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update product' });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete product' });
  }
};

// =================== ORDER MANAGEMENT ===================

// Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('user').populate('items.product');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get orders' });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user').populate('items.product');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get order' });
  }
};

// Create a new order (admin only)
exports.createOrder = async (req, res) => {
  try {
    console.log('Creating new order:', req.body);
    const { user, items, totalAmount, shippingAddress, paymentMethod, orderStatus } = req.body;

    // Validate required fields
    if (!user || !items || items.length === 0) {
      return res.status(400).json({ message: 'User and at least one item are required' });
    }

    // Create new order
    const order = new Order({
      user,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod: paymentMethod || 'COD',
      orderStatus: orderStatus || 'pending',
      placedAt: new Date()
    });

    await order.save();

    // Return the populated order
    const populatedOrder = await Order.findById(order._id)
      .populate('user')
      .populate('items.product');

    res.status(201).json({ message: 'Order created successfully', order: populatedOrder });
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ message: 'Failed to create order' });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { orderStatus: status }, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ message: 'Order status updated', order });
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(500).json({ message: 'Failed to update order' });
  }
};

// Delete order
exports.deleteOrder = async (req, res) => {
  try {
    const deleted = await Order.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Order not found' });
    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete order' });
  }
};

// =================== DASHBOARD & REPORT ===================

// Get Dashboard Stats
exports.getDashboardStats = async (req, res) => {
  try {
    // Get customer role
    const customerRole = await Role.findOne({ name: 'customer' });

    // Get counts
    const totalCustomers = customerRole ? await User.countDocuments({ role: customerRole._id }) : 0;
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    // Get orders by status
    const pendingOrders = await Order.countDocuments({ orderStatus: 'pending' });
    const processingOrders = await Order.countDocuments({ orderStatus: 'confirmed' });
    const shippedOrders = await Order.countDocuments({ orderStatus: 'shipped' });
    const deliveredOrders = await Order.countDocuments({ orderStatus: 'delivered' });
    const cancelledOrders = await Order.countDocuments({ orderStatus: 'cancelled' });

    // Calculate total sales
    const orders = await Order.find();
    const totalSales = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    res.json({
      totalCustomers,
      totalProducts,
      totalOrders,
      totalSales,
      ordersByStatus: {
        pending: pendingOrders,
        processing: processingOrders,
        shipped: shippedOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders
      }
    });
  } catch (err) {
    console.error('Error in getDashboardStats:', err);
    res.status(500).json({ message: 'Failed to load dashboard stats' });
  }
};

// Get Summary Metrics
exports.getSummaryMetrics = async (req, res) => {
  try {
    console.log('Fetching summary metrics...');

    // Log all roles in the database for debugging
    const allRoles = await Role.find();
    console.log('All roles in database:', allRoles);

    // Get customer role
    const customerRole = await Role.findOne({ name: 'customer' });
    console.log('Customer role:', customerRole);

    // Get total customers
    const totalCustomers = customerRole ? await User.countDocuments({ role: customerRole._id }) : 0;
    console.log(`Total customers: ${totalCustomers}`);

    // Get total orders
    const totalOrders = await Order.countDocuments();
    console.log(`Total orders: ${totalOrders}`);

    // Get pending orders
    const pendingOrders = await Order.countDocuments({ orderStatus: 'pending' });
    console.log(`Pending orders: ${pendingOrders}`);

    // Calculate total sales
    const orders = await Order.find();
    console.log(`Found ${orders.length} orders`);
    const totalSales = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    console.log(`Total sales: ${totalSales}`);

    // Calculate growth percentages based on previous month data
    const currentDate = new Date();
    const lastMonthDate = new Date();
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);

    // Get current month orders
    const currentMonthOrders = orders.filter(order => {
      if (!order.placedAt) return false;
      const orderDate = new Date(order.placedAt);
      return orderDate.getMonth() === currentDate.getMonth() &&
             orderDate.getFullYear() === currentDate.getFullYear();
    });

    // Get last month orders
    const lastMonthOrders = orders.filter(order => {
      if (!order.placedAt) return false;
      const orderDate = new Date(order.placedAt);
      return orderDate.getMonth() === lastMonthDate.getMonth() &&
             orderDate.getFullYear() === lastMonthDate.getFullYear();
    });

    // Calculate current month sales
    const currentMonthSales = currentMonthOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    // Calculate last month sales
    const lastMonthSales = lastMonthOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    // Calculate growth percentages
    let salesGrowth = 0;
    let orderGrowth = 0;

    if (lastMonthSales > 0) {
      salesGrowth = ((currentMonthSales - lastMonthSales) / lastMonthSales) * 100;
    } else if (currentMonthSales > 0) {
      salesGrowth = 100; // If last month was 0 and this month is positive, that's 100% growth
    }

    if (lastMonthOrders.length > 0) {
      orderGrowth = ((currentMonthOrders.length - lastMonthOrders.length) / lastMonthOrders.length) * 100;
    } else if (currentMonthOrders.length > 0) {
      orderGrowth = 100; // If last month was 0 and this month is positive, that's 100% growth
    }

    // Get new customers in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newCustomers = customerRole ? await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
      role: customerRole._id
    }) : 0;

    // Calculate customer growth
    const customerGrowth = totalCustomers > 0 ? (newCustomers / totalCustomers) * 100 : 0;

    console.log(`Sales growth: ${salesGrowth.toFixed(1)}%`);
    console.log(`Order growth: ${orderGrowth.toFixed(1)}%`);
    console.log(`Customer growth: ${customerGrowth.toFixed(1)}%`);

    res.json({
      totalSales,
      totalOrders,
      totalCustomers,
      pendingOrders,
      salesGrowth: parseFloat(salesGrowth.toFixed(1)),
      orderGrowth: parseFloat(orderGrowth.toFixed(1)),
      customerGrowth: parseFloat(customerGrowth.toFixed(1))
    });
  } catch (err) {
    console.error('Error in getSummaryMetrics:', err);
    res.status(500).json({ message: 'Failed to get summary metrics' });
  }
};

// Get Order Statistics
exports.getOrderStats = async (req, res) => {
  try {
    console.log('Fetching order statistics...');

    // Get orders by status
    // Note: In the Order model, 'confirmed' is used, but the frontend expects 'processing'
    const pendingOrders = await Order.countDocuments({ orderStatus: 'pending' });
    const processingOrders = await Order.countDocuments({ orderStatus: 'confirmed' });
    const shippedOrders = await Order.countDocuments({ orderStatus: 'shipped' });
    const deliveredOrders = await Order.countDocuments({ orderStatus: 'delivered' });
    const cancelledOrders = await Order.countDocuments({ orderStatus: 'cancelled' });

    console.log('Order statistics:', {
      pending: pendingOrders,
      processing: processingOrders,
      shipped: shippedOrders,
      delivered: deliveredOrders,
      cancelled: cancelledOrders
    });

    res.json({
      ordersByStatus: {
        pending: pendingOrders,
        processing: processingOrders, // Frontend expects 'processing' instead of 'confirmed'
        shipped: shippedOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders
      }
    });
  } catch (err) {
    console.error('Error in getOrderStats:', err);
    res.status(500).json({ message: 'Failed to get order statistics' });
  }
};

// Get Sales Analytics
exports.getSalesAnalytics = async (req, res) => {
  try {
    console.log('Fetching sales analytics...');
    const { period = 'monthly' } = req.query;

    // Get all orders
    const orders = await Order.find().sort({ placedAt: 1 });
    console.log(`Found ${orders.length} orders for sales analytics`);

    // Group orders by month
    const monthlySales = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Create a map to store monthly sales
    const salesByMonth = {};

    // Initialize with zero values for all months
    monthNames.forEach(month => {
      salesByMonth[month] = 0;
    });

    // Aggregate sales by month
    orders.forEach(order => {
      if (order.placedAt && order.totalAmount) {
        const month = monthNames[new Date(order.placedAt).getMonth()];
        salesByMonth[month] += order.totalAmount;
      }
    });

    // Convert to array format for charts
    Object.keys(salesByMonth).forEach(month => {
      monthlySales.push({
        month,
        sales: salesByMonth[month]
      });
    });

    console.log(`Returning sales data for ${monthlySales.length} months`);
    res.json(monthlySales);
  } catch (err) {
    console.error('Error in getSalesAnalytics:', err);
    res.status(500).json({ message: 'Failed to generate sales analytics' });
  }
};

// Get Customer Statistics
exports.getCustomerStats = async (req, res) => {
  try {
    console.log('Fetching customer statistics...');

    // Log all roles in the database for debugging
    const allRoles = await Role.find();
    console.log('All roles in database:', allRoles);

    // Get customer role
    const customerRole = await Role.findOne({ name: 'customer' });
    console.log('Customer role:', customerRole);

    // Get total customers
    const totalCustomers = customerRole ? await User.countDocuments({ role: customerRole._id }) : 0;
    console.log(`Total customers: ${totalCustomers}`);

    // Get all users for debugging
    const allUsers = await User.find().select('role');
    console.log('All users with roles:', allUsers);

    // Get new customers in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newCustomers = customerRole ? await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
      role: customerRole._id
    }) : 0;
    console.log(`New customers in last 30 days: ${newCustomers}`);

    // Get all customers with creation dates
    const customers = customerRole ? await User.find({ role: customerRole._id }).select('createdAt') : [];
    console.log(`Found ${customers.length} customers with creation dates`);

    // Generate monthly growth data based on customer creation dates
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyCustomers = {};

    // Initialize with zero values
    monthNames.forEach(month => {
      monthlyCustomers[month] = 0;
    });

    // Count customers by month of creation
    const currentYear = new Date().getFullYear();
    customers.forEach(customer => {
      if (customer.createdAt) {
        const creationDate = new Date(customer.createdAt);
        // Only count customers created in the current year
        if (creationDate.getFullYear() === currentYear) {
          const month = monthNames[creationDate.getMonth()];
          monthlyCustomers[month]++;
        }
      }
    });

    // Convert from incremental to cumulative
    let runningTotal = 0;
    monthNames.forEach(month => {
      runningTotal += monthlyCustomers[month];
      monthlyCustomers[month] = runningTotal;
    });

    // Convert to array format for charts
    const monthlyGrowth = monthNames.map(month => ({
      month,
      customers: monthlyCustomers[month]
    }));

    console.log('Monthly customer growth data generated');
    res.json({
      totalCustomers,
      newCustomers,
      monthlyGrowth
    });
  } catch (err) {
    console.error('Error in getCustomerStats:', err);
    res.status(500).json({ message: 'Failed to get customer statistics' });
  }
};

// Get Top Products
exports.getTopProducts = async (req, res) => {
  try {
    console.log('Fetching top products...');
    const { limit = 5 } = req.query;

    // Get all products
    const products = await Product.find();
    console.log(`Found ${products.length} products`);

    // Get all orders with items - only consider completed orders (not cancelled)
    const orders = await Order.find({
      orderStatus: { $nin: ['cancelled'] }
    }).populate('items.product');
    console.log(`Found ${orders.length} valid orders for product analysis`);

    // Create a map to track product sales and revenue
    const productMap = new Map();

    // Initialize product map with all products
    products.forEach(product => {
      productMap.set(product._id.toString(), {
        _id: product._id,
        name: product.name || 'Unknown Product',
        productCode: product.productCode || '',
        sales: 0,
        revenue: 0
      });
    });

    // Process all orders to calculate product sales and revenue
    let totalProcessedItems = 0;
    orders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          if (item.product && item.product._id) {
            const productId = item.product._id.toString();
            const quantity = item.quantity || 1;
            const price = item.price || (item.product.price || 0);
            const revenue = quantity * price;
            totalProcessedItems++;

            if (productMap.has(productId)) {
              const product = productMap.get(productId);
              product.sales += quantity;
              product.revenue += revenue;
            }
          }
        });
      }
    });

    console.log(`Processed ${totalProcessedItems} order items for sales calculation`);

    // Convert map to array and sort by sales (descending)
    let topProducts = Array.from(productMap.values())
      .sort((a, b) => b.sales - a.sales)
      .slice(0, parseInt(limit));

    // Log the top products for debugging
    console.log('Top products by sales:');
    topProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}: ${product.sales} units, $${product.revenue} revenue`);
    });

    // Even if there's no sales data, we'll return the actual products with zero sales
    // This is more accurate than generating random data
    console.log(`Returning ${topProducts.length} top products (may have zero sales)`);
    res.json(topProducts);
  } catch (err) {
    console.error('Error in getTopProducts:', err);
    res.status(500).json({ message: 'Failed to get top products' });
  }
};

// Get Recent Orders
exports.getRecentOrders = async (req, res) => {
  try {
    console.log('Fetching recent orders...');
    const { limit = 5 } = req.query;

    // Get the most recent orders
    const recentOrders = await Order.find()
      .sort({ placedAt: -1 })
      .limit(parseInt(limit))
      .populate('user', 'name');

    console.log(`Found ${recentOrders.length} recent orders`);

    // Format the orders for the frontend
    const formattedOrders = recentOrders.map(order => {
      // Ensure we have a valid date
      let orderDate = new Date();
      try {
        if (order.placedAt) {
          orderDate = new Date(order.placedAt);
        }
      } catch (e) {
        console.error('Error parsing order date:', e);
      }

      return {
        id: order._id,
        customer: order.user ? order.user.name : 'Unknown Customer',
        amount: order.totalAmount || 0,
        status: order.orderStatus || 'pending',
        date: orderDate.toISOString().split('T')[0]
      };
    });

    console.log('Formatted recent orders:', formattedOrders);
    res.json(formattedOrders);
  } catch (err) {
    console.error('Error in getRecentOrders:', err);
    res.status(500).json({ message: 'Failed to get recent orders' });
  }
};

// Get Product Category Sales
exports.getProductCategorySales = async (req, res) => {
  try {
    console.log('Fetching product category sales...');

    // Get all products
    const products = await Product.find();
    console.log(`Found ${products.length} products for category analysis`);

    // Group products by category
    const categorySales = {};

    // Get all orders
    const orders = await Order.find().populate('items.product');
    console.log(`Found ${orders.length} orders for category analysis`);

    // Process all orders to calculate category sales
    orders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          if (item.product && item.product.category) {
            const category = item.product.category;
            const quantity = item.quantity || 1;
            const price = item.price || (item.product.price || 0);
            const revenue = quantity * price;

            if (!categorySales[category]) {
              categorySales[category] = 0;
            }

            categorySales[category] += revenue;
          }
        });
      }
    });

    // If no order data is available, use products but with zero sales
    if (Object.keys(categorySales).length === 0) {
      console.log('No order data available, using product categories with zero sales');

      // Group products by category
      products.forEach(product => {
        if (product.category && !categorySales[product.category]) {
          categorySales[product.category] = 0;
        }
      });
    }

    // Convert to array format for charts
    const result = Object.keys(categorySales).map(category => ({
      category,
      sales: categorySales[category]
    }));

    console.log(`Returning sales data for ${result.length} categories`);
    res.json(result);
  } catch (err) {
    console.error('Error in getProductCategorySales:', err);
    res.status(500).json({ message: 'Failed to get product category sales' });
  }
};

// Get Low Stock Products
exports.getLowStockProducts = async (req, res) => {
  try {
    console.log('Fetching low stock products...');
    const { threshold = 10 } = req.query;

    // Find products with stock below the threshold
    const lowStockProducts = await Product.find({ stock: { $lte: parseInt(threshold) } });
    console.log(`Found ${lowStockProducts.length} products with stock <= ${threshold}`);

    res.json(lowStockProducts);
  } catch (err) {
    console.error('Error in getLowStockProducts:', err);
    res.status(500).json({ message: 'Failed to get low stock products' });
  }
};

// Restock Product
exports.restockProduct = async (req, res) => {
  try {
    console.log('Restocking product...');
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Invalid quantity' });
    }

    // Find the product
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update the stock
    product.stock += parseInt(quantity);
    await product.save();

    console.log(`Restocked product ${product.name} with ${quantity} units. New stock: ${product.stock}`);

    res.json({
      message: 'Product restocked successfully',
      product
    });
  } catch (err) {
    console.error('Error in restockProduct:', err);
    res.status(500).json({ message: 'Failed to restock product' });
  }
};

// Get Sales Report
exports.getSalesReport = async (req, res) => {
  try {
    const orders = await Order.find();
    const totalSales = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    res.json({
      totalOrders: orders.length,
      totalSales
    });
  } catch (err) {
    console.error('Error in getSalesReport:', err);
    res.status(500).json({ message: 'Failed to generate sales report' });
  }
};
