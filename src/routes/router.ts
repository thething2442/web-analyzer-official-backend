import { Router } from "express";
import { createJob,listJobs,getJobById,getJobsByUserId } from "../controllers/defineUrl.controller";
import { createUser, listUsers, getUserById, deleteUser } from "../controllers/user.controller";

const router = Router();
router.post("/create-job", createJob);
router.get('/get-job',listJobs);
router.get('/get-job/:id',getJobById)
router.get('/users/:id/job',getJobsByUserId)
router.post("/register", createUser);       // Register new user
router.get("/users", listUsers);           // List all users
router.get("/users/:id", getUserById);     // Get user by ID
router.delete("/users/:id", deleteUser);   // Delete user by ID

export default router;
