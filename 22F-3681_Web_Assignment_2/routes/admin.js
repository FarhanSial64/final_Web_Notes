const express = require("express");
const router = express.Router(); // Define router

router.get("/adminDashboard", (req, res) => {
    res.render("admin/adminDashboard");
});

module.exports = router;
