document.getElementById('searchInput').addEventListener('input', function () {
    let filter = this.value.toLowerCase();
    let rows = document.querySelectorAll("#studentTableBody tr");

    rows.forEach(row => {
        let rollNumber = row.cells[0].textContent.toLowerCase();
        let studentName = row.cells[1].textContent.toLowerCase();
        row.style.display = (rollNumber.includes(filter) || studentName.includes(filter)) ? "" : "none";
    });
});