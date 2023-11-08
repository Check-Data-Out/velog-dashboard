"use strict";

import UserInfo from "../models/userInfo";

export const createUserInfo = async (req, res) => {
    const { body: { accessToken, refreshToken } } = req;

    if (accessToken || refreshToken) {

    }


}