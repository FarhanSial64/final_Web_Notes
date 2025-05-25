import React, { useState } from 'react';
import {
  Paper,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Slider,
  Button
} from '@mui/material';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

const NavbarBottom = ({ onApplyFilters, onShopByCategoryClick ,categories = [] }) => {
  const [showFilterCard, setShowFilterCard] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    category: 'All',
    search: '',
    priceRange: [0, 1000],
  });

  const navigate = useNavigate();

  const handleApply = () => {
    onApplyFilters(localFilters);
    setShowFilterCard(false);
  };

  return (
    <Box className="navbar-bottom" sx={{ position: 'relative' }}>
      <div className="left-section">
        <button className="category-btn" onClick={onShopByCategoryClick}>☰ Shop by Category</button>
        <nav className="page-nav">
          <a href="#">Deals Today</a>
          <a href="#">Special Prices</a>
          <a href="#">Fresh</a>
          <a href="#">Frozen</a>
          <a href="#">Demos</a>
          <a onClick={() => navigate('/orders/history')} style={{ cursor: 'pointer' }}>Order History</a>
          <a onClick={() => navigate('/contact')} style={{ cursor: 'pointer' }}>Contact</a>
        </nav>
      </div>

      <div className="right-section">
        <button
          className="apply-filters-btn"
          onClick={() => setShowFilterCard(prev => !prev)}
        >
          Apply Filters
        </button>

        {showFilterCard && (
          <ClickAwayListener onClickAway={() => setShowFilterCard(false)}>
            <Paper
              elevation={4}
              sx={{
                position: 'absolute',
                top: '100%',
                right: 0,
                width: 300,
                zIndex: 2000,
                p: 2,
                mt: 1,
                borderRadius: 2,
                backgroundColor: '#fff'
              }}
            >
              <Box display="flex" flexDirection="column" gap={2}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={localFilters.category}
                    label="Category"
                    onChange={e =>
                      setLocalFilters(prev => ({
                        ...prev,
                        category: e.target.value
                      }))
                    }
                    MenuProps={{
                      disablePortal: true,
                      PaperProps: {
                        sx: { zIndex: 2501 }
                      }
                    }}
                  >
                    <MenuItem value="All">All</MenuItem>
                    {categories.map(cat => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  label="Search"
                  variant="outlined"
                  value={localFilters.search}
                  onChange={e =>
                    setLocalFilters(prev => ({
                      ...prev,
                      search: e.target.value
                    }))
                  }
                />

                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Price Range</span>
                    <span>
                      ₹{localFilters.priceRange[0]} - ₹{localFilters.priceRange[1]}
                    </span>
                  </Box>
                  <Slider
                    value={localFilters.priceRange}
                    min={0}
                    max={1000}
                    step={10}
                    valueLabelDisplay="auto"
                    onChange={(_, newVal) =>
                      setLocalFilters(prev => ({
                        ...prev,
                        priceRange: newVal
                      }))
                    }
                  />
                </Box>

                <Button variant="contained" onClick={handleApply}>
                  Apply
                </Button>
              </Box>
            </Paper>
          </ClickAwayListener>
        )}
      </div>
    </Box>
  );
};

export default NavbarBottom;
