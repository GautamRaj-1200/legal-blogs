import { Document, Model, Types } from "mongoose";

export interface IPost extends Document {
    title: string;
    desc: string;
    coverImageURL: string;
    author: Types.ObjectId;
    categories: Types.ObjectId[];
}

export interface IPostModel extends Model<IPost> {
    // Add any static methods here if needed
}