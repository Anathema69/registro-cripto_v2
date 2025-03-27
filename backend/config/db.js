const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Decodifica la URL de MongoDB desde base64 si está en la variable de entorno
        const mongoUri = process.env.MONGO_URI_BASE64
            ? Buffer.from(process.env.MONGO_URI_BASE64, 'base64').toString('utf8')
            : process.env.MONGO_URI;

        if (!mongoUri) {
            throw new Error("No se encontró MONGO_URI ni MONGO_URI_BASE64 en las variables de entorno.");
        }

        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('MongoDB conectado');
    } catch (error) {
        console.error('No se pudo conectar a MongoDB. Error: ' + error);
        process.exit(1);
    }
};

module.exports = connectDB;
