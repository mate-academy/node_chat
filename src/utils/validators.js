/** Normaliza espaços e valida o tamanho. Retorna null se for inválido. */
function cleanText(value, max) {
  if (typeof value !== 'string') {
    return null;
  }

  const v = value.replace(/\s+/g, ' ').trim();

  return v && v.length <= max ? v : null;
}

module.exports = { cleanText };
