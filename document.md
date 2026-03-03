# TODO App Documentation

## Project Overview

This is a **TODO Application** built using [Expo](https://expo.dev) and React Native. The app allows users to manage their tasks efficiently with a cross-platform mobile experience.

---

## Project Structure

### Root Files

| File              | Description                                                       |
| ----------------- | ----------------------------------------------------------------- |
| `package.json`    | Contains project dependencies, scripts, and metadata              |
| `app.json`        | Expo configuration file (app name, version, icons, splash screen) |
| `tsconfig.json`   | TypeScript configuration settings                                 |
| `babel.config.js` | Babel transpiler configuration for React Native                   |
| `README.md`       | Basic project setup instructions and getting started guide        |
| `document.md`     | This documentation file                                           |

---

### `/app` Directory

This directory contains all the screens and routes using **file-based routing**.

| File/Folder   | Description                                  |
| ------------- | -------------------------------------------- |
| `_layout.tsx` | Root layout component that wraps all screens |
| `index.tsx`   | Main entry point / Home screen of the app    |
| `(tabs)/`     | Tab-based navigation screens (if applicable) |

---

### `/components` Directory

Reusable UI components used throughout the app.

| File              | Description                         |
| ----------------- | ----------------------------------- |
| `TodoItem.tsx`    | Individual todo item component      |
| `TodoList.tsx`    | List container for displaying todos |
| `AddTodoForm.tsx` | Form component for adding new todos |

---

### `/assets` Directory

Static assets like images, fonts, and icons.

| Folder    | Description           |
| --------- | --------------------- |
| `images/` | App images and icons  |
| `fonts/`  | Custom fonts (if any) |

---

### `/constants` Directory

| File        | Description                           |
| ----------- | ------------------------------------- |
| `Colors.ts` | Color palette definitions for theming |

---

### `/hooks` Directory

Custom React hooks for reusable logic.

| File          | Description                                 |
| ------------- | ------------------------------------------- |
| `useTodos.ts` | Hook for managing todo state and operations |

---

## Getting Started

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start the development server:**

   ```bash
   npx expo start
   ```

3. **Run on your device:**
   - Scan the QR code with Expo Go app
   - Press `a` for Android emulator
   - Press `i` for iOS simulator

---

## Tech Stack

- **Framework:** Expo / React Native
- **Language:** TypeScript
- **Routing:** Expo Router (file-based)
- **State Management:** React Hooks

---

## Features

- ✅ Add new todos
- ✅ Mark todos as complete
- ✅ Delete todos
- ✅ Cross-platform (iOS, Android, Web)

---

_Last updated: March 3, 2026_
