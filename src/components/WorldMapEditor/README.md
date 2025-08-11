# World Map Editor

A live coordinate editor for positioning world map viewports and locations.

## Access

- **Normal site**: `yoursite.netlify.app`
- **Map editor**: `yoursite.netlify.app?editor=true`

## How to Use

1. **Access the Editor**
   - Navigate to your site with `?editor=true` parameter
   - Enter access code: `map2024`

2. **Position the Viewport**
   - Click "Enable Edit Mode" to start positioning
   - Drag the map to position the viewport
   - Use the crosshair to see the center point

3. **Add Locations**
   - Position the viewport where you want a location
   - Click "Add Current Position" to save the location
   - Repeat for all desired locations

4. **Export Coordinates**
   - Click "Export Locations" to copy coordinate data
   - Paste the exported code into `mapLocations.js`

## Features

- **Live coordinate display**: See X/Y percentages and pixel positions
- **Drag-to-pan**: Smooth map positioning with framer-motion
- **Location markers**: Visual indicators for saved positions
- **Export functionality**: Copy coordinates to clipboard
- **Access control**: Password protection for live sites
- **Responsive design**: Works on desktop and mobile

## File Structure

```
src/components/WorldMapEditor/
├── index.jsx              # Main editor component
├── WorldMapViewport.jsx   # Map display component
├── mapLocations.js        # Coordinate storage
└── README.md             # This file
```

## Customization

### Replace the Map SVG
Update the `worldMapSVG` variable in `WorldMapViewport.jsx` with your actual map:

```jsx
const worldMapSVG = `
  <svg viewBox="0 0 1000 500" xmlns="http://www.w3.org/2000/svg">
    <!-- Your custom map SVG here -->
  </svg>
`;
```

### Change Access Code
Update the access code in `index.jsx`:

```jsx
if (accessCode === 'your-new-code') {
  setShowAccessPrompt(false);
}
```

## Security Notes

- The editor is only accessible via URL parameter
- Access code protection prevents unauthorized use
- Normal site functionality is unaffected
- Consider using environment variables for production

## Troubleshooting

- **Editor not loading**: Check URL parameter `?editor=true`
- **Access denied**: Verify access code is correct
- **Map not displaying**: Check SVG path in WorldMapViewport
- **Export not working**: Ensure clipboard permissions are granted 