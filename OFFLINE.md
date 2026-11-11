# Modo offline de las funciones existentes

Base: `main` de `DrAlastor/ecommerce-movil`, commit `0e66b67936a9528bbf24e38419245a7e7e5ca574`. Esta copia se descargó limpia antes de aplicar los cambios. No se incorporó POS móvil ni otra función de negocio.

## Comportamiento

- Catálogo, filtros, detalles, sucursales, compras, comprobantes, reservas, perfil, recomendaciones ya obtenidas y datos del vestidor: las respuestas consultadas con conexión se guardan y recuperan al fallar la red o el servidor. Los errores de autorización no se sustituyen por datos guardados. El historial privado se separa por servidor, tienda y usuario.
- Las búsquedas y filtros de catálogo pueden aplicarse a los productos previamente consultados, aunque esa combinación de filtros no se hubiera abierto online. La interfaz indica que no representan todo el catálogo ni garantizan stock/precios actuales. Un detalle nunca descargado requiere conexión; no se inventan variantes ni existencias.
- Imágenes visualizadas: descarga en archivos privados de la aplicación, con archivo temporal hasta completar cada descarga. Los componentes existentes usan el archivo completo si está disponible. La descarga puede fallar por falta de espacio o red; no se afirma que una imagen no descargada esté disponible offline. No se guardan fotos o videos de la cámara.
- Carrito y favoritos: siguen siendo modificables sin internet. El carrito se guarda como borrador versionado; el envío no se considera terminado hasta verificarlo en el servidor. Un reintento consulta el estado real y aplica cantidades absolutas, sin vaciar el carrito completo ni sumar de nuevo una operación ya recibida. Las eliminaciones también se concilian.
- Reconexión: el carrito pendiente se intenta conciliar al volver la conexión, volver a la app y periódicamente mientras está abierta. Catálogo/detalles y sesión vuelven a consultarse al recuperar conexión o regresar a primer plano. No se promete ejecución con la app cerrada.
- Compra/pago y creación/cancelación de reservas: requieren servidor. No se encolan ni se confirman automáticamente al reconectar. Antes de comprar se verifican carrito, precios y disponibilidad; si cambia el precio en esa validación, se solicita revisar el total antes de continuar.
- Sesión: se restaura la sesión previamente guardada para consultar los datos locales. El inicio de sesión nuevo requiere conexión. Un rechazo 401 del servidor invalida la sesión; un corte de red no la elimina. Cerrar sesión conserva los borradores del usuario para su siguiente inicio, sin mostrarlos a otro usuario.
- Vestidor: se conserva el modo Studio existente con datos/imágenes disponibles localmente. La cámara AR incrustada abre una web externa; necesita conexión y, si falla, se vuelve a Studio. No se ha añadido un motor de cámara distinto.

## Almacenamiento y límites

Lecturas: AsyncStorage, hasta 120 entradas, máximo 400 KB por entrada y vigencia de 30 días. Una falta de espacio se informa sin impedir la consulta online. Carrito/favoritos usan claves propias y no se eliminan al podar lecturas. Imágenes: directorio privado `offline-assets-v1`, máximo aproximado de 150 MB y 20 MB por descarga. Estos datos pueden perderse si se desinstala la aplicación, se borran sus datos o falla el dispositivo.

## Verificación

- `npm run typecheck`: TypeScript, sin errores.
- `npm test -- --runInBand`: veinte pruebas pasan: caché, aislamiento, bloqueo de pagos sin red, invalidación de sesión, filtros locales, reconciliación del carrito, imágenes completas/parciales y render de la aplicación.
- Bundle Android de producción generado con Metro en `/tmp/examen2-offline-mobile/`. No equivale a compilar o probar un APK.
- Nuevas dependencias nativas: `@react-native-community/netinfo` y `react-native-file-access`. Recompilar la app; en iOS instalar Pods en macOS antes de compilar.

En teléfono: iniciar sesión, recorrer catálogo/detalles e imágenes, modificar carrito y favoritos, activar modo avión, cerrar y abrir la app, consultar datos guardados y modificar cantidades/eliminar artículos. Verificar que comprar o reservar no confirme nada sin servidor. Reconectar, comprobar cantidades y precios sin duplicados y cambiar de usuario/tienda para verificar aislamiento. Probar también falta de espacio, token rechazado y un producto sin stock.

No se ha publicado ni instalado una versión móvil. La prueba nativa en dispositivo continúa pendiente; las pruebas automatizadas simulan los módulos de red y archivos.
