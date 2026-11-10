/**
 * storage.js - Sistema de Monitoreo Eléctrico WattVision
 * Módulo de persistencia en LocalStorage
 * Gestiona operaciones de guardar, modificar, borrar individual y vaciar/restablecer.
 * Implementa operadores avanzados: operador OR, operador ternario y destructuring.
 */

const CLAVE_STORAGE_WATT = "wattvision_dispositivos";
const CLAVE_STORAGE_TARIFA = "wattvision_tarifa_bs";

// Tarifa promedio en Bolivia por kWh (Bs. 0.85 estándar domiciliario)
const TARIFA_BOLIVIA_DEFAULT = 0.85;

/**
 * Obtiene los dispositivos guardados en LocalStorage.
 * Uso de operador OR (||) y operador ternario para retorno seguro.
 * @returns {Array|null} Array de dispositivos o null si no existe en storage
 */
const obtenerDispositivosStorage = () => {
  const datosGuardados = localStorage.getItem(CLAVE_STORAGE_WATT);
  return datosGuardados ? JSON.parse(datosGuardados) : null;
};

/**
 * Guarda el array de dispositivos en LocalStorage.
 * @param {Array} dispositivos - Lista de dispositivos a persistir
 */
const guardarDispositivosStorage = (dispositivos) => {
  localStorage.setItem(CLAVE_STORAGE_WATT, JSON.stringify(dispositivos));
};

/**
 * Modifica el estado o los datos de un dispositivo específico.
 * Uso de destructuring y operador ternario.
 * @param {number} idDispositivo - ID del dispositivo a actualizar
 * @param {Object} cambios - Propiedades modificadas
 * @returns {Array} Listado actualizado
 */
const actualizarDispositivoStorage = (idDispositivo, cambios) => {
  const dispositivos = obtenerDispositivosStorage() || [];

  const listaActualizada = dispositivos.map((dispositivo) => {
    const { id } = dispositivo;
    // Operador ternario para aplicar cambios solo al dispositivo coincidente
    return id === idDispositivo ? { ...dispositivo, ...cambios } : dispositivo;
  });

  guardarDispositivosStorage(listaActualizada);
  return listaActualizada;
};

/**
 * Elimina un dispositivo monitoreado del LocalStorage.
 * @param {number} idDispositivo - ID del dispositivo a remover
 * @returns {Array} Listado resultante tras la eliminación
 */
const eliminarDispositivoStorage = (idDispositivo) => {
  const dispositivos = obtenerDispositivosStorage() || [];
  const listaFiltrada = dispositivos.filter((disp) => disp.id !== idDispositivo);
  guardarDispositivosStorage(listaFiltrada);
  return listaFiltrada;
};

/**
 * Vacía y reinicia los dispositivos almacenados en LocalStorage.
 */
const reiniciarDispositivosStorage = () => {
  localStorage.removeItem(CLAVE_STORAGE_WATT);
};

/**
 * Guarda o recupera la tarifa eléctrica en Bolivianos (Bs./kWh)
 */
const obtenerTarifaStorage = () => {
  const tarifaGuardada = localStorage.getItem(CLAVE_STORAGE_TARIFA);
  return tarifaGuardada ? parseFloat(tarifaGuardada) : TARIFA_BOLIVIA_DEFAULT;
};

const guardarTarifaStorage = (tarifa) => {
  localStorage.setItem(CLAVE_STORAGE_TARIFA, JSON.stringify(tarifa));
};
