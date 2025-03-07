const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');


router.put('/update/:id', authMiddleware, async (req, res) => {
    console.log("PUT /update/:id - req.body:", req.body);

    if (!req.body) {
        return res.status(400).json({ message: 'No se recibieron datos' });
    }
    const { telefono, accountNumber, moneda } = req.body;
    if (!telefono || !accountNumber || !moneda) {
        return res.status(400).json({ message: 'Faltan datos: se requieren teléfono, accountNumber y moneda' });
    }
    // Verifica que req.user exista y tenga la propiedad id
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Token inválido o no proporcionado' });
    }
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'No autorizado' });
    }
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { telefono, accountNumber, moneda },
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
