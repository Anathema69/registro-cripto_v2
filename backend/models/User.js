const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email:         { type: String, required: true, unique: true },
    password:      { type: String, required: true },
    role:          { type: String, enum: ['admin', 'user'], default: 'user' },
    fullName:      { type: String },
    telefono:      { type: String },      // Nuevo campo para teléfono
    moneda:        { type: String },      // Nuevo campo para tipo de moneda
    accountNumber: { type: Number }
}, { collection: 'users' });

module.exports = mongoose.model('User', UserSchema);
