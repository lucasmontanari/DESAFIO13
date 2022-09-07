import path from 'path'
import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
import logger from "../logger/logger.js"

function getRoot(req, res) { }

function getLogin(req, res) {
    logger.info(`Metodo ${req.method} requerido a '${req.url}'`)
    if (req.isAuthenticated()) {
        var user = req.user;
        res.render("login-ok", {
            usuario: user.username,
            nombre: user.nombre,
            apellido: user.apellido,
            email: user.email,
        });
    } else {
        res.sendFile(path.join(__dirname, '..', 'public', 'login.html'));
    }
}

function getSignup(req, res) {
    logger.info(`Metodo ${req.method} requerido a '${req.url}'`)
    res.sendFile(path.join(__dirname, '..', 'public', "register.html"));
}

function postLogin(req, res) {
    logger.info(`Metodo ${req.method} requerido a '${req.url}'`)
    var user = req.user;
    res.redirect("/")
}

function postSignup(req, res) {
    logger.info(`Metodo ${req.method} requerido a '${req.url}'`)
    var user = req.user;
    res.redirect("/login")
    //res.sendFile(path.join(__dirname, '..', 'public', "home.html"));
}

function getFaillogin(req, res) {
    logger.error("Error en login")
    res.render("login-error", {});
}

function getFailregister(req, res) {
    logger.error("Error en register")
    res.render("register-error", {});
}

function getLogout(req, res) {
    logger.info(`Metodo ${req.method} requerido a '${req.url}'`)
    req.logout(function (err) {
        if (err) { return next(err); }
        res.sendFile(path.join(__dirname, '..', 'public', "logout.html"));
    });
}

function failRoute(req, res) {
    logger.warn(`Metodo ${req.method} requerido a '${req.url}' NO ENCONTRADO`);
    res.status(404).render("routing-error", {});
}


export default {
    getRoot,
    getLogin,
    postLogin,
    getFaillogin,
    getLogout,
    failRoute,
    getSignup,
    postSignup,
    getFailregister
};
