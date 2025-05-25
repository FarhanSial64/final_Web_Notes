import React, { useEffect, useState, useRef, useCallback } from 'react';
import HeroSection from '../../components/HeroSection/HeroSection';
import ProductCard from '../../components/Product/ProductCard';
import Navbar from '../../components/Navbar/Navbar';
import NavbarTop from '../../components/Navbar/NavbarTop'; // ✅ added
import NavbarBottom from '../../components/Navbar/NavbarBottom';
import Footer from '../../components/Footer/Footer';
import CategoryBrowse from '../../components/CategoryBrowse/CategoryBrowse';


import {
  CircularProgress,
  Box,
  Typography,
  Skeleton,
  Fab,
} from '@mui/material';

import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

import './ProductPage.css';
import { getProducts } from '../../services/ProductServices';
import useCategories from '../../hooks/useCategories';

const ProductPage = () => {
  const [visibleProducts, setVisibleProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const categoryRef = useRef(null);

  const categories = useCategories();
  const itemsPerLoad = 20;
  const observer = useRef();

  const [filters, setFilters] = useState({
    category: 'All',
    search: '',
    priceRange: [0, 1000],
  });

  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);

  const [sortOption, setSortOption] = useState('');

  const handleApplyFilters = newFilters => {
    setFilters(newFilters);
  };

  const fetchProducts = useCallback(async (pageNum = 1, reset = false) => {
    try {
      const response = await getProducts({
        page: pageNum,
        limit: itemsPerLoad,
        category: filters.category,
        search: filters.search,
        sort: sortOption,
        minPrice: filters.priceRange[0],
        maxPrice: filters.priceRange[1],
      });

      const products = Array.isArray(response?.products) ? response.products : [];
      const total = typeof response?.total === 'number' ? response.total : 0;

      if (reset) {
        setVisibleProducts(products);
      } else {
        setVisibleProducts(prev => [...prev, ...products]);
      }

      setTotalProducts(total);
      setHasMore(pageNum * itemsPerLoad < total);
    } catch (error) {
      console.error('Error fetching products:', error);
      setVisibleProducts([]);
      setTotalProducts(0);
      setHasMore(false);
    } finally {
      setIsLoadingInitial(false);
    }
  }, [itemsPerLoad, filters, sortOption]);

  useEffect(() => {
    setPage(1);
    setIsLoadingInitial(true);
    fetchProducts(1, true);
  }, [filters, sortOption, fetchProducts]);

  useEffect(() => {
    if (page === 1) return;
    fetchProducts(page);
  }, [page, fetchProducts]);

  useEffect(() => {
    const loadPriceMeta = async () => {
      try {
        const response = await getProducts({ page: 1, limit: 1000 });
        const products = Array.isArray(response?.products) ? response.products : [];

        const prices = products.map(p => p.price);
        const min = Math.min(...prices);
        const max = Math.max(...prices);

        setMinPrice(min);
        setMaxPrice(max);
        setFilters(prev => ({
          ...prev,
          priceRange: [min, max],
        }));
      } catch (err) {
        console.error('Error loading price meta:', err);
      }
    };
    loadPriceMeta();
  }, []);

  const lastProductRef = useCallback(
    node => {
      if (isLoadingMore || isLoadingInitial) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMore) {
          setIsLoadingMore(true);
          setTimeout(() => {
            setPage(prev => prev + 1);
            setIsLoadingMore(false);
          }, 800);
        }
      });

      if (node) observer.current.observe(node);
    },
    [isLoadingMore, isLoadingInitial, hasMore]
  );

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <div className="product-page">
      <NavbarTop
        onSearch={({ search, category }) =>
          setFilters(prev => ({
            ...prev,
            search,
            category,
          }))
        }
      />
      <Navbar />
      <NavbarBottom
        onApplyFilters={handleApplyFilters}
        categories={categories.filter(c => c !== 'All')}
        onShopByCategoryClick={() => {
          categoryRef.current?.scrollIntoView({ behavior: 'smooth' });
        }}
      />


      <HeroSection />

      <CategoryBrowse
        ref={categoryRef}
        categories={categories.filter(c => c !== 'All')}
        onSelectCategory={(cat) => setFilters(prev => ({ ...prev, category: cat }))}
      />  

      <div className="product-section">
        {isLoadingInitial ? (
          <Box className="skeleton-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <Box key={i} className="product-card-wrapper">
                <Skeleton variant="rectangular" height={200} />
                <Skeleton variant="text" height={30} />
                <Skeleton variant="text" width="60%" />
              </Box>
            ))}
          </Box>
        ) : visibleProducts.length > 0 ? (
          visibleProducts.map((product, index) => {
            const isLast = index === visibleProducts.length - 1;
            return (
              <div
                key={product._id}
                ref={isLast ? lastProductRef : null}
                className="product-card-wrapper"
              >
                <ProductCard product={product} />
              </div>
            );
          })
        ) : (
          <Typography>No products found.</Typography>
        )}

        {isLoadingMore && (
          <Box className="scroll-loader">
            <CircularProgress size={30} thickness={4} />
          </Box>
        )}
      </div>

      {showScrollTop && (
        <Fab
          color="primary"
          size="small"
          onClick={scrollToTop}
          sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}
        >
          <KeyboardArrowUpIcon />
        </Fab>
      )}

      <Footer />
    </div>
  );
};

export default ProductPage;
