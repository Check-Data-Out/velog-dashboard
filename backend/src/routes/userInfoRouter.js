"use strict";

// ==================== middlewares ==================== //

// import { validateUserCreate } from "../middlewares/validators/userValidator.js";
// import { authCheck } from "../middlewares/auth.js";
import { createUserInfo } from "../services/userInfoService";

// ==================== Routing ==================== //

const userInfoRouter = (app, endpoint) => {
    app.route(`${endpoint}`).post(createUserInfo);
};

export default userInfoRouter;