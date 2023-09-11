import * as Joi from 'joi';
import {MAX_NAME_LENGTH, MAX_PASSWORD_LENGTH, MIN_NAME_LENGTH, MIN_PASSWORD_LENGTH} from "../../constants/data";

export const createUserSchema = Joi.object({
    firstName: Joi.string().min(MIN_NAME_LENGTH).max(MAX_NAME_LENGTH).required(),
    lastName: Joi.string().min(MIN_NAME_LENGTH).max(MAX_NAME_LENGTH).required(),
    email: Joi.string().email().required(),
    password: Joi.string()
        .min(MIN_PASSWORD_LENGTH)
        .max(MAX_PASSWORD_LENGTH)
        .pattern(new RegExp('^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])'))
        .message('Password too weak')
        .required(),
    confirmPassword: Joi.ref('password'), // Поле для подтверждения пароля
}).with('password', 'confirmPassword');
