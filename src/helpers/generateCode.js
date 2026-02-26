// Función para generar código aleatorio con prefijo 'AUD' para auditorios. Se genera un codigo de 5 caracteres.
const generarCodigoAuditorio = () => {
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let codigo = 'AUD';
  for (let i = 0; i < 2; i++) {
    codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return codigo;
}

// Función genérica para crear un código de 5 caracteres alfanuméricos
const generarCodigoReserva = () => {
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let codigo = '';
  for (let i = 0; i < 5; i++) {
    codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return codigo;
}

export {
    generarCodigoAuditorio,
    generarCodigoReserva
}
