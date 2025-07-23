"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startScheduler = startScheduler;
const node_cron_1 = __importDefault(require("node-cron"));
const client_1 = require("@prisma/client");
const ping_1 = require("../services/ping");
const http_1 = require("../services/http");
const tcp_1 = require("../services/tcp");
const prisma = new client_1.PrismaClient();
async function runChecks() {
    console.log('Running scheduled checks...');
    const monitors = await prisma.monitor.findMany();
    for (const monitor of monitors) {
        let result;
        console.log(`Checking ${monitor.name} (${monitor.type}:${monitor.target})...`);
        try {
            switch (monitor.type) {
                case 'ping':
                    result = await (0, ping_1.checkPing)(monitor.target);
                    break;
                case 'http':
                    result = await (0, http_1.checkHttp)(monitor.target);
                    break;
                case 'tcp':
                    if (!monitor.port) {
                        throw new Error('Port is required for TCP checks.');
                    }
                    result = await (0, tcp_1.checkTcp)(monitor.target, monitor.port);
                    break;
                default:
                    console.error(`Unknown monitor type: ${monitor.type}`);
                    continue; // Skip to the next monitor
            }
            // Save the metric
            await prisma.metric.create({
                data: {
                    monitorId: monitor.id,
                    status: result.status,
                    latency: result.latency,
                },
            });
            // Update the monitor's overall status
            await prisma.monitor.update({
                where: { id: monitor.id },
                data: { status: result.status },
            });
            console.log(`  -> Status: ${result.status}, Latency: ${result.latency ?? 'N/A'}ms`);
        }
        catch (error) {
            console.error(`Failed to check ${monitor.name}:`, error);
            // Optionally, update monitor status to indicate an error
            await prisma.monitor.update({
                where: { id: monitor.id },
                data: { status: 'DOWN' }, // Mark as DOWN on error
            });
        }
    }
    console.log('Finished scheduled checks.');
}
// Schedule to run every minute
function startScheduler() {
    node_cron_1.default.schedule('* * * * *', runChecks);
    console.log('Scheduler started. Checks will run every minute.');
    // Run checks once on startup as well
    runChecks();
}
