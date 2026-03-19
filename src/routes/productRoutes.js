import express from 'express';
import { getAllProducts, getProduct } from '../controllers/product.js'

const router = express.Router();

router.get('/', getAllProducts);
router.get('/:id', getProduct);

export default router;