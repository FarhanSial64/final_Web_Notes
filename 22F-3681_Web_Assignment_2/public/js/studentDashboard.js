document.addEventListener("DOMContentLoaded", function () {
    // Sample Courses (Replace with API Call)
    const courses = [
        { name: "Data Structures", department: "CS", level: "200", time: "10:00 AM" },
        { name: "Machine Learning", department: "CS", level: "300", time: "12:00 PM" },
        { name: "Physics", department: "EE", level: "100", time: "9:00 AM" },
    ];

    const searchBtn = document.getElementById("search-btn");
    const courseResults = document.querySelector(".course-results");

    searchBtn.addEventListener("click", function () {
        const department = document.getElementById("department-filter").value;
        const level = document.getElementById("level-filter").value;
        const time = document.getElementById("time-filter").value;

        const filteredCourses = courses.filter(course =>
            (department ? course.department === department : true) &&
            (level ? course.level === level : true) &&
            (time ? course.time.includes(time) : true)
        );

        courseResults.innerHTML = filteredCourses.length
            ? filteredCourses.map(course => `<p>${course.name} (${course.time})</p>`).join("")
            : "<p>No courses found</p>";
    });
});
