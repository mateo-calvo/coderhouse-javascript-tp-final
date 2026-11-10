# WattVision - Sistema de Monitoreo Eléctrico y Eficiencia Energética
### Entrega Final - Curso de JavaScript | Coderhouse

**WattVision** es un dashboard técnico interactivo inspirado en interfaces Power BI de control y telemetría en tiempo real, orientado a entornos residenciales y pequeños negocios en Bolivia.

Permite supervisar la curva de carga horaria (Watts), cuantificar el consumo mensual (kWh) y su impacto tarifario en Bolivianos (`Bs.`), detectar consumos pasivos (**Cargas Vampiro / Standby**) y aislar sobrecargas mediante interruptores inteligentes con persistencia en **LocalStorage**.

---

## 🎨 Especificación de Diseño Oficial (`DESIGN.md`)

- **Tema Visual:** Confiabilidad técnica y control. Interfaz tipo Power BI simplificada sin elementos lúdicos o de red social.
- **Paleta de Colores:**
  - `Background Primario:` `#121212` (Modo oscuro de alto contraste y eficiencia visual).
  - `Superficie de Tarjetas:` `#1E1E1E` con bordes sutiles `1px solid #2C2C2E` y `border-radius: 16px`.
  - `Acento Primario (Datos):` `#00E5FF` (Cian Neón) para métricas clave, curvas y botones de acción.
  - `Acento de Alerta:` `#FF453A` (Rojo) para picos de consumo y cajas de advertencia (`#3A1C1C` con borde izquierdo `4px`).
  - `Acento Secundario:` `#32D74B` (Verde Lima) para estado *"En vivo"* y valores de ahorro.
  - `Texto Principal:` `#FFFFFF` | `Texto Secundario:` `#98989D`.
- **Tipografías:**
  - **Títulos:** Inter Semi Bold.
  - **Métricas KPIs:** JetBrains Mono (monoespaciada de alta legibilidad técnica).
  - **Cuerpo:** Inter Regular.
- **Layout:** Grid de 12 columnas con espaciado en múltiplos de 8px (3 KPIs superiores, gráfico principal de 8 columnas y panel lateral de alertas de 4 columnas).

---

## 📋 Checklist de Criterios de Evaluación Coderhouse

| Criterio | Porcentaje | Implementación Técnica en WattVision |
| :--- | :---: | :--- |
| **Uso de DOM** | 20% | 100% de la interfaz gestionada con eventos (`click`, `input`, `change`, `submit`) y manipulación del DOM. Sin alertas ni prompts nativos. |
| **Arrays y Objetos en JSON** | 15% | Los datos residen en `data/dispositivos.json` y se cargan mediante **Fetch API**. Sin hardcodeo en los archivos JS. |
| **Funciones de Orden Superior** | 15% | Uso de `.reduce()` (cálculo de potencia instantánea W, kWh y total en Bs.), `.filter()` (filtros de ambiente y detección de alertas/vampiros), `.find()` (localización por ID), `.some()`, `.map()`, `.forEach()` y `.sort()`. |
| **Storage y Operadores Avanzados** | 8% | [storage.js](file:///C:/Users/mateo/Desktop/coderhouse%20javascript%20tp%20final/js/storage.js) implementa **guardar**, **modificar información** (conmutar encendido/apagado), **borrar dispositivo** y **restablecer** el `localStorage`. Aplica **operador ternario** (`? :`), **operador OR** (`\|\|`) y **destructuring**. |
| **Asincronismo con Fetch** | 15% | Carga asíncrona estructurada con `async / await`, bloque `try / catch / finally` y spinner de carga dinámico. |
| **Librerías Externas** | 8% | Integración de **Chart.js** (gráfico de área degradado cian/verde), **Toastify JS** (notificaciones de telemetría técnica) y **SweetAlert2** (diálogos oscuros de confirmación y calibración). |
| **Lógica Completa del Negocio** | 15% | Circuito completo de auditoría y monitoreo: Telemetría en vivo ➔ KPIs ➔ Curva 24h ➔ Alertas ➔ Control de interruptores ➔ Simulador de desconexión vampiro con proyección en Bs. |
| **Código Claro y Estructura** | 4% | Scripts enlazados en el `<head>` con `defer`. 2 archivos JS, código modular y semántico, sin variables genéricas (`x`, `a`), sin código muerto. |

---

## 📁 Estructura del Proyecto

```text
coderhouse-javascript-tp-final/
├── assets/
│   └── images/
│       └── logo.svg              # Logo vectorial técnico WattVision
├── css/
│   └── style.css                 # Estilos oficiales según DESIGN.md (#121212)
├── data/
│   └── dispositivos.json         # Base de datos JSON de telemetría y cargas
├── js/
│   ├── storage.js                # Persistencia en LocalStorage y operadores avanzados
│   └── main.js                   # Lógica técnica, DOM, Chart.js, Fetch y librerías
├── index.html                    # Único archivo HTML en la raíz con scripts en <head> con defer
├── .gitignore                    # Archivos excluidos de control de versiones
└── README.md                     # Documentación técnica completa
```
