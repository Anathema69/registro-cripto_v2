/************************************************
 * routes/user-operation.js
 ************************************************/
const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const authMiddleware = require('../middleware/auth');

const Operation = require('../models/Operation');
const User = require('../models/User');

// Configura Multer para guardar en /uploads
// y renombrar el archivo como "constancia_{id_usuario}_{timestamp}.ext"
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Carpeta donde se guardan las imágenes
    },
    filename: (req, file, cb) => {
        // userId se obtiene del authMiddleware => req.user.id
        // Asegúrate de que tu middleware asigna 'req.user'
        const userId = req.user.id;
        console.log('MULTER -> userId:', userId); // Depuración

        const extension = path.extname(file.originalname); // Ej: ".jpg", ".png"
        const timestamp = Date.now(); // milisegundos
        // Nombre final: "constancia_{id_usuario}_{timestamp}{ext}"
        const newFilename = `constancia_${userId}_${timestamp}${extension}`;
        console.log('MULTER -> newFilename:', newFilename); // Depuración

        cb(null, newFilename);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        // Solo permitir mimetypes que empiecen con "image/"
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten imágenes'), false);
        }
    }
});

/**
 * POST /api/operation/register
 * Registra una operación con multipart/form-data (receiptImage opcional)
 */
router.post(
    '/register',
    authMiddleware,            // Verifica token y asigna req.user
    upload.single('receiptImage'), // Sube el archivo con Multer
    async (req, res) => {
        try {
            // userId viene de req.user (gracias a authMiddleware)
            const userId = req.user.id;
            console.log('POST /register -> userId:', userId);

            // Verifica si el usuario existe en la DB
            const user = await User.findById(userId);
            if (!user) {
                console.log('POST /register -> Usuario no encontrado:', userId);
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            // Extrae los campos de req.body
            // (con multipart/form-data vienen como strings)
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

            // Si se subió un archivo, req.file existirá
            let receiptImagePath = null;
            if (req.file) {
                // Debe mostrar algo como: "uploads/constancia_123abc_1678899999999.jpg"
                receiptImagePath = req.file.path;
                console.log('POST /register -> req.file.path:', receiptImagePath);
            }

            // Crea la nueva operación
            const newOperation = new Operation({
                userId,
                canal,
                plataforma,
                ordenNum: ordenNum ? parseInt(ordenNum) : null,
                tipoActivo,
                activo,
                moneda,
                monto: monto ? parseFloat(monto) : null,
                cantidad: cantidad ? parseFloat(cantidad) : null,
                total: total ? parseFloat(total) : null,
                comision: comision ? parseFloat(comision) : null,
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
                fecha: fecha ? new Date(fecha) : new Date(),
                // Guardamos la ruta del archivo
                receiptImage: receiptImagePath
            });

            await newOperation.save();
            console.log('POST /register -> Operación registrada OK');
            return res.json({ message: 'Operación registrada correctamente' });
        } catch (error) {
            console.error('Error en POST /api/operation/register:', error);
            return res.status(500).json({ message: 'Error al registrar la operación' });
        }
    }
);

module.exports = router;
