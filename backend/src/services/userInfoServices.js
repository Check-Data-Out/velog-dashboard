"use strict";

import UserInfo from "../models/userInfo.js";

const setAuthCookie = (res, accessToken, refreshToken) => {
    res.cookie("accessToken", accessToken);
    res.cookie("refreshToken", refreshToken);
};

export const signUpORsignIn = async (req, res) => {
    const { body: { accessToken, refreshToken } } = req;

    try {
        // 이미 존재하는 유저인지 체크
        const userChkOne = await UserInfo.findByToken(accessToken, refreshToken);

        // 존재하면?
        if (userChkOne) {
            setAuthCookie(res, accessToken, refreshToken);
            return res.status(200).json({
                message: "User logined successfully",
                user: userChkOne
            });
        }

        // 존재하지 않으면, fetch 때리고 userId를 찾고 다시 찾아봄
        // 만약 이렇게 찾으면 기존의 token을 업데이트 해줘야 함
        const userCheckData = await UserInfo.fetchUserInfo(accessToken, refreshToken);
        const userChkTwo = await UserInfo.findByuserId(userCheckData.data.data.currentUser.username);

        if (userChkTwo) {
            // user token update
            const updateResult = await UserInfo.updateTokenByuserId(userChkTwo.userId, accessToken, refreshToken);
            if (updateResult.matchedCount && updateResult.modifiedCount) {
                setAuthCookie(res, accessToken, refreshToken);
                return res.status(200).json({
                    message: "User logined and updated successfully",
                    user: userChkTwo
                });
            }

            return res.status(400).json({
                message: "User updated fail",
                user: userChkTwo
            });
        }

        // 그래도 존재하지 않으면 신규 가입 -> 만료된 토큰일 가능성 있음, 그때 error
        const newUser = await UserInfo.createUser(accessToken, refreshToken);
        setAuthCookie(res, accessToken, refreshToken);
        return res.status(201).json({
            message: "User created successfully",
            user: newUser
        });
    } catch (error) {
        // // 토큰 만료 에러 핸들링
        // if (error instanceof TokenError) {
        //     return res.status(400).json({ message: error.message });
        // }
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};

export const getUserAllInfo = async (req, res) => {

    try {
        const { params: { userId } } = req;

        if (req.user.userId != userId) {
            return res.status(404).json({ message: "Access Denied" });
        }

        const userInfo = await UserInfo.findOne({ userId })
            .populate('posts')
            .exec();
        if (!userInfo) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        return res.status(200).json({
            message: "Get all user's info successfully",
            userInfo
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};

export const getUserOnlyInfo = async (req, res) => {
    try {
        const { params: { userId } } = req;
        if (req.user.userId != userId) {
            return res.status(404).json({ message: "Access Denied" });
        }
        const userInfo = await UserInfo.findOne({ userId }, { posts: 0 });
        if (!userInfo) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        return res.status(200).json({
            message: "Get all user's info successfully",
            userInfo
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};