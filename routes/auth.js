const express = require("express");

// Carga de modelo
const Usuario = require(__dirname + "/../models/usuario");

let router = express.Router();

// Servicio para mostrar el login
router.get("/login", (req, res) => {
    res.render("login");
});

// Servicio para logearse
router.post("/login", (req, res) => {
    Usuario.find({
        login: req.body.usuario,
        password: req.body.password,
    })
        .then((usuario) => {
            if (usuario.length > 0) {
                req.session.login = usuario[0].login;
                res.redirect("/habitaciones");
            } else throw new Error();
        })
        .catch((error) => {
            res.render("login", { error: "Usuario o contraseña incorrecto" });
        });
});

// Servicio para deslogearse
router.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/habitaciones");
});

module.exports = router;
