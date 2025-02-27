const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET;

// Endpoint de Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        // Nota: En producción deberías usar hashing de contraseñas
        const user = await User.findOne({ email, password });
        if (!user) {
            return res.status(400).json({ message: 'Credenciales inválidas' });
        }
        // Genera el token JWT incluyendo el id y el rol del usuario
        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
        return res.json({ token, role: user.role });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error en el servidor' });
    }
});

// Endpoint de Registro (nuevo usuario)
router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    try {
        // Crea un usuario con rol "user" por defecto
        const newUser = new User({ email, password, role: 'user' });
        await newUser.save();
        res.json({ message: 'Usuario registrado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al registrar el usuario' });
    }
});

module.exports = router;
