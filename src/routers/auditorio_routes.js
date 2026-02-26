import { crearAuditorios, listarAuditorios, detalleAuditorio, actualizarAuditorio, eliminarAuditorios } from "../controllers/auditorios_controller.js";
import { Router } from 'express';
import { verificarTokenJWT, autorizarAdmin, autorizarAdminOConferencistaLectura } from "../middlewares/JWT.js";

const router = Router();

//CRUD de auditorios por medio de un usuario (administrador)
//1. Crear auditorios - Solo un usuario con rol admin
router.post('/auditorios/crear-auditorio', verificarTokenJWT, autorizarAdmin, crearAuditorios)
//2. Listar todos los auditorios creados - Admin y Conferencista (lectura)
router.get('/auditorios/listar-auditorios', verificarTokenJWT, autorizarAdminOConferencistaLectura, listarAuditorios)
//3. Visualizar el detalle de una materia por ID - Admin y Conferencista (lectura)
router.get('/auditorios/detalle-auditorio/:id', verificarTokenJWT, autorizarAdminOConferencistaLectura, detalleAuditorio)
//4. Editar una materia por ID - Solo Admin
router.put('/auditorios/editar-auditorio/:id', verificarTokenJWT, autorizarAdmin, actualizarAuditorio)
//5. Eliminar materias y pasar a inactivas por auditoria - Solo Admin
router.delete('/auditorios/eliminar-auditorios', verificarTokenJWT, autorizarAdmin, eliminarAuditorios)

export default router;