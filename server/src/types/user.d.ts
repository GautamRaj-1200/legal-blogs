import { Document, Model, Types } from "mongoose";
export interface IUser extends Document {
    _id: Types.ObjectId;
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    isVerified: boolean;
    refreshToken?: string;
    otp?: string;
    otpExpires?: Date;
    resetPwdOtp?: string;
    resetPwdOtpExpires?: Date;
    roles: string[];
    isPasswordCorrect(password: string): Promise<boolean>;
}

export interface IUserModel extends Model<IUser> {
    // add any static methods here if needed
}
