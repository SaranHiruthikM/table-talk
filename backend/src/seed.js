import "dotenv/config";
import mongoose from "mongoose";
import Recipe from "./models/Recipe.js";

const recipes = [
  {
    title: "Lemon Butter Pasta",
    ingredients: [
      "Spaghetti",
      "Unsalted butter",
      "1 lemon, zested and juiced",
      "Parmesan",
      "Black pepper",
      "Fresh parsley",
    ],
    steps: [
      "Cook the pasta in well-salted water until just tender, reserving a mug of pasta water.",
      "Melt the butter in a wide pan and stir in the lemon zest and juice.",
      "Toss in the pasta with a splash of pasta water, then finish with Parmesan, pepper, and parsley.",
    ],
    cookingTime: 30,
    imageUrl:
      "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1200&q=85",
    author: "Saran Hitrik",
    likes: 18,
  },
  {
    title: "Crispy Chickpea Salad",
    ingredients: [
      "Chickpeas",
      "Cucumber",
      "Cherry tomatoes",
      "Red onion",
      "Feta",
      "Olive oil",
      "Red wine vinegar",
    ],
    steps: [
      "Pat the chickpeas dry, toss with oil and salt, and roast until crisp.",
      "Chop the vegetables and crumble the feta into a large bowl.",
      "Whisk the oil and vinegar together, toss everything while the chickpeas are still warm, and serve.",
    ],
    cookingTime: 25,
    imageUrl:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=85",
    author: "Maya Chen",
    likes: 34,
  },
  {
    title: "Tomato Toast with Ricotta",
    ingredients: [
      "Sourdough bread",
      "Whole milk ricotta",
      "Ripe tomatoes",
      "Basil leaves",
      "Flaky salt",
      "Olive oil",
    ],
    steps: [
      "Toast the sourdough until the edges are deeply golden.",
      "Spread each slice with ricotta and season with black pepper.",
      "Pile on the sliced tomatoes, basil, flaky salt, and a generous drizzle of olive oil.",
    ],
    cookingTime: 15,
    imageUrl:
      "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?auto=format&fit=crop&w=1200&q=85",
    author: "Theo Martins",
    likes: 27,
  },
  {
    title: "Ginger Miso Noodles",
    ingredients: [
      "Rice noodles",
      "White miso",
      "Fresh ginger",
      "Soy sauce",
      "Sesame oil",
      "Baby spinach",
      "Scallions",
    ],
    steps: [
      "Soak the noodles according to the packet directions and drain.",
      "Whisk miso, ginger, soy sauce, sesame oil, and a little hot water into a glossy sauce.",
      "Toss the noodles and spinach through the sauce, then top with sliced scallions.",
    ],
    cookingTime: 20,
    imageUrl:
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1200&q=85",
    author: "Nora Patel",
    likes: 42,
  },
  {
    title: "Roasted Pepper Soup",
    ingredients: [
      "Red bell peppers",
      "Yellow onion",
      "Garlic",
      "Vegetable stock",
      "Smoked paprika",
      "Crème fraîche",
    ],
    steps: [
      "Roast the peppers, onion, and garlic until soft and charred at the edges.",
      "Peel the peppers and simmer everything with stock and smoked paprika for ten minutes.",
      "Blend until smooth and finish each bowl with crème fraîche and cracked pepper.",
    ],
    cookingTime: 45,
    imageUrl:
      "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1200&q=85",
    author: "Eli Brooks",
    likes: 31,
  },
  {
    title: "One-Pan Honey Chicken",
    ingredients: [
      "Chicken thighs",
      "Honey",
      "Dijon mustard",
      "Baby potatoes",
      "Green beans",
      "Garlic",
      "Fresh thyme",
    ],
    steps: [
      "Whisk honey, mustard, garlic, and thyme together, then coat the chicken.",
      "Roast the chicken and potatoes in one pan until the skin is crisp and the potatoes are tender.",
      "Add the green beans for the final eight minutes and spoon the pan juices over everything.",
    ],
    cookingTime: 50,
    imageUrl:
      "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=1200&q=85",
    author: "Amelia Hart",
    likes: 23,
  },
];

await mongoose.connect(process.env.MONGODB_URI);
const result = await Recipe.bulkWrite(
  recipes.map((recipe) => ({
    updateOne: {
      filter: { title: recipe.title },
      update: { $setOnInsert: recipe },
      upsert: true,
    },
  })),
);
console.log(
  `Seeded ${result.upsertedCount} new recipes; existing starter recipes were kept.`,
);

await mongoose.disconnect();
