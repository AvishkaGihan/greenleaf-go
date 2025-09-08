import express from "express";
const router = express.Router();
import { globalSearch } from "../controllers/searchController.js";

// Public route
router.get("/", globalSearch);

export default router;
