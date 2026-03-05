// routes/search.routes.js
import express from "express";
import { globalSearch, searchProjectTasks } from "../controllers/search.controllers.js";

const router = express.Router();

router.get("/global/:userId", globalSearch);
router.get("/project/:projectId/tasks", searchProjectTasks);

export default router;