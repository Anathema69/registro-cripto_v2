/************************************************
 * routes/user-panel.js
 ************************************************/
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');

// GET /api/user/:id
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        // Verifica si el usuario logueado coincide con el :id o si es admin
        if (!req.user || (req.user.id !== req.params.id && req.user.role !== 'admin')) {
            return res.status(403).json({ message: 'No autorizado' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener usuario' });
    }
});

// PUT /api/user/update/:id (ejemplo, si necesitas actualizar datos)
router.put('/update/:id', authMiddleware, async (req, res) => {
    try {
        // Igualmente, verifica permisos
        if (!req.user || (req.user.id !== req.params.id && req.user.role !== 'admin')) {
            return res.status(403).json({ message: 'No autorizado' });
        }

        const { fullName, telefono, accountNumber, moneda } = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { fullName, telefono, accountNumber, moneda },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json({ message: 'Datos actualizados', user: updatedUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar' });
    }
});

module.exports = router;
