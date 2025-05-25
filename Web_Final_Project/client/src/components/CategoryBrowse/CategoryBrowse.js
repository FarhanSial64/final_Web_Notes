// src/components/CategoryBrowse/CategoryBrowse.js
import React, { forwardRef } from 'react';
import './CategoryBrowse.css';

const CategoryBrowse = forwardRef(({ categories, onSelectCategory }, ref) => {
  return (
    <section ref={ref} className="category-browse">
      <h2>Browse by Category</h2>
      <div className="category-grid">
        {categories.map((cat) => (
          <div
            key={cat}
            className="category-card"
            onClick={() => onSelectCategory(cat)}
          >
            <div className="category-icon">🍎</div> {/* Replace with proper icons later */}
            <p>{cat}</p>
          </div>
        ))}
      </div>
    </section>
  );
});

export default CategoryBrowse;
