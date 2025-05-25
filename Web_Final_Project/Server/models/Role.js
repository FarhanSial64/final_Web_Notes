// models/Role.js
const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // admin, salesman, customer
  permissions: [{ type: String }] // e.g., ["create_product", "view_orders"]
});

module.exports = mongoose.model('Role', RoleSchema);
