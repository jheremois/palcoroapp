# App Store (iOS) — checklist Pal Coro

## ⚠️ Prerrequisito (tuyo)
- **Apple Developer Program — $99 USD/año.** Inscríbete en
  [developer.apple.com/programs](https://developer.apple.com/programs/). Sin esto
  no se puede subir nada a iOS. (Android era $25 una vez; Apple es anual.)
- Para apps gratis no necesitas datos bancarios, solo aceptar el acuerdo de
  desarrollador (se acepta al inscribirte).

## ✅ Config ya lista (en app.json)
- `ios.bundleIdentifier`: **com.palcoro.app**
- Icono de marca (PNG sin canal alpha — Apple lo exige) y splash negro.
- iPhone-only (`supportsTablet: false`).
- `ITSAppUsesNonExemptEncryption: false` → te salta la pregunta de "export
  compliance" en cada envío.
- Sin permisos sensibles → no hace falta ningún texto de uso (cámara/mic/fotos).

## 1. Build (EAS maneja certificados solo)
```bash
cd /Users/jheremycastro/Documents/projects/mobile/palcoro
eas build --platform ios --profile production
```
- EAS te pide login de Apple y **genera solo** el certificado de distribución y el
  provisioning profile, y registra el bundle id. Sale un `.ipa`. ~15–20 min.

## 2. Subir a App Store Connect
```bash
eas submit --platform ios
```
- Interactivo: te pide tu Apple ID y **crea/enlaza la app** en App Store Connect.
- El build aparece en **TestFlight** tras ~10–30 min de procesamiento → puedes
  probarlo en tu iPhone antes de mandarlo a revisión.

## 3. Ficha en App Store Connect (appstoreconnect.apple.com)
- **Nombre:** `Pal Coro`
- **Subtítulo** (máx 30): `Verdad o Reto y más · offline`
- **Categoría:** Juegos (subgéneros sugeridos: Casual y Trivia).
- **Descripción:** la misma de `play-listing.md` (descripción larga).
- **Palabras clave** (máx 100, separadas por coma):
  `verdad o reto,yo nunca nunca,fiesta,beber,previa,party,juego,reto,coro,junta,amigos,tomar`
- **URL de soporte:** https://palcoroweb.vercel.app
- **URL de marketing** (opcional): https://palcoroweb.vercel.app
- **Política de privacidad:** https://palcoroweb.vercel.app/privacy
- **Precio:** Gratis.
- **Capturas (iPhone 6.7"):** sube las 3 de `store/screenshots/` (ya son 1290×2796).
  Apple pide mínimo 1; puedes agregar más tomadas en tu iPhone.
- **Icono:** App Store Connect toma el de 1024 desde el build automáticamente.

## 4. App Privacy (la "etiqueta nutricional")
- **Data Not Collected** → selecciona *"No, no recopilo datos de esta app."*
  (Igual que en Android: todo es local, nada se transmite.)

## 5. Age Rating (cuestionario de Apple)
- Alcohol/Tabaco/Drogas (referencias): **Infrecuente/Leve**.
- Contenido sexual o desnudez: **Infrecuente/Leve** (temas sugestivos).
- Lenguaje soez / humor crudo: **Infrecuente/Leve**.
- Resultado: **17+**. Acéptalo.

## 6. Enviar a revisión
- Adjunta el build (de TestFlight) a la versión 1.0.0 → **Submit for Review**.
- Revisión de Apple: ~1–3 días normalmente.

## Notas
- view-shot (compartir la carta), expo-audio (sonidos) y expo-sqlite (guardado)
  **sí funcionan** en el build de producción de iOS (no es Expo Go).
- Expo SDK 54 genera el Privacy Manifest (PrivacyInfo.xcprivacy) automáticamente.
