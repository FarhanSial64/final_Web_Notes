const express = require("express");
const session = require("express-session"); // Import session
const path = require("path");
const connectDB = require("./config/db");
require("dotenv").config();

const app = express();

app.use(express.json()); // ✅ Parse JSON bodies
app.use(express.urlencoded({ extended: true }));
// Connect Database
connectDB();

// Middleware
app.use(express.urlencoded({ extended: false }));


// Set View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/auth", require("./routes/auth"));
app.use("/admin", require("./routes/admin"));  
app.use("/admin/courses", require("./routes/adminCourses")); 
app.use("/admin/seats", require("./routes/adminSeats"));
app.use("/admin/reports", require("./routes/reports"));

const studentRoutes = require("./routes/student");
app.use("/student", studentRoutes);

const adminRoutes = require("./routes/adminStudent");  // Import admin routes
app.use("/admin", adminRoutes);

// Admin Dashboard
app.get("/admin/adminDashboard", (req, res) => {
    res.render("admin/adminDashboard");
});

// Student Dashboard
app.get("/student/studentDashboard", (req, res) => {
    res.render("student/studentDashboard");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
