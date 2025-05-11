import baseUserSchema from "../base/baseUserSchema";
import { z } from 'zod';

export const registrationSchema = baseUserSchema
    .omit({
        userID: true, // Automatically generated
        displayname: true, // Determined later in the profile setup
    })
    .extend({
        password: z.string().nonempty("Please enter a password"),
    });
