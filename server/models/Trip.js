import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  startLocation: {
    type: String,
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  maxParticipants: {
    type: Number,
    required: true
  },
  preferredGender: {
    type: String,
    enum: ['male', 'female', 'any'],
    default: 'any'
  },
  transportMode: {
    type: String,
    enum: ['flight', 'train', 'car', 'bus', 'bike', ''],
    default: ''
  },
  description: {
    type: String,
    required: true
  },
  budget: {
    type: Number
  },
  activities: {
    type: String
  },
  imageUrl: {
    type: String
  },
  imagePublicId: {
    type: String
  },
  userId: {
    type: String,
    required: true
  },
  participants: [{
    userId: String,
    name: String,
    photoURL: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add text indexes for search
tripSchema.index({ 
  title: 'text', 
  startLocation: 'text', 
  destination: 'text',
  description: 'text',
  activities: 'text'
});

const Trip = mongoose.model('Trip', tripSchema);

export default Trip;