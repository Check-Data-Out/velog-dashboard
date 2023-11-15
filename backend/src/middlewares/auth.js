"use strict";

import UserInfo from "../models/userInfo.js";

export const userAuth = async (req, res, next) => {
    const { accessToken, refreshToken } = req.cookies;
    const user = await UserInfo.findByToken(accessToken, refreshToken);
    if (!user) return res.status(403).json({ message: "velog dashboard's token is not founded, please login again" });
    req.user = user;
    next();
};