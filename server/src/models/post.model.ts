import mongoose, { Schema } from "mongoose";
import { IPost, IPostModel } from "../types/post.js";

const postSchema = new Schema<IPost>({
    title: {
        type: String,
        unique: true,
        required: true,
        trim: true,
    },
    desc: {
        type: String,
        required: true,
    },
    coverImageURL: {
        type: String,
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    categories: [{
        type: Schema.Types.ObjectId,
        ref: 'Category',
    }]
}, { timestamps: true })

export const Post = mongoose.model<IPost, IPostModel>("Post", postSchema)