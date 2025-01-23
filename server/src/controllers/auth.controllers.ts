import { User } from "../models/user.model.js";
import crypto from "crypto";
import { sendOTP } from "../utils/sendOTP.js";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response } from "express";
import { errorHandler } from "../utils/errorHandler.js";
import { ResponseHandler } from "../utils/responseHandler.js";
import { IUser } from "../types/user.js";

const registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, email, password, firstName, lastName } = req.body;

        if (!username || !email || !password || !firstName || !lastName) {
            return ResponseHandler.error(res, "All fields are required", 400);
        }

        const duplicatedUser = await User.findOne({
            $or: [{ username }, { email }],
        });

        if (duplicatedUser) {
            return ResponseHandler.error(res, "User already exists", 409);
        }

        const otp = crypto.randomInt(100000, 999999).toString();
        const otpExpires = Date.now() + 10 * 60 * 1000;

        sendOTP(
            email,
            otp,
            "Email Verification OTP",
            "OTP to verify your email on mern-auth-js is"
        );

        const roles = ["user"]
        const newUser = await User.create({
            username,
            email,
            password,
            firstName,
            lastName,
            otp,
            otpExpires,
            roles
        });

        if (!newUser) {
            return ResponseHandler.error(res, "Error occurred while registering", 500);
        }

        const {
            password: _,
            refreshToken: __,
            otp: ___,
            otpExpires: ______,
            ...userDataToSend
        } = newUser.toObject();

        return ResponseHandler.success(res, "User Registered Successfully", userDataToSend, 201);
    } catch (error) {
        errorHandler(res, error, "Couldn't register user!!!!");
    }
};

const verifyEmailOTP = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return ResponseHandler.error(res, "User Not Found", 404);
        }
        if (user.isVerified) {
            return ResponseHandler.error(res, "User already verified", 400);
        }
        const otpValid =
            user.otp === otp &&
            user.otpExpires != undefined &&
            user.otpExpires.getTime() > Date.now();

        if (!otpValid) {
            return ResponseHandler.error(res, "Invalid OTP or OTP Expired", 400);
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;

        await user.save();

        return ResponseHandler.success(res, "Email verified successfully");
    } catch (error) {
        errorHandler(res, error, "Couldn't verify the email!!!!");
    }
};

const loginUser = async (req: Request, res: Response): Promise<void> => {
    const { username, email, password } = req.body;
    try {
        if (!password || (!username && !email)) {
            return ResponseHandler.error(res, "All fields are required", 400);
        }
        const user = await User.findOne({ $or: [{ username }, { email }] });

        if (!user) {
            return ResponseHandler.error(res, "User not found", 404);
        }
        const isPasswordValid = await user.isPasswordCorrect(password);

        if (!isPasswordValid) {
            return ResponseHandler.error(res, "Invalid Credentials", 401);
        }
        if (!user.isVerified) {
            return ResponseHandler.error(res, "User not verified", 401);
        }

        const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
        const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

        if (!accessTokenSecret || !refreshTokenSecret) {
            console.error("JWT secret keys are not defined in the environment");
            return ResponseHandler.error(res, "Internal server error", 500);
        }

        const accessToken = jwt.sign(
            { _id: user._id, email: user.email, roles: user.roles },
            accessTokenSecret,
            { expiresIn: "15m" }
        );
        const refreshToken = jwt.sign(
            { _id: user._id, email: user.email, roles: user.roles },
            refreshTokenSecret,
            { expiresIn: "1d" }
        );

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        const {
            password: _,
            refreshToken: __,
            otp: ___,
            otpExpires: ____,
            ...userDataToSend
        } = user.toObject();

        const options = {
            httpOnly: true,
            secure: true,
            sameSite: "none" as const,
        };

        res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json({ message: "Login Success", data: userDataToSend });
        return
    } catch (error) {
        errorHandler(res, error, "Couldn't Log in!!!!");
    }
};

const logoutUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const refreshToken =
            req.cookies?.refreshToken ||
            req.header("Authorization")?.replace("Bearer ", "");

        const cookieOptions = {
            httpOnly: true,
            secure: true,
            sameSite: "none" as const,
        };

        res.clearCookie("accessToken", cookieOptions);
        res.clearCookie("refreshToken", cookieOptions);

        if (!refreshToken) {
            return ResponseHandler.success(res, "Logged out successfully");
        }

        const user = await User.findOneAndUpdate(
            { refreshToken },
            { $unset: { refreshToken: 1 } },
            { new: true }
        );

        if (!user) {
            return ResponseHandler.success(res, "Logged out successfully");
        }

        return ResponseHandler.success(res, "Logged out successfully");
    } catch (error) {
        errorHandler(res, error, "Couldn't log out!!!!");
    }
};

