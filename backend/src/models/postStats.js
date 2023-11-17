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

    // 오늘 날짜 설정
    // UTC 기준으로 오늘 날짜 설정
    const KST_OFFSET = 9 * 60 * 60 * 1000; // 한국 시간대는 UTC+9
    const now = new Date();
    let today = new Date(now.getTime() + KST_OFFSET); // UTC 시간에 한국 시간대를 적용

    // 다시 문자열로 년월일 문자열로 바꾸고, 다시 문자열을 date object로 바꾸고
    // 시 분 초 0으로, UTC 시간대로 만들기
    const dateString = today.toISOString().split("T")[0];
    today = new Date(dateString);

    try {
        const aggreateResult = await this.aggregate([
            // userId에 맞는 문서를 필터링
            { $match: { userId } },

            // 각 문서별로 필요한 작업
            {
                $project: {
                    totalViewCount: 1, // totalViewCount 값을 포함
                    todayViews: {
                        // 오늘 날짜에 해당하는 stats 요소 필터링
                        $filter: {
                            input: "$stats",
                            as: "stat",
                            cond: { $eq: ["$$stat.date", today] }
                        }
                    },
                    lastLikeCount: { $last: "$stats.likeCount" } // stats 배열의 마지막 likeCount 값
                }
            },

            // 오늘 날짜의 viewCount를 합산
            {
                $project: {
                    totalViewCount: 1,
                    todayViewCount: { $sum: "$todayViews.viewCount" },
                    lastLikeCount: 1
                }
            },

            // 모든 문서에 대해 totalViewCount, todayViewCount, lastLikeCount를 더함
            {
                $group: {
                    _id: null,
                    totalViewCountSum: { $sum: "$totalViewCount" },
                    todayViewCountSum: { $sum: "$todayViewCount" },
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


PostStatsSchema.statics.aggDailyTotalByUserId = async function (userId) {
    try {
        const aggreateResult = await this.aggregate([
            // userId에 맞는 문서를 필터링
            { $match: { userId } },

            // Unwind the stats array to deconstruct it
            { $unwind: '$stats' },
            // Group the results by date and sum up the viewCounts
            {
                $group: {
                    _id: { date: '$stats.date' }, // Group by the date field inside stats
                    totalViewCountPerDay: { $sum: '$stats.viewCount' } // Sum up all viewCounts for each day
                }
            },
            // Optionally sort the results by date
            {
                $sort: {
                    '_id.date': 1 // Sort by date ascending (use -1 for descending)
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

            if (doc.stats.length <= 0) {
                return {
                    uuid: doc.uuid,
                    title: doc.title,
                    totalViewCount: doc.totalViewCount,
                    lastViewCount: 0,
                    updatedAt: doc.updatedAt.$date,
                    url: doc.url,
                    userId: doc.userId,
                    isUp: false
                };
            }

            const lastStat = doc.stats[doc.stats.length - 1];
            const secondLastStat = doc.stats[doc.stats.length - 2];

            // 마지막과 그 이전 stats를 비교하여 isUp 결정
            doc.isUp = secondLastStat && lastStat && lastStat.viewCount > secondLastStat.viewCount;

            return {
                uuid: doc.uuid,
                title: doc.title,
                totalViewCount: doc.totalViewCount,
                lastViewCount: lastStat.viewCount,
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