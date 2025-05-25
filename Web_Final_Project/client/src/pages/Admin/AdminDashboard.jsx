import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import {
  getSummaryMetrics,
  getOrderStats,
  getCustomerStats,
  getSalesAnalytics,
  getTopProducts,
  getRecentOrders,
  getProductCategorySales,
  getLowStockProducts,
  restockProduct as restockProductAPI
} from '../../services/adminService';

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
const STATUS_COLORS = {
  pending: '#FFBB28',
  processing: '#0088FE',
  shipped: '#00C49F',
  delivered: '#8884d8',
  cancelled: '#FF8042'
};

const AdminDashboard = () => {
  const navigate = useNavigate();

  // State for all dashboard data
  const [summaryMetrics, setSummaryMetrics] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalCustomers: 0,
    pendingOrders: 0,
    salesGrowth: 0,
    orderGrowth: 0,
    customerGrowth: 0
  });

  const [orderStats, setOrderStats] = useState({
    ordersByStatus: {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0
    }
  });

  const [customerStats, setCustomerStats] = useState({
    totalCustomers: 0,
    newCustomers: 0,
    monthlyGrowth: []
  });

  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [categorySales, setCategorySales] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingOrderStats, setLoadingOrderStats] = useState(true);
  const [loadingCustomerStats, setLoadingCustomerStats] = useState(true);
  const [loadingSalesData, setLoadingSalesData] = useState(true);
  const [loadingTopProducts, setLoadingTopProducts] = useState(true);
  const [loadingRecentOrders, setLoadingRecentOrders] = useState(true);
  const [loadingCategorySales, setLoadingCategorySales] = useState(true);
  const [loadingLowStock, setLoadingLowStock] = useState(true);

  // Restock dialog state
  const [showRestockDialog, setShowRestockDialog] = useState(false);
  const [restockProduct, setRestockProduct] = useState({
    productId: '',
    productName: '',
    quantity: 1
  });

  // Handle opening the restock dialog
  const handleOpenRestockDialog = (product) => {
    setRestockProduct({
      productId: product._id,
      productName: product.name,
      quantity: 1
    });
    setShowRestockDialog(true);
  };

  // Handle closing the restock dialog
  const handleCloseRestockDialog = () => {
    setShowRestockDialog(false);
  };

  // Handle quantity change in restock dialog
  const handleQuantityChange = (e) => {
    setRestockProduct({
      ...restockProduct,
      quantity: parseInt(e.target.value) || 1
    });
  };

  // Handle restock submission
  const handleRestockSubmit = async () => {
    try {
      // Use the renamed API function
      await restockProductAPI(restockProduct.productId, restockProduct.quantity);
      handleCloseRestockDialog();
      // Refresh low stock products
      fetchLowStockProducts();
    } catch (error) {
      console.error('Failed to restock product:', error);
      alert('Failed to restock product. Please try again.');
    }
  };

  // Function to fetch low stock products
  const fetchLowStockProducts = async () => {
    setLoadingLowStock(true);
    try {
      const data = await getLowStockProducts();
      setLowStockProducts(data);
    } catch (error) {
      console.warn('Low stock API call failed, using mock data instead:', error);
      const mockData = [
        { _id: '1', name: 'Product A', stock: 5, price: 100 },
        { _id: '2', name: 'Product B', stock: 3, price: 200 },
        { _id: '3', name: 'Product C', stock: 8, price: 150 },
        { _id: '4', name: 'Product D', stock: 2, price: 80 },
        { _id: '5', name: 'Product E', stock: 7, price: 120 }
      ];
      setLowStockProducts(mockData);
    } finally {
      setLoadingLowStock(false);
    }
  };

  // Fetch all dashboard data
  useEffect(() => {
    const fetchAllDashboardData = async () => {
      try {
        setLoading(true);
        console.log('Starting to fetch all dashboard data...');

        // Fetch summary metrics
        const fetchSummaryMetrics = async () => {
          setLoadingSummary(true);
          console.log('Fetching summary metrics...');
          try {
            const data = await getSummaryMetrics();
            console.log('Summary metrics data received:', data);

            // Validate the data
            if (data && typeof data === 'object') {
              // Ensure all required fields are present
              const validatedData = {
                totalSales: data.totalSales || 0,
                totalOrders: data.totalOrders || 0,
                totalCustomers: data.totalCustomers || 0,
                pendingOrders: data.pendingOrders || 0,
                salesGrowth: data.salesGrowth || 0,
                orderGrowth: data.orderGrowth || 0,
                customerGrowth: data.customerGrowth || 0
              };

              console.log('Validated summary metrics:', validatedData);
              setSummaryMetrics(validatedData);
            } else {
              throw new Error('Invalid summary metrics data format');
            }
          } catch (error) {
            console.warn('Failed to fetch summary metrics, using mock data:', error);
            const mockData = {
              totalSales: 125000,
              totalOrders: 450,
              totalCustomers: 320,
              pendingOrders: 45,
              salesGrowth: 12.5,
              orderGrowth: 8.3,
              customerGrowth: 15.2
            };
            console.log('Using mock summary metrics:', mockData);
            setSummaryMetrics(mockData);
          } finally {
            setLoadingSummary(false);
          }
        };

        // Fetch order statistics
        const fetchOrderStats = async () => {
          setLoadingOrderStats(true);
          console.log('Fetching order statistics...');
          try {
            const data = await getOrderStats();
            console.log('Order statistics data received:', data);

            // Validate the data
            if (data && data.ordersByStatus && typeof data.ordersByStatus === 'object') {
              // Ensure all required fields are present
              const validatedData = {
                ordersByStatus: {
                  pending: data.ordersByStatus.pending || 0,
                  processing: data.ordersByStatus.processing || 0,
                  shipped: data.ordersByStatus.shipped || 0,
                  delivered: data.ordersByStatus.delivered || 0,
                  cancelled: data.ordersByStatus.cancelled || 0
                }
              };

              console.log('Validated order statistics:', validatedData);
              setOrderStats(validatedData);
            } else {
              throw new Error('Invalid order statistics data format');
            }
          } catch (error) {
            console.warn('Failed to fetch order stats, using mock data:', error);
            const mockData = {
              ordersByStatus: {
                pending: 45,
                processing: 120,
                shipped: 180,
                delivered: 85,
                cancelled: 20
              }
            };
            console.log('Using mock order statistics:', mockData);
            setOrderStats(mockData);
          } finally {
            setLoadingOrderStats(false);
          }
        };

        // Fetch sales data
        const fetchSalesData = async () => {
          setLoadingSalesData(true);
          try {
            const data = await getSalesAnalytics();
            setSalesData(data);
          } catch (error) {
            console.warn('Failed to fetch sales data, using mock data:', error);
            const mockData = [
              { month: 'Jan', sales: 4000 },
              { month: 'Feb', sales: 3000 },
              { month: 'Mar', sales: 5000 },
              { month: 'Apr', sales: 8000 },
              { month: 'May', sales: 7000 },
              { month: 'Jun', sales: 9000 },
              { month: 'Jul', sales: 11000 },
              { month: 'Aug', sales: 12000 },
              { month: 'Sep', sales: 14000 },
              { month: 'Oct', sales: 18000 },
              { month: 'Nov', sales: 20000 },
              { month: 'Dec', sales: 24000 }
            ];
            setSalesData(mockData);
          } finally {
            setLoadingSalesData(false);
          }
        };

        // Fetch customer statistics
        const fetchCustomerStats = async () => {
          setLoadingCustomerStats(true);
          try {
            const data = await getCustomerStats();
            setCustomerStats(data);
          } catch (error) {
            console.warn('Failed to fetch customer stats, using mock data:', error);
            const mockData = {
              totalCustomers: 320,
              newCustomers: 28,
              monthlyGrowth: [
                { month: 'Jan', customers: 120 },
                { month: 'Feb', customers: 140 },
                { month: 'Mar', customers: 160 },
                { month: 'Apr', customers: 190 },
                { month: 'May', customers: 210 },
                { month: 'Jun', customers: 230 },
                { month: 'Jul', customers: 250 },
                { month: 'Aug', customers: 270 },
                { month: 'Sep', customers: 290 },
                { month: 'Oct', customers: 300 },
                { month: 'Nov', customers: 310 },
                { month: 'Dec', customers: 320 }
              ]
            };
            setCustomerStats(mockData);
          } finally {
            setLoadingCustomerStats(false);
          }
        };

        // Fetch top products
        const fetchTopProducts = async () => {
          setLoadingTopProducts(true);
          try {
            console.log('Fetching top products data...');
            const data = await getTopProducts();
            console.log('Top products data received:', data);

            // Validate the data
            if (data && Array.isArray(data)) {
              // Ensure all required fields are present in each product
              const validatedData = data.map(product => ({
                _id: product._id || '',
                name: product.name || 'Unknown Product',
                sales: product.sales || 0,
                revenue: product.revenue || 0
              }));

              console.log('Validated top products data:', validatedData);
              setTopProducts(validatedData);
            } else {
              throw new Error('Invalid top products data format');
            }
          } catch (error) {
            console.error('Failed to fetch top products, using empty data:', error);
            // Instead of using mock data, use empty data to encourage fixing the API
            setTopProducts([]);
            // Show error in UI by setting loading state to false
          } finally {
            setLoadingTopProducts(false);
          }
        };

        // Fetch recent orders
        const fetchRecentOrders = async () => {
          setLoadingRecentOrders(true);
          try {
            const data = await getRecentOrders();
            setRecentOrders(data);
          } catch (error) {
            console.warn('Failed to fetch recent orders, using mock data:', error);
            const mockData = [
              { id: '1', customer: 'John Doe', amount: 2500, status: 'delivered', date: '2023-11-15' },
              { id: '2', customer: 'Jane Smith', amount: 1800, status: 'shipped', date: '2023-11-14' },
              { id: '3', customer: 'Robert Johnson', amount: 3200, status: 'processing', date: '2023-11-14' },
              { id: '4', customer: 'Emily Davis', amount: 950, status: 'pending', date: '2023-11-13' },
              { id: '5', customer: 'Michael Brown', amount: 1200, status: 'cancelled', date: '2023-11-12' }
            ];
            setRecentOrders(mockData);
          } finally {
            setLoadingRecentOrders(false);
          }
        };

        // Fetch category sales
        const fetchCategorySales = async () => {
          setLoadingCategorySales(true);
          try {
            const data = await getProductCategorySales();
            setCategorySales(data);
          } catch (error) {
            console.warn('Failed to fetch category sales, using mock data:', error);
            const mockData = [
              { category: 'Electronics', sales: 25000 },
              { category: 'Clothing', sales: 18000 },
              { category: 'Home & Kitchen', sales: 22000 },
              { category: 'Books', sales: 15000 },
              { category: 'Toys', sales: 12000 }
            ];
            setCategorySales(mockData);
          } finally {
            setLoadingCategorySales(false);
          }
        };

        // Call the fetchLowStockProducts function defined above

        // Execute all fetch functions in parallel
        await Promise.all([
          fetchSummaryMetrics(),
          fetchOrderStats(),
          fetchSalesData(),
          fetchCustomerStats(),
          fetchTopProducts(),
          fetchRecentOrders(),
          fetchCategorySales(),
          fetchLowStockProducts()
        ]);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchAllDashboardData();
  }, []);

  // Prepare data for order status pie chart
  const orderStatusData = Object.entries(orderStats.ordersByStatus).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count
  }));

  return (
    <div className="dashboard-container">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">Admin Dashboard</h1>
        <button className="refresh-button" onClick={() => window.location.reload()}>
          <i className="fas fa-sync-alt"></i> Refresh Data
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid-container">
        {/* Total Sales Card */}
        <div className="card">
          <div className="card-decoration"></div>
          <div className="card-content">
            <div className="card-header">
              <i className="fas fa-dollar-sign card-icon"></i>
              <h3 className="card-title">Total Sales</h3>
            </div>
            {loadingSummary ? (
              <div className="loading-container">
                <div className="spinner"></div>
              </div>
            ) : (
              <>
                <h2 className="card-value">${summaryMetrics.totalSales.toLocaleString()}</h2>
                <p className={`card-subtitle ${summaryMetrics.salesGrowth >= 0 ? 'trend-up' : 'trend-down'}`}>
                  <i className={`fas fa-${summaryMetrics.salesGrowth >= 0 ? 'arrow-up' : 'arrow-down'}`}></i>
                  {summaryMetrics.salesGrowth}% from last month
                </p>
              </>
            )}
          </div>
        </div>

        {/* Total Orders Card */}
        <div className="card">
          <div className="card-decoration"></div>
          <div className="card-content">
            <div className="card-header">
              <i className="fas fa-shopping-cart card-icon"></i>
              <h3 className="card-title">Total Orders</h3>
            </div>
            {loadingSummary ? (
              <div className="loading-container">
                <div className="spinner"></div>
              </div>
            ) : (
              <>
                <h2 className="card-value">{summaryMetrics.totalOrders.toLocaleString()}</h2>
                <p className={`card-subtitle ${summaryMetrics.orderGrowth >= 0 ? 'trend-up' : 'trend-down'}`}>
                  <i className={`fas fa-${summaryMetrics.orderGrowth >= 0 ? 'arrow-up' : 'arrow-down'}`}></i>
                  {summaryMetrics.orderGrowth}% from last month
                </p>
              </>
            )}
          </div>
        </div>

        {/* Total Customers Card */}
        <div className="card">
          <div className="card-decoration"></div>
          <div className="card-content">
            <div className="card-header">
              <i className="fas fa-users card-icon"></i>
              <h3 className="card-title">Total Customers</h3>
            </div>
            {loadingSummary ? (
              <div className="loading-container">
                <div className="spinner"></div>
              </div>
            ) : (
              <>
                <h2 className="card-value">{summaryMetrics.totalCustomers.toLocaleString()}</h2>
                <p className={`card-subtitle ${summaryMetrics.customerGrowth >= 0 ? 'trend-up' : 'trend-down'}`}>
                  <i className={`fas fa-${summaryMetrics.customerGrowth >= 0 ? 'arrow-up' : 'arrow-down'}`}></i>
                  {summaryMetrics.customerGrowth}% from last month
                </p>
              </>
            )}
          </div>
        </div>

        {/* Pending Orders Card */}
        <div className="card">
          <div className="card-decoration"></div>
          <div className="card-content">
            <div className="card-header">
              <i className="fas fa-exclamation-triangle card-icon" style={{ color: '#ff9800' }}></i>
              <h3 className="card-title">Pending Orders</h3>
            </div>
            {loadingSummary ? (
              <div className="loading-container">
                <div className="spinner"></div>
              </div>
            ) : (
              <>
                <h2 className="card-value">{summaryMetrics.pendingOrders.toLocaleString()}</h2>
                <p className="card-subtitle" style={{ color: '#ff9800' }}>
                  Requires attention
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid-container">
        {/* Monthly Sales Chart */}
        <div className="grid-item-half">
          <div className="card">
            <div className="card-content">
              <div className="dashboard-header">
                <h3 className="card-title">Monthly Sales</h3>
                <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Last 12 months</span>
              </div>
              {loadingSalesData ? (
                <div className="loading-container">
                  <div className="spinner"></div>
                </div>
              ) : (
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Sales']} />
                      <Bar dataKey="sales" fill="#1976d2" name="Sales ($)" radius={[4, 4, 0, 0]} barSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Status Pie Chart */}
        <div className="grid-item-half">
          <div className="card">
            <div className="card-content">
              <h3 className="card-title">Order Status</h3>
              {loadingOrderStats ? (
                <div className="loading-container">
                  <div className="spinner"></div>
                </div>
              ) : (
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={orderStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={90}
                        innerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                        paddingAngle={2}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {orderStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name.toLowerCase()] || COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [`${value} orders`, name]} />
                      <Legend layout="vertical" verticalAlign="middle" align="right" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Customer Growth Chart */}
      <div className="grid-container">
        <div className="grid-item-full">
          <div className="card">
            <div className="card-content">
              <div className="dashboard-header">
                <h3 className="card-title">Customer Growth</h3>
                <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                  {customerStats.newCustomers} new customers this month
                </span>
              </div>
              {loadingCustomerStats ? (
                <div className="loading-container">
                  <div className="spinner"></div>
                </div>
              ) : (
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={customerStats.monthlyGrowth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip formatter={(value) => [`${value.toLocaleString()} customers`]} />
                      <Line
                        type="monotone"
                        dataKey="customers"
                        stroke="#8884d8"
                        strokeWidth={3}
                        dot={{ r: 4, strokeWidth: 2 }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                        name="Customers"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid-container">
        {/* Top Products Table */}
        <div className="grid-item-half">
          <div className="card">
            <div className="card-content">
              <div className="dashboard-header">
                <h3 className="card-title">Top Selling Products</h3>
                <button className="btn btn-outline" onClick={() => navigate('/admin/products')}>
                  View All
                </button>
              </div>
              {loadingTopProducts ? (
                <div className="loading-container">
                  <div className="spinner"></div>
                </div>
              ) : (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th style={{ textAlign: 'right' }}>Sales</th>
                        <th style={{ textAlign: 'right' }}>Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topProducts.length > 0 ? (
                        topProducts.map((product, index) => (
                          <tr key={product._id}>
                            <td style={{ fontWeight: index === 0 ? 'bold' : 'normal' }}>
                              {product.name}
                              {index === 0 && product.sales > 0 && (
                                <span className="tag tag-top">TOP</span>
                              )}
                            </td>
                            <td style={{ textAlign: 'right' }}>{product.sales}</td>
                            <td style={{ textAlign: 'right', fontWeight: index === 0 ? 'bold' : 'normal' }}>
                              ${product.revenue.toLocaleString()}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" style={{ textAlign: 'center', padding: '20px' }}>
                            No sales data available yet. As orders are placed, top products will appear here.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="grid-item-half">
          <div className="card">
            <div className="card-content">
              <div className="dashboard-header">
                <h3 className="card-title">Recent Orders</h3>
                <button className="btn btn-outline" onClick={() => navigate('/admin/orders')}>
                  View All
                </button>
              </div>
              {loadingRecentOrders ? (
                <div className="loading-container">
                  <div className="spinner"></div>
                </div>
              ) : (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Customer</th>
                        <th style={{ textAlign: 'right' }}>Amount</th>
                        <th style={{ textAlign: 'right' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr key={order.id} onClick={() => navigate(`/admin/orders/${order.id}`)} style={{ cursor: 'pointer' }}>
                          <td>{order.date}</td>
                          <td>{order.customer}</td>
                          <td style={{ textAlign: 'right' }}>${order.amount.toLocaleString()}</td>
                          <td style={{ textAlign: 'right' }}>
                            <span className={`status-badge status-${order.status}`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Category Sales and Low Stock Products */}
      <div className="grid-container">
        {/* Category Sales */}
        <div className="grid-item-half">
          <div className="card">
            <div className="card-content">
              <div className="dashboard-header">
                <h3 className="card-title">Sales by Category</h3>
                <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                  Current Period
                </span>
              </div>
              {loadingCategorySales ? (
                <div className="loading-container">
                  <div className="spinner"></div>
                </div>
              ) : (
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categorySales} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis type="number" axisLine={false} tickLine={false} />
                      <YAxis
                        dataKey="category"
                        type="category"
                        width={120}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#666', fontSize: 12 }}
                      />
                      <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Sales']} />
                      <Bar
                        dataKey="sales"
                        fill="#82ca9d"
                        name="Sales ($)"
                        radius={[0, 4, 4, 0]}
                        barSize={20}
                      >
                        {categorySales.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={`rgba(130, 202, 157, ${0.5 + (index * 0.1)})`}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="grid-item-half">
          <div className="card">
            <div className="card-content">
              <div className="dashboard-header">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <h3 className="card-title" style={{ marginRight: '8px' }}>Low Stock Products</h3>
                  <span className="tag tag-critical">
                    {lowStockProducts.length} items
                  </span>
                </div>
                <button
                  className="btn btn-outline"
                  style={{ padding: '4px 8px', borderRadius: '50%' }}
                  onClick={() => fetchLowStockProducts()}
                >
                  <i className="fas fa-sync-alt"></i>
                </button>
              </div>
              {loadingLowStock ? (
                <div className="loading-container">
                  <div className="spinner"></div>
                </div>
              ) : (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th style={{ textAlign: 'right' }}>Stock</th>
                        <th style={{ textAlign: 'right' }}>Price</th>
                        <th style={{ textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lowStockProducts.map((product) => (
                        <tr key={product._id}>
                          <td style={{ fontWeight: product.stock <= 3 ? 'bold' : 'normal' }}>
                            {product.name}
                            {product.stock <= 3 && (
                              <span className="tag tag-critical">CRITICAL</span>
                            )}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <span className={`stock-indicator ${
                              product.stock <= 3 ? 'stock-critical' :
                              product.stock <= 5 ? 'stock-warning' : 'stock-low'
                            }`}>
                              {product.stock}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>${product.price}</td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              className="btn btn-primary"
                              onClick={() => handleOpenRestockDialog(product)}
                            >
                              Restock
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Restock Dialog */}
      {showRestockDialog && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Restock Product</h3>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>
                Enter the quantity to add to <strong>{restockProduct.productName}</strong>
              </p>
              <div className="form-group">
                <label className="form-label" htmlFor="quantity">Quantity</label>
                <input
                  id="quantity"
                  className="form-input"
                  type="number"
                  min="1"
                  value={restockProduct.quantity}
                  onChange={handleQuantityChange}
                  autoFocus
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn"
                onClick={handleCloseRestockDialog}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleRestockSubmit}
              >
                Restock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
