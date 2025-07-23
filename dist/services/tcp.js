"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkTcp = checkTcp;
const net_1 = __importDefault(require("net"));
/**
 * Checks the status of a TCP port on a host.
 * @param target The IP address or hostname.
 * @param port The port number to check.
 * @returns An object with the status and latency.
 */
async function checkTcp(target, port) {
    return new Promise((resolve) => {
        const socket = new net_1.default.Socket();
        const startTime = Date.now();
        socket.setTimeout(10000); // 10-second timeout
        socket.on('connect', () => {
            const latency = Date.now() - startTime;
            socket.destroy();
            resolve({ status: 'UP', latency });
        });
        socket.on('error', () => {
            socket.destroy();
            resolve({ status: 'DOWN', latency: null });
        });
        socket.on('timeout', () => {
            socket.destroy();
            resolve({ status: 'DOWN', latency: null });
        });
        socket.connect(port, target);
    });
}
