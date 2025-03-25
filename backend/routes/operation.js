const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Operation = require('../models/Operation');
const User = require('../models/User');

router.post('/register', authMiddleware, async (req, res) => {
    console.log("Llegó petición a /api/operation/register", req.body);
    const {
        canal,
        plataforma,
        ordenNum,
        tipoActivo,
        activo,
        moneda,
        monto,
        cantidad,
        total,
        comision,
        titularNombre,
        titularTipoID,
        titularDocumento,
        titularDireccion,
        terceroNombre,
        terceroTipoID,
        terceroDocumento,
        cuentaOrigen,
        cuentaDestino,
        referenciaPago,
        estadoPago,
        fecha
    } = req.body;

    // Verifica que existan los campos
    if (!canal || !plataforma || !ordenNum || !tipoActivo || !activo || !moneda ||
        monto == null || cantidad == null || total == null || comision == null ||
        !titularNombre || !titularTipoID || !titularDocumento || !titularDireccion ||
        !terceroNombre || !terceroTipoID || !terceroDocumento ||
        !cuentaOrigen || !cuentaDestino || !referenciaPago || !estadoPago || !fecha
    ) {
        return res.status(400).json({ message: 'Faltan datos para registrar la operación' });
    }

    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const newOperation = new Operation({
            userId,
            canal,
            plataforma,
            ordenNum,
            tipoActivo,
            activo,
            moneda,
            monto,
            cantidad,
            total,
            comision,
            titularNombre,
            titularTipoID,
            titularDocumento,
            titularDireccion,
            terceroNombre,
            terceroTipoID,
            terceroDocumento,
            cuentaOrigen,
            cuentaDestino,
            referenciaPago,
            estadoPago,
            fecha: new Date(fecha) // parsear a tipo Date
        });

        await newOperation.save();
        return res.json({ message: 'Operación registrada correctamente' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al registrar la operación' });
    }
});

module.exports = router;
