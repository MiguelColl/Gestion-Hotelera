let autenticacion = (req, res, next) => {
    if (req.session && req.session.login) return next();
    else res.render("login");
};

module.exports = {
    autenticacion: autenticacion
};
