import User from '../models/User.js';
import Project from '../models/Project.js';
import Bid from '../models/Bid.js';
import Review from '../models/Review.js';
import { exportToCSV, exportToPDF } from '../utils/exportHelper.js';
import path from 'path';

// Helper: last X days range
const getDateNDaysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

const handleExport = (res, data, fileName, format) => {
  try {
    let filePath;
    if (format === 'csv') {
      filePath = exportToCSV(data, fileName);
    } else if (format === 'pdf') {
      filePath = exportToPDF(data, fileName);
    }

    return res.download(filePath);
  } catch (err) {
    return res.status(500).json({ message: `Error exporting ${fileName}`, error: err.message });
  }
};

export const getPlatformStats = async (req, res) => {
  try {
    const [totalUsers, totalFreelancers, totalClients] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'freelancer' }),
      User.countDocuments({ role: 'client' })
    ]);

    const totalProjects = await Project.countDocuments();
    const totalBids = await Bid.countDocuments();
    const totalReviews = await Review.countDocuments();
    const completedProjects = await Project.countDocuments({ status: 'completed' });

    const data = [{
      totalUsers,
      totalFreelancers,
      totalClients,
      totalProjects,
      totalBids,
      totalReviews,
      completedProjects
    }];

    if (req.query.export) {
      return handleExport(res, data, 'platform_stats', req.query.export);
    }

    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching platform stats', error: err.message });
  }
};

export const getSkillPopularity = async (req, res) => {
  try {
    const result = await User.aggregate([
      { $match: { role: 'freelancer' } },
      { $unwind: '$skills' },
      { $group: { _id: '$skills', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    if (req.query.export) {
      return handleExport(res, result, 'skill_popularity', req.query.export);
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching skill popularity', error: err.message });
  }
};

export const getRevenueStats = async (req, res) => {
  try {
    const result = await Project.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$budget' },
          avgProjectBudget: { $avg: '$budget' }
        }
      }
    ]);

    const data = result.length > 0 ? [result[0]] : [{ totalRevenue: 0, avgProjectBudget: 0 }];

    if (req.query.export) {
      return handleExport(res, data, 'revenue_stats', req.query.export);
    }

    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching revenue stats', error: err.message });
  }
};

export const getSignupTrends = async (req, res) => {
  try {
    const since = getDateNDaysAgo(30);
    const result = await User.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          signups: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    if (req.query.export) {
      return handleExport(res, result, 'signup_trends', req.query.export);
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching signup trends', error: err.message });
  }
};

export const getProjectPostingTrends = async (req, res) => {
  try {
    const since = getDateNDaysAgo(30);
    const result = await Project.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          projects: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    if (req.query.export) {
      return handleExport(res, result, 'project_posting_trends', req.query.export);
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching project trends', error: err.message });
  }
};
