// scripts/initRoles.js
const mongoose = require('mongoose');
const Role = require('../models/Role');
const dotenv = require('dotenv');
const connectDB = require('../config/db');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Define default roles
const defaultRoles = [
  { name: 'admin', permissions: ['manage_users', 'manage_products', 'manage_orders'] },
  { name: 'customer', permissions: ['view_products', 'place_orders', 'view_own_orders'] },
  { name: 'salesman', permissions: ['view_products', 'manage_orders'] }
];

// Initialize roles
const initRoles = async () => {
  try {
    console.log('Checking for existing roles...');
    const existingRoles = await Role.find();
    
    if (existingRoles.length === 0) {
      console.log('No roles found. Creating default roles...');
      await Role.insertMany(defaultRoles);
      console.log('Default roles created successfully!');
    } else {
      console.log(`Found ${existingRoles.length} existing roles. No need to create defaults.`);
      
      // Log existing roles
      existingRoles.forEach(role => {
        console.log(`- ${role.name} (${role._id}): ${role.permissions.join(', ')}`);
      });
    }
    
    // Exit process
    process.exit(0);
  } catch (error) {
    console.error('Error initializing roles:', error);
    process.exit(1);
  }
};

// Run the initialization
initRoles();
