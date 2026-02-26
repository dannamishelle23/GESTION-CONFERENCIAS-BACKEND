import Reservas from '../models/Reservas.js';
import Conferencistas from '../models/Conferencista.js';
import Auditorios from '../models/Auditorios.js';
import mongoose from 'mongoose';
import { generarCodigoReserva } from '../helpers/generateCode.js';

//1. Crear reserva
const crearReserva = async (req, res) => {
  try {
    const { auditorioId } = req.body;

    if (!auditorioId) {
      return res.status(400).json({
        message: "El campo auditorioId es obligatorio."
      });
    }

    // Usuario autenticado desde el token
    const usuarioActual = req.usuarioHeader;
    const conferencista = await Conferencistas.findOne({ usuario: usuarioActual._id });

    if (!conferencista) {
      return res.status(404).json({
        message: "Conferencista no encontrado para este usuario."
      });
    }

    const conferencistaId = conferencista._id;

    // Verificar que el auditorio exista
    const auditorio = await Auditorios.findById(auditorioId);
    if (!auditorio) {
      return res.status(404).json({
        message: "No existe el auditorio con el ID proporcionado."
      });
    }

    // Verificar que el auditorio esté disponible
    if (auditorio.estadoAuditorio === false) {
      return res.status(400).json({
        message: "No se puede reservar un auditorio deshabilitado."
      });
    }

    // Verificar que el conferencista no tenga una reserva activa
    const reservaExistente = await Reservas.findOne({
      conferencistaID: conferencistaId,
      estadoReserva: true
    });
    if (reservaExistente) {
      return res.status(400).json({
        message: "Ya tienes una reserva activa."
      });
    }

    // Crear nueva reserva
    const nuevaReserva = new Reservas({
      codigo: generarCodigoReserva(),
      conferencistaID: conferencistaId,
      auditorioID: auditorioId,
      estadoReserva: true
    });

    await nuevaReserva.save();

    // Poblar conferencista y auditorio
    const reservaConDetalles = await Reservas.findById(nuevaReserva._id)
      .populate({
        path: 'conferencistaID',
        select: 'cedula usuario',
        populate: {
          path: 'usuario',
          select: 'nombre apellido'
        }
      })
      .populate('auditorioID', 'nombre ubicacion capacidad estadoAuditorio');

    return res.status(201).json({
      message: "Reserva creada con éxito",
      reserva: {
        _id: reservaConDetalles._id,
        codigo: reservaConDetalles.codigo,
        fecha: reservaConDetalles.fechaReserva,
        conferencista: {
          _id: reservaConDetalles.conferencistaID._id,
          cedula: reservaConDetalles.conferencistaID.cedula,
          nombre: `${reservaConDetalles.conferencistaID.usuario.nombre} ${reservaConDetalles.conferencistaID.usuario.apellido}`
        },
        auditorio: {
          _id: reservaConDetalles.auditorioID._id,
          nombre: reservaConDetalles.auditorioID.nombre,
          ubicacion: reservaConDetalles.auditorioID.ubicacion,
          capacidad: reservaConDetalles.auditorioID.capacidad
        }
      }
    });
  } catch (error) {
    console.error("Error al crear reserva:", error);
    return res.status(500).json({
      message: "Error al crear la reserva."
    });
  }
};

