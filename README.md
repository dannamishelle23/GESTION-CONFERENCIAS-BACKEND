# CASO DE ESTUDIO 5: Sistema de gestión de conferencias

4 tablas o colecciones (conferencistas – auditorios – reservas – usuarios)
- Módulo – Login
- Módulo – Conferencistas
- Módulo – Auditorios
- Módulo – Reservas

## Módulo – Login
Esta pantalla será la inicial del sistema y presentará un formulario de inicio de sesión con los siguientes campos:
- Campo de texto: “Email”
- Campo de texto: “Clave”
- Botón “Ingresar”
  
Al ingresar los datos en el formulario se debe verificar que los mismos se encuentren registrados en 
la Base de datos, caso contrario se debe presentar un mensaje de alerta “Usuario o contraseña incorrectos.”

Si los datos ingresados en el formulario son correctos, se debe presentar una pantalla con todos los 
módulos asignados.

El usuario puede salir del sistema web cuando lo requiera.

## Módulo – Conferencistas
Para este módulo del sistema web solo tendrán acceso los usuarios que hayan iniciado sesión correctamente, si un usuario sin sesión intenta ingresar, 
se lo debe redireccionar al módulo inicial.
- Si el usuario ingresa a este módulo, se debe mostrar un mensaje de bienvenida.
o “Bienvenido - Nombre del usuario”
- El usuario en el sistema web debe realizar la gestión (CRUD) de conferencistas.

## Módulo – Auditorios
- Para este módulo del sistema web solo tendrán acceso los usuarios que hayan iniciado sesión 
correctamente, si un usuario sin sesión intenta ingresar, se lo debe redireccionar al módulo 
inicial.
- Si el usuario ingresa a este módulo, se debe mostrar un mensaje de bienvenida: “Bienvenido - Nombre del usuario”
- El usuario en el sistema web debe realizar la gestión (CRUD) de auditorios.

## Módulo – Reservas
- Para este módulo del sistema web solo tendrán acceso los usuarios que hayan iniciado sesión 
correctamente, si un usuario sin sesión intenta ingresar, se lo debe redireccionar al módulo 
inicial.
- Si el usuario ingresa a este módulo, se debe mostrar un mensaje de bienvenida: “Bienvenido - Nombre del usuario”
- El usuario en el sistema web debe realizar la gestión (CRUD) de reservas en donde:
  o Un conferencista puede reservar varios auditorios.
  o Un auditorio puede tener asignado varios conferencistas.

De acuerdo con el problema planteado se tiene las siguientes tareas a realizar:
- Diseñar el modelo físico para el Sistema Gestor de Base de datos.
- Implementar el patrón de arquitectura (MVC).
- Diseñar cada una de la interfaz de usuario, teniendo en cuenta las bases para UI y UX.
- Codificar las interfaces de usuario.
- Codificar los endpoints para el inicio de sesión del usuario.
- Codificar los endpoints para el CRUD de auditorios, conferencistas y reservas.
- Consumir los endpoints del backend.
- Realizar pruebas de rendimiento.
- Desplegar el frontend y backend a un entorno de producción.
- Alojar todo el frontend y backend en un repositorio de GitHub.
