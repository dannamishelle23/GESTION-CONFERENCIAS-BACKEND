import Conferencista from '../models/Conferencista.js';
import Usuarios from '../models/Usuarios.js';
import mongoose from 'mongoose';
import {sendMailToNewClient} from '../helpers/sendMail.js';

//CRUD de conferencistas por medio de un usuario

//1. CREAR CONFERENCISTAS
const crearConferencistas = async(req,res) => {
    try {
        const {nombre, apellido, email, cedula, genero, fecha_nacimiento, ciudad, direccion, telefono} = req.body
        if (Object.values(req.body).includes("")) return res.status(400).json({message: "Todos los campos son obligatorios."})
        if (cedula.length < 7 || cedula.length > 10) return res.status(400).json({message: "La cédula debe tener entre 7 y 10 dígitos."})
        //1. Verificar si el email y la cédula existen en la BDD
        const [emailExistente, cedulaExistente] = await Promise.all([
            Usuarios.findOne({ email }),
            Conferencista.findOne({ cedula })
        ]);

        if (emailExistente || cedulaExistente) {
            return res.status(400).json({
                message: `El usuario ya se encuentra registrado con ese correo o cédula en el sistema. No puedes usar datos que ya pertenecen a otro usuario.`
            });
        }
        //2. Generar contraseña aleatoria corta
        const passwordGenerada = Math.random().toString(36).slice(2, 10);
        
        //3. Crear usuario con rol 'Conferencista'
        const nuevoUsuario = new Usuarios({
            nombre,apellido, email, password: passwordGenerada, rol: "Conferencista"
        });
        nuevoUsuario.password = await nuevoUsuario.encryptPassword(passwordGenerada)
        
        let usuarioGuardado
        try {
            usuarioGuardado = await nuevoUsuario.save()
        } catch (errorGuardar) {
            // Si hay error al guardar (ej: email duplicado), rechazar
            if (errorGuardar.code === 11000) {
                return res.status(400).json({
                    message: "El email ya se encuentra registrado en el sistema."
                })
            }
            throw errorGuardar
        }
        
        //4. Crear conferencista asociado al usuario creado
        const nuevoConferencista = new Conferencista({
            cedula,
            genero,
            fecha_nacimiento,
            ciudad,
            direccion,
            telefono,
            usuario: usuarioGuardado._id,
            creadoPor: req.usuarioHeader._id
        })
        
        try {
            await nuevoConferencista.save()
        } catch (errorConferencista) {
            // Si hay error al guardar conferencista (ej: cédula duplicada), eliminar el usuario creado
            await Usuarios.findByIdAndDelete(usuarioGuardado._id)
            if (errorConferencista.code === 11000) {
                return res.status(400).json({
                    message: "La cédula ya se encuentra registrada en el sistema."
                })
            }
            throw errorConferencista
        }
        
        //5. Enviar correo con credenciales (sin bloquear la respuesta)
        sendMailToNewConferencista(email, nombre, email, passwordGenerada).catch(err => {
            console.error("Error al enviar email al conferencista:", err)
        })
        
        res.status(201).json({
            message: "El conferencista ha sido creado con éxito.",
            credenciales: {
                idConferencista: nuevoConferencista._id,
                email: email,
                password: passwordGenerada,
                aviso: "Las credenciales han sido enviadas al correo del conferencista."
            }
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({message: `Error al procesar la solicitud - ${error}`})
    }
}

//2. Ver/listar conferencistas.
const listarConferencistas = async (req, res) => {
    try {

        const conferencistas = await Conferencista.find({
            estadoConferencista: "Activo",
            creadoPor: req.usuarioHeader._id
        })
        .populate("usuario", "nombre apellido email rol")
        .populate("creadoPor", "nombre apellido email rol");

        //Transformar la respuesta
        const resultado = clientes.map(est => ({
            nombre: est.usuario?.nombre,
            apellido: est.usuario?.apellido,
            cedula: est.cedula,
            genero: est.genero,
            fecha_nacimiento: est.fecha_nacimiento,
            direccion: est.ciudad, 
            telefono: est.telefono,
            email: est.usuario?.email,
            rol: est.usuario?.rol,
            estadoConferencista: est.estadoConferencista,
            creadoPor: {
                nombre: est.creadoPor?.nombre,
                apellido: est.creadoPor?.apellido,
                email: est.creadoPor?.email,
                rol: est.creadoPor?.rol
            }
        }));

        res.status(200).json(resultado);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al procesar la solicitud."
        });
    }
};

