const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');

// Para solicitudes preflight
router.options('/update/:id', (req, res) => res.sendStatus(200));

router.put('/update/:id', authMiddleware, async (req, res) => {
    // Imprimir req.body para debug
    console.log("PUT /update/:id - req.body:", req.body);

    if (!req.body) {
        return res.status(400).json({ message: 'No se recibieron datos' });
    }
    const { fullName, accountNumber } = req.body;
    if (!fullName || !accountNumber) {
        return res.status(400).json({ message: 'Faltan datos: se requieren fullName y accountNumber' });
    }
    // Permitir solo que el mismo usuario o un admin actualice
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'No autorizado' });
    }
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { fullName, accountNumber },
            { new: true }
        );
        if (!updatedUser) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json({ message: 'Datos actualizados correctamente', user: updatedUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar los datos' });
    }
});

module.exports = router;
