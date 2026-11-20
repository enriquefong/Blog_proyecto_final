# AFORO · Edición N.º 1 — Quickvnt

Revista digital (blog) en HTML, CSS y JS puros. No requiere compilación.

## Estructura de la edición
| N.º | Sección | Contenido destacado |
|---|---|---|
| — | Portada | Entrada interactiva con QR que se valida al hacer clic |
| 1 | Sumario | Índice navegable y tiempo de lectura |
| 01 | Introducción | Figura interactiva «Sin Quickvnt / Con Quickvnt» |
| 02 | Equipo | Biografía de Enrique Fong |
| 03 | Estrategia | Misión, visión, función, hoja de ruta y ciclo construir–medir–aprender |
| 04 | Impacto | KPIs, ecosistema de actores, flujo del MVP en 4 pasos y simulador de ahorro |
| 05 | Cifras | Gráfico de anillo del presupuesto, tarifas, stack, cronograma (Gantt), KPIs y riesgos filtrables |
| 06 | Conclusión | Resumen ejecutivo y test de lectura |
| — | Bibliografía | Fuentes y créditos de imágenes en APA |

## Publicar en GitHub Pages
1. Sube el contenido de esta carpeta a la rama `main` de un repositorio.
2. **Settings → Pages → Deploy from a branch**, rama `main`, carpeta `/ (root)`.
3. En unos minutos estará en `https://TU-USUARIO.github.io/NOMBRE-DEL-REPO/`.

## Ver en local
```
python -m http.server 8000
```
y abre `http://localhost:8000`.

## Personalizar
- Formato del proyecto final: Times New Roman, 12 pt en texto y 14 pt en títulos, interlineado 1,5, párrafos justificados, citas APA.
- Colores: variables al inicio de `css/styles.css`.
- Fotos: se cargan desde Wikimedia Commons (licencias CC/CC0, citadas en la Bibliografía). Si una no carga, se muestra la ilustración de respaldo. Ver `img/LEEME.txt`.
