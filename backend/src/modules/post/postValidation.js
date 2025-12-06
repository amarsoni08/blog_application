import Joi from "joi";

export const createPostSchema = Joi.object({
  caption: Joi.string().allow("").optional()
});

export const updatePostSchema = Joi.object({
  caption: Joi.string().allow("").optional()
});