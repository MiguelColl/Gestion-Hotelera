const mongoose = require('mongoose');

let usuariosSchema = new mongoose.Schema({
    login: {
        type: String,
        required: true,
        trim: true,
        min: 5
    },
    password: {
        type: String,
        required: true,
        trim: true,
        min: 8
    }
});

let Usuario = mongoose.model('usuarios', usuariosSchema);
module.exports = Usuario;