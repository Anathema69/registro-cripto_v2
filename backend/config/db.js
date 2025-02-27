const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Conecta a la base de datos bd_cripto (ya especificado en la cadena)
        await mongoose.connect(process.env.MONGO_URI, {
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
