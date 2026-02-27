# Volleyball Stats

Application mobile **React Native** pour enregistrer et consulter les statistiques des joueurs de volley-ball pendant un match. Export des données en Excel et partage (WhatsApp, etc.).

## Prérequis

- **Node.js** >= 18
- **React Native** : [Configuration de l’environnement](https://reactnative.dev/docs/environment-setup) (Android Studio et/ou Xcode)

## Installation

```bash
npm install
```

## Lancer l’application

1. **Démarrer Metro** (dans un terminal) :

   ```bash
   npm start
   ```

2. **Lancer l’app** (dans un second terminal) :
   - Android : `npm run android`
   - iOS : `npm run ios`

## Fonctionnalités

- **Gestion des joueurs** : créer des joueurs avec nom et poste (R4, Pointu, Central, Libéro, Passeur).
- **Saisie des stats** : selon le poste, enregistrement des actions (attaques réussies/ratées, services, réceptions, blocs, passes ratées, fautes).
- **Annuler la dernière action** : suppression de la dernière statistique enregistrée.
- **Export Excel** : génération d’un fichier Excel avec les stats de tous les joueurs et partage (WhatsApp, etc.).
- **Réinitialisation** : remise à zéro de toutes les statistiques (proposée après export).

## Stack technique

- **React Native** 0.76 — UI mobile
- **React Navigation** (Stack) — navigation entre écrans
- **SQLite** (`react-native-sqlite-storage`) — stockage local des joueurs et de l’historique des stats
- **xlsx** + **react-native-fs** — export Excel
- **react-native-share** — partage du fichier
- **TypeScript** — typage

## Structure du projet

```
app/
├── components/     # StatInput, PlayerList
├── models/         # PlayerStat
├── screens/        # HomeScreen, PlayerListScreen, CreatePlayerScreen
├── services/       # DatabaseService, ExcelService
└── types.ts        # Types de navigation (RootStackParamList)
```

## Scripts disponibles

| Commande           | Description           |
|--------------------|----------------------|
| `npm start`        | Démarre Metro        |
| `npm run android`  | Lance l’app Android  |
| `npm run ios`      | Lance l’app iOS      |
| `npm run lint`     | ESLint               |
| `npm test`         | Tests Jest           |

## Dépannage

- Environnement / build : [Troubleshooting React Native](https://reactnative.dev/docs/troubleshooting).
- Recharger l’app : **Android** — touche <kbd>R</kbd> deux fois ou menu dev (<kbd>Ctrl</kbd>+<kbd>M</kbd>) ; **iOS** — <kbd>Cmd ⌘</kbd>+<kbd>R</kbd>.

## Licence

Projet personnel.
