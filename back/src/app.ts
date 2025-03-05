import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import * as RecipeAPI from "./recipe-api";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();
console.log("Database URL:", process.env.DATABASE_URL);

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(cors());

// Middleware to handle async errors
const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) =>
    fn(req, res, next).catch(next);

// Route: Search Recipes
app.get(
  "/api/recipes/search",
  asyncHandler(async (req: Request, res: Response) => {
    const searchTerm = req.query.q as string;
    if (!searchTerm) {
      return res.status(400).json({ error: "Search term is required" });
    }
    const results = await RecipeAPI.searchRecipes(searchTerm, 1);
    res.json(results);
  })
);

// Route: Add Recipe to Favourites
app.post(
  "/api/recipes/favourite",
  asyncHandler(async (req: Request, res: Response) => {
    const { recipeId } = req.body;
    if (!recipeId) {
      return res.status(400).json({ error: "Recipe ID is required" });
    }
    const favouriteRecipe = await prisma.favouriteRecipes.create({
      data: { recipeId },
    });
    res.status(201).json(favouriteRecipe);
  })
);

// Route: Get Favourite Recipes
app.get(
  "/api/recipes/favourite",
  asyncHandler(async (req: Request, res: Response) => {
    const recipes = await prisma.favouriteRecipes.findMany();
    const recipeIds = recipes.map((r:any) => r.recipeId?.toString() || "");
    if (recipeIds.length === 0) return res.json([]);
 
    const favourites = await RecipeAPI.getFavouriteRecipesByIDs(recipeIds);
    res.json(favourites);
  })
);

// Route: Delete Recipe from Favourites
app.delete(
  "/api/recipes/favourite",
  asyncHandler(async (req: Request, res: Response) => {
    const { recipeId } = req.body;
    if (!recipeId) {
      return res.status(400).json({ error: "Recipe ID is required" });
    }
    await prisma.favouriteRecipes.delete({ where: { recipeId } });
    res.status(204).send();
  })
);

// Global Error Handling Middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", err.message);
  res.status(500).json({ error: err.message });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
  