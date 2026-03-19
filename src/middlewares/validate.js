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
  loginSchema
}


