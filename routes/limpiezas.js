const express = require("express");
const auth = require(__dirname + "/../utils/auth");

// Carga de modelo
const Limpieza = require(__dirname + "/../models/limpieza");
const Habitacion = require(__dirname + "/../models/habitacion");

let router = express.Router();

// Servicio para mostrar el formulario de limpiezas
router.get("/nueva/:id", auth.autenticacion, (req, res) => {
    Habitacion.findById(req.params.id)
        .then((habitacion) => {
            if (habitacion) {
                res.render("limpiezas_nueva", {
                    habitacion: habitacion,
                    fecha: new Date().toISOString().split("T")[0],
                });
            } else throw new Error();
        })
        .catch((error) => {
            res.render("error", { error: "No se encuentra esa habitación" });
        });
});

// Servicio para obtener limpiezas de una habitación
router.get("/:id", (req, res) => {
    Limpieza.find({ habitacion: req.params.id })
        .populate("habitacion")
        .sort("-fecha")
        .then(async (resultado) => {
            if (resultado.length > 0)
                res.render("limpiezas_listado", {
                    limpiezas: resultado,
                    habitacion: resultado[0].habitacion,
                });
            else {
                const habitacion = await Habitacion.findById(req.params.id);

                if (habitacion)
                    res.render("limpiezas_listado", {
                        habitacion: habitacion,
                    });
                else throw new Error();
            }
        })
        .catch((error) => {
            res.render("error", {
                error: "No se encuentra esa habitación",
            });
        });
});

// Servicio para insertar limpieza
router.post("/:id", auth.autenticacion, (req, res) => {
    let nuevaLimpieza = new Limpieza({
        habitacion: req.params.id,
        fecha: req.body.fecha ? req.body.fecha : Date.now(),
    });

    if (req.body.observaciones)
        nuevaLimpieza.observaciones = req.body.observaciones;

    nuevaLimpieza
        .save()
        .then(async (resultado) => {
            const ultimaLimpieza = await Limpieza.find({
                habitacion: req.params.id,
            }).sort("-fecha");

            const habitacion = await Habitacion.findByIdAndUpdate(
                req.params.id,
                {
                    $set: { ultimaLimpieza: ultimaLimpieza[0].fecha },
                },
                { new: true }
            );

            res.redirect(`/limpiezas/${habitacion.id}`);
        })
        .catch((error) => {
            res.render("error", {
                error: "Error insertando limpieza",
            });
        });
});

module.exports = router;
