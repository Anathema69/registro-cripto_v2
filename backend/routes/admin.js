const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const SALT_ROUNDS = 10;

// Registro de nuevos usuarios desde el panel admin (requiere token y rol admin)
// Ruta para registrar nuevos usuarios desde el panel admin
router.post('/register', authMiddleware, async (req, res) => {
    // Verifica que el usuario autenticado tenga rol "admin"
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'No autorizado' });
    }
    const { email, password, role, nombre } = req.body;
    try {
        // Si ya existe un usuario con ese correo, se retorna el mensaje
        const existingUser = await User.findOne({ email });
        if(existingUser){
            return res.status(400).json({
                message: 'El correo ya existe, por favor use otro correo.'
            });
        }
        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({
            email,
            password: hashedPassword,
            role: role ? role : 'user',
            fullName: nombre
        });
        await newUser.save();
        res.json({ message: 'Usuario creado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al registrar el usuario' });
    }
});


// Obtener lista de usuarios de tipo 'user'
// Endpoint para obtener la lista de usuarios de tipo 'user'
router.get('/users', authMiddleware, async (req, res) => {
    if (!req.user || req.user.role !== 'admin'){
        return res.status(403).json({ message: 'No autorizado' });
    }
    try {
        // Solo se consultan usuarios con rol 'user'
        const users = await User.find({ role: 'user' }, { fullName: 1, email: 1 });
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener usuarios' });
    }
});


// Endpoint para obtener la fecha actual del servidor (formato YYYY-MM-DD)
router.get('/current-date', (req, res) => {
    const currentDate = new Date().toISOString().slice(0,10);
    res.json({ currentDate });
});

module.exports = router;
