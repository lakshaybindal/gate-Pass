
import zod from "zod";
export const userSignup = zod.object({
  name: zod.string(),
  email: zod.string().email(),
  password: zod.string().min(6),
  parentEmail: zod.string().email(),
  rollno: zod.string(),
  hostelName: zod.string(),
});

export const userSignin = zod.object({
  email: zod.string().email(),
  password: zod.string().min(6),
});
