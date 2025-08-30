import express from 'express';
import { getTemperatures } from '../controllers/temperatureController.js';

const router = express.Router();

router.get('/temperaturas', getTemperatures);

export default router;