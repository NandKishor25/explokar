import User from '../models/User.js';

/**
 * @desc Create or update user
 * @route POST /api/users
 * @access Public
 */
export const createOrUpdateUser = async (req, res) => {
  try {
    const { uid, email, name, photoURL } = req.body;

    if (!uid || !email || !name) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const updatedUser = await User.findOneAndUpdate(
      { uid }, 
      { email, name, photoURL }, 
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error creating/updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc Get user by UID
 * @route GET /api/users/:uid
 * @access Public
 */
export const getUserByUid = async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.params.uid });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc Update user profile
 * @route PUT /api/users/:uid
 * @access Private
 */
export const updateUserProfile = async (req, res) => {
  try {
    const { name, photoURL, bio, location, interests } = req.body;

    const user = await User.findOne({ uid: req.params.uid });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update only provided fields
    if (name) user.name = name;
    if (photoURL) user.photoURL = photoURL;
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (Array.isArray(interests)) user.interests = interests;

    await user.save();
    res.status(200).json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc Delete user
 * @route DELETE /api/users/:uid
 * @access Private
 */
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ uid: req.params.uid });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
