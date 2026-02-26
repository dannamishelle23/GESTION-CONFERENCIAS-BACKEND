import Auditorios from '../models/Auditorios.js';
import Reservas from '../models/Reservas.js'
import mongoose from 'mongoose';
import { generarCodigoAuditorio } from '../helpers/generateCode.js';

//1. CREAR AUDITORIO (LO HACE EL USUARIO)

const crearAuditorios = async (req, res) => {
    try {
        const { nombre, ubicacion, capacidad, descripcion } = req.body;

        // Validación básica de campos obligatorios
        if (!nombre || !ubicacion || !capacidad) {
            return res.status(400).json({
                message: "Todos los campos son obligatorios."
            });
        }

        //Generar un código único utilizando la funcion generateCode de helpers
        let codigo;
        do {
            codigo = generarCodigoAuditorio();
        } while (await Auditorios.findOne({ codigo }));

        const nuevoAuditorio = new Auditorios({
            codigo,
            nombre,
            ubicacion,
            capacidad,
            descripcion: descripcion || null,        //opcional
            estadoAuditorio: true
        });

        const auditorioGuardado = await nuevoAuditorio.save();

        //Devolver el documento recién guardado
        return res.status(201).json({
            message: "Auditorio creado con éxito.",
            auditorio: auditorioGuardado
        });
    } catch (error) {
        if (error.code === 11000) {
            const duplicatedField = Object.keys(error.keyPattern)[0];
            return res.status(400).json({
                message: `El campo '${duplicatedField}' ya está registrado.`
            });
        }

        console.error(error);
        return res.status(500).json({
            message: "Error al agregar auditorio"
        });
    }
};

// Listar todos los auditorios creados
const listarAuditorios = async (req, res) => {
  try {
    const auditorios = await Auditorios.find();
    res.status(200).json(auditorios);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

//Visualizar un auditorio por ID
const detalleAuditorio = async (req, res) => {
    try {

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ 
                msg: `No existe el auditorio con el ID: ${id}` 
            });
        }

        const auditorio = await Auditorios.findById(id);

        if (!auditorio) {
            return res.status(404).json({
                msg: "Auditorio no encontrado"
            });
        }

        //Formatear la respuesta
        const resultado = {
            _id: auditorio._id,
            nombre: auditorio.nombre,
            ubicacion: auditorio.ubicacion,
            capacidad: auditorio.capacidad,
            descripcion: auditorio.descripcion,
            estadoAuditorio: auditorio.estadoAuditorio
        }
        return res.status(200).json(resultado);

    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            msg: `Error al procesar solicitud - ${error}` 
        });
    }
};

const actualizarAuditorio = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, ubicacion, capacidad, codigo } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ 
                msg: `No existe el auditorio con el ID: ${id}` 
            });
        }

        // Verificar que el auditorio exista en la BDD
        const auditorio = await Auditorios.findById(id);
        if (!auditorio) {
            return res.status(404).json({
                msg: "Auditorio no encontrado"
            });
        }

        if (codigo) {
            // validar que no existan otros registros con el mismo código
            const codigoExistente = await Auditorios.findOne({ codigo, _id: { $ne: id } });

            if (codigoExistente) {
                return res.status(400).json({
                    msg: "El código ya pertenece a otro auditorio"
                });
            }
        }

        let auditorioActualizado
        try {
            auditorioActualizado = await Auditorios.findByIdAndUpdate(
                id,
                { nombre, ubicacion, capacidad },
                { new: true, runValidators: true }
            );
        } catch (errorActualizar) {
            if (errorActualizar.code === 11000) {
                return res.status(400).json({
                    message: "El código ya está registrado en otro auditorio."
                });
            }
            throw errorActualizar;
        }

        res.status(200).json({
            message: "Auditorio actualizado con éxito.",
            auditorioActualizado
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: `Error al actualizar auditorio - ${error}`
        });
    }
};

//Dar de baja varios auditorios por su codigo respectivo
const eliminarAuditorios = async (req, res) => {
    try {
        const { codigo, fechaEliminacionAuditorio } = req.body;

        if (!codigo || !fechaEliminacionAuditorio) {
            return res.status(400).json({
                msg: "Debes enviar código y fecha de eliminación de forma obligatoria."
            });
        }

        const auditorio = await Auditorios.findOne({ codigo });


        if (!auditorio) {
            return res.status(404).json({
                msg: "No se encontró un auditorio con ese código"
            });
        }

        //Verificar si hay reservas activas para el auditorio antes de eliminar
        const reservasActivas = await Reservas.findOne({ 
            auditorioID: auditorio._id,
            estadoReserva: true
        });

        //No eliminar el auditorio si tiene reservas activas
        if (reservasActivas) {
            return res.status(400).json({
                msg: "No se puede eliminar el auditorio porque tiene reservas activas."
            });
        }

        //Dar de baja el auditorio
        auditorio.estadoAuditorio = false;
        auditorio.fechaEliminacionAuditorio = new Date(fechaEliminacionAuditorio);

        await auditorio.save();

        return res.status(200).json({
            msg: "Auditorio dado de baja correctamente"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            msg: "Error al deshabilitar auditorio"
        });
    }
};

export {
    crearAuditorios,
    listarAuditorios,
    detalleAuditorio,
    actualizarAuditorio,
    eliminarAuditorios
}