"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkHttp = checkHttp;
const axios_1 = __importDefault(require("axios"));
/**
 * Checks the status of a web server using an HTTP GET request.
 * @param target The URL to check (e.g., https://google.com).
 * @returns An object with the status and latency.
 */
async function checkHttp(target) {
    const startTime = Date.now();
    try {
        const response = await axios_1.default.get(target, {
            timeout: 10000, // 10-second timeout
            validateStatus: (status) => status >= 200 && status < 300, // Only 2xx status codes are considered UP
        });
        const latency = Date.now() - startTime;
        return { status: 'UP', latency };
    }
    catch (error) {
        const latency = Date.now() - startTime;
        // Axios throws an error for non-2xx status codes or other network issues.
        return { status: 'DOWN', latency };
    }
}
