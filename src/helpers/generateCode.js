// Función para generar código aleatorio de 5 caracteres (números y letras)
const generarCodigoAuditorio = () => {
  const caracteres = 'AUD';
  let codigo = '';
  for (let i = 0; i < 5; i++) {
    codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return codigo;
}

const generarCodigoReserva = () => {
  const caracteres = '';
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
