import mongoose from 'mongoose';

const milestoneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ["pending", "completed"], default: "pending" },
});

const timeLogSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  hours: { type: Number, required: true },
});

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String },
  budget: { type: Number, required: true },
  deadline: { type: Date, required: true },
  isHourly: { type: Boolean, default: false },
  milestones: { type: [milestoneSchema], default: [] },
  timeLogs: { type: [timeLogSchema], default: [] },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'completed', 'cancelled'],
    default: 'open',
  },
  progress: { type: Number, default: 0 },
}, { timestamps: true });

const Project = mongoose.model('Project', projectSchema);
export default Project;
