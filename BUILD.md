# Retail Solution — Play Market va App Store build

## Oldindan kerak

| Platforma | Nima kerak |
|-----------|------------|
| **Android** | Node.js 22+, Android Studio, JDK (Android Studio ichidagi) |
| **iOS** | Mac, Xcode 15+, Apple Developer akkaunt ($99/yil) |

---

## 1. Android — Play Market (AAB)

Google Play **AAB** fayl talab qiladi (APK emas, lekin test uchun APK ham chiqadi).

### 1-qadam: Release imzo (bir marta)

Terminalda loyiha papkasida:

```bash
npm run keystore:android
```

Parol kiriting va **eslab qoling** — keyinroq yangilanishlar uchun shu kalit kerak.

Yaratiladi:
- `android/app/retail-release.keystore`
- `android/keystore.properties` (GitHubga yuklanmaydi)

### 2-qadam: Build

```bash
npm run build:android
```

Tayyor fayllar:

| Fayl | Qayerda | Nima uchun |
|------|---------|------------|
| **AAB** | `android/app/build/outputs/bundle/release/app-release.aab` | **Play Market** ga yuklash |
| **APK** | `android/app/build/outputs/apk/release/app-release.apk` | Telefonga test o‘rnatish |

### 3-qadam: Play Console

1. [Google Play Console](https://play.google.com/console) → Yangi ilova
2. **Ilova ID:** `com.retailsolution.uz` (`android/app/build.gradle` dagi `applicationId`)
3. **Production** → Yangi release → AAB faylni yuklang
4. Skrinshotlar, tavsif, reyting — to‘ldiring

### Versiya yangilash

Har yangi chiqarishda `android/app/build.gradle` ichida:

```gradle
versionCode 3        // har safar +1
versionName "1.0.2"
```

---

## 2. iOS — App Store

Faqat **Mac** da.

### 1-qadam: CocoaPods

```bash
npm run pods:ios
```

### 2-qadam: Apple Developer

1. [developer.apple.com](https://developer.apple.com) — Team ID oling
2. Xcode → `ios/retail.xcworkspace` oching
3. Target **retail** → **Signing & Capabilities** → Team tanlang
4. Bundle ID: `com.retailsolution.uz` (App Store Connect bilan bir xil bo‘lsin)

### 3-qadam: Archive (Xcode — eng oson)

1. Xcode: **Product → Archive**
2. Organizer ochiladi → **Distribute App**
3. **App Store Connect** → Upload

### Yoki terminal

```bash
# Team ID bilan (Apple Developer → Membership)
APPLE_TEAM_ID=XXXXXXXXXX npm run build:ios
```

IPA uchun `ios/ExportOptions.plist.example` dan nusxa oling:

```bash
cp ios/ExportOptions.plist.example ios/ExportOptions.plist
# teamID ni o‘zgartiring
```

### Versiya yangilash

Xcode → Target **retail** → **General**:
- **Version** → `1.0.1` (foydalanuvchi ko‘radi)
- **Build** → `2` (har upload +1)

---

## Tez buyruqlar

```bash
npm start                 # Metro (dev)
npm run android           # Emulator / telefon (dev)
npm run ios               # Simulator (dev)
npm run keystore:android  # Imzo kaliti (bir marta)
npm run build:android     # AAB + APK (release)
npm run build:ios         # iOS archive (Mac)
```

---

## Muammolar

### Android: `Unable to locate Java Runtime`

`android/gradle.properties` ichidagi izohga qarang: `org.gradle.java.home` ni faqat kerak bo‘lsa qo‘shing (Android Studio JDK yo‘li). Yoki `JAVA_HOME` / Android Studio orqali Gradle JDK tanlang.

### Android: `keystore.properties yo‘q`

Avval `npm run keystore:android` ishga tushiring.

### iOS: Signing xato

Xcode da Team tanlang va Bundle ID `com.retailsolution.uz` bo‘sh bo‘lmasin.

### Build uzoq davom etadi

Birinchi marta 10–20 daqiqa normal. Keyingi safar tezroq.

---

## Firebase (push bildirishnomalar)

Loyiha: **retail** (`retail-56f9a`, project number `458194550273`).

Login muvaffaqiyatli bo‘lgach FCM token `POST /mobile/user/firebase_token/?firebase_token=...` ga yuboriladi.

### ID mosligi (muhim)

| | Firebase (skrinshot) | Ilova kodi (Play/App Store) |
|--|----------------------|-----------------------------|
| **Android** | `com.cradle.retail_mobile` | `com.retailsolution.uz` |
| **iOS** | `com.cradle.retailMobile` | `com.retailsolution.uz` |

Eski `com.cradle.*` fayllari **ishlamaydi**. Bir xil Firebase loyihada **yangi** ilovalar qo‘shing (Add app):

| Platforma | Maydon | Qiymat |
|-----------|--------|--------|
| Android | Package name | `com.retailsolution.uz` |
| iOS | Bundle ID | `com.retailsolution.uz` |

### Fayllar qayerga

| Platforma | Console dan yuklash | Loyihada joy |
|-----------|---------------------|--------------|
| **Android** | `google-services.json` | `android/app/google-services.json` |
| **iOS** | `GoogleService-Info.plist` | `ios/retail/GoogleService-Info.plist` |

Namuna: `android/app/google-services.json.example`, `ios/retail/GoogleService-Info.plist.example`.

### Sozlash (bir marta)

1. [Firebase Console](https://console.firebase.google.com/) → **retail** → Project settings → Your apps.
2. Yuqoridagi jadval bo‘yicha **yangi** Android va iOS ilovalar qo‘shing (`com.retailsolution.uz`).
3. Har biridan config faylini yuklab yuqoridagi joylarga qo‘ying.
4. Firebase → **Cloud Messaging** yoqilgan bo‘lsin.
5. iOS (RN 0.85 + Firebase): `npm run pods:ios` yoki `npm run ios` — Podfile `RCT_USE_PREBUILT_RNCORE=0` ishlatadi. `AppDelegate.swift` da `FirebaseApp.configure()` bo‘lishi kerak (`GoogleService-Info.plist` bundan keyin ishlaydi).
6. `No Firebase App '[DEFAULT]'` xatosi: odatda iOS native rebuild yetmaydi — Simulator’dagi ilovani o‘chiring, `npm run ios` (faqat Metro reload yetmaydi).
7. `RNFBAppModule not found` bo‘lsa: Simulator’dagi ilovani o‘chiring, keyin `cd ios && rm -rf Pods Podfile.lock build && npm run ios`.
8. Android: `npm run android` yoki Xcode.

### Android: `No online devices` / `UNAUTHORIZED`

Build muvaffaqiyatli, lekin o‘rnatish qurilmada qoladi:

1. Telefon: USB debugging yoqing, kompyuterga ulang, «Allow USB debugging» tasdiqlang.
2. Yoki emulyatorni qo‘lda ishga tushiring: Android Studio → Device Manager → Pixel.
3. Terminal: `adb kill-server && adb start-server && adb devices` — ro‘yxatda `device` (UNAUTHORIZED emas) ko‘rinishi kerak.
4. Keyin: `npm run android`

`google-services.json` bo‘lmasa Android build ishlaydi, lekin push token olinmaydi.

---

## Muhim

- `keystore.properties` va `retail-release.keystore` ni **hech qachon GitHubga yuklamang**
- Play Market parolini yo‘qotsangiz, ilovani yangilab bo‘lmaysiz — zaxira nusxa saqlang
- Production server: `.env` yoki `src/config/env.ts` dagi `BASE_URL` (`https://api.retailsolution.ai`)
