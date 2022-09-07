import 'dotenv/config'
const { DB_USER, DB_PASSWORD, DB_HOST, DB_NAME, SESSION_SECRET } = process.env;
import mongoose from "mongoose";
mongoose.connect(`mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}?retryWrites=true&w=majority`)
console.log('Conexion establecida')

//YARS
// import yargs from 'yargs';
// const args = yargs(process.argv.slice(2)).alias({ p: 'port', m: 'modo' })
//   .default({ port: 8080, modo: 'FORK' }).argv

const modo = parseInt(process.argv[3]) || 'FORK'
const port = Number(process.argv[2]) || 8080

import express from 'express'
const app = express()
import path from 'path'
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io'
import bcrypt from "bcrypt"
import session from "express-session"
import passport from "passport"
import passportLocal from "passport-local"
const LocalStrategy = passportLocal.Strategy;
import rutas from "./routes/rutas.js"
import rutasD11 from "./routes/rutasD11.js"
import Usuario from "./models.js"
import cluster from 'cluster'
import os from "os"
const cpus = os.cpus();

//-----------Desafio 12
import compression from "compression";



const __dirname = dirname(fileURLToPath(import.meta.url));

import ContenedorMensaje from './dao/MensajeDaoMongoDb.js'
const mensajes = new ContenedorMensaje()
import ContenedorProducto from './dao/ProductoDaoMongoDb.js'
const productos = new ContenedorProducto()

app.set('views', path.join(__dirname, './public'))
app.set('view engine', 'ejs')

let mensajesEnBaseDeDatos = []
let productosEnBaseDeDatos = []

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/public', express.static(`${__dirname}/public`))
app.use(express.static(path.join(__dirname, './public')))

app.use(compression())

let ultimoUsuario

//PASSPORT

app.use(
  session({
    secret: SESSION_SECRET,
    cookie: {
      httpOnly: false,
      secure: false,
      maxAge: 600000,
    },
    rolling: true,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

function hashPassword(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
}

function isValidPassword(reqPassword, hashedPassword) {
  return bcrypt.compareSync(reqPassword, hashedPassword);
}

const registerStrategy = new LocalStrategy(
  { passReqToCallback: true },
  async (req, username, password, done) => {
    try {
      ultimoUsuario = username
      const existingUser = await Usuario.findOne({ username });

      if (existingUser) {
        return done("User already exists", false);
      }

      const newUser = {
        username: username,
        password: hashPassword(password),
        email: req.body.email,
        nombre: req.body.nombre,
        apellido: req.body.apellido,
      };

      const createdUser = await Usuario.create(newUser);

      return done(null, createdUser);
    } catch (err) {
      console.log(err);
      done(err);
    }
  }
);


const loginStrategy = new LocalStrategy(
  async (username, password, done) => {
    ultimoUsuario = username
    const user = await Usuario.findOne({ username });

    if (!user || !isValidPassword(password, user.password)) {
      return done("Invalid credentials", null);
    }

    return done(null, user);
  });

passport.use("register", registerStrategy);
passport.use("login", loginStrategy);

passport.serializeUser((usuario, done) => {
  done(null, usuario._id);
});

passport.deserializeUser((id, done) => {
  Usuario.findById(id, done);
});

if ((modo == "CLUSTER" && cluster.isPrimary)) {
  cpus.map(() => {
    cluster.fork();
  });
  
  cluster.on("exit", (worker) => {
    console.log(`Worker ${worker.process.pid} died`);

    cluster.fork()
  })
}
else {
  app.get("/register", rutas.getSignup);

  app.post(
    "/register",
    passport.authenticate("register", { failureRedirect: "/failregister" }),
    rutas.postSignup
  );

  app.get("/failregister", rutas.getFailregister);

  app.get("/login", rutas.getLogin);
  app.post(
    "/login",
    passport.authenticate("login", { failureRedirect: "/faillogin" }),
    rutas.postLogin
  );
  app.get("/faillogin", rutas.getFaillogin);

  function checkAuth(req, res, next) {
    if (req.isAuthenticated()) {
      next();
    } else {
      res.redirect("/login");
    }
  }

  app.get("/logout", checkAuth, rutas.getLogout);

  app.get("/", checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, "/public/home.html"));
  });

  app.get("/user", (req, res) => {
    res.json(ultimoUsuario);
  });


  //----------DESAFIO 11--------------------

  app.get("/info", /*checkAuth,*/ rutasD11.info) //Comento el checkAuth ya que es molesto para las pruebas

  app.get("/api/randoms", /*checkAuth,*/ rutasD11.randoms)


  //----------------------------------------

  //  FAIL ROUTE
  app.get("*", rutas.failRoute);

  const expressServer = app.listen(process.env.PORT || port, () => console.log(`Servidor escuchando puerto ${process.env.PORT || port}`))
  const io = new Server(expressServer)
  io.on('connection', async socket => {
    console.log(`Se conecto un usuario ${socket.id}`)


    try {
      socket.emit('server:bienvenida', ultimoUsuario)
    } catch (error) {
      console.log(`Error al adquirir los productos ${error}`)
    }
    try {
      productosEnBaseDeDatos = await productos.getAll()
      socket.emit('server:productos', productosEnBaseDeDatos)
    } catch (error) {
      console.log(`Error al adquirir los productos ${error}`)
    }
    try {
      mensajesEnBaseDeDatos = await mensajes.getAll()
      socket.emit('server:mensajes', mensajesEnBaseDeDatos)
    } catch (error) {
      console.log(`Error al adquirir los mensajes ${error}`)
    }
    socket.on('cliente:mensaje', async nuevoMensaje => {
      await mensajes.save(nuevoMensaje)
      mensajesEnBaseDeDatos = await mensajes.getAll()
      io.emit('server:mensajes', mensajesEnBaseDeDatos)
    })
    socket.on('cliente:producto', async nuevoProducto => {
      await productos.save(nuevoProducto)
      productosEnBaseDeDatos = await productos.getAll()
      io.emit('server:productos', productosEnBaseDeDatos)
    })
  })
}