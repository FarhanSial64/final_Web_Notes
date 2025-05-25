const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ['student', 'tutor', 'admin'], required: true },

    // Common fields
    firstName: { type: String },
    lastName: { type: String },
    profilePicture: { type: String }, // Store image URL or file path
    bio: { type: String },
    location: { type: String }, // City or "online"

    // Tutor-specific fields
    subjects: [{ type: String }], // Subjects they teach
    hourlyRate: { type: Number }, // Hourly rate in $
    availability: [
        {
            day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
            times: [{ type: String }] // Example: ["10:00", "14:00"]
        }
    ], // { "Monday": ["10:00", "12:00"] }
    teachingPreferences: { type: String, enum: ['online', 'in-person', 'both'] },
    qualifications: [{ type: String }], // List of degrees/certifications

    // Verification (for admins)
    verificationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    verificationComments: { type: String },
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
