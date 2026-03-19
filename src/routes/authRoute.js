import express from "express"

import {register,login} from "../controllers/auth.js"
import { getAllProducts,getProduct} from "../controllers/product.js";
import {validate,registerSchema,loginSchema} from "../middlewares/validate.js"


const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);




export default router;