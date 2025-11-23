import { z } from "zod";

export const nameSchema = z
  .string()
  .min(4, "You need to input a name (at least 4 characters)");
