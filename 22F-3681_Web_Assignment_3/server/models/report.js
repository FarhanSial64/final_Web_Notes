const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
    reportType: { type: String, enum: ['popularSubjects', 'sessionCompletionRates', 'platformUsageByCity', 'userGrowth'], required: true },
    dateRange: {
      startDate: { type: Date },
      endDate: { type: Date },
    },
    data: { type: Object }, // Store report-specific data (e.g., counts, percentages)
    generatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Report", reportSchema);