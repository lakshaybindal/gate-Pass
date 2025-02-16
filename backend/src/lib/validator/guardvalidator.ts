import zod from "zod";
export const guardSignup = zod.object({
  name: zod.string(),
  email: zod.string().email(),
  password: zod.string().min(6),
});

export const guardSignin = zod.object({
  email: zod.string().email(),
  password: zod.string().min(6),
});
