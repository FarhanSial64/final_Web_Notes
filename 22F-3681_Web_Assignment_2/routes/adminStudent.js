const express = require("express");
const router = express.Router();
const Student = require("../models/student"); // Assuming you have a Student model
const Course = require("../models/course");   // Assuming you have a Course model

// View all students and their enrolled courses
router.get("/students", async (req, res) => {
    try {
        const courses = await Course.find(); // Fetch all courses first
        const students = await Student.find(); // Fetch students separately

        // Manually map courses to students
        const studentsWithCourses = students.map(student => {
            return {
                ...student._doc, // Spread student data
                registeredCourses: student.registeredCourses.map(courseId => 
                    courses.find(course => course._id.equals(courseId)) || {}
                ) // Map ObjectIds to actual course details
            };
        });

        res.render("admin/adminStudent", { students: studentsWithCourses, courses }); // Pass students with courses
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});


// Register a student for a course
router.post("/students/register/:studentId", async (req, res) => {
    try {
        const studentId = req.params.studentId;  // ✅ Correct extraction
        const { courseId } = req.body;  // ✅ Ensure courseId is coming in req.body

        console.log("Received POST request to register student.");
        console.log("Student ID:", studentId);
        console.log("Course ID:", courseId);

        const student = await Student.findById(studentId);
        const course = await Course.findById(courseId);

        if (!student || !course) {
            console.log("Error: Student or Course not found");
            return res.status(404).send("Student or Course not found");
        }

        // Prevent duplicate registration
        if (student.registeredCourses.includes(course._id)) {
            console.log("Error: Student is already registered in this course");
            return res.status(400).send("Student is already registered in this course");
        }

        // Check seat availability
        if (course.seatsAvailable > 0) {
            console.log("Registering student...");
            student.registeredCourses.push(course._id);
            course.registeredStudents.push(student._id);  // ✅ Also add student to the course
            course.seatsAvailable--;

            await student.save();
            await course.save();

            console.log("Student successfully registered.");
            res.redirect("/admin/students");  // ✅ Redirect back
        } else {
            console.log("Error: No seats available");
            res.status(400).send("No seats available");
        }
    } catch (err) {
        console.error("Server Error:", err);
        res.status(500).send("Server Error");
    }
});





// Drop a student from a course
router.post("/students/drop/:studentId", async (req, res) => {
    const studentId = req.params.studentId;  // ✅ Correct extraction
    const { courseId } = req.body;
    
    console.log("Received Drop Request");
    console.log("Student ID:", studentId);
    console.log("Course ID:", courseId);

    try {
        const student = await Student.findById(studentId);
        const course = await Course.findById(courseId);

        if (!student || !course) {
            console.log("Error: Student or Course not found");
            return res.status(404).send("Student or Course not found");
        }

        // Remove course reference from student
        student.registeredCourses = student.registeredCourses.filter(id => id.toString() !== courseId);
        
        // Remove student reference from course
        course.registeredStudents = course.registeredStudents.filter(id => id.toString() !== studentId);
        
        // Increase seat count
        course.seatsAvailable++;

        await student.save();
        await course.save();

        console.log("Student successfully dropped from course.");
        res.redirect("/admin/students");
    } catch (err) {
        console.error("Server Error:", err);
        res.status(500).send("Server Error");
    }
});


module.exports = router;
