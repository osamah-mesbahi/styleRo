const fs = require('fs');
const path = require('path');

function readJson(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { return null; }
}

const gsPath = path.join(__dirname, '..', 'android', 'app', 'google-services.json');
const buildGradlePath = path.join(__dirname, '..', 'android', 'app', 'build.gradle');

const gs = readJson(gsPath);
if (!gs) {
  console.error('google-services.json not found or invalid:', gsPath);
  process.exit(2);
}

let packageName = null;
try {
  packageName = gs.client && gs.client[0] && gs.client[0].client_info && gs.client[0].client_info.android_client_info && gs.client[0].client_info.android_client_info.package_name;
} catch (e) { packageName = null; }

if (!packageName) {
  console.error('package_name not found inside google-services.json');
  process.exit(2);
}

const gradle = fs.existsSync(buildGradlePath) ? fs.readFileSync(buildGradlePath, 'utf8') : null;
if (!gradle) {
  console.error('android/app/build.gradle not found:', buildGradlePath);
  process.exit(2);
}

const m = gradle.match(/applicationId\s+"([^"]+)"/);
const applicationId = m ? m[1] : null;
if (!applicationId) {
  console.error('applicationId not found in android/app/build.gradle');
  process.exit(2);
}

if (packageName === applicationId) {
  console.log('OK: google-services.json package_name matches applicationId ->', applicationId);
  process.exit(0);
} else {
  console.error('MISMATCH: google-services.json package_name:', packageName);
  console.error('          android/app/build.gradle applicationId:', applicationId);
  console.error('\nRecommendation: download a google-services.json from Firebase Console for package:', applicationId);
  process.exit(1);
}
