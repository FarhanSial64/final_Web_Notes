const express = require("express");
const router = express.Router();
const Student = require("../models/student");
const Course = require("../models/course");

// 📌 Report 1: Get students registered for a specific course
router.get("/students/:courseId", async (req, res) => {
    try {
        const { courseId } = req.params;

        // Find the course and populate the registeredStudents field
        const course = await Course.findById(courseId).populate("registeredStudents", "name rollNumber");

        if (!course) {
            return res.status(404).json({ error: "Course not found" });
        }

        res.json(course.registeredStudents);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error fetching students" });
    }
});


// 📌 Report 2: Get courses with available seats
router.get("/courses/available", async (req, res) => {
    try {
        const courses = await Course.find({ seatsAvailable: { $gt: 0 } }).select("courseCode title seatsAvailable");

        console.log("Fetched Courses:", courses); // ✅ Debugging Log

        res.json(courses);
    } catch (err) {
        console.error("Server error fetching available courses:", err);
        res.status(500).json({ error: "Server error fetching courses" });
    }
});

// 📌 Report 3: Get students missing prerequisites
router.get("/courses/prerequisites", async (req, res) => {
    try {
        const courses = await Course.find().populate("prerequisites");

        const result = courses.map(course => ({
            courseCode: course.courseCode,
            title: course.title,
            seatsAvailable: course.seatsAvailable,
            prerequisites: course.prerequisites.map(prereq => ({
                courseCode: prereq.courseCode,
                title: prereq.title,
                seatsAvailable: prereq.seatsAvailable
            }))
        }));

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error fetching course prerequisites" });
    }
});

// 📌 Render Reports Page
router.get("/", async (req, res) => {
    try {
        const courses = await Course.find().select("courseCode title");
        res.render("admin/reports", { courses });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading reports page");
    }
});

module.exports = router;
