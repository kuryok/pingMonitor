"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServer = createServer;
exports.startServer = startServer;
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const routes_1 = __importDefault(require("./routes"));
function createServer() {
    const app = (0, express_1.default)();
    // Middleware to parse JSON bodies
    app.use(express_1.default.json());
    // Serve static files from the 'public' directory
    const publicPath = path_1.default.join(__dirname, '../../public');
    app.use(express_1.default.static(publicPath));
    // API routes will be added here later
    app.use('/api/monitors', routes_1.default);
    // A simple health check endpoint
    app.get('/api/health', (req, res) => {
        res.json({ status: 'OK', timestamp: new Date() });
    });
    return app;
}
function startServer() {
    const app = createServer();
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`API Server listening on http://localhost:${port}`);
    });
}
