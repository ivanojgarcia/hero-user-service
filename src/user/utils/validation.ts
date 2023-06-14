import * as Joi from 'joi';
import { ValidationError } from '@libs/errors';
import { UserRequest, LoginRequest, RefreshTokenRequest } from '@user/interface/user.interfaces';

const createUserSchema = Joi.object<UserRequest>({
  name: Joi.string().min(1).required(),
  lastName: Joi.string().min(1).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  confirmPassword: Joi.ref('password'),
}).with('password', 'confirmPassword');

const loginUserSchema = Joi.object<LoginRequest>({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
})

const refreshTokenSchema = Joi.object<RefreshTokenRequest>({
  email: Joi.string().email().required(),
  refresh_token: Joi.string().regex(/^[A-Za-z0-9_-]{21}$/).required(),
})

const getUserSchema = Joi.string().guid().required().label("id");

export const validateUserCreate = (payload: UserRequest): void => {
  const { error } = createUserSchema.validate(payload);

  if (error) {
    throw new ValidationError(`Validation error: ${error.message}`);
  }
}

export const validateUserLogin = (payload: LoginRequest): void => {
  const { error } = loginUserSchema.validate(payload);

  if (error) {
    throw new ValidationError(`Validation error: ${error.message}`);
  }
}

export const validateRefreshToken = (payload: RefreshTokenRequest): void => {
  const { error } = refreshTokenSchema.validate(payload);

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