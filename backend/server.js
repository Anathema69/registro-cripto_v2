const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// Habilitar CORS
app.use(cors());
// Middleware para parsear JSON (debe ir antes de las rutas)
app.use(express.json());
// Logging
app.use(morgan('dev'));

// Si deseas servir archivos estáticos del frontend (opcional)
app.use(express.static(path.join(__dirname, '../frontend')));

// Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
