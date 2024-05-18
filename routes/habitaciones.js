const express = require("express");
const upload = require(__dirname + "/../utils/uploads");
const auth = require(__dirname + "/../utils/auth");

// Carga de modelo
const Habitacion = require(__dirname + "/../models/habitacion");
const Limpieza = require(__dirname + "/../models/limpieza");

let router = express.Router();

const enumValues = Habitacion.schema.path("tipo").enumValues;

// Servicio para listar todas las habitaciones:
router.get("/", (req, res) => {
    Habitacion.find()
        .sort("numero")
        .then((resultado) => {
            if (resultado.length > 0)
                res.render("habitaciones_listado", { habitaciones: resultado });
            else throw new Error();
        })
        .catch((error) => {
            res.render("error", {
                error: "No hay habitaciones registradas en la aplicación",
            });
        });
});

// Servicio para mostrar el formulario de habitaciones
router.get("/nueva", auth.autenticacion, (req, res) => {
    res.render("habitaciones_nueva", { tiposHab: enumValues });
});

// Servicio para mostrar el formulario de actualizar habitación
router.get("/actualizar/:id", auth.autenticacion, (req, res) => {
    Habitacion.findById(req.params.id)
        .then((habitacion) => {
            res.render("habitaciones_nueva", {
                tiposHab: enumValues,
                habitacion: habitacion,
                actualizar: true,
            });
        })
        .catch((error) => {
            res.render("error", { error: "No existe el número de habitación" });
        });
});

// Servicio para mostrar una habitacion concreta
router.get("/:id", (req, res) => {
    Habitacion.findById(req.params.id)
        .then((resultado) => {
            if (resultado)
                res.render("habitaciones_ficha", { habitacion: resultado });
            else throw new Error();
        })
        .catch((error) => {
            res.render("error", { error: "No existe el número de habitación" });
        });
});

// Servicio para insertar una habitación
router.post(
    "/",
    auth.autenticacion,
    upload.uploadHab.single("imagen"),
    (req, res) => {
        let nuevaHabitacion = new Habitacion({
            numero: req.body.numero,
            tipo: req.body.tipo,
            descripcion: req.body.descripcion,
            precio: req.body.precio,
        });

        if (req.file) nuevaHabitacion.imagen = req.file.filename;

        nuevaHabitacion
            .save()
            .then((resultado) => {
                res.redirect("/habitaciones");
            })
            .catch((error) => {
                const errores = {
                    generico: "Error insertando habitación",
                };

                if (error.code == 11000) {
                    errores.generico = `El número de habitación ${nuevaHabitacion.numero} ya existe`;
                } else {
                    Object.keys(error.errors).forEach(
                        (clave) =>
                            (errores[clave] = error.errors[clave].message)
                    );
                }

                res.render("habitaciones_nueva", {
                    error: errores,
                    habitacion: nuevaHabitacion,
                    tiposHab: enumValues,
                });
            });
    }
);

// Servicio para actualizar una habitacion
router.post(
    "/:id",
    auth.autenticacion,
    upload.uploadHab.single("imagen"),
    (req, res) => {
        let actualizarHabitacion = {
            numero: req.body.numero,
            tipo: req.body.tipo,
            descripcion: req.body.descripcion,
            precio: req.body.precio,
        };

        if (req.file) actualizarHabitacion.imagen = req.file.filename;

        Habitacion.findByIdAndUpdate(
            req.params.id,
            {
                $set: actualizarHabitacion,
            },
            { new: true, runValidators: true }
        )
            .then((habitacion) => {
                if (habitacion) res.redirect(`/habitaciones/${habitacion._id}`);
                else throw new Error();
            })
            .catch(async (error) => {
                const errores = {
                    generico: "Error actualizando habitación",
                };

                const habitacion = await Habitacion.findById(req.params.id);
                errores.numHabitacionActual = habitacion.numero;

                if (error.code == 11000) {
                    errores.generico = `El número de habitación ${actualizarHabitacion.numero} ya existe`;
                } else {
                    Object.keys(error.errors).forEach(
                        (clave) =>
                            (errores[clave] = error.errors[clave].message)
                    );
                }

                actualizarHabitacion.id = req.params.id;

                res.render("habitaciones_nueva", {
                    error: errores,
                    habitacion: actualizarHabitacion,
                    tiposHab: enumValues,
                    actualizar: true,
                });
            });
    }
);

// Servicio para borrar una habitacion
router.delete("/:id", auth.autenticacion, async (req, res) => {
    Habitacion.findByIdAndDelete(req.params.id)
        .then(async (resultado) => {
            if (resultado) {
                const limpiezas = await Limpieza.find({
                    habitacion: req.params.id,
                });
                limpiezas.forEach(async (limpieza) => {
                    await Limpieza.findByIdAndDelete(limpieza._id);
                });

                res.redirect("/habitaciones");
            } else throw new Error();
        })
        .catch((error) => {
            res.render("error", { error: "Error eliminando la habitación" });
        });
});

// Servicio para añadir una incidencia en una habitación
router.post(
    "/:id/incidencias",
    auth.autenticacion,
    upload.uploadInc.single("imagen"),
    (req, res) => {
        let incidencia = {
            descripcion: req.body.descripcion,
        };

        if (req.file) incidencia.imagen = req.file.filename;

        Habitacion.findByIdAndUpdate(
            req.params.id,
            {
                $push: {
                    incidencias: incidencia,
                },
            },
            { new: true, runValidators: true }
        )
            .then((resultado) => {
                if (resultado) res.redirect(`/habitaciones/${resultado.id}`);
                else throw new Error();
            })
            .catch((error) => {
                res.render("error", {
                    error: error.errors["incidencias.descripcion"].message,
                });
            });
    }
);

// Servicio para cerrar la incidencia de una habitación
router.put("/:idHab/incidencias/:idInc", auth.autenticacion, (req, res) => {
    Habitacion.findById(req.params.idHab)
        .then((habitacion) => {
            if (habitacion) {
                let incidencia = habitacion.incidencias.filter(
                    (i) => i._id == req.params.idInc
                );
                if (incidencia.length > 0) {
                    incidencia[0].fin = new Date();

                    habitacion
                        .save()
                        .then((resultado) => {
                            res.redirect(`/habitaciones/${habitacion.id}`);
                        })
                        .catch((error) => {
                            res.render("error", {
                                error: "Error actualizando incidencia",
                            }); // PREGUNTAR A NACHO
                        });
                } else
                    res.render("error", { error: "Incidencia no encontrada" });
            } else throw new Error();
        })
        .catch((error) => {
            res.render("error", { error: "Habitación no encontrada" });
        });
});

module.exports = router;
