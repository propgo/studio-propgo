import { z } from "zod";

export const propertyDetailsSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(120, "Title must be 120 characters or less"),
  propertyType: z.enum([
    "apartment",
    "condo",
    "terrace",
    "semi_d",
    "bungalow",
    "commercial",
    "land",
  ]),
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
  address: z.string().max(300).optional(),
  floors: z.number().int().min(1).max(99).optional(),
  bedrooms: z.number().int().min(0).max(99),
  bathrooms: z.number().int().min(0).max(99),
  builtUpSqft: z.number().int().min(1).optional(),
  landSqft: z.number().int().min(1).optional(),
  furnishing: z.enum(["fully", "partially", "unfurnished"]).optional(),
  tenure: z.enum(["freehold", "leasehold"]).optional(),
  price: z.number().min(0).optional(),
  keyFeatures: z.array(z.string()).default([]),
  description: z.string().max(2000).optional(),
});

export type PropertyDetailsInput = z.infer<typeof propertyDetailsSchema>;
