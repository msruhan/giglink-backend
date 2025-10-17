import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./src/routes/authRoutes.js";
import testProtectedRoute from "./src/routes/testProtectedRoute.js";
import userRoutes from "./src/routes/userRoutes.js";
import productRoutes from "./src/routes/productRoutes.js";
import workshopRoutes from "./src/routes/workshopRoutes.js";
import technicianRoutes from "./src/routes/technicianRoutes.js";
import licenseRoutes from "./src/routes/licenseRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root endpoint
app.get("/", (req, res) => {
  res.json({ message: "GIGLINK API running..." });
});

// Test endpoint
app.post("/api/test", (req, res) => {
  console.log("📩 Test route hit:", req.body);
  res.json({ message: "POST received", body: req.body });
});

// Protected test route
app.use("/api/test", testProtectedRoute);

// Routes
app.use("/api/auth", authRoutes);

// User routes
app.use("/api/users", userRoutes);

// Product routes
app.use("/api/products", productRoutes);

// Workshop routes
app.use("/api/workshops", workshopRoutes);

// Technician routes
app.use("/api/technicians", technicianRoutes);

// License routes
app.use("/api/licenses", licenseRoutes);

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