//Visualizar el detalle de un registro en particular
const detalleConferencista = async (req, res) => {
    try {

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ 
                msg: `No existe el conferencista ${id}` 
            });
        }

        const conferencista = await Conferencista.findById(id)
            .populate("usuario", "nombre apellido email rol")
            .populate("creadoPor", "nombre apellido email rol");

        if (!conferencista) {
            return res.status(404).json({
                msg: "Conferencista no encontrado"
            });
        }

        //Formatear la respuesta
        const resultado = {
            _id: conferencista._id,
            nombre: conferencista.usuario?.nombre,
            apellido: conferencista.usuario?.apellido,
            cedula: conferencista.cedula,
            genero: conferencista.genero,
            fecha_nacimiento: conferencista.fecha_nacimiento,
            direccion: conferencista.direccion,
            ciudad: conferencista.ciudad,
            telefono: conferencista.telefono,
            email: conferencista.usuario?.email,
            rol: conferencista.usuario?.rol,
            estadoConferencista: conferencista.estadoConferencista,
            creadoPor: {
                id: cliente.creadoPor?._id,
                nombre: cliente.creadoPor?.nombre,
                apellido: cliente.creadoPor?.apellido,
                email: cliente.creadoPor?.email,
                rol: cliente.creadoPor?.rol
            }
        };

        res.status(200).json(resultado);

    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            msg: `Error al procesar solicitud - ${error}` 
        });
    }
};

//3. Actualizar la información de un conferencista por ID (solo campos específicos)
const actualizarConferencista = async (req, res) => {
    try {

        const { id } = req.params;

        //Verificar que el usuario exista en la BDD
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({
                msg: `No existe el conferencista ${id}`
            });
        }

        const conferencista = await Conferencista.findById(id);

        if (!conferencista) {
            return res.status(404).json({
                msg: "Conferencista no encontrado"
            });
        }

        // Campos permitidos del conferencista
        const {nombre, apellido,cedula,ciudad,direccion, telefono, estadoConferencista, email} = req.body;

        // Validar cédula duplicada si se intenta cambiar
        if (cedula && cedula !== conferencista.cedula) {
            const cedulaDuplicada = await Conferencista.findOne({ cedula, _id: { $ne: id } });
            if (cedulaDuplicada) {
                return res.status(400).json({
                    msg: "La cédula ya está registrada en el sistema."
                });
            }
        }

        // Validar email duplicado si se intenta cambiar
        if (email) {
            const emailDuplicado = await Usuarios.findOne({ email, _id: { $ne: conferencista.usuario } });
            if (emailDuplicado) {
                return res.status(400).json({
                    msg: "El email ya está registrado en el sistema."
                });
            }
        }

        // Actualizar datos del estudiante
        if (cedula) conferencista.cedula = cedula;
        if (ciudad) conferencista.ciudad = ciudad;
        if (direccion) conferencista.direccion = direccion;
        if (telefono) conferencista.telefono = telefono;
        if (estadoConferencista) conferencista.estadoConferencista = estadoConferencista;

        await conferencista.save();

        // Actualizar datos del usuario relacionado
        if (nombre || apellido || email) {
            await Usuarios.findByIdAndUpdate(
                conferencista.usuario,
                {
                    ...(nombre && { nombre }),
                    ...(apellido && { apellido }),
                    ...(email && { email })
                },
                { new: true, runValidators: true }
            );
        }

        res.status(200).json({
            msg: "Datos del conferencista actualizados correctamente"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: `Error al actualizar - ${error}`
        });
    }
};

//Eliminar conferencista (solo eliminacion lógica, cambiar a estado inactivo)
const eliminarConferencista = async (req,res)=>{

    try {
        const {id} = req.params
        const {fechaEliminacionConferencista} = req.body
        if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Debes llenar todos los campos"})
        if( !mongoose.Types.ObjectId.isValid(id) ) return res.status(404).json({msg:`No existe el conferencista ${id}`})
        await Conferencista.findByIdAndUpdate(id,{fechaEliminacionConferencista:Date.parse(fechaEliminacionConferencista),estadoConferencista:false})
        res.status(200).json({msg:"El conferencista ha sido deshabilitado con éxito."})

    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: `Error al deshabilitar la cuenta del conferencista - ${error}` })
    }
}

export {
    crearConferencistas,
    listarConferencistas,
    detalleConferencista,
    actualizarConferencista,
    eliminarConferencista
}