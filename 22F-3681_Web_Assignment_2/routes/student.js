const express = require("express");
const router = express.Router();
const Student = require("../models/student"); // Assuming Student model exists
const Course = require("../models/course"); // Assuming Course model exists

// Student Dashboard
router.get("/studentDashboard", async (req, res) => {
    try {
        const courses = await Course.find();

        res.render("student/studentDashboard", { courses }); 
    } catch (error) {
        console.error("🔥 Error fetching courses:", error);
        res.status(500).send("Failed to load student dashboard.");
    }
});

router.post("/register", async (req, res) => {
    try {
        const { courseId, rollNumber } = req.body; 
        if (!courseId || !rollNumber) {
            return res.status(400).json({ success: false, message: "Course ID and Roll Number are required" });
        }

        // Find student by roll number
        const student = await Student.findOne({ rollNumber });
        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        // Find course by ID
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }

        if (course.seatsAvailable <= 0) {
            return res.status(400).json({ success: false, message: "No seats available" });
        }

        // Check if student is already registered
        if (student.registeredCourses.includes(course._id)) {
            return res.status(400).json({ success: false, message: "Already registered for this course" });
        }

        // Register student in course
        course.registeredStudents.push(student._id);
        course.seatsAvailable -= 1;
        await course.save();

        // Register course in student profile
        student.registeredCourses.push(course._id);
        await student.save();

        res.json({ success: true, message: "Successfully registered" });
    } catch (error) {
        console.error("🔥 Registration error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

router.post("/drop", async (req, res) => {
    try {
        const { courseId, rollNumber } = req.body;

        if (!courseId || !rollNumber) {
            return res.status(400).json({ success: false, message: "Course ID and Roll Number are required" });
        }

        // Find student by roll number
        const student = await Student.findOne({ rollNumber });
        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        // Find course by ID
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }

        // Check if student is registered in the course
        if (!student.registeredCourses.includes(course._id)) {
            return res.status(400).json({ success: false, message: "Not registered in this course" });
        }

        // Remove student from course
        course.registeredStudents = course.registeredStudents.filter(id => id.toString() !== student._id.toString());
        course.seatsAvailable += 1;
        await course.save();

        // Remove course from student profile
        student.registeredCourses = student.registeredCourses.filter(id => id.toString() !== course._id.toString());
        await student.save();

        res.json({ success: true, message: "Successfully dropped the course" });
    } catch (error) {
        console.error("🔥 Drop error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});


router.get("/schedule/:rollNumber", async (req, res) => {
    try {
        console.log("API Called");
        const { rollNumber } = req.params;

        if (!rollNumber) {
            return res.status(400).json({ error: "Roll number is required" });
        }

        console.log("API check rollNumber", rollNumber);
        const student = await Student.findOne({ rollNumber }).populate("registeredCourses");
        if (!student) {
            return res.status(404).json({ error: "Student not found" });
        }

        const studentSchedule = [];

        student.registeredCourses.forEach(course => {
            if (course.days && course.days.length > 0 && course.startTime) {
                course.days.forEach(day => {
                    studentSchedule.push({
                        day: day,
                        time: course.startTime,
                        courseTitle: course.title
                    });
                });
            }
        });

        console.log("API extract schedule", studentSchedule);
        res.json(studentSchedule);
        console.log("API Ended");
    } catch (error) {
        console.error("Error fetching schedule:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.get("/prerequisites/:rollNumber", async (req, res) => {
    try {
        const { rollNumber } = req.params;

        const student = await Student.findOne({ rollNumber }).populate({
            path: 'registeredCourses',
            populate: {
                path: 'prerequisites'
            }
        });

        if (!student) {
            return res.status(404).json({ error: "Student not found" });
        }

        const courses = student.registeredCourses.map(course => ({
            courseCode: course.courseCode,
            title: course.title,
            seatsAvailable: course.seatsAvailable,
            prerequisites: course.prerequisites.map(prereq => ({
                courseCode: prereq.courseCode,
                title: prereq.title,
                seatsAvailable: prereq.seatsAvailable
            }))
        }));

        res.json(courses);
    } catch (error) {
        console.error("Error fetching prerequisites:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Logout Route
router.get("/logout", (req, res) => {
        res.redirect("/auth/login");
});

module.exports = router;
