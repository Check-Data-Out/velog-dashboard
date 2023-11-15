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


// ==================== static methods ==================== //

PostStatsSchema.statics.aggTotalByUserId = async function (userId) {

    // 1. userId 에 해당하는 모든 PostStats 모델을 찾고
    // 2. 해당 모델들의 totalViewCount 값을 모두 찾고 더한 값
    // 3. 해당 모델들의 stats 의 오늘 viewCount 값을 모두 더한 값
    // 4. 해당 모델들의 stats 의 마지막 요소의 likeCount 값을 모두 더한 값

    try {
        const aggreateResult = await this.aggregate([
            // userId에 맞는 문서를 필터링
            { $match: { userId } },

            // 각 문서별로 필요한 작업
            {
                $project: {
                    totalViewCount: 1, // totalViewCount 값을 포함
                    lastViewCount: { $last: "$stats.viewCount" }, // stats 배열의 마지막 viewCount 값
                    lastLikeCount: { $last: "$stats.likeCount" } // stats 배열의 마지막 likeCount 값
                }
            },

            // 모든 문서에 대해 totalViewCount와 lastLikeCount를 더함
            {
                $group: {
                    _id: null,
                    totalViewCountSum: { $sum: "$totalViewCount" },
                    todayViewCountSum: { $sum: "$lastViewCount" },
                    totalLastLikeCountSum: { $sum: "$lastLikeCount" }
                }
            }
        ]).exec();
        return aggreateResult;
    } catch (error) {
        console.error(error);
        throw new Error(error.message);
    }
}

PostStatsSchema.statics.allPostsAggByUserId = async function (userId) {

    try {
        const docs = await this.find({ userId }).lean(); // 모든 문서를 가져옴
        const result = docs.map(doc => {
            const lastStat = doc.stats[doc.stats.length - 1];
            const secondLastStat = doc.stats[doc.stats.length - 2];

            // 마지막과 그 이전 stats를 비교하여 isUp 결정
            doc.isUp = secondLastStat && lastStat && lastStat.viewCount > secondLastStat.viewCount;

            // 필요하지 않은 필드를 제거하거나, 결과를 조정할 수 있습니다.
            return {
                // _id: doc._id,
                uuid: doc.uuid,
                title: doc.title,
                totalViewCount: doc.totalViewCount,
                updatedAt: doc.updatedAt.$date,
                url: doc.url,
                userId: doc.userId,
                isUp: doc.isUp
            };
        });
        return result;
    } catch (error) {
        console.error(error);
        throw new Error(error.message);
    }
}


const PostStats = mongoose.model("PostStats", PostStatsSchema);
export default PostStats;