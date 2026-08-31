# Invalidación del catálogo desde Google Sheets

Este script conecta las ediciones de la pestaña `Productos` con:

```text
POST /api/revalidate/catalog
```

La aplicación mantiene como respaldo la revalidación automática cada cinco
minutos. El webhook permite que una edición llegue antes sin consultar Google
Sheets en cada visita.

## Qué ediciones invalidan la caché

El trigger observa únicamente las columnas utilizadas por el catálogo:

| Columna | Campo     |
| ------- | --------- |
| A       | `SKU`     |
| B       | `ARTISTA` |
| C       | `ALBUM`   |
| G       | `ESTADO`  |
| H       | `PORTADA` |
| L       | `GENERO`  |

Las ediciones en otra pestaña o en las columnas ignoradas no realizan ninguna
petición.

## 1. Configurar el servidor

Genera un secreto aleatorio con al menos 32 caracteres. Por ejemplo:

```bash
openssl rand -base64 32
```

Configúralo en el entorno de producción de Next.js:

```dotenv
CATALOG_REVALIDATION_SECRET="valor-generado"
```

Después vuelve a desplegar la aplicación. No agregues el valor real a Git.

## 2. Crear el proyecto vinculado

1. Abre el Google Sheet del catálogo.
2. Ve a **Extensiones > Apps Script**.
3. Copia el contenido de `catalog-revalidation.gs` al editor.
4. Guarda el proyecto.

El código debe estar vinculado al Sheet. No necesita desplegarse como Web App.

## 3. Guardar la configuración privada

En Apps Script abre **Configuración del proyecto > Propiedades del script** y
agrega exactamente:

| Propiedad                     | Valor                                           |
| ----------------------------- | ----------------------------------------------- |
| `CATALOG_REVALIDATION_URL`    | `https://tu-dominio.com/api/revalidate/catalog` |
| `CATALOG_REVALIDATION_SECRET` | El mismo secreto configurado en Next.js         |

La URL debe usar HTTPS, no debe contener query string y no debe incluir el
secreto. Usa la URL pública de producción, no `localhost`.

## 4. Instalar el trigger autorizado

1. Selecciona `installCatalogRevalidationTrigger` en el editor.
2. Presiona **Ejecutar**.
3. Autoriza el acceso solicitado por Google.
4. Abre **Activadores** y confirma que exista un activador de edición para
   `handleCatalogEdit`.

La función es idempotente: puede ejecutarse otra vez sin crear triggers
duplicados. Se usa un trigger instalable porque la petición HTTPS requiere
autorización; no crees un trigger simple llamado `onEdit`.

## 5. Verificar la conexión

Primero ejecuta manualmente:

```text
testCatalogRevalidation
```

Después edita una celda de `Productos` en cualquiera de las seis columnas
observadas. En **Ejecuciones** debe aparecer `handleCatalogEdit` con estado
correcto.

Una respuesta HTTP diferente de `200` queda registrada solo con su código de
estado. El script nunca registra el secreto, la respuesta del servidor ni los
productos.

El endpoint únicamente expira `catalog-products`. La siguiente solicitud de una
página que consuma el catálogo realizará una lectura nueva de Google Sheets.

## Control de ráfagas

La primera edición envía la invalidación inmediatamente. Las ediciones que
ocurran durante los siguientes 15 segundos se agrupan en una única invalidación
diferida. `LockService` impide que ejecuciones concurrentes creen solicitudes o
triggers duplicados.

Esto mantiene el webhook por debajo del límite de cinco solicitudes por minuto
del endpoint durante pegados o ediciones rápidas. Apps Script puede ejecutar el
trigger diferido más tarde que el mínimo solicitado; la caché temporal de cinco
minutos sigue siendo el respaldo si el webhook falla.

## Operación y seguridad

- Al rotar el secreto, actualízalo primero en Next.js, despliega y después
  reemplázalo en Script Properties.
- No pongas el secreto en el código, la URL, una celda ni los registros.
- Los triggers instalables se ejecutan con la cuenta que los creó. Si esa cuenta
  pierde acceso, vuelve a instalar el trigger con una cuenta administradora.
- Las ediciones hechas mediante scripts o APIs no disparan el evento de edición
  de Sheets. En ese caso, el proceso que escribe debe llamar al endpoint o se
  utilizará la revalidación automática de cinco minutos.
- Para desactivar la integración ejecuta
  `removeCatalogRevalidationTriggers`; la URL y el secreto se conservan.
