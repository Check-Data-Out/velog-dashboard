"use strict";
import { totalStats } from "../services/postStatsServices.js";

// ==================== Routing ==================== //

const postStatsRouter = (app, endpoint) => {
    app.route(`${endpoint}/total/:userId`).get(totalStats);
};

export default postStatsRouter;