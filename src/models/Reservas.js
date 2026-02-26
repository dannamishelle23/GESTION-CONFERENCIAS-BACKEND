import {Schema, model} from 'mongoose';


const reservaSchema = new Schema(
  {
    codigo: { type: String, required: true, unique: true },
    descripcion: { type: String, trim: true },
    conferencistaID: { type: Schema.Types.ObjectId, ref: "Conferencistas", required: true },
    auditorioID: { type: Schema.Types.ObjectId, ref: "Auditorios", required: true },
    estadoReserva: { type: Boolean, default: true },
    fechaReserva: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default model("Reserva", reservaSchema);