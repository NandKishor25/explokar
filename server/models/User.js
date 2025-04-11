import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    photoURL: {
      type: String,
      default: '',
      validate: {
        validator: function (value) {
          return !value || /^https?:\/\/.*\.(jpeg|jpg|png|gif|webp)$/.test(value);
        },
        message: 'Invalid photo URL format',
      },
    },
    bio: {
      type: String,
      default: '',
      maxlength: 300,
    },
    location: {
      type: String,
      trim: true,
    },
    interests: {
      type: [String],
      default: [],
      validate: {
        validator: function (arr) {
          return arr.every((item) => typeof item === 'string');
        },
        message: 'Interests must be an array of strings',
      },
    },
  },
  { timestamps: true }
);

userSchema.index({ uid: 1, email: 1 }, { unique: true });

const User = mongoose.model('User', userSchema);
export default User;

