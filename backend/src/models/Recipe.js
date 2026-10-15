import mongoose from "mongoose";

const recipeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    ingredients: [{ type: String, required: true, trim: true }],
    steps: [{ type: String, required: true, trim: true }],
    cookingTime: { type: Number, required: true, min: 1 },
    imageUrl: { type: String, required: true, trim: true },
    imagePublicId: { type: String, trim: true },
    author: { type: String, required: true, trim: true, maxlength: 60 },
    likes: { type: Number, default: 0, min: 0 },
    likedBy: [{ type: String, trim: true }],
    savedBy: [{ type: String, trim: true }],
  },
  { timestamps: true },
);

recipeSchema.index({ title: "text", ingredients: "text", author: "text" });

export default mongoose.model("Recipe", recipeSchema);
