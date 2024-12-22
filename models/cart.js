const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  products: [
    {
      productId: { type: String, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, default: 1 }
    },
  ],
});

module.exports = mongoose.model("Cart", CartSchema); 