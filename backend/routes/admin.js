const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Ruta para registrar nuevos usuarios (admin o user)
router.post('/register', async (req, res) => {
    const { email, password, role } = req.body;
    try {
        const newUser = new User({ email, password, role });
        await newUser.save();
        res.json({ message: 'Usuario creado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al registrar el usuario' });
    }
});

module.exports = router;
