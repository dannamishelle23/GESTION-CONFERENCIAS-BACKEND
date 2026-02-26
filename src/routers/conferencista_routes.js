import {Router} from 'express';
import { crearConferencistas, listarConferencistas, detalleConferencista, eliminarConferencista, actualizarConferencista,  } from '../controllers/conferencista_controller.js';
import { verificarTokenJWT, autorizarAdmin } from '../middlewares/JWT.js';

const router = Router();

//CRUD de conferencistas por medio de un usuario (administrador)
//1. CREAR CONFERENCISTAS
router.post('/conferencistas/crear-conferencista', verificarTokenJWT, autorizarAdmin, crearConferencistas)
//2. VER/LISTAR CONFERENCISTAS
router.get('/conferencistas/listar-conferencistas', verificarTokenJWT, autorizarAdmin, listarConferencistas)
//Ver la info especifica de un conferencista
router.get('/conferencistas/detalle-conferencista/:id', verificarTokenJWT, autorizarAdmin, detalleConferencista)
//3. ACTUALIZAR INFO CONFERENCISTAS
router.put('/conferencistas/actualizar-conferencista/:id', verificarTokenJWT, autorizarAdmin, actualizarConferencista)
//4. ELIMINAR CONFERENCISTAS (ESTADO INACTIVO)
router.delete('/conferencistas/eliminar-conferencista/:id', verificarTokenJWT, autorizarAdmin, eliminarConferencista)

export default router;