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
    userId: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    lastScrapingAttemptTime: {
        type: Date,
        default: Date.now
    },
    lastScrapingAttemptResult: {
        type: String,
        default: "",
    },
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "PostStats"
    }]
}, { timestamps: true, versionKey: false });

// ==================== static methods ==================== //
class TokenError extends Error {
    constructor(message) {
        super(message);
        this.name = "TokenError";
        Error.captureStackTrace(this, this.constructor);
    }
}


userInfoSchema.statics.fetchUserInfo = async function (accessToken, refreshToken) {
    const res = await axios.post("https://v3.velog.io/graphql", {
        query: `
            query currentUser {
                currentUser {
                    username
                    email
                }
            }
        `,
        operationName: "currentUser"
    }, {
        headers: {
            "authority": "v3.velog.io",
            "origin": "https://velog.io",
            "content-type": "application/json",
            "cookie": `access_token=${accessToken}; refresh_token=${refreshToken};`,
        }
    });
    if (res.data.data.currentUser?.username === null ||
        res.data.data.currentUser?.username === undefined) {
        throw new TokenError("The token has expired!");
    }
    return res;
};


userInfoSchema.statics.createUser = async function (accessToken, refreshToken) {
    try {
        const res = await this.fetchUserInfo(accessToken, refreshToken);
        const userId = res.data.data.currentUser.username;
        const email = res.data.data.currentUser.email;
        const user = new this({ accessToken, refreshToken, userId, email });
        await user.save();
        return user;
    } catch (error) {
        console.error(error);
        throw error;
    }
}


userInfoSchema.statics.findByToken = async function (accessToken, refreshToken) {
    try {
        const targetUser = await this.findOne({
            $or: [
                { accessToken }, { refreshToken }
            ]
        });
        return targetUser;
    } catch (error) {
        console.error(error);
        throw new Error(error.message);
    }
}


userInfoSchema.statics.findByuserId = async function (userId) {
    try {
        const targetUser = await this.findOne({ userId });
        return targetUser;
    } catch (error) {
        console.error(error);
        throw new Error(error.message);
    }
}


userInfoSchema.statics.updateTokenByuserId = async function (userId, accessToken, refreshToken) {
    try {
        const result = await User.updateOne(
            { userId }, // 업데이트할 문서의 조건
            { $set: { accessToken, refreshToken } } // 업데이트할 내용
        );
        return result; // 업데이트 결과 반환
    } catch (error) {
        console.error(error);
        throw new Error(error.message);
    }
}


const UserInfo = mongoose.model("UserInfo", userInfoSchema);
export default UserInfo;