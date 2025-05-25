import Project from '../models/Project.js';
import User from '../models/User.js';

// Create a project (client)
export const createProject = async (req, res) => {
  try {
    const project = await Project.create({ ...req.body, clientId: req.user.id });
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: 'Error creating project', error: err.message });
  }
};

// Get all projects (admin/freelancer/client with filters)
export const getProjects = async (req, res) => {
  try {
    const query = {};
    if (req.user.role === 'freelancer') {
      query.$or = [{ freelancerId: req.user.id }, { freelancerId: null }];
    } else if (req.user.role === 'client') {
      query.clientId = req.user.id;
    }
    const projects = await Project.find(query).populate('clientId freelancerId', 'name email');
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching projects', error: err.message });
  }
};
//get Single project
export const getSingleProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('clientId freelancerId', 'name email');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching project', error: err.message });
  }
};

// Assign a freelancer to a project
export const assignFreelancer = async (req, res) => {
  const { projectId } = req.params;
  const { freelancerId } = req.body;
  try {
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    project.freelancerId = freelancerId;
    project.status = 'in_progress';
    await project.save();
    res.json({ message: 'Freelancer assigned', project });
  } catch (err) {
    res.status(500).json({ message: 'Error assigning freelancer', error: err.message });
  }
};

// Update project status or progress
export const updateProject = async (req, res) => {
  const { projectId } = req.params;
  const updates = req.body;

  try {
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    Object.assign(project, updates); // This copies all fields from req.body to project
    await project.save();

    res.json({ message: 'Project updated', project });
  } catch (err) {
    res.status(500).json({ message: 'Error updating project', error: err.message });
  }
};



// Add a milestone
export const addMilestone = async (req, res) => {
  const { projectId } = req.params;
  const { title, dueDate } = req.body;
  try {
    const project = await Project.findById(projectId);
    project.milestones.push({ title, dueDate });
    await project.save();
    res.json({ message: 'Milestone added', milestones: project.milestones });
  } catch (err) {
    res.status(500).json({ message: 'Error adding milestone', error: err.message });
  }
};

// Log time (freelancer)
export const logTime = async (req, res) => {
  const { projectId } = req.params;
  const { date, hours } = req.body;
  try {
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!project.freelancerId || project.freelancerId.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not your project' });

    project.timeLogs.push({ date, hours });
    await project.save();
    res.json({ message: 'Time logged', timeLogs: project.timeLogs });
  } catch (err) {
    res.status(500).json({ message: 'Error logging time', error: err.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Optional: Check if the user is the owner
    if (req.user.role === 'client' && project.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this project' });
    }

    await project.remove();
    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
