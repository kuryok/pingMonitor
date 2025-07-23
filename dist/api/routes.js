"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
// GET /api/monitors - List all monitors
router.get('/', async (req, res) => {
    try {
        const monitors = await prisma.monitor.findMany({
            orderBy: { createdAt: 'asc' },
        });
        res.json(monitors);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch monitors' });
    }
});
// POST /api/monitors - Create a new monitor
router.post('/', async (req, res) => {
    try {
        const { name, type, target, port, interval } = req.body;
        // Basic validation
        if (!name || !type || !target) {
            return res.status(400).json({ error: 'Missing required fields: name, type, target' });
        }
        const newMonitor = await prisma.monitor.create({
            data: {
                name,
                type,
                target,
                port,
                interval,
            },
        });
        res.status(201).json(newMonitor);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create monitor' });
    }
});
exports.default = router;
