/************************************************
 * server.js
 ************************************************/
const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// Para evitar logs de archivos estáticos (js, css, icon, imágenes, etc.)
app.use(morgan('dev', {
    skip: (req, res) => {
        // Si la URL coincide con estos patrones, no se loggea
        return (
            req.url.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|map)$/i) ||
            req.url.includes('/icon/')
        );
    }
}));

app.use(cors({
    origin: 'https://registro-cripto-v2.onrender.com'
}));
app.use(express.json());

// Servir estáticos desde 'frontend'
app.use(express.static(path.join(__dirname, '../frontend')));

// Rutas de la API
app.use('/api/auth', require('./routes/auth'));
// Ajusta el nombre si tu archivo se llama user-panel.js
app.use('/api/user', require('./routes/user-panel'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/operation', require('./routes/user-operation'));
app.use('/api/history', require('./routes/user-history-operations'));
app.use('/uploads', express.static('uploads'));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
