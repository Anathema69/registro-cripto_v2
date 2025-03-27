const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const SALT_ROUNDS = 10;
// routes/admin.js



const Operation = require('../models/Operation');

const ExcelJS = require('exceljs');

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



// routes/admin.js

router.get('/report', authMiddleware, async (req, res) => {
    try {
        // Solo admin
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).send('No autorizado');
        }

        let { userIds, startDate, endDate } = req.query;
        if (!userIds) {
            return res.status(400).send('Faltan userIds');
        }
        if (!Array.isArray(userIds)) {
            userIds = [userIds];
        }
        if (!startDate || !endDate) {
            return res.status(400).send('Faltan startDate o endDate');
        }

        const start = new Date(`${startDate}T00:00:00`);
        const end = new Date(`${endDate}T23:59:59.999`);

        // Buscar operaciones filtradas por userIds y createdAt en rango
        // Además, hacemos populate para traer fullName y email del usuario
        const operations = await Operation.find({
            userId: { $in: userIds },
            createdAt: { $gte: start, $lte: end }
        })
            .populate('userId', 'fullName email')
            .sort({ createdAt: 1 });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Reporte');

        // Columnas para el reporte
        worksheet.columns = [
            { header: 'Usuario', key: 'fullName', width: 20 },
            { header: 'Email', key: 'email', width: 25 },
            { header: 'Canal', key: 'canal', width: 12 },
            { header: 'Plataforma', key: 'plataforma', width: 12 },
            { header: 'Orden N°', key: 'ordenNum', width: 10 },
            { header: 'Tipo', key: 'tipoActivo', width: 10 },
            { header: 'Activo', key: 'activo', width: 10 },
            { header: 'Moneda', key: 'moneda', width: 10 },
            { header: 'Monto', key: 'monto', width: 12 },
            { header: 'Cantidad', key: 'cantidad', width: 12 },
            { header: 'Total', key: 'total', width: 12 },
            { header: 'Comisión', key: 'comision', width: 10 },
            { header: 'Titular', key: 'titularNombre', width: 16 },
            { header: 'Tipo ID Titular', key: 'titularTipoID', width: 10 },
            { header: 'Documento Titular', key: 'titularDocumento', width: 14 },
            { header: 'Dirección Titular', key: 'titularDireccion', width: 18 },
            { header: 'Tercero', key: 'terceroNombre', width: 16 },
            { header: 'Tipo ID Tercero', key: 'terceroTipoID', width: 10 },
            { header: 'Documento Tercero', key: 'terceroDocumento', width: 14 },
            { header: 'Cuenta Origen', key: 'cuentaOrigen', width: 14 },
            { header: 'Cuenta Destino', key: 'cuentaDestino', width: 14 },
            { header: 'Referencia', key: 'referenciaPago', width: 14 },
            { header: 'Estado', key: 'estadoPago', width: 10 },
            { header: 'Fecha Usuario', key: 'fecha', width: 14 },
            { header: 'Fecha Registro', key: 'createdAt', width: 20 }
        ];

        // Poner en negrita la fila de encabezados
        worksheet.getRow(1).font = { bold: true };

        // Agregar filas
        operations.forEach(op => {
            worksheet.addRow({
                fullName: op.userId ? op.userId.fullName : '',
                email: op.userId ? op.userId.email : '',
                canal: op.canal || '',
                plataforma: op.plataforma || '',
                ordenNum: op.ordenNum || '',
                tipoActivo: op.tipoActivo || '',
                activo: op.activo || '',
                moneda: op.moneda || '',
                monto: op.monto || '',
                cantidad: op.cantidad || '',
                total: op.total || '',
                comision: op.comision || '',
                titularNombre: op.titularNombre || '',
                titularTipoID: op.titularTipoID || '',
                titularDocumento: op.titularDocumento || '',
                titularDireccion: op.titularDireccion || '',
                terceroNombre: op.terceroNombre || '',
                terceroTipoID: op.terceroTipoID || '',
                terceroDocumento: op.terceroDocumento || '',
                cuentaOrigen: op.cuentaOrigen || '',
                cuentaDestino: op.cuentaDestino || '',
                referenciaPago: op.referenciaPago || '',
                estadoPago: op.estadoPago || '',
                fecha: op.fecha ? op.fecha.toISOString().slice(0,10) : '',
                createdAt: op.createdAt ? op.createdAt.toLocaleString('es-ES') : ''
            });
        });

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            'attachment; filename="reporte.xlsx"'
        );

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Error generando reporte Excel:', error);
        res.status(500).send('Error interno al generar reporte');
    }
});

module.exports = router;