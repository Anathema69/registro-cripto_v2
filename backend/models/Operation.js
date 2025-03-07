const mongoose = require('mongoose');

const OperationSchema = new mongoose.Schema({
    userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    monto:       { type: Number, required: true },
    plataforma:  { type: String, required: true },
    fecha:       { type: Date, required: true },
    tipoMoneda:  { type: String, required: true }
}, { collection: 'operations', timestamps: true });

module.exports = mongoose.model('Operation', OperationSchema);
