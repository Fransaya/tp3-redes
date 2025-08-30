import express from 'express';
import { getTokens } from '../controllers/authController.js';

const router = express.Router();

router.get('/get-tokens', getTokens);

export default router;