import mongoose from "mongoose";


export default class ContenedorMongoDb{ //module.exports permite importar la clase en otro archivo usando require
    constructor(colNombre, schema){
        this.colNombre = colNombre
        this.col = mongoose.model(colNombre, schema)
    }

    async save(objeto){
        await this.col.insertMany(objeto)
        return `${this.colNombre} ingresado a Base de Datos`
    }
    
    async getById(numeroID){
        const obj = await this.col.find({_id: numeroID})
        if (obj == null){
            return `${this.colNombre} no encontrado`
        }
        return obj
    }

    async getAll(){
        const obj = await this.col.find()
        if (obj == null){
            return `No se encontraron ${this.colNombre} cargados`
        }
        return obj
    }

    async changeById(objeto,numeroID){
        const updatedElement = await this.col.replaceOne({_id: numeroID}, objeto)
        if(updatedElement.n == 0){
            return `${this.colNombre} no encontrado`
        }
        return `${this.colNombre} actualizado`
    }

    async deleteById(idABorrar){
        await this.col.deleteOne({_id: idABorrar})
        return `${this.colNombre} borrado`
    }

    async deleteAll(){
        await this.col.deleteMany({})
        return `${this.colNombre} borrados`
    }
}