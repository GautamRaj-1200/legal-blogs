import mongoose, { Schema, CallbackError } from "mongoose";
import bcrypt from "bcrypt";
import { IUser, IUserModel } from "../types/user.js";

const userSchema = new Schema<IUser>({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    refreshToken: {
        type: String,
    },
    otp: {
        type: String,
    },
    otpExpires: {
        type: Date,
    },
    resetPwdOtp: {
        type: String,
    },
    resetPwdOtpExpires: {
        type: Date,
    },
    roles: {
        type: [String],
        enum: ["user", "author", "admin"],
        default: ["user"]
    }
},
    { timestamps: true }
);

userSchema.pre<IUser>("save", async function (next) {
    if (!this.isModified("password")) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error: unknown) {
        let errorMessage = "Failed while saving password";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        console.log("Error: ", errorMessage);
        next(new Error(errorMessage) as CallbackError);
    }
});

userSchema.methods.isPasswordCorrect = async function (
    this: IUser,
    password: string
): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
};

export const User = mongoose.model<IUser, IUserModel>("User", userSchema);