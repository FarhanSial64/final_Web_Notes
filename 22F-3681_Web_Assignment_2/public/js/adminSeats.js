document.getElementById('searchInput').addEventListener('input', function () {
    let filter = this.value.toLowerCase();
    let rows = document.querySelectorAll("#courseTableBody tr");

    rows.forEach(row => {
        let courseCode = row.cells[0].textContent.toLowerCase();
        let courseName = row.cells[1].textContent.toLowerCase();
        row.style.display = (courseCode.includes(filter) || courseName.includes(filter)) ? "" : "none";
    });
});