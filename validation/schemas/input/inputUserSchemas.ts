import { z } from 'zod';
import baseUserSchema from "../base/baseUserSchema";
import { validateUsername, usernameFormatMessage, validateDisplayName, displayNameFormatMessage } from '~~/validation/commonRules';

export const registrationSchema = baseUserSchema
  .omit({
    userID: true, // Automatically generated
    displayname: true, // Determined later in the profile setup
  })
  .extend({
    username: baseUserSchema.shape.username.refine((name) => validateUsername(name), usernameFormatMessage),
    password: z.string().min(8, "Password must have at least 8 characters"),
  });

export const loginSchema = registrationSchema
  .pick({
    password: true,
  })
  .extend({
    usernameOrEmail: z.string().nonempty("Required"),
  });

export const displayNameSchema = baseUserSchema.shape.displayname.refine(
  (name) => !name || validateDisplayName(name), displayNameFormatMessage);

export const usernameSchema = registrationSchema.shape.username;

export const emailSchema = baseUserSchema.shape.email;
