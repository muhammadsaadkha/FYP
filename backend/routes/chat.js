import express from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { chat } from '../controllers/chatController.js';

const router = express.Router();
router.post('/', asyncHandler(chat));
export default router;
