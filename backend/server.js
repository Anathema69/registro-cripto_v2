const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const morgan = require('morgan');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// Middleware de logging simple para cada solicitud
app.use((req, res, next) => {
    console.log(`Request: ${req.method} ${req.url}`);
    next();
});

// Middleware de logging con morgan (opcional, para más detalles)
app.use(morgan('dev'));

// Middleware para parsear JSON
app.use(express.json());

// Ruta absoluta de la carpeta frontend (asegúrate de que la estructura sea la correcta)
const staticPath = path.join(__dirname, '../frontend');
console.log("Sirviendo archivos estáticos desde: " + staticPath);
app.use(express.static(staticPath));

// Rutas de autenticación
app.use('/api/auth', require('./routes/auth'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
