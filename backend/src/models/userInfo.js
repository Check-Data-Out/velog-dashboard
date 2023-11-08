import mongoose from "mongoose";
import axios from "axios";

// ==================== schema ==================== //
const userInfoSchema = new mongoose.Schema({
    accessToken: {
        type: String,
        required: true
    },
    refreshToken: {
        type: String,
        required: true
    },
    velogUniqueUrl: {
        type: String,
        required: true,
        unique: true
    },
    lastScrapingAttemptTime: {
        type: Date
    },
    lastScrapingAttemptResult: String,
    posts: [{
        type: mongoose.Schema.Types.UUID,
        ref: "PostStats"
    }]
}, { timestamps: true, versionKey: false });

// ==================== static methods ==================== //

userInfoSchema.statics.createUser = async function (accessToken, refreshToken) {
    try {
        const res = await axios.post("https://v3.velog.io/graphql", {
            query: `
                query currentUser {
                    currentUser {
                        username
                    }
                }
            `,
            operationName: "currentUser"
        }, {
            headers: {
                "authority": "v3.velog.io",
                "origin": "https://velog.io",
                "content-type": "application/json",
                "cookie": `access_token=${accessToken}; refresh_token=${refreshToken}`,
                // 기타 필요한 헤더들을 여기에 추가합니다.
            }
        });
        const velogUniqueUrl = res.data.data.currentUser.username;
        const user = new this({ accessToken, refreshToken, velogUniqueUrl });
        await user.save();
        return user;
    } catch (error) {
        throw new Error(error.message);
    }
}

const UserInfo = mongoose.model("UserInfo", userInfoSchema);

export default UserInfo;