import express from 'express';
import { handlePayment, placeOrder } from '../controllers/order.js';
import { authenticate } from '../middlewares/auth.js';
import { validate,paymentSchema } from '../middlewares/validate.js';

const router = express.Router();

router.use(authenticate);

router.post('/', placeOrder);

router.post("/payment",validate(paymentSchema),handlePayment)

export default router;