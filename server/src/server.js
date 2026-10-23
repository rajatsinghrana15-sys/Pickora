import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { User, Product, Order, Review, AffiliateClick } from "./models.js";

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "2mb" }));
app.use(
  "/api/auth",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 60,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);
const wrap = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
const signupSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(160),
  password: z.string().min(8).max(72),
});
const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(72),
});
const tokenFor = (user) =>
  jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
const auth = wrap(async (req, res, next) => {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer "))
    return res.status(401).json({ message: "Please sign in to continue." });
  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    req.user = await User.findById(payload.sub).select(
      "name email role isActive avatar",
    );
    if (!req.user || !req.user.isActive)
      return res
        .status(401)
        .json({ message: "Account not found or disabled." });
    if (req.user.name === ["Shop", "Ease Admin"].join("")) {
      req.user.name = "Pickora Admin";
      await req.user.save();
    }
    next();
  } catch {
    return res
      .status(401)
      .json({ message: "Your session expired. Please sign in again." });
  }
});
const admin = (req, res, next) =>
  req.user?.role === "admin"
    ? next()
    : res.status(403).json({ message: "Admin access required." });
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success)
    return res.status(400).json({
      message: result.error.issues[0].message,
      errors: result.error.flatten(),
    });
  req.body = result.data;
  next();
};

