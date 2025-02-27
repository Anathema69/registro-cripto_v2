const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Ruta para actualizar datos del usuario normal
router.put('/update/:id', async (req, res) => {
    const { fullName, accountNumber } = req.body;
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { fullName, accountNumber },
            { new: true }
        );
        if (!updatedUser) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json({ message: 'Datos actualizados', user: updatedUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar los datos' });
    }
});

module.exports = router;
