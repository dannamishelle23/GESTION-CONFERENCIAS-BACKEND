import {Schema, model} from 'mongoose';

const ConferencistaSchema = new Schema({
    cedula: {
        type: String,
        required: true,
        trim: true,
        unique: true 
    },
    genero: {
        type: String,
        required: true,
        enum: ['Masculino', 'Femenino', 'Otro']
    },
    fecha_nacimiento: {
        type: Date,
        required: true
    },
    ciudad: {
        type: String,
        required: true,
        trim: true
    },
    direccion: {
        type: String,
        required: true,
        trim: true
    },
    telefono: {
        type: String,
        required: true,
        trim: true
    },
    empresa: {
        type: String,
        required: true,
        trim: true
    },
    fechaIngresoConferencista:{
        type:Date,
        required:true,
        default:Date.now
    },
    fechaEliminacionConferencista:{
        type:Date,
        default:null
    },
    estadoConferencista:{
        type:String,
        enum: ['Activo', 'Inactivo'],
        default: 'Activo'
    },
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuarios',
        required: true
    },
    creadoPor: {
        type: Schema.Types.ObjectId,
        ref: 'Usuarios',
        required: true
    },
}, {
    timestamps: true
})

export default model('Conferencistas', ConferencistaSchema);