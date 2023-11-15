"use strict";

import UserInfo from "../models/userInfo.js";

export const userAuth = async (req, res, next) => {
    let { accessToken, refreshToken } = req.cookies;

    // 만약 쿠키에 토큰이 없으면 헤더에서 찾는다.
    if (!accessToken || !refreshToken) {
        accessToken = req.headers['access-token'];
        refreshToken = req.headers['refresh-token'];
    }

    // accessToken 또는 refreshToken 둘 중 하나라도 없다면, 에러 메시지를 보낸다.
    if (!accessToken || !refreshToken) {
        return res.status(403).json({ message: "Access token or refresh token is missing, please login again." });
    }

    const user = await UserInfo.findByToken(accessToken, refreshToken);
    if (!user) {
        return res.status(403).json({ message: "Velog dashboard's token is not found, please login again." });
    }

    req.user = user;
    next();
};
