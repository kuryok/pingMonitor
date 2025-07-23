import cron from 'node-cron';
import { PrismaClient, Monitor } from '@prisma/client';
import { checkPing } from '../services/ping';
import { checkHttp } from '../services/http';
import { checkTcp } from '../services/tcp';

const prisma = new PrismaClient();

/**
 * Performs a check for a single monitor, updates its status, and saves the metric.
 * @param monitor The monitor object to check.
 */
export async function checkMonitor(monitor: Monitor) {
    let result: { status: 'UP' | 'DOWN'; latency: number | null };

    console.log(`Verificando ${monitor.name} (${monitor.type}:${monitor.target})...`);

    try {
        switch (monitor.type) {
            case 'ping':
                result = await checkPing(monitor.target);
                break;
            case 'http':
                result = await checkHttp(monitor.target);
                break;
            case 'tcp':
                if (!monitor.port) {
                    throw new Error('A porta é obrigatória para verificações TCP.');
                }
                result = await checkTcp(monitor.target, monitor.port);
                break;
            default:
                console.error(`Tipo de monitor desconhecido: ${monitor.type}`);
                return; // Stop processing this monitor
        }

        // Save the metric
        await prisma.metric.create({
            data: {
                monitorId: monitor.id,
                status: result.status,
                latency: result.latency,
            },
        });

        // Update the monitor's overall status and lastCheckedAt
        await prisma.monitor.update({
            where: { id: monitor.id },
            data: { status: result.status, lastCheckedAt: new Date() },
        });

        console.log(`  -> Status: ${result.status}, Latência: ${result.latency ?? 'N/A'}ms`);

    } catch (error) {
        console.error(`Falha ao verificar ${monitor.name}:`, error);
        // Mark as DOWN on error and update lastCheckedAt
        await prisma.monitor.update({
            where: { id: monitor.id },
            data: { status: 'DOWN', lastCheckedAt: new Date() },
        });
    }
}

async function runAllChecks() {
    console.log('Executando verificações agendadas...');
    const monitors = await prisma.monitor.findMany();
    const now = Date.now();

    for (const monitor of monitors) {
        // Check if it's time to run this monitor's check
        const lastChecked = monitor.lastCheckedAt ? monitor.lastCheckedAt.getTime() : 0;
        const intervalMs = monitor.interval * 1000; // Convert seconds to milliseconds

        if (now - lastChecked >= intervalMs) {
            // We call the check without await to run them in parallel
            checkMonitor(monitor);
        } else {
            console.log(`Pulando ${monitor.name}: ainda não é a hora. Próxima verificação em ${Math.round((intervalMs - (now - lastChecked)) / 1000)}s`);
        }
    }
    console.log('Finalizadas todas as verificações agendadas.');
}

// Schedule to run every 10 seconds
export function startScheduler() {
    cron.schedule('*/10 * * * * *', runAllChecks); // Runs every 10 seconds
    console.log('Agendador iniciado. As verificações serão executadas a cada 10 segundos.');
    // Run checks once on startup as well
    runAllChecks();
}