import * as Joi from 'joi';
import { ValidationError } from '@libs/errors';
import { UserRequest } from '@user/interface/user.interfaces';
const createUserSchema = Joi.object<UserRequest>({
  name: Joi.string().min(1).required(),
  lastName: Joi.string().min(1).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  confirmPassword: Joi.ref('password'),
}).with('password', 'confirmPassword');

const getUserSchema = Joi.string().guid().required().label("id");

export const validateUserCreate = (payload: UserRequest): void => {
  const { error } = createUserSchema.validate(payload);

  if (error) {
    throw new ValidationError(`Validation error: ${error.message}`);
  }
}

export const validateGetuser = (userId: string): void => {
  const { error } = getUserSchema.validate(userId);

  if (error) {
    throw new ValidationError(`Validation error: ${error.message}`);
  }
}