import ContenedorMongoDb from "../contenedores/ContenedorMongoDb.js"
import mongoose from "mongoose";

export default class ContenedorProductoMongoDb extends ContenedorMongoDb{
    constructor(){
        const productoScherma = new mongoose.Schema({
            nombre: {type: String},
            precio: {type: Number},
            imagen: {type: String}
        })

        super('productos', productoScherma)
    }

}