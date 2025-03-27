/************************************************
 * routes/user-history-operations.js
 ************************************************/
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Operation = require('../models/Operation');

/**
 * GET /api/history?userId=xxx
 * Retorna el historial de operaciones de un usuario
 * Requiere token (authMiddleware)
 */
router.get('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.query.userId;
        if (!userId) {
            return res.status(400).json({ message: 'Falta userId en la query' });
        }

        // Verifica que sea el mismo usuario o rol admin
        if (req.user.id !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'No autorizado' });
        }

        // Busca todas las operaciones de ese userId
        // Ordenadas por fecha de creación descendente
        const operations = await Operation.find({ userId }).sort({ createdAt: -1 });

        return res.json(operations);
    } catch (error) {
        console.error('Error en GET /api/history:', error);
        return res.status(500).json({ message: 'Error al obtener operaciones' });
    }
});

module.exports = router;
