# Mejoras futuras

Ideas descartadas por ahora, con el motivo. No están implementadas: si alguien
las pide, esto es lo que costarían.

---

## 1. Detección automática de paredes en cualquier foto

**Hoy:** la pared del fondo de la foto de ejemplo viene marcada con una máscara
generada en el build (`scripts/build-wall-mask.mjs`), combinando geometría
medida a mano y un filtro por color. Para cualquier otra zona, el usuario
arrastra un rectángulo.

**Lo que haría falta:** un modelo de segmentación semántica que distinga
"pared" de "sofá" en una foto arbitraria. Opciones:

- **API externa** (Segment Anything alojado, Replicate, Google Vision). Lo más
  rápido de integrar. Implica coste por petición, subir la foto del cliente a
  un tercero (aviso de privacidad) y latencia de 1–3 s.
- **Modelo en el navegador** (ONNX Runtime Web o TensorFlow.js). Sin coste por
  uso y sin enviar nada fuera, pero son 5–20 MB de descarga y va lento en
  móviles modestos.

**Recomendación:** no hacerlo hasta que alguien lo pida. Que el usuario pueda
subir *su* foto es lo que lo justificaría, y eso es otra funcionalidad.

---

## 2. Subir tu propia foto

Encaja con lo anterior. Requiere además: límite de peso, corrección de la
orientación EXIF, borrado de metadatos (las fotos de móvil llevan GPS) y una
política de retención. Sin segmentación automática, el usuario tendría que
marcar todas las zonas a mano, lo que rebaja bastante la gracia.

---

## 3. Adjuntos grandes en el formulario

**Hoy:** hasta 5 imágenes y 4 MB en total, porque el cuerpo de una petición a
una función serverless de Vercel se corta sobre los 4,5 MB.

**Para admitir más:** subida directa del navegador a un almacén (Vercel Blob,
S3, Cloudinary) con URL firmada, y que el email lleve enlaces en vez de
adjuntos. Es la vía normal cuando alguien quiere mandar 20 fotos de una obra.

---

## 4. Limitación de envíos por IP

**Hoy:** trampa oculta (*honeypot*) más una comprobación de que el formulario
no se ha enviado en menos de 3 segundos. Frena el spam automático corriente.

**Si llegara spam de verdad:** un contador por IP en Upstash Redis o Vercel KV
(en serverless no vale una variable en memoria: cada invocación puede caer en
una instancia distinta). Un captcha sólo como último recurso: estorba a
usuarios reales y empeora la accesibilidad.

---

## 5. Un CMS para el contenido

**Hoy:** el contenido está en módulos TypeScript tipados. Para el volumen
actual va perfecto y no cuesta nada.

**Cuando dejaría de bastar:** si PINTURESGS quiere publicar proyectos por su
cuenta sin tocar código. Encajarían Sanity, Keystatic (guarda en el propio
repositorio, gratis) o Decap. Los componentes ya leen de una única capa de
datos, así que sería sustituir esa capa, no reescribir la web.

---

## 6. Analítica

No hay nada instalado, y por tanto no hay banner de cookies. Si hiciera falta
medir, lo primero que miraría es una opción sin cookies (Plausible, Fathom, o
Vercel Web Analytics, que ya está en el adaptador y sólo hay que activar). Con
Google Analytics sí haría falta banner de consentimiento y aviso de cookies.

---

## 7. Varios idiomas

La web está en español, con el nombre de la herramienta en catalán
("Pinta el teu espai"), tal como se aprobó. Para una versión catalana completa,
Astro trae enrutado por idioma (`src/pages/ca/`), y el contenido ya está
separado en `src/data/`, que es la parte que habría que duplicar.
