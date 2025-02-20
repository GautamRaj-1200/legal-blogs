import { Router } from "express";
import { deleteUser, fetchAllUsers, fetchSingleUser, getCurrentUser, updateUserDetails } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/").get(fetchAllUsers)
router.route("/me").get(verifyJWT, getCurrentUser)
router.route("/:userId").get(fetchSingleUser)
router.route("/:userId").patch(verifyJWT, updateUserDetails)
router.route("/:userId").delete(verifyJWT, deleteUser)

export default router