//Listar reservas con detalles de cliente y vehículo
const listarReservas = async(req,res) => {
    try {
        const usuarioActual = req.usuarioHeader;
        let filtro = {};

        // Si es conferencista, solo ve sus propias reservas
        if (usuarioActual.rol === "Conferencista") {
            const conferencista = await Conferencistas.findOne({ usuario: usuarioActual._id });
            if (!conferencista) {
                return res.status(404).json({
                    message: "Conferencista no encontrado."
                });
            }
            filtro = { conferencistaID: conferencista._id };
        }
        // Si es admin, ve todas las reservas

        const reservas = await Reservas.find(filtro)
            .populate({
                path: 'conferencistaID',
                select: 'cedula usuario',
                populate: {
                    path: 'usuario',
                    select: 'nombre apellido'
                }
            })
            .populate('auditorioID', 'nombre ubicacion capacidad estadoAuditorio');

        // Validación: si no hay reservas mostrar que no tiene reservas hechas
        if (!reservas || reservas.length === 0) {
        return res.status(200).json({
            message: "No tienes reservas hechas actualmente.",
        });
        }

        res.status(200).json({
            message: "Reservas obtenidas con éxito.",
            total: reservas.length,
            reservas
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({msg: "Error en el servidor"});
    }
}

//Visualizar una reserva por ID
const detalleReserva = async(req,res) => {
    try {
        const { id } = req.params;
        const usuarioActual = req.usuarioHeader;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({
                message: `No existe la reserva ${id}`
            });
        }

        const reserva = await Reservas.findById(id)
            .populate({
                path: 'conferencistaID',
                select: 'cedula usuario',
                populate: {
                    path: 'usuario',
                    select: 'nombre apellido'
                }
            })
            .populate('auditorioID', 'nombre ubicacion capacidad estadoAuditorio');     

        if (!reserva) {
        return res.status(404).json({
            message: `No existe la reserva ${id}`
        });
        }
        // Validar si la reserva está cancelada
        if (reserva.estadoReserva === false) {
        return res.status(400).json({
            message: "La reserva está cancelada y no puede visualizarse."
        });
        }

        // Validar que el conferencista solo vea sus propias reservas
        if (usuarioActual.rol === "Conferencista") {
            const conferencista = await Conferencistas.findOne({ usuario: usuarioActual._id });
            if (!conferencista || reserva.conferencistaID._id.toString() !== conferencista._id.toString()) {
                return res.status(403).json({
                    message: "No tienes permiso para ver esta reserva."
                });
            }
        }

        return res.status(200).json({
            message: "Reserva obtenida con éxito.",
            reserva
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Error en el servidor"
        });
    }
}

//Actualizar reserva por id
const actualizarReserva = async (req, res) => {
  try {
    const { id } = req.params;
    const { fechaReserva } = req.body;
    const usuarioActual = req.usuarioHeader;

    // Validar que se envíe la fecha
    if (!fechaReserva) {
      return res.status(400).json({
        message: "El campo fechaReserva es obligatorio."
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        message: `No existe la reserva ${id}`
      });
    }

    const reserva = await Reservas.findById(id);
    if (!reserva) {
      return res.status(404).json({
        message: "Reserva no encontrada"
      });
    }

    // Validar que el auditorio asociado siga activo
    const auditorio = await Auditorios.findById(reserva.auditorioID);
    if (!auditorio || auditorio.estadoAuditorio === false) {
      return res.status(400).json({
        message: "No se puede actualizar la reserva porque el auditorio está deshabilitado o no existe."
      });
    }

    // Validar que el conferencista solo actualice sus propias reservas
    if (usuarioActual.rol === "Conferencista") {
      const conferencista = await Conferencistas.findOne({ usuario: usuarioActual._id });
      if (!conferencista || reserva.conferencistaID.toString() !== conferencista._id.toString()) {
        return res.status(403).json({
          message: "No tienes permiso para actualizar esta reserva."
        });
      }
    }

    // Actualizar la fecha de la reserva
    reserva.fechaReserva = new Date(fechaReserva);
    await reserva.save();

    return res.status(200).json({
      message: "Reserva actualizada con éxito.",
      reserva
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error en el servidor al actualizar la reserva."
    });
  }
};


// Eliminar matrícula por id
const eliminarReserva = async (req, res) => {
    try {
        const { id } = req.params;
        const { motivo, fecha } = req.body;
        const usuarioActual = req.usuarioHeader;

        // Validar que el campo fecha es obligatorio
        if (!fecha) {
            return res.status(400).json({
                message: "El campo fecha es obligatorio."
            });
        }

        if (typeof fecha === 'string' && fecha.trim() === "") {
            return res.status(400).json({
                message: "El campo fecha no puede estar vacío."
            });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({
                message: `No existe la reserva ${id}`
            });
        }

        const reserva = await Reservas.findById(id);
        if (!reserva) {
            return res.status(404).json({ 
                message: "Reserva no encontrada" 
            });
        }

        // Validar que el estudiante solo elimine sus propias reservas
        if (usuarioActual.rol === "Conferencista") {
            const conferencista = await Conferencistas.findOne({ usuario: usuarioActual._id });
            if (!conferencista || reserva.conferencistaID.toString() !== conferencista._id.toString()) {
                return res.status(403).json({
                    message: "No tienes permiso para eliminar esta reserva."
                });
            }
        }
        await reserva.deleteOne();
        res.status(200).json({ 
            message: "Reserva eliminada correctamente" 
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Error en el servidor" });
    }
};

export {
    crearReserva,
    listarReservas,
    detalleReserva,
    actualizarReserva,
    eliminarReserva
}