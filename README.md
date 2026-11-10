# TechZone - Simulador de Tienda de Hardware & Tecnología
### Entrega Final - Curso de JavaScript | Coderhouse

Simulador interactivo de comercio electrónico desarrollado con **JavaScript Vanilla**, manipulación dinámica del **DOM**, persistencia mediante **LocalStorage**, consumo asíncrono con **Fetch API** y feedback visual enriquecido con **SweetAlert2** y **Toastify JS**.

---

## 🚀 Características y Funcionalidades

1. **Catálogo Dinámico e Interactivo:**
   - Carga asíncrona de base de datos local en formato `.json` mediante `fetch`, `async / await` y estructura `try / catch / finally`.
   - Filtrado reactivo en tiempo real por categorías (Periféricos, Monitores, Componentes, Laptops).
   - Buscador por texto en vivo con evento `input`.
   - Ordenamiento inteligente por precio (menor a mayor, mayor a menor) y alfabético (A-Z).
   - Control de stock en tiempo real (bloqueo automático al agotar unidades disponibles).

2. **Gestión Completa del Carrito de Compras (Offcanvas):**
   - Incorporación de productos evitando duplicados innecesarios y sumando unidades.
   - Controles interactivos para aumentar (`+`) o disminuir (`-`) cantidades.
   - Eliminación individual de productos.
   - Vaciado total del carrito con ventana modal de confirmación (`SweetAlert2`).
   - Cálculo dinámico de unidades y monto total acumulado.

3. **Circuito de Checkout y Confirmación de Compra:**
   - Formulario con validación de datos del cliente (nombre, email, teléfono, dirección).
   - Selección de métodos de pago con cálculo reactivo de beneficios (ej. 10% de descuento abonando por transferencia bancaria).
   - Simulación de procesamiento de pago.
   - Emisión de ticket de compra con número de orden único (`#ORD-XXXXXX`), resumen detallado y restablecimiento del carrito.

4. **Experiencia de Usuario (UX/UI):**
   - Prohibido el uso de alertas y diálogos nativos (`alert`, `confirm`, `prompt`).
   - Notificaciones no invasivas mediante `Toastify JS`.
   - Diálogos y modales elegantes con `SweetAlert2`.
   - Diseño responsivo adaptable a dispositivos móviles, tablets y computadoras de escritorio.

---

## 📋 Checklist de Criterios de Evaluación Coderhouse

| Requisito | Estado | Implementación en el Proyecto |
| :--- | :---: | :--- |
| **Estructura de Archivos** | ✅ | `index.html` único archivo en la raíz. Carpetas organizadas: `assets/`, `css/`, `js/`, `data/`. |
| **Referencia de Scripts** | ✅ | Exactamente 2 archivos JS (`storage.js` y `main.js`) enlazados en el `<head>` con atributo `defer`. |
| **Interacción con el DOM** | ✅ | 100% de la experiencia se gestiona mediante eventos (`click`, `input`, `change`, `submit`) y manipulación del DOM. |
| **Cero Alertas Nativas** | ✅ | Sin ningún `alert()`, `confirm()` o `prompt()`. Reemplazados por `SweetAlert2` y `Toastify`. |
| **Arrays y Objetos en JSON** | ✅ | Base de datos externa ubicada en `data/productos.json`. No hay arrays hardcodeados en los scripts. |
| **Asincronismo con Fetch** | ✅ | Implementación con `async / await`, bloque `try / catch / finally` y spinner de carga visual. |
| **Funciones de Orden Superior** | ✅ | Uso exhaustivo de `filter()`, `find()`, `some()`, `reduce()`, `forEach()`, `sort()` y `map()`. |
| **Storage Completo** | ✅ | Funciones para: **guardar**, **modificar cantidades**, **borrar item individual** y **vaciar** el `localStorage`. |
| **Operadores Avanzados** | ✅ | Uso de **operador ternario** (`? :`), **operador OR** (`\|\|`) y **destructuring** de objetos. |
| **Librerías Externas** | ✅ | Integración de **Toastify JS** (notificaciones toast) y **SweetAlert2** (diálogos modales interactivos). |
| **Lógica Completa de Negocio** | ✅ | Circuito de compra completo: catálogo ➔ carrito ➔ gestión de unidades ➔ checkout ➔ comprobante. |
| **Código Limpio y Semántico** | ✅ | Nomenclatura descriptiva en español, sin variables genéricas (`x`, `a`), sin código muerto ni `console.log` residuales. |

---

## 📁 Estructura del Proyecto

```text
coderhouse-javascript-tp-final/
├── assets/
│   └── images/
│       └── logo.svg          # Logo vectorial de la marca
├── css/
│   └── style.css             # Estilos y diseño responsivo
├── data/
│   └── productos.json        # Base de datos simulada en formato JSON
├── js/
│   ├── storage.js            # Módulo de persistencia en LocalStorage
│   └── main.js               # Lógica de la aplicación, DOM, fetch y librerías
├── index.html                # Archivo principal único en la raíz
└── README.md                 # Documentación completa del proyecto
```

---

## 💻 Instrucciones para Ejecutar el Proyecto

1. Clonar o descargar el repositorio.
2. Dado que el proyecto consume un archivo local `.json` mediante la Fetch API, los navegadores modernos restringen solicitudes `file://` debido a políticas de seguridad CORS. Por lo tanto, se recomienda abrir el proyecto mediante un servidor local:
   - **Opción recomendada (VS Code):** Instalar la extensión **Live Server**, hacer click derecho sobre `index.html` y seleccionar *Open with Live Server*.
   - **Opción alternativa (Python):** Ejecutar `python -m http.server 3000` en la terminal dentro de la carpeta del proyecto y abrir `http://localhost:3000`.
   - **Opción alternativa (Node.js):** Ejecutar `npx serve` o `npx live-server`.
