import express from 'express';
import { addToCart, getCart } from '../controllers/cart.js';
import { authenticate } from '../middlewares/auth.js';
import { validate, addToCartSchema } from '../middlewares/validate.js';

const router = express.Router();


router.use(authenticate);

router.post('/', validate(addToCartSchema), addToCart);
router.get('/', getCart);

export default router;