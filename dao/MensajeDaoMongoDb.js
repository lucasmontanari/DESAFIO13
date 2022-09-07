import ContenedorMongoDb from "../contenedores/ContenedorMongoDb.js"
import mongoose from "mongoose";

export default class ContenedorMensajeMongoDb extends ContenedorMongoDb{
    constructor(){
        const mensajeScherma = new mongoose.Schema({
            author: {type: Object},
            tiempoStamp: {type: String},
            text: {type: String}
        })

        super('mensajes', mensajeScherma)
    }

}
