const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Operation = require('../models/Operation');
const User = require('../models/User');

// backend/routes/operation.js
router.post('/register', authMiddleware, async (req, res) => {
    // Verificar que req.user esté definido
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Token inválido o no proporcionado' });
    }
    const { monto, plataforma, fecha } = req.body;
    if (monto == null || !plataforma || !fecha) {
        return res.status(400).json({ message: 'Faltan datos: se requieren monto, plataforma y fecha' });
    }
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        const tipoMoneda = user.moneda || '';
        const operation = new Operation({
            userId: req.user.id,
            monto,
            plataforma,
            fecha,
            tipoMoneda
        });
        await operation.save();
        res.json({ message: 'Operación registrada correctamente', operation });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al registrar la operación' });
    }
});


module.exports = router;
