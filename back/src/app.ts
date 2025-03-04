// import express, { Request, Response } from "express";
// import cors from "cors";
// import "dotenv/config";
// import * as RecipeAPI from "./recipe-api";
// import { PrismaClient } from "@prisma/client";

// const app = express();
// const prismaClient = new PrismaClient();

// app.use(express.json());
// app.use(cors());

// app.get("/api/recipes/search", async (req: Request, res: Response) => {
//   const searchTerm = req.query.searchTerm as string | undefined;
//   const page = parseInt(req.query.page as string, 10) || 1;

//   if (!searchTerm) {
//     return res.status(400).json({ error: "Search term is required" });
//   }

//   try {
//     const results = await RecipeAPI.searchRecipes(searchTerm, page);
//     return res.json(results);
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// });

// app.get(
//   "/api/recipes/:recipeId/summary",
//   async (req: Request, res: Response) => {
//     const { recipeId } = req.params;

//     try {
//       const results = await RecipeAPI.getRecipeSummary(recipeId);
//       return res.json(results);
//     } catch (error) {
//       console.error(error);
//       return res.status(500).json({ error: "Internal server error" });
//     }
//   }
// );

// app.post("/api/recipes/favourite", async (req: Request, res: Response) => {
//   const { recipeId } = req.body;

//   if (!recipeId) {
//     return res.status(400).json({ error: "Recipe ID is required" });
//   }

//   try {
//     const favouriteRecipe = await prismaClient.favouriteRecipes.create({
//       data: { recipeId },
//     });
//     return res.status(201).json(favouriteRecipe);
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// });

// app.get("/api/recipes/favourite", async (req: Request, res: Response) => {
//   try {
//     const recipes = await prismaClient.favouriteRecipes.findMany();
//     const recipeIds = recipes.map(
//       (recipe) => recipe.recipeId?.toString() || ""
//     );

//     if (recipeIds.length === 0) {
//       return res.json([]);
//     }

//     const favourites = await RecipeAPI.getFavouriteRecipesByIDs(recipeIds);
//     return res.json(favourites);
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// });

// app.delete("/api/recipes/favourite", async (req: Request, res: Response) => {
//   const { recipeId } = req.body;

//   if (!recipeId) {
//     return res.status(400).json({ error: "Recipe ID is required" });
//   }

//   try {
//     await prismaClient.favouriteRecipes.delete({
//       where: { recipeId },
//     });
//     return res.status(204).send();
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// });

// app.listen(5000, () => {
//   console.log("Server running on http://localhost:5000");
// });


import express, { Request, Response, NextFunction } from "express";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

// Middleware to handle async errors
const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) =>
    fn(req, res, next).catch(next);

// Example Recipes Data
const favouriteRecipes: { recipeId: string; name: string }[] = [];

// Route: Search Recipes
app.get(
  "/api/recipes/search",
  asyncHandler(async (req: Request, res: Response) => {
    const searchTerm = req.query.q as string;
    if (!searchTerm) {
      return res.status(400).json({ error: "Search term is required" });
    }
    res.json({ message: `Search results for "${searchTerm}"` });
  })
);

// Route: Add Recipe to Favourites
app.post(
  "/api/recipes/favourite",
  asyncHandler(async (req: Request, res: Response) => {
    const { recipeId, name } = req.body;
    if (!recipeId || !name) {
      return res.status(400).json({ error: "recipeId and name are required" });
    }
    favouriteRecipes.push({ recipeId, name });
    res.status(201).json({ message: "Recipe added to favourites" });
  })
);

// Route: Get Favourite Recipes
app.get(
  "/api/recipes/favourite",
  asyncHandler(async (req: Request, res: Response) => {
    res.json({ favourites: favouriteRecipes });
  })
);

// Route: Delete Recipe from Favourites
app.delete(
  "/api/recipes/favourite",
  asyncHandler(async (req: Request, res: Response) => {
    const { recipeId } = req.body;
    const index = favouriteRecipes.findIndex((r) => r.recipeId === recipeId);
    if (index === -1) {
      return res.status(404).json({ error: "Recipe not found" });
    }
    favouriteRecipes.splice(index, 1);
    res.json({ message: "Recipe removed from favourites" });
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
