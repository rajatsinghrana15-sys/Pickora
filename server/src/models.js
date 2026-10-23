import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    isActive: { type: Boolean, default: true },
    avatar: { type: String, default: "" },
  },
  { timestamps: true },
);
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true, index: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, required: true },
    affiliateUrl: { type: String, required: true },
    merchant: { type: String, default: "Amazon India", trim: true, maxlength: 80 },
    originalPrice: { type: Number, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    rating: { type: Number, default: 4.7, min: 0, max: 5 },
    featured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: String,
        image: String,
        price: Number,
        quantity: Number,
      },
    ],
    shippingAddress: {
      fullName: String,
      line1: String,
      city: String,
      postalCode: String,
      country: String,
    },
    paymentMethod: {
      type: String,
      enum: ["cash_on_delivery"],
      default: "cash_on_delivery",
    },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["placed", "processing", "shipped", "delivered", "cancelled"],
      default: "placed",
    },
  },
  { timestamps: true },
);
const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 1000,
    },
  },
  { timestamps: true },
);
reviewSchema.index({ user: 1, product: 1 }, { unique: true });
const affiliateClickSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    productName: { type: String, required: true },
    image: { type: String, default: "" },
    merchant: { type: String, default: "Partner store" },
    affiliateUrl: { type: String, required: true },
  },
  { timestamps: true },
);
export const User = mongoose.model("User", userSchema);
export const Product = mongoose.model("Product", productSchema);
export const Order = mongoose.model("Order", orderSchema);
export const Review = mongoose.model("Review", reviewSchema);
export const AffiliateClick = mongoose.model("AffiliateClick", affiliateClickSchema);
