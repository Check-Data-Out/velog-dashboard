"use strict";
import { userAuth } from "../middlewares/auth.js";
import { totalStats, dailyTotalView, getAllPostsWithTotal, getPostByUUID } from "../services/postStatsServices.js";

// ==================== Routing ==================== //

const postStatsRouter = (app, endpoint) => {
    app.route(`${endpoint}`).get(userAuth, getPostByUUID);
    app.route(`${endpoint}/:userId`).get(userAuth, getAllPostsWithTotal);
    app.route(`${endpoint}/total/:userId`).get(userAuth, totalStats);
    app.route(`${endpoint}/daily/:userId`).get(userAuth, dailyTotalView);
};

export default postStatsRouter;