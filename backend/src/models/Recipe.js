import mongoose from "mongoose";

const recipeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      maxlength: 120,
    },
    ingredients: [
      {
        type: String,
        required: true,
      },
    ],
    steps: [
      {
        type: String,
        required: true,
      },
    ],
    cookingTime: {
      type: Number,
      required: true,
      min: 1,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    imagePublicId: {
      type: String,
    },
    author: {
      type: String,
      required: true,
      maxlength: 60,
    },
    likes: {
      type: Number,
      default: 0,
      min: 0,
    },
    likedBy: [{ type: String }],
    savedBy: [{ type: String }],
  },
  { timestamps: true },
);

recipeSchema.index({ title: "text", ingredients: "text", author: "text" });

export default mongoose.model("Recipe", recipeSchema);
