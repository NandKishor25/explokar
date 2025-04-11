import express from 'express';
import { 
  createOrUpdateUser, 
  getUserByUid, 
  updateUserProfile, 
  deleteUser 
} from '../controllers/authController.js';

const router = express.Router();

router.post('/', createOrUpdateUser);
router.get('/:uid', getUserByUid);
router.put('/:uid', updateUserProfile);
router.delete('/:uid', deleteUser);

export default router;
