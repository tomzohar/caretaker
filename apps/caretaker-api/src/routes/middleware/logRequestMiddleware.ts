import {RequestHandler} from "express";
import {LogColor, LogColorCode} from "./logger/colors";
import {StatusCode} from "../../types";

const statusCodesColorMap: Record<StatusCode, LogColor> = {
    [StatusCode.OK]: LogColor.GREEN,
    [StatusCode.CREATED]: LogColor.GREEN,
    [StatusCode.NO_CONTENT]: LogColor.GREEN,
    [StatusCode.BAD_REQUEST]: LogColor.RED,
    [StatusCode.UNAUTHORIZED]: LogColor.RED,
    [StatusCode.NOT_FOUND]: LogColor.RED,
    [StatusCode.INTERNAL_SERVER_ERROR]: LogColor.RED,
}

const logRequestMiddleware: RequestHandler = (req, res, next) => {
    const requestPath = req.path;
    setTimeout(() => {
        const statusLogColor = statusCodesColorMap[res.statusCode as StatusCode] || LogColor.GREEN;
        const dateLog = `[${new Date().toUTCString()}]`;
        const requestMethodLog = `${LogColor.YELLOW}${req.method}${LogColorCode.RESET}`;
        const statusLog = `${statusLogColor}${res.statusCode}${LogColorCode.RESET}`;
        console.log(`${dateLog} ${statusLog} ${requestMethodLog} ${requestPath}`);
    })
    next();
};

export default logRequestMiddleware;