const refreshAccessToken = async (req: Request, res: Response): Promise<void> => {
    const refreshToken =
        req.cookies?.refreshToken ||
        req.header("Authorization")?.replace("Bearer ", "");

    try {
        if (!refreshToken) {
            const options = {
                httpOnly: true,
                secure: true,
                sameSite: "none" as const,
            };
            res
                .status(200)
                .clearCookie("accessToken", options)
                .clearCookie("refreshToken", options)
                .json({ message: "User logged out successfully" });
            return;
        }

        const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
        const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

        if (!accessTokenSecret || !refreshTokenSecret) {
            console.error("JWT secret keys are not defined in the environment");
            return ResponseHandler.error(res, "Internal server error", 500);
        }

        const decodedRefreshToken = jwt.verify(refreshToken, refreshTokenSecret) as JwtPayload;

        const user = await User.findById(decodedRefreshToken._id);
        if (!user || user.refreshToken !== refreshToken) {
            return ResponseHandler.error(res, "Invalid refresh token", 403);
        }

        const newAccessToken = jwt.sign(
            { _id: user._id, email: user.email },
            accessTokenSecret,
            { expiresIn: "30s" }
        );

        const options = {
            httpOnly: true,
            secure: true,
            sameSite: "none" as const,
        };

        res
            .status(200)
            .cookie("accessToken", newAccessToken, options)
            .json({ message: "Token refreshed", accessToken: newAccessToken });
        return;
    } catch (error) {
        errorHandler(res, error, "Refresh Token is invalid or expired!!!!");
    }
};

const initiatePasswordRequest = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return ResponseHandler.error(res, "User not found", 404);
        }

        const resetPwdOtp = crypto.randomInt(100000, 999999).toString();
        const resetPwdOtpExpires = new Date(Date.now() + 10 * 60 * 1000);

        user.resetPwdOtp = resetPwdOtp;
        user.resetPwdOtpExpires = resetPwdOtpExpires;
        await user.save();

        sendOTP(
            email,
            resetPwdOtp,
            "Forgot Password OTP",
            "OTP to reset your password on mern-auth-js is"
        );

        return ResponseHandler.success(res, "OTP sent to email");
    } catch (error) {
        errorHandler(res, error, "Couldn't initiate password reset request!!!!");
    }
};

const resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, otp, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return ResponseHandler.error(res, "User not found", 404);
        }

        const resetPwdOtpValid =
            user.resetPwdOtp === otp &&
            user.resetPwdOtpExpires != undefined &&
            user.resetPwdOtpExpires.getTime() > Date.now();

        if (!resetPwdOtpValid) {
            return ResponseHandler.error(res, "Invalid OTP or OTP Expired", 400);
        }

        user.password = password;
        user.resetPwdOtp = undefined;
        user.resetPwdOtpExpires = undefined;

        await user.save();

        return ResponseHandler.success(res, "Password changed successfully");
    } catch (error) {
        errorHandler(res, error, "Couldn't reset password!!!!");
    }
};

const assignRoles = async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params;
    const { roles } = req.body;

    try {
        if (!Array.isArray(roles) || roles.length === 0) {
            ResponseHandler.badRequest(res, "Invalid roles input");
            return;
        }

        const validRoles = ["user", "author", "admin"];
        const areRolesValid = roles.every(role => validRoles.includes(role));
        if (!areRolesValid) {
            ResponseHandler.badRequest(res, "Invalid role(s) provided");
            return;
        }

        const existingUser = await User.findById(userId) as IUser | null;
        if (!existingUser) {
            ResponseHandler.notFound(res, "User not found");
            return;
        }

        existingUser.roles = roles;
        const updatedUserDetails = await existingUser.save();

        ResponseHandler.success(res, "User roles updated successfully", updatedUserDetails.roles);
    } catch (error) {
        errorHandler(res, error, "An unexpected error occurred while assigning roles");
    }
};
export {
    registerUser,
    verifyEmailOTP,
    loginUser,
    logoutUser,
    refreshAccessToken,
    initiatePasswordRequest,
    resetPassword,
    assignRoles
};
