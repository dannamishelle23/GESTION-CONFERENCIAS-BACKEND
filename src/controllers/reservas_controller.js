import Reservas from '../models/Reservas.js';
import Conferencistas from '../models/Conferencista.js';
import auditorios from '../models/Auditorios.js';
import mongoose from 'mongoose';
import { generarCodigoReserva } from '../helpers/generateCode.js';

//1. Crear reserva
const crearReserva = async(req,res) => {
    try {
        const { auditorioId } = req.body;
        
        if (!auditorioId) {
            return res.status(400).json({
                message: "El campo auditorioId es obligatorio."
            });
        }

        // Obtener el clienteID del usuario autenticado (del token)
        const usuarioActual = req.usuarioHeader;
        const conferencista = await Conferencistas.findOne({ usuario: usuarioActual._id });
        
        if (!conferencista) {
            return res.status(404).json({
                message: "Conferencista no encontrado para este usuario."
            });
        }

        const conferencistaId = conferencista._id;

        // Verificar si el vehículo existe
        const auditorio = await auditorios.findById(auditorioId);
        if (!auditorio) {
            return res.status(404).json({
                message: "No existe el auditorio con el ID proporcionado."
            });
        }

        //Verificar que el auditorio esté disponible
        if (auditorio.estadoAuditorio === false) {
            return res.status(400).json({
                message: "No se puede reservar un auditorio deshabilitado."
            });
        }

        //Verificar que el conferencista ya no tenga una reserva activa
        const reservaExistente = await Reservas.findOne({ 
            conferencistaID: conferencistaId, 
            estadoReserva: true
        });
        if (reservaExistente) {
            return res.status(400).json({
                message: "Ya tienes una reserva activa."
            });
        }

        const nuevaReserva = new Reservas({
            codigo: generarCodigoReserva(),
            clienteID: clienteId,
            auditorioID: auditorioId,
            estadoReserva: true
        });

        await nuevaReserva.save();

        // Poblar los datos del vehículo y cliente para devolver en la respuesta
        const reservaConDetalles = await Reservas.findById(nuevaReserva._id)
            .populate({
                path: 'clienteID',
                select: 'cedula usuario',
                populate: {
                    path: 'usuario',
                    select: 'nombre apellido'
                }
            })
            .populate('auditorioID', 'marca modelo año estadoauditorio');

        return res.status(201).json({
            message: "Reserva creada con éxito",
            reserva: {
                _id: reservaConDetalles._id,
                codigo: reservaConDetalles.codigo,
                fecha: reservaConDetalles.fechaReserva,
                cliente: {
                    _id: reservaConDetalles.clienteID._id,
                    cedula: reservaConDetalles.clienteID.cedula,
                    nombre: `${reservaConDetalles.clienteID.usuario.nombre} ${reservaConDetalles.clienteID.usuario.apellido}`
                },
                auditorio: {
                    _id: reservaConDetalles.auditorioID._id,
                    marca: reservaConDetalles.auditorioID.marca,
                    modelo: reservaConDetalles.auditorioID.modelo,
                    año: reservaConDetalles.auditorioID.año
                }
            }
        });
    } catch (error) {
        console.error("Error al crear reserva:", error);
        return res.status(500).json({
            message: "Error al crear la reserva."
        });
    }   
}

//Listar reservas con detalles de cliente y vehículo
const listarReservas = async(req,res) => {
    try {
        const usuarioActual = req.usuarioHeader;
        let filtro = {};

        // Si es estudiante, solo ve sus propias reservas
        if (usuarioActual.rol === "Cliente") {
            const cliente = await Clientes.findOne({ usuario: usuarioActual._id });
            if (!cliente) {
                return res.status(404).json({
                    message: "Cliente no encontrado."
                });
            }
            filtro = { clienteID: cliente._id };
        }
        // Si es admin, ve todas las reservas

        const reservas = await Reservas.find(filtro)
            .populate({
                path: 'clienteID',
                select: 'cedula usuario',
                populate: {
                    path: 'usuario',
                    select: 'nombre apellido'
                }
            })
            .populate('auditorioID', 'marca modelo año estadoauditorio');
            
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
                path: 'clienteID',
                select: 'cedula usuario',
                populate: {
                    path: 'usuario',
                    select: 'nombre apellido'
                }
            })
            .populate('auditorioID', 'marca modelo año estadoauditorio');     
        
        if (!reserva) {
            return res.status(404).json({
                message: `No existe la reserva ${id}`
            });
        }

        // Validar que el estudiante solo vea sus propias reservas
        if (usuarioActual.rol === "Estudiante") {
            const estudiante = await Estudiantes.findOne({ usuario: usuarioActual._id });
            if (!estudiante || reserva.clienteID._id.toString() !== estudiante._id.toString()) {
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

/*
//Actualizar matrícula por id
const actualizarMatricula = async (req, res) => {
    try {
        const { id } = req.params;
        const { estadoMatricula } = req.body;
        const usuarioActual = req.usuarioHeader;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({
                message: `No existe la matrícula ${id}`
            });
        }

        const matricula = await Matriculas.findById(id);

        if (!matricula) {
            return res.status(404).json({ 
                message: "Matrícula no encontrada" 
            });
        }

        // Validar que el estudiante solo modifique sus propias matrículas
        if (usuarioActual.rol === "Estudiante") {
            const estudiante = await Estudiantes.findOne({ usuario: usuarioActual._id });
            if (!estudiante || matricula.estudianteID.toString() !== estudiante._id.toString()) {
                return res.status(403).json({
                    message: "No tienes permiso para modificar esta matrícula."
                });
            }
        }

        // Solo permitir cambiar el estado de la matrícula
        if (estadoMatricula !== undefined) {
            matricula.estadoMatricula = estadoMatricula;
        }

        await matricula.save();

        const matriculaActualizada = await Matriculas.findById(id)
            .populate({
                path: 'estudianteID',
                select: 'cedula usuario',
                populate: {
                    path: 'usuario',
                    select: 'nombre apellido'
                }
            })
            .populate('materiaID', 'nombre codigo creditos');

        res.status(200).json({
            message: "Matrícula actualizada con éxito.",
            matricula: matriculaActualizada
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Error en el servidor" });
    }
};
*/

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
        if (usuarioActual.rol === "Cliente") {
            const cliente = await Clientes.findOne({ usuario: usuarioActual._id });
            if (!cliente || reserva.clienteID.toString() !== cliente._id.toString()) {
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
    //actualizarReserva,
    eliminarReserva
}