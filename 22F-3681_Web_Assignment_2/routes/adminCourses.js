const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Course = require("../models/course");
const Student = require("../models/student");

// 🚀 GET all courses (Render EJS page)
router.get("/", async (req, res) => {
    try {
        const courses = await Course.find().populate("prerequisites", "title");
        console.log("Courses:", courses);
        res.render("admin/courses", { courses, editingCourse: null }); // Pass editingCourse: null
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

// 🚀 POST a new course (CREATE)
router.post("/add", async (req, res) => {
    try {
        console.log("Received Data:", req.body);
        console.log("Raw Prerequisites:", req.body.prerequisites);

        const { courseCode, courseName, seatsAvailable, department, startTime, endTime, prerequisites, days } = req.body;

        let prerequisiteIds = [];
        if (prerequisites) {
            const selectedCourses = await Course.find({ courseCode: { $in: prerequisites } }, "_id"); // Use prerequisites directly
            prerequisiteIds = selectedCourses.map(course => course._id);
        }

        console.log("Converted Prerequisites to IDs:", prerequisiteIds);

        const daysArray = Array.isArray(days) ? days : (days ? [days] : []);

        // Time Conflict Check (as before)
        const conflictingCourses = await Course.find({
            days: { $in: daysArray },
            $or: [
                { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
            ],
        });

        if (conflictingCourses.length > 0) {
            return res.status(400).send("Time conflict: Another course is scheduled at the same time on the same day.");
        }

        const newCourse = new Course({
            courseCode,
            title: courseName,
            seatsAvailable,
            prerequisites: prerequisiteIds,
            days: daysArray,
            startTime,
            endTime,
            department,
        });

        await newCourse.save();
        console.log("Course Added Successfully:", newCourse);
        res.redirect("/admin/courses");

    } catch (error) {
        console.error("Error adding course:", error);
        res.status(500).send("Failed to add course.");
    }
});


router.get("/update/:id", async (req, res) => {
    try {
        const editingCourse = await Course.findById(req.params.id).populate('prerequisites');
        const courses = await Course.find().populate('prerequisites');
        res.render("admin/courses", { courses, editingCourse });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

// Route to update an existing course
router.post("/update/:id", async (req, res) => {
    try {
        const { courseCode, courseName, seatsAvailable, department, days, startTime, endTime, prerequisites } = req.body;

        const prerequisiteIds = [];
        if (prerequisites && prerequisites.length > 0) {
            const selectedCourses = await Course.find({ courseCode: { $in: prerequisites } }, "_id");
            prerequisiteIds = selectedCourses.map(course => course._id);
        }

        await Course.findByIdAndUpdate(req.params.id, {
            courseCode,
            title: courseName,
            seatsAvailable,
            department,
            days: Array.isArray(days) ? days : (days ? [days] : []),
            startTime,
            endTime,
            prerequisites: prerequisiteIds,
        });

        res.redirect("/admin/courses");
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

// 🚀 POST to delete a course
router.post("/delete/:id", async (req, res) => {
    try {
        const courseId = req.params.id;

        let objectId;
        try {
            objectId = new mongoose.Types.ObjectId(courseId);
        } catch (err) {
            console.error("Invalid courseId:", err);
            return res.status(400).send("Invalid courseId");
        }

        const course = await Course.findById(objectId);
        if (!course) {
            return res.status(404).send("Course not found");
        }

        const result = await Student.updateMany(
            { registeredCourses: objectId },
            { $pull: { registeredCourses: objectId } }
        );

        console.log("Updated Students:", result);

        const deletedCourse = await Course.findByIdAndDelete(objectId);
        console.log("Deleted Course:", deletedCourse);

        res.redirect("/admin/courses");
    } catch (err) {
        console.error("Error deleting course:", err);
        res.status(500).send("Server error");
    }
});


module.exports = router;
