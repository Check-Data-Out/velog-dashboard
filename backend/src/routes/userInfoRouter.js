"use strict";

// ==================== middlewares ==================== //


// import { authCheck } from "../middlewares/auth.js";
import { validateUserInfoCreate } from "../middlewares/validator/userValidator.js";
import { createUserInfo, getAllUserPosts } from "../services/userInfoService.js";

// ==================== Routing ==================== //

const userInfoRouter = (app, endpoint) => {
    app.route(`${endpoint}`).post(validateUserInfoCreate, createUserInfo);
    app.route(`${endpoint}/:userId`).get(getAllUserPosts);
};

export default userInfoRouter;