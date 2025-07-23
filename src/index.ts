
import { startScheduler } from './core/scheduler';

console.log('Iniciando Monitoramento Taguatinga Norte...');

// Start the background monitoring jobs
startScheduler();

import { startServer } from './api/server';

// Start the API server
startServer();
