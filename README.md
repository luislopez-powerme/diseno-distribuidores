# Distribuidores PowerMe · maqueta del portal B2B

Maqueta estática del portal de distribuidores de **PowerMe Energy**, Distribuidor Maestro de EcoFlow en México.
Sirve para revisar el diseño antes de implementarlo en Shopify. No tiene backend: los formularios, el carrito y el
inicio de sesión son de demostración y no guardan nada.

## Páginas

| Página | Archivo |
|---|---|
| Inicio | `index.html` |
| Catálogo de productos | `categoria.html` |
| Buscador | `buscar.html` |
| Fichas de producto | `producto.html` · `producto-delta-3-max.html` · `producto-river-3-plus.html` · `producto-panel-110-ligero.html` |
| Carrito y pago | `carrito.html` |
| Registro de distribuidor | `registro.html` |
| Inicio de sesión · Recuperar contraseña | `login.html` · `recuperar.html` |
| Programa de distribuidores | `programa.html` |
| Nosotros | `nosotros.html` |
| Preguntas frecuentes | `preguntas-frecuentes.html` |
| Reglamento · Términos y condiciones | `reglamento.html` · `terminos.html` |
| Contacto y showrooms | `contacto.html` |
| Página no encontrada | `404.html` |

## Cómo verla

Es HTML, CSS y JavaScript sin dependencias ni compilación. Basta con un servidor estático:

```bash
python -m http.server 8743
```

Y abrir http://localhost:8743.

## Qué es real y qué es de muestra

- **Reales:** nombres, SKU, imágenes y descripciones de los productos EcoFlow y ATESS; el reglamento para
  subdistribuidores; las direcciones de los showrooms; los videos de la cuenta de TikTok de PowerMe.
- **De muestra:** los precios de distribuidor (15 % de descuento de ejemplo), la agenda de capacitación, los datos
  del ejecutivo de cuenta y todo el flujo con sesión iniciada del carrito.

## Pendientes conocidos

- Las tipografías Commuters Sans incluidas son versiones **DEMO de Fontspring**: falta comprar la licencia web
  antes de usarlas en un sitio de producción.
- Las imágenes de producto pertenecen a EcoFlow y ATESS, y se usan aquí con fines de maqueta.

© 2026 PowerMe Energy
