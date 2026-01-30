Android Firebase setup (google-services.json)

This project requires a `google-services.json` file for Android FCM / Firebase.

Steps to obtain and install the correct file:

1. Open Firebase Console → select the project `stylero-6dddd`.
2. In Project Settings → Your apps, add an Android app with the package name exactly matching `applicationId` in `android/app/build.gradle` (currently `com.stylero.app`).
3. Download the generated `google-services.json` for that Android app.
4. Place the downloaded file at `android/app/google-services.json`.

Notes:
- A backup of the previous file was saved at `android/app/google-services.json.bak`.
- After placing the correct file, run the validation script in the repo root:

```bash
npm run check:google-services
```

- Then prepare/build the Android app:

```bash
npm run android:prepare
npm run android:build
```

If you want, upload the downloaded `google-services.json` here and I will place it for you and run the validation/build steps.

Registered SHA-1 fingerprint
---------------------------

The following SHA-1 fingerprint has been provided and should be added to the Android app in Firebase Console (Project settings → Your apps → select Android app → Add fingerprint):

`DA:39:A3:EE:5E:6B:4B:0D:32:55:BF:EF:95:60:18:90:AF:D8:07:09`

After adding the fingerprint, re-download `google-services.json` and place it at `android/app/google-services.json`.