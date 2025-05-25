import React from 'react';
import './WishlistDrawer.css';
import { FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const WishlistDrawer = ({ isOpen, wishlist, onRemove }) => {
  const navigate = useNavigate();

  return (
    <div className={`wishlist-drawer ${isOpen ? 'open' : ''}`}>
      <div className="drawer-header">
        <h4>My Wishlist</h4>
        <span onClick={() => navigate('/wishlist')} className="view-all">View All</span>
      </div>
      <div className="drawer-items">
        {wishlist.length === 0 ? (
          <div className="empty-msg">Your wishlist is empty.</div>
        ) : (
          wishlist.map(item => (
            <div key={item._id} className="wishlist-item">
              <img src={item.product.thumbnail} alt={item.product.name} />
              <div className="item-details">
                <span>{item.product.name}</span>
                <button onClick={() => onRemove(item._id)}><FaTrash /></button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WishlistDrawer;
