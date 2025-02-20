import { Router } from "express";
const router = Router();
import {
    assignRoles,
    initiatePasswordRequest,
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
    resetPassword,
    verifyEmailOTP,
} from "../controllers/auth.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/role.middleware.js";

router.route("/users").post(registerUser);
router.route("/otp-verifications").post(verifyEmailOTP);
router.route("/sessions").post(loginUser);
router.route("/sessions").delete(logoutUser);
router.route("/tokens").post(refreshAccessToken);
router.route("/password-reset-requests").post(initiatePasswordRequest);
router.route("/passwords").post(resetPassword);
router.route("/roles/:userId").post(verifyJWT, checkRole(["admin"]), assignRoles)

export default router;
