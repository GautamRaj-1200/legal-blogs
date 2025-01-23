import { Router } from "express";
import { createPost, deleteUserPosts, deleteSinglePost, fetchAllPosts, fetchSinglePost, updateSinglePost } from "../controllers/post.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router()

router.route("/").post(verifyJWT, createPost)
router.route("/").get(fetchAllPosts)
router.route("/:postId").get(fetchSinglePost)
router.route("/:postId").put(verifyJWT, updateSinglePost)
router.route("/:postId").delete(verifyJWT, deleteSinglePost)
router.route("/").delete(verifyJWT, deleteUserPosts)

export default router