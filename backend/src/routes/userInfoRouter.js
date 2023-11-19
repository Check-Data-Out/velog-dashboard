"use strict";
// import { authCheck } from "../middlewares/auth.js";
import { validateUserInfoCreate } from "../middlewares/validator/userValidator.js";
import { userAuth } from "../middlewares/auth.js";
import { signUpORsignIn, signInSample, getUserAllInfo, getUserOnlyInfo } from "../services/userInfoServices.js";

// ==================== Routing ==================== //

const userInfoRouter = (app, endpoint) => {
    app.route(`${endpoint}`).post(validateUserInfoCreate, signUpORsignIn);
    app.route(`${endpoint}/sample`).post(signInSample);
    app.route(`${endpoint}/:userId`).get(userAuth, getUserOnlyInfo);
    app.route(`${endpoint}/all/:userId`).get(userAuth, getUserAllInfo);
};

export default userInfoRouter;