const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const Admin = require("../models/admin");
const Student = require("../models/student");

router.get("/login", (req, res) => {
    res.render("auth/login");
});

router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        let user = await Admin.findOne({ username });
        if (!user) {
            user = await Student.findOne({ rollNumber: username });
        }

        if (!user) {
            return res.status(400).send("User not found");
        }

        if (password !== user.password) return res.status(400).send("Invalid credentials");

        if (user.username) {
            return res.redirect("/admin/adminDashboard");
        } else {
            return res.redirect("/student/studentDashboard");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
});

module.exports = router;
