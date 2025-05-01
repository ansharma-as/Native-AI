## 🚀 Expo Project Setup with Tailwind CSS & NativeWind

Follow these steps to set up an Expo project with Tailwind CSS and NativeWind for styling.

### Step 1: Create a new Expo project
```bash
npx create-expo-app@latest
```

### Step 2: Reset the project
```bash
npm run reset-project
```

### Step 3: Install dependencies
```bash
npm install nativewind tailwindcss react-native-reanimated react-native-safe-area-context
```

### Step 4: Initialize Tailwind CSS
```bash
npx tailwindcss init
```

### Step 5: Update `tailwind.config.js`
Replace content with the following:
```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### Step 6: Create `globals.css` in the `app/` folder
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Step 7: Create `babel.config.js` in the root directory
```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
  };
};
```

### Step 8: Customize `metro.config.js`
Run the following:
```bash
npx expo customize metro.config.js
```
Then replace the content with:
```js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: "./app/globals.css" });
```

### Step 9: Import `globals.css` in `app/_layout.tsx`
At the top of the file, add:
```ts
import "../app/globals.css";
```

### Step 10: Create `nativewind-env.d.ts` in the root directory
```ts
/// <reference types="nativewind/types" />
```
> This helps TypeScript recognize Tailwind CSS class names.

### Step 11: Double-check `metro.config.js` input path
Ensure the input path points correctly to your CSS file:
```js
input: "./app/globals.css"
```

### Step 12: Restart terminal and run the project
```bash
npx expo start --clear
```