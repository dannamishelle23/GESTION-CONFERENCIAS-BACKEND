import { Schema, model } from "mongoose";

const auditorioSchema = new Schema({
  codigo: {
    type: String,
    trim: true,
    unique: true,
  },
  nombre: {
    type: String,
    required: true,
    trim: true,
  },
  ubicacion: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  capacidad: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  descripcion: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  fechaEliminacionAuditorio: {
    type: Date,
    default: null,
  },
  estadoAuditorio: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true
});

export default model("Auditorios", auditorioSchema);