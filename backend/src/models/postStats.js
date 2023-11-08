import mongoose from "mongoose";

const StatsSchema = new mongoose.Schema({
    date: Date,
    viewCount: {
        type: Number,
        default: 0
    },
    likeCount: {
        type: Number,
        default: 0
    }
}, { timestamps: false, versionKey: false, _id: false });

const PostStatsSchema = new mongoose.Schema({
    velogUniqueUrl: {
        type: String,
        required: true,
        unique: true
    },
    uuid: {
        type: mongoose.Schema.Types.UUID,
        required: true,
        unique: true
    },
    url: String,
    title: String,
    stats: [StatsSchema]
}, { timestamps: true, versionKey: false, _id: false });

const Stats = mongoose.model("Stats", StatsSchema);
const PostStats = mongoose.model("PostStats", PostStatsSchema);

export { PostStats, Stats };