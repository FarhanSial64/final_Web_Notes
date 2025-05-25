import { useState, useEffect } from 'react';
import { getProducts } from '../services/ProductServices';

const useCategories = () => {
  const [categories, setCategories] = useState(['All']);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getProducts({ page: 1, limit: 1000 });
        const products = response?.products || [];
        const uniqueCategories = ['All', ...new Set(products.map(p => p.category))];
        setCategories(uniqueCategories);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    fetchCategories();
  }, []);

  return categories;
};

export default useCategories;
