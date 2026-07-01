# Respuestas exactas — Play Console (Pal Coro)

Copia/cliquea esto en cada sección del checklist "Configura tu app".

## App access (Acceso a la app)
- **Toda la funcionalidad está disponible sin restricciones.** (No hay login ni
  credenciales — no agregues nada.)

## Ads (Anuncios)
- **No, mi app no contiene anuncios.**

## Content rating (Clasificación de contenido)
Inicia el cuestionario. Categoría de la app: **Juego**. Email de contacto: el tuyo.
Responde:
- **Violencia:** No.
- **Sexualidad:** Sí → *referencias / insinuaciones sexuales suaves* (los retos
  picantes). NO hay desnudez ni contenido sexual explícito.
- **Lenguaje soez:** Sí → *poco frecuente / leve*.
- **Sustancias controladas:** **Sí → referencias al consumo de alcohol** (modo "con
  shots" y el tono). No drogas ilegales.
- **Juegos de azar / apuestas:** No.
- **Interacción entre usuarios / contenido compartido en línea:** **No.** (Lo que
  escriben se queda local; nada se comparte por internet dentro de la app.)
- Resultado esperado: **Maduro / +17 (ESRB), PEGI 16–18.** Está bien, acéptalo.

## Target audience and content (Público objetivo)
- **Grupos de edad:** marca solo **18 y más**. NO incluyas menores de 18.
- **¿Tu app atrae a niños?** **No.**
- (Así evitas las políticas de "Familias" que chocarían con el contenido.)

## Data safety (Seguridad de los datos)
- **¿Tu app recopila o comparte datos de usuarios?** → **No.**
  - Todo se guarda solo en el dispositivo; nada se transmite. En términos de Play,
    almacenamiento local ≠ "recopilar". Responde **No** con confianza.
- **¿Tu app usa un ID de publicidad (Advertising ID)?** → **No.**
  - Verificado: cero SDKs de ads/analítica/tracking en las dependencias. La app no
    accede al Advertising ID.
  - (Si alguna vez Google detectara el permiso `com.google.android.gms.permission.AD_ID`
    por una dependencia transitiva, se quita con
    `<uses-permission android:name="com.google.android.gms.permission.AD_ID" tools:node="remove"/>`
    — pero con estas dependencias no debe aparecer.)

## Otras declaraciones
- **App de noticias:** No.
- **App relacionada con COVID-19:** No.
- **Funciones financieras:** No.
- **App del gobierno:** No.
- **Health apps:** No.

## Store listing (Ficha) — valores
- **Nombre:** `Pal Coro`
- **Descripción corta** (de `play-listing.md`):
  `El sistema operativo de las juntas. Verdad o Reto y más, 100% offline.`
- **Descripción larga:** la de `play-listing.md`.
- **Icono:** `store/icon-512.png`
- **Gráfico destacado:** `store/feature-graphic.png`
- **Capturas de teléfono:** las 3 de `store/screenshots/` (puedes agregar más
  tomadas en tu teléfono después).
- **Categoría de la app:** Juegos → Casual.
- **Email de contacto:** jheremy802@gmail.com
- **Política de privacidad:** la URL donde hospedes `store/privacy.html`.

## Release
- **Testing → Internal testing → Create release** → sube `~/Downloads/pal-coro-v1.aab`.
- Acepta **Play App Signing** (automático).
- Agrégate como tester → **Rollout**. Sale al instante para ti/tus panas.
- Cuando esté probado → **Promote to Production** (la revisión de Production tarda
  unos días en cuentas nuevas).
