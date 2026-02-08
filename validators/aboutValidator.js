import { body } from "express-validator";

export const updateAboutValidation = [
  body("heroTitle")
    .optional()
    .isString()
    .withMessage("heroTitle must be a string"),

  body("heroDescription")
    .optional()
    .isString()
    .withMessage("heroDescription must be a string"),

  body("mission").optional().isString().withMessage("mission must be a string"),

  body("vision").optional().isString().withMessage("vision must be a string"),

  body("stats").optional().isArray().withMessage("stats must be an array"),

  body("stats.*.label")
    .optional()
    .isString()
    .withMessage("stats.label must be a string"),

  body("stats.*.value")
    .optional()
    .isString()
    .withMessage("stats.value must be a string"),

  body("sections")
    .optional()
    .isArray()
    .withMessage("sections must be an array"),

  body("sections.*.title")
    .optional()
    .isString()
    .withMessage("section title must be string"),

  body("sections.*.content")
    .optional()
    .isString()
    .withMessage("section content must be string"),

  body("sections.*.image")
    .optional()
    .isString()
    .withMessage("section image must be string"),
];
