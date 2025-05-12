import { z } from "zod";
import { userLimits } from "../../commonLimits";

export default z.object({
    userID: z.string().uuid(),
    email: z.string().email("Invalid E-Mail address"),
    username: z.string().max(userLimits.username, `Username cannot be over ${userLimits.username} characters long`).nonempty("Required"),
    displayname: z.string().max(userLimits.displayname, `Display Name cannot be over ${userLimits.displayname} characters long`).nullable(),
});
