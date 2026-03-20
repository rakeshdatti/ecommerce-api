import Joi from "joi"


const registerSchema=Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
})


const loginSchema=Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
})

const addToCartSchema = Joi.object({
  product_id: Joi.number().integer().positive().required(),
  quantity: Joi.number().integer().min(1).default(1),
});


const paymentSchema = Joi.object({
  order_id: Joi.number().integer().positive().required(),
  payment_status: Joi.string().valid('success', 'failure').required(),
});




const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.details.map((d) => d.message),
    });
  }
  req.body = value;
  next();
};





export {
  validate,
  registerSchema,
  loginSchema,
  addToCartSchema,
  paymentSchema
}


