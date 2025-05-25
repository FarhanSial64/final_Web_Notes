async function fetchStudents() {
    const courseId = document.getElementById("courseSelect").value;
    if (!courseId) {
        alert("Please select a course first!");
        return;
    }
    try {
        const res = await fetch(`/admin/reports/students/${courseId}`);
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        const students = await res.json();
        if (students.length === 0) {
            document.getElementById("studentsTable").innerHTML = "<p>No students registered for this course.</p>";
        } else {
            let tableHTML = `
                <table>
                    <thead>
                        <tr>
                            <th>Roll Number</th>
                            <th>Student Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${students.map(s => `
                            <tr>
                                <td>${s.rollNumber}</td>
                                <td>${s.name}</td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            `;
            document.getElementById("studentsTable").innerHTML = tableHTML;
        }
    } catch (err) {
        console.error("Error fetching students:", err);
        document.getElementById("studentsTable").innerHTML = "<p>Error fetching students.</p>";
    }
}

async function fetchAvailableCourses() {
    try {
        const res = await fetch(`/admin/reports/courses/available`);
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        const courses = await res.json();
        if (courses.length === 0) {
            document.getElementById("availableCoursesTable").innerHTML = "<p>No courses have available seats.</p>";
        } else {
            let tableHTML = `
                <table>
                    <thead>
                        <tr>
                            <th>Course Code</th>
                            <th>Course Name</th>
                            <th>Available Seats</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${courses.map(c => `
                            <tr>
                                <td>${c.courseCode}</td>
                                <td>${c.title}</td>
                                <td>${c.seatsAvailable}</td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            `;
            document.getElementById("availableCoursesTable").innerHTML = tableHTML;
        }
    } catch (err) {
        console.error("Error fetching available courses:", err);
        document.getElementById("availableCoursesTable").innerHTML = "<p>Error fetching courses.</p>";
    }
}

async function fetchCoursePrereqs() {
    try {
        const res = await fetch(`/admin/reports/courses/prerequisites`);
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

        const courses = await res.json();

        if (courses.length === 0) {
            document.getElementById("coursePrereqsTable").innerHTML = "<p>No courses found.</p>";
            return;
        }

        let tableHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Course Code</th>
                        <th>Course Name</th>
                        <th>Seats Available</th>
                        <th>Prerequisite Code</th>
                        <th>Prerequisite Name</th>
                        <th>Prerequisite Seats</th>
                    </tr>
                </thead>
                <tbody>
                    ${courses.map(course => {
                        if (course.prerequisites.length === 0) {
                            return `
                                <tr>
                                    <td>${course.courseCode}</td>
                                    <td>${course.title}</td>
                                    <td>${course.seatsAvailable}</td>
                                    <td>No Prerequisites</td>
                                    <td>No Prerequisites</td>
                                    <td>No Prerequisites</td>
                                </tr>
                            `;
                        } else {
                            return course.prerequisites.map(prereq => `
                                <tr>
                                    <td>${course.courseCode}</td>
                                    <td>${course.title}</td>
                                    <td>${course.seatsAvailable}</td>
                                    <td>${prereq.courseCode}</td>
                                    <td>${prereq.title}</td>
                                    <td>${prereq.seatsAvailable}</td>
                                </tr>
                            `).join("");
                        }
                    }).join("")}
                </tbody>
            </table>
        `;

        document.getElementById("coursePrereqsTable").innerHTML = tableHTML;
    } catch (err) {
        console.error("Error fetching course prerequisites:", err);
        document.getElementById("coursePrereqsTable").innerHTML = "<p>Error fetching course prerequisites.</p>";
    }
}