"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const scheduler_1 = require("./core/scheduler");
console.log('Starting Ping Monitor...');
// Start the background monitoring jobs
(0, scheduler_1.startScheduler)();
const server_1 = require("./api/server");
// Start the API server
(0, server_1.startServer)();
