// MyProjects.jsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Modal,
  TextField,
  IconButton,
} from '@mui/material';
import { toast } from 'react-toastify';
import CloseIcon from '@mui/icons-material/Close';
import './MyProjects.css';

const MyProjects = () => {
  const [projects, setProjects] = useState([]);
  const [bids, setBids] = useState({});
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 3;

  const [filterStatus, setFilterStatus] = useState('all');

  const [openEditModal, setOpenEditModal] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    status: '',
    budget: '',
    deadline: '',
    category: '',
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await axios.get('http://localhost:5005/api/projects', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(res.data);
      console.log('Projects:', res.data);
      fetchBidsForProjects(res.data);
    } catch {
      toast.error('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchBidsForProjects = async (projects) => {
    const bidData = {};
    for (const project of projects) {
      try {
        const res = await axios.get(`http://localhost:5004/api/bids/project/${project._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        bidData[project._id] = res.data;
        console.log(`Bids for project ${project._id}:`, res.data); // Inspect bid data
      } catch {
        toast.error(`Failed to fetch bids for project ${project.title}`);
      }
    }
    setBids(bidData);
    console.log("Current bids state:", bidData);
  };

  const handleAssignFreelancer = async (projectId, freelancerId) => {
    try {
      await axios.put(
        `http://localhost:5005/api/projects/${projectId}/assign`,
        { freelancerId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Freelancer assigned successfully');
      fetchProjects();
    } catch {
      toast.error('Error assigning freelancer');
    }
  };

  const handlePageChange = (event, value) => setCurrentPage(value);

  const handleFilterChange = (event) => {
    setFilterStatus(event.target.value);
    setCurrentPage(1);
  };

  const handleCancelProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to cancel/delete this project?')) return;
    try {
      await axios.delete(`http://localhost:5005/api/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Project cancelled/deleted');
      fetchProjects();
    } catch {
      toast.error('Failed to cancel/delete project');
    }
  };

  const handleEditProject = (project) => {
    setCurrentProject(project);
    setEditForm({
      title: project.title || '',
      description: project.description || '',
      status: project.status || '',
      budget: project.budget || '',
      deadline: project.deadline?.split('T')[0] || '',
      category: project.category || '',
    });
    setOpenEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async () => {
    try {
      await axios.put(
        `http://localhost:5005/api/projects/${currentProject._id}`,
        editForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Project updated successfully');
      setOpenEditModal(false);
      fetchProjects();
    } catch {
      toast.error('Failed to update project');
    }
  };

  const filteredProjects = projects.filter(
    (project) => filterStatus === 'all' || project.status === filterStatus
  );
  const indexOfLastProject = currentPage * projectsPerPage;
  const currentProjects = filteredProjects.slice(indexOfLastProject - projectsPerPage, indexOfLastProject);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="70vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="my-projects-container" p={3}>
      <Typography variant="h4" gutterBottom>My Projects</Typography>

      <FormControl sx={{ minWidth: 200, mb: 3 }}>
        <InputLabel>Status Filter</InputLabel>
        <Select value={filterStatus} onChange={handleFilterChange} label="Status Filter">
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="open">Open</MenuItem>
          <MenuItem value="in_progress">In Progress</MenuItem>
          <MenuItem value="completed">Completed</MenuItem>
          <MenuItem value="cancelled">Cancelled</MenuItem>
        </Select>
      </FormControl>

      {currentProjects.length === 0 ? (
        <Typography>No projects found for this status.</Typography>
      ) : (
        currentProjects.map((project) => (
          <Card key={project._id} sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6">{project.title}</Typography>
              <Typography>Status: {project.status}</Typography>
              <Typography>Description: {project.description}</Typography>
              <Typography>Category: {project.category}</Typography>
              <Typography>Budget: ${project.budget}</Typography>
              <Typography>Deadline: {project.deadline?.split('T')[0]}</Typography>

              <Typography mt={2} fontWeight="bold">Bids:</Typography>
              {bids[project._id] && Array.isArray(bids[project._id]) && bids[project._id].length > 0 ? (
                bids[project._id].map((bid) => (
                  <Box key={bid._id} sx={{ p: 1, border: '1px solid #ccc', my: 1, borderRadius: 1 }}>
                    {/* Handle freelancerId properly whether it's an object or string */}
                    <Typography><strong>Freelancer:</strong> {
                      typeof bid.freelancerId === 'object' && bid.freelancerId !== null
                        ? (bid.freelancerId.name || 'Unknown Freelancer')
                        : bid.freelancerId
                    }</Typography>
                    <Typography><strong>Proposal:</strong> {bid.proposal}</Typography>
                    <Typography><strong>Bid Amount:</strong> ${bid.bidAmount}</Typography>
                    <Typography><strong>Status:</strong> {bid.status}</Typography>
                    {!project.freelancerId && (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleAssignFreelancer(
                          project._id,
                          typeof bid.freelancerId === 'object' && bid.freelancerId !== null
                            ? bid.freelancerId._id
                            : bid.freelancerId
                        )}
                        sx={{ mt: 1 }}
                      >
                        Assign Freelancer
                      </Button>
                    )}
                  </Box>
                ))
              ) : (
                <Typography>No bids yet.</Typography>
              )}

              <Box display="flex" gap={2} mt={2}>
                <Button variant="outlined" color="secondary" onClick={() => handleCancelProject(project._id)}>
                  Cancel Project
                </Button>
                <Button variant="outlined" color="primary" onClick={() => handleEditProject(project)}>
                  Edit Project
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))
      )}

      <Pagination
        className="pagination-wrapper"
        count={Math.ceil(filteredProjects.length / projectsPerPage)}
        page={currentPage}
        onChange={handlePageChange}
        color="primary"
        sx={{ mt: 2 }}
      />

      <Modal open={openEditModal} onClose={() => setOpenEditModal(false)}>
        <Box className="edit-project-modal">
          <IconButton
            onClick={() => setOpenEditModal(false)}
            sx={{ position: 'absolute', right: 16, top: 16 }}
          >
            <CloseIcon />
          </IconButton>

          <Typography variant="h6" gutterBottom>Edit Project</Typography>

          <TextField
            label="Title"
            name="title"
            value={editForm.title}
            onChange={handleEditChange}
            fullWidth
            margin="normal"
          />

          <TextField
            label="Description"
            name="description"
            value={editForm.description}
            onChange={handleEditChange}
            fullWidth
            margin="normal"
            multiline
          />

          <TextField
            label="Deadline"
            type="date"
            name="deadline"
            value={editForm.deadline}
            onChange={handleEditChange}
            fullWidth
            margin="normal"
            // Using slotProps instead of deprecated InputLabelProps
            slotProps={{ input: { shrink: true } }}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Category</InputLabel>
            <Select
              name="category"
              value={editForm.category}
              onChange={handleEditChange}
              label="Category"
            >
              <MenuItem value="web-development">Web Development</MenuItem>
              <MenuItem value="mobile-development">Mobile Development</MenuItem>
              <MenuItem value="design">Design</MenuItem>
              <MenuItem value="writing">Writing</MenuItem>
              <MenuItem value="marketing">Marketing</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Budget"
            name="budget"
            value={editForm.budget}
            onChange={handleEditChange}
            fullWidth
            margin="normal"
            type="number"
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={editForm.status}
              onChange={handleEditChange}
              label="Status"
            >
              <MenuItem value="open">Open</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            color="primary"
            onClick={handleEditSubmit}
            sx={{ mt: 2 }}
          >
            Save Changes
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default MyProjects;