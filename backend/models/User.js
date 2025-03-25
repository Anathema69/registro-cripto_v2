// backend/models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },

    // Campos que quieres almacenar:
    fullName: { type: String },
    telefono: { type: String },         // Ej. "+51 957111067"
    accountNumber: { type: Number },
    //moneda: { type: String },           // Si quieres seguir guardando la moneda
    birthDate: { type: Date },          // Fecha de nacimiento
    date_last_update: { type: Date }    // Fecha de la última modificación
}, {
    collection: 'users'
});

module.exports = mongoose.model('User', UserSchema);
