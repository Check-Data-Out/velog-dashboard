"use strict";
import { userAuth } from "../middlewares/auth.js";
import { totalStats, getAllPostsWithTotal } from "../services/postStatsServices.js";

// ==================== Routing ==================== //

const postStatsRouter = (app, endpoint) => {
    app.route(`${endpoint}/:userId`).get(userAuth, getAllPostsWithTotal);
    app.route(`${endpoint}/total/:userId`).get(userAuth, totalStats);
};

export default postStatsRouter;