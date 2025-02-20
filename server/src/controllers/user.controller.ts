import { Request, Response } from "express";
import { User } from "../models/user.model.js";
import { errorHandler } from "../utils/errorHandler.js";
import { ResponseHandler } from "../utils/responseHandler.js";
import { IUser } from "../types/user.js";

const fetchAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.find().select("-password -refreshToken");

        if (users.length === 0) {
            ResponseHandler.notFound(res, "No users found")
            return;
        }

        ResponseHandler.success(res, `${users.length} users fetched successfully.`, users)
    } catch (error) {
        errorHandler(res, error, "Couldn't fetch users!!!!!")
    }
}

const fetchSingleUser = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params
        const user = await User.findById(userId).select("-password -refreshToken")
        //s
        if (!user) {
            ResponseHandler.notFound(res, "User not found!")
            return;
        }

        ResponseHandler.success(res, "User fetched Successfully", user)
    } catch (error) {
        errorHandler(res, error, "Couldn't fetch user!!!!")
    }
}

const updateUserDetails = async (req: Request, res: Response) => {
    const { userId } = req.params
    try {
        const { username, firstName, lastName } = req.body;

        const loggedInUser = req.user as IUser;

        if (!loggedInUser) {
            ResponseHandler.unauthorized(res, "User not authenticated")
            return;
        }

        const existingUser = await User.findById(userId).select("-password -refreshToken") as IUser | null

        if (!existingUser) {
            ResponseHandler.notFound(res, "User not found");
            return;
        }

        if (existingUser._id.toString() !== loggedInUser._id.toString()) {
            ResponseHandler.forbidden(res, "You can update only your details");
            return;
        }
        if (username !== undefined) existingUser.username = username;
        if (firstName !== undefined) existingUser.firstName = firstName;
        if (lastName !== undefined) existingUser.lastName = lastName;

        const updatedUser = await existingUser.save();

        ResponseHandler.success(res, "User Details Updated", updatedUser)
    } catch (error) {
        errorHandler(res, error, "Couldn't update details!!!!")
    }
}

const deleteUser = async (req: Request, res: Response) => {
    const { userId } = req.params;
    try {
        const loggedInUser = req.user as IUser
        if (!loggedInUser) {
            ResponseHandler.unauthorized(res, "User Not Authenticated")
            return;
        }

        const existingUser = await User.findById(userId) as IUser
        if (!existingUser) {
            ResponseHandler.notFound(res, "User Not Found")
            return;
        }

        if (loggedInUser._id.toString() !== existingUser._id.toString()) {
            ResponseHandler.forbidden(res, "You can delete only your account!")
            return;
        }

        const deletedUser = await User.deleteOne({ _id: userId })

        if (deletedUser.deletedCount === 0) {
            ResponseHandler.notFound(res, "User could not be deleted");
            return;
        }
        ResponseHandler.success(res, "The user has been deleted", deletedUser);
    } catch (error) {
        errorHandler(res, error, "Couldn't delete user!!!!")
    }
}

const getCurrentUser = async (req: Request, res: Response) => {
    try {
        const currentUser = req.user as IUser
        if (!currentUser) {
            ResponseHandler.unauthorized(res, "User not authenticated")
            return;
        }
        const userDetails = await User.findById(currentUser._id).select("-password -refreshToken")

        if (!userDetails) {
            ResponseHandler.notFound(res, "User not found")
            return
        }

        ResponseHandler.success(res, "Current User", userDetails)
    } catch (error) {
        errorHandler(res, error, "Couldn't get current user")
    }
}
export { fetchAllUsers, fetchSingleUser, updateUserDetails, deleteUser, getCurrentUser }