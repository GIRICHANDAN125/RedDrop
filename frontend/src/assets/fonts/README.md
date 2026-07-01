# Fonts Setup

Download these free fonts and place them in this folder (`frontend/src/assets/fonts/`):

## Required Fonts

### Sora (Headings)
Download from: https://fonts.google.com/specimen/Sora
Files needed:
- Sora-Bold.ttf
- Sora-SemiBold.ttf
- Sora-Regular.ttf

### DM Sans (Body)
Download from: https://fonts.google.com/specimen/DM+Sans
Files needed:
- DMSans-Regular.ttf
- DMSans-Medium.ttf

### Space Mono (Monospace)
Download from: https://fonts.google.com/specimen/Space+Mono
Files needed:
- SpaceMono-Regular.ttf

## Quick Download Script

```bash
# From the frontend directory:
mkdir -p src/assets/fonts
cd src/assets/fonts

# Download via npx (easiest method):
# 1. Go to https://fonts.google.com
# 2. Search each font above
# 3. Click "Download family"
# 4. Extract and copy the .ttf files here
```

## Placeholder (for testing without fonts)

If you want to test the app without setting up fonts first, replace the font loading in App.js:

```js
// Comment out the font loading:
// const [fontsLoaded] = useFonts({...});
// if (!fontsLoaded) return null;

// And in theme.js, change all fontFamily references to:
// fontFamily: 'System'  (uses device default font)
```
