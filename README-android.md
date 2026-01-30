Capacitor Android wrapper

Recommended approach: use Capacitor to wrap the existing Vite React web app as a native Android app.

Quick steps (run locally on your machine with Android SDK/Android Studio installed):

1. Install Capacitor CLI (if not installed):

   npm install @capacitor/cli --save-dev
   npm install @capacitor/core --save

2. Build web assets and add Android platform:

   npm run build
   npx cap add android

3. Copy web assets and open Android Studio:

   npx cap copy android
   npx cap open android

4. From Android Studio you can build, run on an emulator/device, and adjust app settings (package name, icons, signing).

NPM helper scripts added to `package.json`:

- `npm run android:add` — run `npx cap add android`
- `npm run android:prepare` — builds and copies assets to the Android project
- `npm run android:open` — opens the Android project in Android Studio
- `npm run android:build` — builds web assets, syncs and opens Android Studio

Notes:
- Ensure `capacitor.config.json` fields `appId` and `appName` match your desired identifiers.
- Android Studio and Android SDK (Java JDK) must be installed to build and run the native app.
- If you prefer a Progressive Web App or Trusted Web Activity (TWA) approach, tell me and I can scaffold that instead.
