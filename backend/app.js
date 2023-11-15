import createError from "http-errors";
import express from "express";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

// ==================== APP config Setting ==================== //

dotenv.config(); // add .env file 
const app = express();

// DB connection
const dbInfo = JSON.parse(process.env.DB_INFO);
const dbUrl = `mongodb+srv://${dbInfo.username}:${dbInfo.password}@${dbInfo.host}/${dbInfo.database}?retryWrites=true&w=majority`;
mongoose.connect(dbUrl, {
    dbName: dbInfo.database,
    useUnifiedTopology: true,
    useNewUrlParser: true,
})
    .then(() => console.log("DB Connected!"))
    .catch(err => {
        console.log("DB Connection Error: " + err.message);
    });

app.use(cors());
app.use(logger("dev"));
app.use(express.json()); // body-parser setting ~ express include body-parser from 4.X version
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.set("env", process.env.NODE_ENV);

// ==================== API Routing Setting ==================== //

import userInfoRouter from "./src/routes/userInfoRouter.js";
import postStatsRouter from "./src/routes/postStatsRouter.js";

// router mapping
userInfoRouter(app, "/api/user");
postStatsRouter(app, "/api/post");

// ==================== Other Config Setting ==================== //

// catch 404 and forward to error handler
app.use(function (req, res, next) { next(createError(404)); });

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error pag
    res.status(err.status || 500);

    res.json({
        message: err.message,
        error: err
    });
});

export default app;