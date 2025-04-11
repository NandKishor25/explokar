
import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { fileURLToPath } from 'url';
import Trip from '../models/Trip.js';
import Comment from '../models/Comment.js';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure Multer for trip image uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Create a new trip
     // Create a new trip (without image upload)
router.post('/create', async (req, res) => {
  try {
    const {
      title,
      startLocation,
      destination,
      startDate,
      duration,
      maxParticipants,
      preferredGender,
      transportMode,
      description,
      budget,
      activities,
      userId
    } = req.body;

    // Get user info for creator
    const user = await User.findOne({ uid: userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create the trip without image
    const newTrip = new Trip({
      title,
      startLocation,
      destination,
      startDate,
      duration: parseInt(duration),
      maxParticipants: parseInt(maxParticipants),
      preferredGender: preferredGender || 'any',
      transportMode: transportMode || '',
      description,
      budget: budget ? parseInt(budget) : undefined,
      activities,
      userId,
      participants: [] // Initially empty, creator is not a participant
    });

    await newTrip.save();

    // Add creator info to response
    const tripWithCreator = {
      ...newTrip._doc,
      createdBy: {
        name: user.name,
        photoURL: user.photoURL,
        email: user.email
      }
    };

    res.status(201).json(tripWithCreator);
  } catch (error) {
    console.error('Error creating trip:', error);
    res.status(500).json({ message: 'Server error' });
  }
});                                                                            
// Get all trips
router.get('/', async (req, res) => {
  try {
    const trips = await Trip.find().sort({ createdAt: -1 });
    
    // Get creator info for each trip
    const tripsWithCreatorInfo = await Promise.all(trips.map(async (trip) => {
      const creator = await User.findOne({ uid: trip.userId });
      return {
        ...trip._doc,
        createdBy: {
          name: creator ? creator.name : 'Unknown',
          photoURL: creator ? creator.photoURL : '',
          email: creator ? creator.email : ''
        }
      };
    }));
    
    res.status(200).json(tripsWithCreatorInfo);
  } catch (error) {
    console.error('Error fetching trips:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get trip by ID
router.get('/:id', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    
    // Get creator info
    const creator = await User.findOne({ uid: trip.userId });
    
    const tripWithCreator = {
      ...trip._doc,
      createdBy: {
        name: creator ? creator.name : 'Unknown',
        photoURL: creator ? creator.photoURL : '',
        email: creator ? creator.email : ''
      }
    };
    
    res.status(200).json(tripWithCreator);
  } catch (error) {
    console.error('Error fetching trip:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get trips by user ID
router.get('/user/:uid', async (req, res) => {
  try {
    const trips = await Trip.find({ userId: req.params.uid }).sort({ createdAt: -1 });
    
    // Get creator info for each trip
    const tripsWithCreatorInfo = await Promise.all(trips.map(async (trip) => {
      const creator = await User.findOne({ uid: trip.userId });
      return {
        ...trip._doc,
        createdBy: {
          name: creator ? creator.name : 'Unknown',
          photoURL: creator ? creator.photoURL : ''
        }
      };
    }));
    
    res.status(200).json(tripsWithCreatorInfo);
  } catch (error) {
    console.error('Error fetching user trips:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search trips
router.get('/search', async (req, res) => {
  try {
    const { startLocation, destination, startDate, transportMode, preferredGender } = req.query;
    
    const query = {};
    
    // Add search criteria if provided
    if (startLocation) query.startLocation = { $regex: startLocation, $options: 'i' };
    if (destination) query.destination = { $regex: destination, $options: 'i' };
    if (startDate) {
      const date = new Date(startDate);
      query.startDate = { $gte: date };
    }
    if (transportMode) query.transportMode = transportMode;
    if (preferredGender && preferredGender !== 'any') {
      query.preferredGender = { $in: [preferredGender, 'any'] };
    }
    
    const trips = await Trip.find(query).sort({ startDate: 1 });
    
    // Get creator info for each trip
    const tripsWithCreatorInfo = await Promise.all(trips.map(async (trip) => {
      const creator = await User.findOne({ uid: trip.userId });
      return {
        ...trip._doc,
        createdBy: {
          name: creator ? creator.name : 'Unknown',
          photoURL: creator ? creator.photoURL : ''
        }
      };
    }));
    
    res.status(200).json(tripsWithCreatorInfo);
  } catch (error) {
    console.error('Error searching trips:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update trip
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    
    // Check if user is the creator
    if (trip.userId !== req.body.userId) {
      return res.status(403).json({ message: 'Not authorized to update this trip' });
    }
    
    // Update image if provided
    if (req.file) {
      // Delete old image from Cloudinary if exists
      if (trip.imagePublicId) {
        await cloudinary.uploader.destroy(trip.imagePublicId);
      }
      
      // Upload new image
      const result = await cloudinary.uploader.upload(req.file.path);
      trip.imageUrl = result.secure_url;
      trip.imagePublicId = result.public_id;
    }
    
    // Update other fields
    const fieldsToUpdate = [
      'title', 'startLocation', 'destination', 'startDate', 'duration',
      'maxParticipants', 'preferredGender', 'transportMode', 'description',
      'budget', 'activities'
    ];
    
    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined) {
        // Parse numbers
        if (['duration', 'maxParticipants', 'budget'].includes(field)) {
          trip[field] = parseInt(req.body[field]);
        } else {
          trip[field] = req.body[field];
        }
      }
    });
    
    await trip.save();
    
    // Get creator info
    const creator = await User.findOne({ uid: trip.userId });
    
    const updatedTrip = {
      ...trip._doc,
      createdBy: {
        name: creator ? creator.name : 'Unknown',
        photoURL: creator ? creator.photoURL : '',
        email: creator ? creator.email : ''
      }
    };
    
    res.status(200).json(updatedTrip);
  } catch (error) {
    console.error('Error updating trip:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete trip
router.delete('/:id', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    
    // Delete image from Cloudinary if exists
    if (trip.imagePublicId) {
      await cloudinary.uploader.destroy(trip.imagePublicId);
    }
    
    // Delete all comments for this trip
    await Comment.deleteMany({ tripId: trip._id });
    
    // Delete the trip
    await Trip.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ message: 'Trip deleted successfully' });
  } catch (error) {
    console.error('Error deleting trip:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Join a trip
router.post('/:id/join', async (req, res) => {
  try {
    const { userId, name, photoURL } = req.body;
    
    const trip = await Trip.findById(req.params.id);
    
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    
    // Check if user is already a participant
    if (trip.participants.some(p => p.userId === userId)) {
      return res.status(400).json({ message: 'Already joined this trip' });
    }
    
    // Check if trip is full
    if (trip.participants.length >= trip.maxParticipants) {
      return res.status(400).json({ message: 'Trip is full' });
    }
    
    // Add user to participants
    trip.participants.push({
      userId,
      name,
      photoURL
    });
    
    await trip.save();
    
    res.status(200).json(trip);
  } catch (error) {
    console.error('Error joining trip:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Leave a trip
router.post('/:id/leave', async (req, res) => {
  try {
    const { userId } = req.body;
    
    const trip = await Trip.findById(req.params.id);
    
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    
    // Remove user from participants
    trip.participants = trip.participants.filter(p => p.userId !== userId);
    
    await trip.save();
    
    res.status(200).json(trip);
  } catch (error) {
    console.error('Error leaving trip:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment to trip
router.post('/:id/comments', async (req, res) => {
  try {
    const { userId, userName, userPhoto, text } = req.body;
    
    // Check if trip exists
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    
    const newComment = new Comment({
      tripId: trip._id,
      userId,
      userName,
      userPhoto,
      text
    });
    
    await newComment.save();
    
    res.status(201).json(newComment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get comments for a trip
router.get('/:id/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ tripId: req.params.id }).sort({ createdAt: 1 });
    res.status(200).json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;