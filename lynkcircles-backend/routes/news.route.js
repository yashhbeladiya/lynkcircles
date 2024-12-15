import express from 'express';
import { getHeadlines, getNews } from '../controllers/news.controller.js';

const router = express.Router();

router.get('/', getNews);
router.get('/headlines', getHeadlines);


export default router;