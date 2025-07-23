
import express from 'express';
import path from 'path';
import monitorRoutes from './routes';
import settingsRoutes from './settingsRoutes';

export function createServer() {
    const app = express();

    // Middleware to parse JSON bodies
    app.use(express.json());

    // Serve static files from the 'public' directory
    const publicPath = path.join(__dirname, '../../public');
    app.use(express.static(publicPath));

    app.use('/api/monitors', monitorRoutes);
    app.use('/api/settings', settingsRoutes);

    // A simple health check endpoint
    app.get('/api/health', (req, res) => {
        res.json({ status: 'OK', timestamp: new Date() });
    });

    return app;
}

export function startServer() {
    const app = createServer();
    const port = process.env.PORT || 3000;

    app.listen(port, () => {
        console.log(`API Server listening on http://localhost:${port}`);
    });
}
