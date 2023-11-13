import mongoose from "mongoose";

const PostStatsSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    uuid: {
        type: String,
        required: true,
        unique: true
    },
    url: String,
    title: String,
    stats: [{
        date: Date,
        viewCount: { type: Number, default: 0 },
        likeCount: { type: Number, default: 0 }
    }],
    totalViewCount: {
        type: Number,
        default: 0
    },
}, { timestamps: true, versionKey: false, _id: false });

const PostStats = mongoose.model("PostStats", PostStatsSchema);

export { PostStats };