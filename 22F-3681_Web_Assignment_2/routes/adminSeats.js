const express = require("express");
const router = express.Router();
const Course = require("../models/course");

// GET: Seat Management Page
router.get("/", async (req, res) => {
    try {
        const courses = await Course.find();
        res.render("admin/seats", { courses });
    } catch (error) {
        console.error("Error fetching courses:", error);
        res.status(500).send("Failed to load seat management.");
    }
});

// POST: Update Seat Count
router.post("/update/:id", async (req, res) => {
    try {
        const { seatsAvailable } = req.body;
        await Course.findByIdAndUpdate(req.params.id, { seatsAvailable });
        res.redirect("/admin/seats");
    } catch (error) {
        console.error("Error updating seats:", error);
        res.status(500).send("Failed to update seats.");
    }
});

module.exports = router;
