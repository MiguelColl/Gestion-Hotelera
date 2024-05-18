const mongoose = require('mongoose');

let limpiezasSchema = new mongoose.Schema({
    habitacion: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'habitaciones'
    },
    fecha: {
        type: Date,
        required: true,
        default: Date.now
    },
    observaciones: {
        type: String,
        trim: true
    }
});

let Limpieza = mongoose.model('limpiezas', limpiezasSchema);
module.exports = Limpieza;