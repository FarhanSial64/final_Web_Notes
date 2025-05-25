// controllers/reviewController.js
import Review from '../models/Review.js';

export const createReview = async (req, res) => {
  try {
    const { projectId, freelancerId, rating, comment } = req.body;

    const review = new Review({
      projectId,
      freelancerId,
      clientId: req.user.id,
      rating,
      comment,
    });

    await review.save();
    res.status(201).json({ message: 'Review submitted', review });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create review', error: err.message });
  }
};

export const getFreelancerReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ freelancerId: req.params.freelancerId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch reviews', error: err.message });
  }
};

export const respondToReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { freelancerResponse } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    if (review.freelancerId.toString() !== req.user.id)
      return res.status(403).json({ message: 'Unauthorized' });

    review.freelancerResponse = freelancerResponse;
    await review.save();

    res.json({ message: 'Response added', review });
  } catch (err) {
    res.status(500).json({ message: 'Failed to respond', error: err.message });
  }
};

export const getAllReviews = async (req, res) => {
    try {
      const reviews = await Review.find()
        .populate('clientId', 'name email')
        .populate('freelancerId', 'name email')
        .populate('projectId', 'title');
  
      res.status(200).json(reviews);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching reviews', error: error.message });
    }
};