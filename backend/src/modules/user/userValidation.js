import Joi from "joi";

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;


const mobileRegex = /^[0-9]{10}$/;

export const registerSchema = Joi.object({
  firstName: Joi.string().min(2).max(40).trim().required(),

  lastName: Joi.string().min(2).max(40).trim().required(),

  email: Joi.string().email().trim().required(),

  mobile: Joi.string()
    .trim()
    .pattern(mobileRegex)
    .message("Mobile number must be exactly 10 digits")
    .required(),

  password: Joi.string()
    .trim()
    .pattern(passwordRegex)
    .message(
      "Password must be at least 8 characters long, include uppercase, lowercase, number & special character"
    )
    .required(),
});


export const loginSchema = Joi.object({
  email: Joi.string().email().trim().required(),

  password: Joi.string()
    .trim()
    .pattern(passwordRegex)
    .message(
      "Password must be at least 8 characters long, include uppercase, lowercase, number & special character"
    )
    .required(),
});

export const updateProfileSchema = Joi.object({
    firstName: Joi.string().min(2).max(40).optional(),
    lastName: Joi.string().min(2).max(40).optional(),
    mobile: Joi.string().pattern(/^[0-9]{10}$/).optional(),
    bio: Joi.string().max(200).optional()
});

export const resetPasswordSchema = Joi.object({
    oldPassword: Joi.string().trim().min(6).required(),
    newPassword: Joi.string()
        .trim()
        .min(6)
        .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@#$!%*?&]).{6,}$/)
        .message("Password must contain uppercase, lowercase, number & special character")
        .required()
});