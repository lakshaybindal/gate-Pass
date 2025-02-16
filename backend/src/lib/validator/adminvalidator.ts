import zod from "zod";
export const adminSignup = zod.object({
  name: zod.string(),
  email: zod.string().email(),
  password: zod.string().min(6),
  hostelName: zod.string(),
});

export const adminSignin = zod.object({
  email: zod.string().email(),
  password: zod.string().min(6),
});