app.get("/api/health", (req, res) =>
  res.json({
    status: "ok",
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  }),
);
app.post(
  "/api/auth/register",
  validate(signupSchema),
  wrap(async (req, res) => {
    const email = req.body.email.toLowerCase();
    if (await User.exists({ email }))
      return res
        .status(409)
        .json({ message: "An account with this email already exists." });
    const password = await bcrypt.hash(req.body.password, 12);
    const user = await User.create({ name: req.body.name, email, password });
    res.status(201).json({
      token: tokenFor(user),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || "",
      },
    });
  }),
);
app.post(
  "/api/auth/login",
  validate(loginSchema),
  wrap(async (req, res) => {
    const user = await User.findOne({
      email: req.body.email.toLowerCase(),
    }).select("+password");
    if (
      !user ||
      !user.isActive ||
      !(await bcrypt.compare(req.body.password, user.password))
    )
      return res
        .status(401)
        .json({ message: "Email or password is incorrect." });
    res.json({
      token: tokenFor(user),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || "",
      },
    });
  }),
);
app.get("/api/auth/me", auth, (req, res) => res.json({ user: req.user }));
app.patch(
  "/api/users/me",
  auth,
  validate(
    z.object({
      name: z.string().trim().min(2).max(80),
      avatar: z
        .string()
        .max(1_500_000)
        .optional()
        .refine(
          (value) =>
            !value ||
            /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(
              value,
            ),
          "Upload a PNG, JPG, or WebP image under 1 MB.",
        ),
    }),
  ),
  wrap(async (req, res) => {
    req.user.name = req.body.name;

    if (typeof req.body.avatar === "string") {
      req.user.avatar = req.body.avatar;
    }

    await req.user.save();

    res.json({
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        avatar: req.user.avatar || "",
      },
    });
  }),
);
app.get(
  "/api/users",
  auth,
  admin,
  wrap(async (req, res) =>
    res.json({
      users: await User.find()
        .select("name email role isActive createdAt")
        .sort({ createdAt: -1 })
        .limit(100),
    }),
  ),
);
app.patch(
  "/api/users/:id/status",
  auth,
  admin,
  validate(z.object({ isActive: z.boolean() })),
  wrap(async (req, res) => {
    if (req.params.id === req.user.id)
      return res
        .status(400)
        .json({ message: "You cannot disable your own admin account." });
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: req.body.isActive },
      { new: true },
    ).select("name email role isActive");
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ user });
  }),
);
app.patch(
  "/api/admin/users/:id/password",
  auth,
  admin,
  validate(z.object({ password: z.string().min(12).max(72) })),
  wrap(async (req, res) => {
    if (req.params.id === req.user.id)
      return res.status(400).json({ message: "Use your own account security page to change your password." });
    const account = await User.findById(req.params.id).select("+password");
    if (!account) return res.status(404).json({ message: "User not found." });
    account.password = await bcrypt.hash(req.body.password, 12);
    await account.save();
    res.json({ message: "Temporary password set. Share it with the verified user through a secure channel." });
  }),
);
app.patch(
  "/api/users/me/password",
  auth,
  validate(z.object({ currentPassword: z.string().min(8).max(72), newPassword: z.string().min(12).max(72) })),
  wrap(async (req, res) => {
    const account = await User.findById(req.user.id).select("+password");
    if (!account || !(await bcrypt.compare(req.body.currentPassword, account.password)))
      return res.status(400).json({ message: "Current password is incorrect." });
    account.password = await bcrypt.hash(req.body.newPassword, 12);
    await account.save();
    res.json({ message: "Your password has been updated." });
  }),
);
app.post(
  "/api/admin/users/admin",
  auth,
  admin,
  validate(
    z.object({
      name: z.string().trim().min(2).max(80),
      email: z.string().trim().email().max(160),
      password: z.string().min(12).max(72),
    }),
  ),
  wrap(async (req, res) => {
    const email = req.body.email.toLowerCase();
    if (await User.exists({ email }))
      return res.status(409).json({ message: "An account with this email already exists." });
    const user = await User.create({
      name: req.body.name,
      email,
      password: await bcrypt.hash(req.body.password, 12),
      role: "admin",
    });
    res.status(201).json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role, isActive: user.isActive },
      message: "Admin account created.",
    });
  }),
);
const productInput = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().min(10).max(1500),
  category: z.string().trim().min(2).max(40),
  price: z.number().positive().max(1000000),
  image: z.string().url().max(500).refine((value) => /^https?:\/\//i.test(value), "Image must use an HTTP or HTTPS URL."),
  affiliateUrl: z.string().url().max(1000).refine((value) => /^https?:\/\//i.test(value), "Affiliate link must use an HTTP or HTTPS URL."),
  merchant: z.string().trim().min(2).max(80).default("Amazon India"),
  originalPrice: z.number().positive().max(1000000).optional(),
  stock: z.number().int().min(0).max(100000),
  featured: z.boolean().default(false),
});
app.get(
  "/api/admin/products",
  auth,
  admin,
  wrap(async (req, res) =>
    res.json({ products: await Product.find().sort({ createdAt: -1 }) }),
  ),
);
app.post(
  "/api/admin/products",
  auth,
  admin,
  validate(productInput),
  wrap(async (req, res) =>
    res.status(201).json({ product: await Product.create(req.body) }),
  ),
);
app.patch(
  "/api/admin/products/:id",
  auth,
  admin,
  validate(productInput.partial()),
  wrap(async (req, res) => {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product)
      return res.status(404).json({ message: "Product not found." });
    res.json({ product });
  }),
);
app.delete(
  "/api/admin/products/:id",
  auth,
  admin,
  wrap(async (req, res) => {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product)
      return res.status(404).json({ message: "Product not found." });
    await Review.deleteMany({ product: product._id });
    res.json({ message: "Product permanently deleted." });
  }),
);
app.patch(
  "/api/admin/products/:id/visibility",
  auth,
  admin,
  validate(z.object({ isActive: z.boolean() })),
  wrap(async (req, res) => {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: req.body.isActive },
      { new: true },
    );
    if (!product)
      return res.status(404).json({ message: "Product not found." });
    res.json({ product });
  }),
);
app.get(
  "/api/products",
  wrap(async (req, res) => {
    const filter = { isActive: true };
    if (req.query.category && req.query.category !== "All")
      filter.category = req.query.category;
    if (req.query.q)
      filter.$or = [
        {
          name: new RegExp(
            String(req.query.q)
              .slice(0, 60)
              .replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
            "i",
          ),
        },
        {
          description: new RegExp(
            String(req.query.q)
              .slice(0, 60)
              .replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
            "i",
          ),
        },
      ];
    const products = await Product.find(filter)
      .sort({ featured: -1, createdAt: -1 });
    res.json({ products });
  }),
);
app.get(
  "/api/products/:id",
  
  wrap(async (req, res) => {
    const product = await Product.findOne({
      _id: req.params.id,
      isActive: true,
    });
    if (!product)
      return res.status(404).json({ message: "Product not found." });
    res.json({ product });
  }),
);
app.get(
  "/api/products/:id/reviews",
  auth,
  wrap(async (req, res) => {
    const reviews = await Review.find({ product: req.params.id })
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ reviews });
  }),
);
app.post(
  "/api/products/:id/reviews",
  auth,
  validate(
    z.object({
      rating: z.number().int().min(1).max(5),
      comment: z.string().trim().min(5).max(1000),
    }),
  ),
  wrap(async (req, res) => {
    const product = await Product.findOne({
      _id: req.params.id,
      isActive: true,
    });
    if (!product)
      return res.status(404).json({ message: "Product not found." });
    const purchased = await Order.exists({
      user: req.user.id,
      status: "delivered",
      "items.product": product.id,
    });
    if (!purchased)
      return res.status(403).json({
        message: "You can review a product after its order is delivered.",
      });
    const review = await Review.findOneAndUpdate(
      { user: req.user.id, product: product.id },
      { $set: req.body },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    ).populate("user", "name");
    const ratings = await Review.aggregate([
      { $match: { product: product._id } },
      { $group: { _id: "$product", average: { $avg: "$rating" } } },
    ]);
    product.rating = ratings[0]?.average || product.rating;
    await product.save();
    res.status(201).json({ review });
  }),
);
app.post(
  "/api/affiliate-clicks",
  auth,
  validate(z.object({ productId: z.string().length(24) })),
  wrap(async (req, res) => {
    const product = await Product.findOne({
      _id: req.body.productId,
      isActive: true,
    });
    if (!product)
      return res.status(404).json({ message: "Product is no longer available." });
    await AffiliateClick.create({
      user: req.user.id,
      product: product.id,
      productName: product.name,
      image: product.image,
      merchant: product.merchant,
      affiliateUrl: product.affiliateUrl,
    });
    res.status(201).json({ message: "Affiliate click recorded." });
  }),
);
const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().length(24),
        quantity: z.number().int().min(1).max(20),
      }),
    )
    .min(1)
    .max(30),
  shippingAddress: z.object({
    fullName: z.string().trim().min(2).max(100),
    line1: z.string().trim().min(4).max(200),
    city: z.string().trim().min(2).max(80),
    postalCode: z.string().trim().min(3).max(20),
    country: z.string().trim().min(2).max(60),
  }),
});
app.post(
  "/api/orders",
  auth,
  validate(checkoutSchema),
  wrap(async (req, res) => {
    const quantities = new Map();
    for (const item of req.body.items)
      quantities.set(
        item.productId,
        (quantities.get(item.productId) || 0) + item.quantity,
      );
    const ids = [...quantities.keys()];
    const products = await Product.find({ _id: { $in: ids }, isActive: true });
    if (products.length !== new Set(ids).size)
      return res
        .status(400)
        .json({ message: "A product in your cart is no longer available." });
    const byId = new Map(products.map((product) => [product.id, product]));
    let total = 0;
    const items = ids.map((id) => {
      const product = byId.get(id),
        quantity = quantities.get(id);
      if (product.stock < quantity)
        throw Object.assign(
          new Error(`${product.name} does not have enough stock.`),
          { status: 409 },
        );
      total += product.price * quantity;
      return {
        product: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity,
      };
    });
    const deducted = [];
    try {
      for (const item of items) {
        const result = await Product.updateOne(
          { _id: item.product, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
        );
        if (!result.modifiedCount)
          throw Object.assign(
            new Error("Stock changed during checkout. Please try again."),
            { status: 409 },
          );
        deducted.push(item);
      }
      const shipping = total >= 75 ? 0 : 5.99;
      const order = await Order.create({
        user: req.user.id,
        items,
        shippingAddress: req.body.shippingAddress,
        paymentMethod: "cash_on_delivery",
        total: Math.round((total + shipping) * 100) / 100,
      });
      res.status(201).json({ order });
    } catch (error) {
      await Promise.all(
        deducted.map((item) =>
          Product.updateOne(
            { _id: item.product },
            { $inc: { stock: item.quantity } },
          ),
        ),
      );
      throw error;
    }
  }),
);
app.get(
  "/api/orders/mine",
  auth,
  wrap(async (req, res) =>
    res.json({
      orders: await Order.find({ user: req.user.id }).sort({ createdAt: -1 }),
    }),
  ),
);
app.patch(
  "/api/orders/:id/cancel",
  auth,
  wrap(async (req, res) => {
    const order = await Order.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.id,
        status: { $in: ["placed", "processing"] },
      },
      { $set: { status: "cancelled" } },
      { new: true },
    );
    if (!order) {
      const existing = await Order.findOne({
        _id: req.params.id,
        user: req.user.id,
      }).select("status");
      if (!existing)
        return res.status(404).json({ message: "Order not found." });
      return res.status(409).json({
        message:
          existing.status === "cancelled"
            ? "This order is already cancelled."
            : "This order can no longer be cancelled.",
      });
    }
    await Promise.all(
      order.items.map((item) =>
        Product.updateOne(
          { _id: item.product },
          { $inc: { stock: item.quantity } },
        ),
      ),
    );
    res.json({
      order,
      message: "Order cancelled. Items were returned to stock.",
    });
  }),
);
app.get(
  "/api/admin/orders",
  auth,
  admin,
  wrap(async (req, res) =>
    res.json({
      orders: await Order.find()
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .limit(100),
    }),
  ),
);
app.get(
  "/api/admin/affiliate-clicks",
  auth,
  admin,
  wrap(async (req, res) =>
    res.json({
      clicks: await AffiliateClick.find()
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .limit(500),
    }),
  ),
);
app.get(
  "/api/admin/reviews",
  auth,
  admin,
  wrap(async (req, res) => {
    const reviews = await Review.find()
      .populate("user", "name email")
      .populate("product", "name")
      .sort({ createdAt: -1 })
      .limit(500);
    res.json({ reviews });
  }),
);
app.patch(
  "/api/admin/orders/:id/status",
  auth,
  admin,
  validate(
    z.object({
      status: z.enum([
        "placed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ]),
    }),
  ),
  wrap(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found." });
    if (order.status === "cancelled" && req.body.status !== "cancelled")
      return res
        .status(409)
        .json({ message: "A cancelled order cannot be reopened." });
    if (req.body.status === "cancelled" && order.status !== "cancelled") {
      if (!["placed", "processing"].includes(order.status))
        return res.status(409).json({
          message: "Only placed or processing orders can be cancelled.",
        });
      await Promise.all(
        order.items.map((item) =>
          Product.updateOne(
            { _id: item.product },
            { $inc: { stock: item.quantity } },
          ),
        ),
      );
    }
    order.status = req.body.status;
    await order.save();
    res.json({ order });
  }),
);
app.use((req, res) => res.status(404).json({ message: "Route not found." }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || (err.code === 11000 ? 409 : 500)).json({
    message:
      err.code === 11000
        ? "This email is already registered."
        : err.status
          ? err.message
          : "Something went wrong. Please try again.",
  });
});

const start = async () => {
  if (
    !process.env.MONGODB_URI ||
    !process.env.JWT_SECRET ||
    process.env.JWT_SECRET.length < 32
  )
    throw new Error(
      "Set MONGODB_URI and a JWT_SECRET of at least 32 characters in server/.env",
    );
  await mongoose.connect(process.env.MONGODB_URI);
  const port = process.env.PORT || 5000;
  app.listen(port, () =>
    console.log(`Pickora API ready at http://localhost:${port}`),
  );
};
start().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
