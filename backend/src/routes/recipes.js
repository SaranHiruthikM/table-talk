import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import Recipe from "../models/Recipe.js";

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, done) =>
    done(null, file.mimetype.startsWith("image/")),
});

const cleanArray = (value) =>
  (Array.isArray(value) ? value : [value])
    .filter((item) => item !== undefined && item !== null)
    .map(String)
    .map((item) => item.trim())
    .filter(Boolean);
const payload = (body) => ({
  title: String(body.title || "").trim(),
  ingredients: cleanArray(body.ingredients),
  steps: cleanArray(body.steps),
  cookingTime: Number(body.cookingTime),
  imageUrl: String(body.imageUrl || "").trim(),
  author: String(body.author || "").trim(),
});

const uploadToCloudinary = (file) =>
  new Promise((resolve, reject) => {
    const callback = (error, result) =>
      error ? reject(error) : resolve(result);
    const stream = process.env.CLOUDINARY_UPLOAD_PRESET
      ? cloudinary.uploader.unsigned_upload_stream(
          process.env.CLOUDINARY_UPLOAD_PRESET,
          { resource_type: "image" },
          callback,
        )
      : cloudinary.uploader.upload_stream(
          {
            folder: process.env.CLOUDINARY_FOLDER || "tabletalk-recipes",
            resource_type: "image",
          },
          callback,
        );
    stream.end(file.buffer);
  });

function validateRecipe(data) {
  if (
    !data.title ||
    !data.author ||
    !data.imageUrl ||
    !data.ingredients.length ||
    !data.steps.length ||
    !Number.isInteger(data.cookingTime) ||
    data.cookingTime < 1
  ) {
    return "Title, author, image URL, ingredients, steps, and a positive cooking time are required.";
  }
  return null;
}

router.get("/", async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 6, 1), 24);
    const search = String(req.query.search || "").trim();
    const filter = search ? { $text: { $search: search } } : {};
    const [recipes, total] = await Promise.all([
      Recipe.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Recipe.countDocuments(filter),
    ]);
    res.json({
      recipes,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/", upload.single("image"), async (req, res, next) => {
  try {
    const data = payload(req.body);
    if (req.file) {
      if (
        !process.env.CLOUDINARY_CLOUD_NAME ||
        !process.env.CLOUDINARY_API_KEY ||
        !process.env.CLOUDINARY_API_SECRET
      ) {
        return res
          .status(503)
          .json({ message: "Cloudinary is not configured on the server." });
      }
      const uploaded = await uploadToCloudinary(req.file);
      data.imageUrl = uploaded.secure_url;
      data.imagePublicId = uploaded.public_id;
    }
    const error = validateRecipe(data);
    if (error) return res.status(400).json({ message: error });
    const recipe = await Recipe.create(data);
    res.status(201).json(recipe);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found." });
    res.json(recipe);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", upload.single("image"), async (req, res, next) => {
  try {
    const data = payload(req.body);
    const existing = await Recipe.findById(req.params.id);
    if (!existing)
      return res.status(404).json({ message: "Recipe not found." });
    if (req.file) {
      if (
        !process.env.CLOUDINARY_CLOUD_NAME ||
        !process.env.CLOUDINARY_API_KEY ||
        !process.env.CLOUDINARY_API_SECRET
      ) {
        return res
          .status(503)
          .json({ message: "Cloudinary is not configured on the server." });
      }
      const uploaded = await uploadToCloudinary(req.file);
      data.imageUrl = uploaded.secure_url;
      data.imagePublicId = uploaded.public_id;
    } else {
      data.imageUrl = data.imageUrl || existing.imageUrl;
      data.imagePublicId = existing.imagePublicId;
    }
    const error = validateRecipe(data);
    if (error) return res.status(400).json({ message: error });
    const recipe = await Recipe.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });
    if (!recipe) return res.status(404).json({ message: "Recipe not found." });
    res.json(recipe);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const recipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found." });
    res.json({ message: "Recipe deleted." });
  } catch (error) {
    next(error);
  }
});

router.post("/:id/like", async (req, res, next) => {
  try {
    const user = String(req.body.user || "guest").trim();
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found." });
    const index = recipe.likedBy.indexOf(user);
    if (index >= 0) recipe.likedBy.splice(index, 1);
    else recipe.likedBy.push(user);
    recipe.likes = recipe.likedBy.length;
    await recipe.save();
    res.json(recipe);
  } catch (error) {
    next(error);
  }
});

router.post("/:id/save", async (req, res, next) => {
  try {
    const user = String(req.body.user || "guest").trim();
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found." });
    const index = recipe.savedBy.indexOf(user);
    if (index >= 0) recipe.savedBy.splice(index, 1);
    else recipe.savedBy.push(user);
    await recipe.save();
    res.json(recipe);
  } catch (error) {
    next(error);
  }
});

export default router;
