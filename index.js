// Carga de librerias
require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const nunjucks = require('nunjucks');
const dateFilter = require('nunjucks-date-filter');
const methodOverride = require('method-override');
const session = require('express-session');

// Carga de enrutadores
const habitaciones = require(__dirname + "/routes/habitaciones");
const limpiezas = require(__dirname + "/routes/limpiezas");
const auth = require(__dirname + "/routes/auth");

// Conexion con la base de datos
mongoose.connect(process.env.URL);

// Instanciamos express
let app = express();

// Configuramos motor Nunjucks
let env = nunjucks.configure('views', {
    autoescape: true,
    express: app
});

// Añadimos el filtro de fecha
dateFilter.setDefaultFormat('DD/MM/YYYY');
env.addFilter('date', dateFilter);

// Asignamos el motor de plantillas
app.set('view engine', 'njk');

// Establecemos el middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        let method = req.body._method;
        delete req.body._method;
        return method;
    }
}));
app.use(session({
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: false
}));
app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});
app.use('/public', express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/node_modules/bootstrap/dist'));


// Establecemos los enrutadores
app.use('/habitaciones', habitaciones);
app.use('/limpiezas', limpiezas);
app.use('/auth', auth);

// Redireccion al listado de habitaciones
app.get('/', (req, res) => {
    res.redirect('/habitaciones')
});

// Ponemos el marcha el servidor
app.listen(process.env.PORT);