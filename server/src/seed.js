import "dotenv/config";
import mongoose from "mongoose";
import { Product, User } from "./models.js";
import bcrypt from "bcryptjs";

const products = [
  {
    name: "Studio Headphones",
    category: "Audio",
    price: 89,
    stock: 18,
    rating: 4.9,
    featured: true,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85",
    description:
      "Rich, balanced sound and soft over-ear cushions for your daily listening ritual.",
  },
  {
    name: "Everyday Camera",
    category: "Tech",
    price: 129,
    stock: 12,
    rating: 4.8,
    featured: true,
    image:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=85",
    description:
      "A compact camera made for collecting the little moments worth keeping.",
  },
  {
    name: "Soft Knit Throw",
    category: "Home",
    price: 58,
    stock: 25,
    rating: 4.7,
    featured: true,
    image:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=85",
    description:
      "A cloud-soft, textured throw that makes slow evenings feel even better.",
  },
  {
    name: "Sculpted Table Lamp",
    category: "Home",
    price: 74,
    stock: 10,
    rating: 4.8,
    featured: true,
    image:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=85",
    description:
      "Warm ambient light with a sculptural silhouette for your reading corner.",
  },
  {
    name: "Canvas Weekend Tote",
    category: "Style",
    price: 42,
    stock: 30,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=900&q=85",
    description:
      "Roomy, durable canvas with thoughtful pockets for all your everyday carry.",
  },
  {
    name: "Ceramic Pour-over Set",
    category: "Home",
    price: 36,
    stock: 22,
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=85",
    description:
      "Start the day slowly with a handmade-feel brewer and matching cup.",
  },
  {
    name: "Minimal Wristwatch",
    category: "Style",
    price: 115,
    stock: 8,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85",
    description:
      "Clean lines, a comfortable strap, and reliable timekeeping in one timeless piece.",
  },
  {
    name: "Pocket Bluetooth Speaker",
    category: "Audio",
    price: 64,
    stock: 16,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=900&q=85",
    description:
      "Take a room-filling soundtrack outdoors with a compact, travel-ready speaker.",
  },
  {
    name: "Daily Journal",
    category: "Style",
    price: 24,
    stock: 50,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=900&q=85",
    description:
      "A calm, tactile space for lists, plans, sketches, and everything in between.",
  },
  {
    name: "Desk Companion Stand",
    category: "Tech",
    price: 39,
    stock: 15,
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=85",
    description:
      "Give your workspace a little order with this tidy, adjustable device stand.",
  },
  {
    name: "Wireless Earbuds",
    category: "Audio",
    price: 79,
    stock: 24,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=900&q=85",
    description:
      "Lightweight wireless earbuds with clear sound for calls, music, and travel.",
  },
  {
    name: "Portable Record Player",
    category: "Audio",
    price: 149,
    stock: 7,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1461360228754-6e81c478b882?auto=format&fit=crop&w=900&q=85",
    description:
      "Bring your favorite records to life with this compact, easy-to-use player.",
  },
  {
    name: "Insulated Travel Mug",
    category: "Home",
    price: 28,
    stock: 35,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=900&q=85",
    description:
      "Keep your coffee warm on the go with a comfortable, leak-resistant travel mug.",
  },
  {
    name: "Woven Storage Basket",
    category: "Home",
    price: 46,
    stock: 14,
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1593085260707-5377ba37f868?auto=format&fit=crop&w=900&q=85",
    description:
      "A versatile woven basket that brings practical storage and natural texture home.",
  },
  {
    name: "Linen Cushion Cover",
    category: "Home",
    price: 32,
    stock: 20,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=900&q=85",
    description:
      "Refresh your favorite chair or sofa with a soft, breathable linen cushion cover.",
  },
  {
    name: "Leather Card Holder",
    category: "Style",
    price: 34,
    stock: 19,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=900&q=85",
    description:
      "A slim everyday card holder crafted to keep your essentials close at hand.",
  },
  {
    name: "Classic Sunglasses",
    category: "Style",
    price: 55,
    stock: 13,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=85",
    description:
      "A timeless frame with a lightweight fit for bright days and weekend escapes.",
  },
  {
    name: "Everyday Backpack",
    category: "Style",
    price: 88,
    stock: 11,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85",
    description:
      "A roomy, comfortable backpack designed for commutes, classes, and short trips.",
  },
  {
    name: "Compact Bluetooth Keyboard",
    category: "Tech",
    price: 69,
    stock: 17,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=85",
    description:
      "A compact wireless keyboard that keeps your desk tidy and your typing comfortable.",
  },
  {
    name: "Wireless Charging Pad",
    category: "Tech",
    price: 31,
    stock: 28,
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1591290619762-c588fc3d5a94?auto=format&fit=crop&w=900&q=85",
    description:
      "A simple charging pad for keeping compatible devices powered up on your desk.",
  },
  {
    name: "Foldable Laptop Stand",
    category: "Tech",
    price: 44,
    stock: 21,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=900&q=85",
    description:
      "Raise your screen to a more comfortable height with this portable laptop stand.",
  },
];

async function seed() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing from your backend .env file.");
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB.");

  // Products are inserted or updated by name, so running the seed repeatedly
  // will not create duplicate products.
  await Product.bulkWrite(
  products.map((product) => ({
      updateOne: {
        filter: { name: product.name },
        update: { $set: { ...product, merchant: "Amazon India", affiliateUrl: `https://www.amazon.in/s?k=${encodeURIComponent(product.name)}` } },
        upsert: true,
      },
    })),
  );

  // Create the admin if configured. Admin password comes from .env.
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    const email = process.env.ADMIN_EMAIL.toLowerCase();
    let admin = await User.findOne({ email });

    if (!admin) {
      admin = await User.create({
        name: "Pickora Admin",
        email,
        password: await bcrypt.hash(process.env.ADMIN_PASSWORD, 12),
        role: "admin",
      });
    } else if (admin.name === ["Shop", "Ease Admin"].join("")) {
      admin.name = "Pickora Admin";
      await admin.save();
    }

    console.log(`Admin ready: ${email}`);
  }

  console.log(`Seeded/updated ${products.length} products.`);
}

try {
  await seed();
} catch (error) {
  console.error("Seed failed:", error.message);
  process.exitCode = 1;
} finally {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}
