import Bid from '../models/Bid.js';
import Project from '../models/Project.js';

export const placeBid = async (req, res) => {
  const { projectId, proposal, bidAmount } = req.body;
  const freelancerId = req.user._id;

  try {
    const bid = await Bid.create({ projectId, freelancerId, proposal, bidAmount });
    res.status(201).json({ message: 'Bid placed successfully', bid });
  } catch (error) {
    res.status(500).json({ message: 'Error placing bid', error: error.message });
  }
};

export const getBidsByProject = async (req, res) => {
  const { projectId } = req.params;

  try {
    const bids = await Bid.find({ projectId }).populate('freelancerId', 'name skills');
    res.json(bids);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bids', error: error.message });
  }
};

export const getMyBids = async (req, res) => {
  const freelancerId = req.user._id;

  try {
    const bids = await Bid.find({ freelancerId }).populate('projectId', 'title status');
    res.json(bids);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching your bids', error: error.message });
  }
};

export const updateBid = async (req, res) => {
  const { bidId } = req.params;
  const { proposal, bidAmount } = req.body;

  try {
    const bid = await Bid.findById(bidId);
    if (!bid) return res.status(404).json({ message: 'Bid not found' });

    if (String(bid.freelancerId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to update this bid' });
    }

    bid.proposal = proposal || bid.proposal;
    bid.bidAmount = bidAmount || bid.bidAmount;
    await bid.save();

    res.json({ message: 'Bid updated successfully', bid });
  } catch (error) {
    res.status(500).json({ message: 'Error updating bid', error: error.message });
  }
};

export const counterBid = async (req, res) => {
  const { bidId } = req.params;
  const { counterOffer } = req.body;

  try {
    const bid = await Bid.findById(bidId);
    if (!bid) return res.status(404).json({ message: 'Bid not found' });

    bid.counterOffer = counterOffer;
    await bid.save();

    res.json({ message: 'Counter offer sent', bid });
  } catch (error) {
    res.status(500).json({ message: 'Error sending counter offer', error: error.message });
  }
};

export const updateBidStatus = async (req, res) => {
  const { bidId } = req.params;
  const { status } = req.body;

  if (!["accepted", "rejected"].includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  try {
    const bid = await Bid.findById(bidId);
    if (!bid) return res.status(404).json({ message: 'Bid not found' });

    bid.status = status;
    await bid.save();

    res.json({ message: `Bid ${status}`, bid });
  } catch (error) {
    res.status(500).json({ message: 'Error updating bid status', error: error.message });
  }
};
