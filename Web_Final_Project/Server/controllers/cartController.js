const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Add item to cart
exports.addToCart = async (req, res) => {
  const { productCode, quantity } = req.body;
  const userId = req.user.id;
  console.log('Adding to cart:', { productCode, quantity, userId });

  try {
    const product = await Product.findOne({ productCode });
    if (!product) {
      console.log('Product not found with code:', productCode);
      return res.status(404).json({ message: 'Product not found' });
    }

    console.log('Found product:', product._id);

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      console.log('Creating new cart for user:', userId);
      cart = new Cart({ user: userId, items: [] });
    }

    const itemIndex = cart.items.findIndex(item => item.product.toString() === product._id.toString());
    if (itemIndex > -1) {
      console.log('Updating existing item in cart');
      cart.items[itemIndex].quantity += quantity;
    } else {
      console.log('Adding new item to cart');
      cart.items.push({ product: product._id, quantity });
    }

    await cart.save();

    // Populate the cart items before sending the response
    const populatedCart = await Cart.findById(cart._id).populate('items.product');
    console.log('Sending back populated cart with items:', populatedCart.items.length);

    res.status(200).json(populatedCart);
  } catch (err) {
    console.error('Error adding to cart:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// View cart
exports.getCart = async (req, res) => {
    try {
        console.log('Getting cart for user:', req.user.id);
        let cart = await Cart.findOne({ user: req.user.id }).populate('items.product');

        if (!cart) {
            console.log('No cart found, creating new cart');
            cart = new Cart({ user: req.user.id, items: [] });
            await cart.save();
        } else {
            console.log('Cart found with items:', cart.items.length);
        }

        // Make sure we're sending back a properly populated cart
        if (cart.items && cart.items.length > 0) {
            console.log('Sending back cart with items:', cart.items.length);
            console.log('First item product:', cart.items[0].product);
        } else {
            console.log('Sending back empty cart');
        }

        res.json(cart);
    } catch (err) {
        console.error('Error getting cart:', err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Update cart item
exports.updateCartItem = async (req, res) => {
    const { productCode, quantity } = req.body;
    console.log('Updating cart item:', { productCode, quantity });

    try {
        const product = await Product.findOne({ productCode });
        if (!product) {
            console.log('Product not found with code:', productCode);
            return res.status(404).json({ message: 'Product not found' });
        }

        console.log('Found product:', product._id);

        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            console.log('Cart not found for user:', req.user.id);
            return res.status(404).json({ message: 'Cart not found' });
        }

        const item = cart.items.find(item => item.product.toString() === product._id.toString());
        if (!item) {
            console.log('Item not in cart');
            return res.status(404).json({ message: 'Item not in cart' });
        }

        console.log('Updating item quantity from', item.quantity, 'to', quantity);
        item.quantity = quantity;
        await cart.save();

        // Populate the cart items before sending the response
        const populatedCart = await Cart.findById(cart._id).populate('items.product');
        console.log('Sending back populated cart with items:', populatedCart.items.length);

        res.json(populatedCart);
    } catch (err) {
        console.error('Error updating cart item:', err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Remove item from cart
exports.removeCartItem = async (req, res) => {
    const productCode = req.params.productCode;
    console.log('Removing item with productCode:', productCode);

    try {
        const product = await Product.findOne({ productCode });
        if (!product) {
            console.log('Product not found with code:', productCode);
            return res.status(404).json({ message: 'Product not found' });
        }

        console.log('Found product:', product._id);

        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            console.log('Cart not found for user:', req.user.id);
            return res.status(404).json({ message: 'Cart not found' });
        }

        console.log('Original cart items:', cart.items.length);

        // Filter out the item to remove
        cart.items = cart.items.filter(item => item.product.toString() !== product._id.toString());

        console.log('Updated cart items:', cart.items.length);

        await cart.save();

        // Populate the cart items before sending the response
        const populatedCart = await Cart.findById(cart._id).populate('items.product');

        res.json(populatedCart);
    } catch (err) {
        console.error('Error removing cart item:', err);
        res.status(500).json({ message: 'Server Error' });
    }
};
