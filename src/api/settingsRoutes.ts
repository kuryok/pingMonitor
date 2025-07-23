import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

// GET /api/settings - Get all settings
router.get('/', async (req, res) => {
    try {
        const settings = await prisma.setting.findMany();
        // Convert array of { key, value } to a single object { key: value }
        const settingsObject = settings.reduce((acc: Record<string, string>, setting) => {
            acc[setting.key] = setting.value;
            return acc;
        }, {});
        res.json(settingsObject);
    } catch (error) {
        res.status(500).json({ error: 'Falha ao buscar configurações' });
    }
});

// POST /api/settings - Update a setting (or create if not exists)
router.post('/', async (req, res) => {
    try {
        const { key, value } = req.body;
        if (!key || value === undefined) {
            return res.status(400).json({ error: 'Campos obrigatórios ausentes: chave, valor' });
        }

        const updatedSetting = await prisma.setting.upsert({
            where: { key: key },
            update: { value: value },
            create: { key: key, value: value },
        });
        res.json(updatedSetting);
    } catch (error) {
        res.status(500).json({ error: 'Falha ao atualizar configuração' });
    }
});

export default router;