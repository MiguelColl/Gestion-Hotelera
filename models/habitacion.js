const mongoose = require("mongoose");

let incidenciasSchema = new mongoose.Schema({
    descripcion: {
        type: String,
        required: [true, 'Es necesario indicar una descripción de la incidencia'],
        trim: true
    },
    inicio: {
        type: Date,
        required: true,
        default: Date.now
    },
    fin: {
        type: Date
    },
    imagen: {
        type: String
    }
});

let habitacionesSchema = new mongoose.Schema({
    numero: {
        type: Number,
        required: [true, 'Es necesario indicar el número de la habitación'],
        min: [1, 'El número mínimo de la habitacíon debe ser 1'],
        max: [50, 'El número máximo de la habitación no puede exceder de 50'],
        unique: true
    },
    tipo: {
        type: String,
        required: [true, 'Debes seleccionar un tipo de habitación'],
        enum: ['individual', 'doble', 'familiar', 'suite']
    },
    descripcion: {
        type: String,
        required: [true, 'Es necesario indicar una descripción de la habitación'],
        trim: true
    },
    ultimaLimpieza: {
        type: Date,
        required: true,
        default: Date.now
    },
    precio: {
        type: Number,
        required: [true, 'Es necesario indicar el precio de la habitación'],
        min: [0, 'El precio mínimo debe ser 0€'],
        max: [300, 'El precio máximo no puede exceder de 300€']
    },
    incidencias: [incidenciasSchema],
    imagen: {
        type: String
    }
});

let Habitacion = mongoose.model('habitaciones', habitacionesSchema);
module.exports = Habitacion;