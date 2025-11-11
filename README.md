# Liste App

En React Native shopping list app laget med Expo, som lar deg opprette og administrere flere gjøremåls-lister.

## Funksjoner

- Opprett og administrer flere handlelister
- Legg til varer i lister ved å trykke Enter
- Marker varer som handlet/ikke handlet med et trykk
- Drag-and-drop for å endre rekkefølge på varer (long-press)
- Gi nytt navn til lister
- Slett lister med bekreftelse
- Automatisk sortering: uhandlede varer øverst, handlede nederst
- Persistent lagring med JSON-filer (én fil per liste)

## Teknologier

- **React Native** 0.81.5
- **Expo** SDK 54
- **TypeScript**
- **expo-file-system** for filbasert lagring
- **react-native-draggable-flatlist** for drag-and-drop
- **react-native-gesture-handler** for gestures

## Installasjon

1. **Installer avhengigheter**

   ```bash
   npm install
   ```

## Kjør appen

### På Android-emulator

1. Start Android-emulatoren via Android Studio
2. Kjør kommandoen:

   ```bash
   npx expo start --android
   ```

### På fysisk enhet

1. **Installer Expo Go på telefonen din**
   - Last ned Expo Go fra [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent) (Android)
   - Eller fra [App Store](https://apps.apple.com/app/expo-go/id982107779) (iOS)

2. Start Expo dev server:

   ```bash
   npx expo start
   ```

3. Skann QR-koden med Expo Go-appen:
   - **Android**: Skann QR-koden direkte i Expo Go-appen
   - **iOS**: Skann QR-koden med Camera-appen, åpne i Expo Go

## Prosjektstruktur

```
MyApp/
├── app/
│   ├── index.tsx          # Hovedkomponent med all UI og logikk
│   ├── types.ts           # TypeScript interfaces (ListItem, ShoppingList)
│   └── utils/
│       └── storage.ts     # Filbasert lagring med expo-file-system
├── package.json
└── README.md
```

## Lisens

Dette er et studentprosjekt for IDATT2506 - Applikasjonsutvikling for mobile enheter.

