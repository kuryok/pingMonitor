"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPing = checkPing;
const ping_1 = __importDefault(require("ping"));
/**
 * Checks the status of a host using an ICMP ping.
 * @param target The IP address or hostname to ping.
 * @returns An object with the status and latency.
 */
async function checkPing(target) {
    try {
        const res = await ping_1.default.promise.probe(target);
        if (res.alive) {
            const latency = res.time !== 'unknown' ? Math.round(res.time) : null;
            return { status: 'UP', latency };
        }
    }
    catch (error) {
        // The ping library can throw errors for invalid hosts, etc.
        console.error(`Error pinging ${target}:`, error);
    }
    return { status: 'DOWN', latency: null };
}
