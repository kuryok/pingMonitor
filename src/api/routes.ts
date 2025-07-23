
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { checkMonitor } from '../core/scheduler';

const prisma = new PrismaClient();
const router = Router();

// Helper to map Uptime Kuma type to our type
function mapUptimeKumaType(ukType: string): string {
    if (ukType === 'ping') return 'ping';
    if (ukType === 'http' || ukType === 'https') return 'http';
    if (ukType === 'tcp') return 'tcp';
    return 'unknown'; // Fallback for unsupported types
}

// Helper to infer category from monitor name
function inferCategoryFromName(monitorName: string): string {
    const lowerName = monitorName.toLowerCase();
    if (lowerName.includes('impressora')) return 'Impressoras';
    if (lowerName.includes('servidor')) return 'Servidores';
    if (lowerName.includes('serviço') || lowerName.includes('servico')) return 'Serviços';
    if (lowerName.includes('catraca')) return 'Catracas';
    if (lowerName.includes('monitor lg')) return 'Monitores';
    if (lowerName.includes('link')) return 'Links';
    if (lowerName.includes('host') || lowerName.includes('gateway') || lowerName.includes('dns')) return 'Hosts';
    return 'Outros'; // Default if no specific keyword is found
}

// GET /api/monitors - List all monitors
router.get('/', async (req, res) => {
    try {
        const monitors = await prisma.monitor.findMany({
            orderBy: { createdAt: 'asc' },
        });
        res.json(monitors);
    } catch (error) {
        res.status(500).json({ error: 'Falha ao buscar monitores' });
    }
});

// POST /api/monitors - Create a new monitor
router.post('/', async (req, res) => {
    try {
        const { name, type, target, port, interval, category } = req.body;

        // Basic validation
        if (!name || !type || !target) {
            return res.status(400).json({ error: 'Campos obrigatórios ausentes: nome, tipo, alvo' });
        }

        // Sanitize data before saving
        const sanitizedData = {
            name,
            type,
            target,
            port: port ? parseInt(port, 10) : null,
            interval: interval ? parseInt(interval, 10) : 60, // Default to 60s
            category: category || "Outros", // Default category
        };

        const newMonitor = await prisma.monitor.create({
            data: sanitizedData,
        });

        // Trigger a check immediately in the background
        checkMonitor(newMonitor);

        res.status(201).json(newMonitor);
    } catch (error) {
        res.status(500).json({ error: 'Falha ao criar monitor' });
    }
});

// PUT /api/monitors/:id - Update an existing monitor
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, type, target, port, interval, category } = req.body;

        // Basic validation
        if (!name || !type || !target) {
            return res.status(400).json({ error: 'Campos obrigatórios ausentes: nome, tipo, alvo' });
        }

        const sanitizedData = {
            name,
            type,
            target,
            port: port ? parseInt(port, 10) : null,
            interval: interval ? parseInt(interval, 10) : 60,
            category: category || "Outros",
        };

        const updatedMonitor = await prisma.monitor.update({
            where: { id: parseInt(id) },
            data: sanitizedData,
        });

        // Trigger a check immediately in the background for the updated monitor
        checkMonitor(updatedMonitor);

        res.status(200).json(updatedMonitor);
    } catch (error) {
        console.error('Erro ao atualizar monitor:', error);
        res.status(500).json({ error: 'Falha ao atualizar monitor.' });
    }
});

// DELETE /api/monitors/:id - Delete a monitor
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.metric.deleteMany({
            where: { monitorId: parseInt(id) },
        });
        await prisma.monitor.delete({
            where: { id: parseInt(id) },
        });
        res.status(204).send(); // No content
    } catch (error) {
        console.error('Erro ao deletar monitor:', error);
        res.status(500).json({ error: 'Falha ao deletar monitor.' });
    }
});

export default router;
