const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

// ================================
// 📥 GET /wishlist - Fetch Wishlist
// ================================
exports.getWishlist = async (req, res) => {
  try {
    console.log(`[GET] Fetching wishlist for user: ${req.user.id}`);

    const wishlist = await Wishlist.findOne({ user: req.user.id }).populate('items');

    if (!wishlist) {
      console.log('⚠️  No wishlist found. Returning empty array.');
      return res.json({ items: [] });
    }

    res.json({ items: wishlist.items });
  } catch (error) {
    console.error('❌ Error fetching wishlist:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============================================
// ➕ POST /wishlist/add - Add Product to Wishlist
// ============================================
exports.addToWishlist = async (req, res) => {
    const { productId } = req.body;

  try {
    console.log(`[ADD] Attempting to add productCode: ${productId} to user: ${req.user.id}`);

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user.id, items: [] });
    }

    // Check if the product is already in the wishlist
    const alreadyExists = wishlist.items.some((item) => item.equals(product._id));
    if (!alreadyExists) {
      wishlist.items.push(product._id);
      await wishlist.save();
      console.log('✅ Product added to wishlist.');
    } else {
      console.log('ℹ️  Product already in wishlist.');
    }
    const populatedWishlist = await Wishlist.findOne({user: req.user.id}).populate('items');
    res.json({ items: populatedWishlist.items });
  } catch (error) {
    console.error('❌ Error adding to wishlist:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// ===================================================
// ❌ DELETE /wishlist/remove - Remove Product from Wishlist
// ===================================================
exports.removeFromWishlist = async (req, res) => {
  const { productId } = req.body;

  try {
    console.log(`[REMOVE] Removing productId: ${productId} from user: ${req.user.id}`);

    const product = await Product.findById(productId);  // 🔧 FIXED HERE
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const wishlist = await Wishlist.findOneAndUpdate(
      { user: req.user.id },
      { $pull: { items: product._id } },
      { new: true }
    ).populate('items');

    console.log('✅ Product removed. Updated wishlist sent.');
    res.json({ items: wishlist ? wishlist.items : [] });
  } catch (error) {
    console.error('❌ Error removing from wishlist:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

