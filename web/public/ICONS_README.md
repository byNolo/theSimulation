# Generating Icons and OG Image

## Quick Steps

1. Open `web/public/generate-icons.html` in a browser
2. Right-click each canvas image and "Save As":
   - `favicon16.png` → save as `favicon-16x16.png`
   - `favicon32.png` → save as `favicon-32x32.png`
   - `apple180.png` → save as `apple-touch-icon.png`
   - `ogimage.png` → save as `og-image.png`
3. Save all PNGs to `web/public/` directory
4. Rebuild the frontend: `cd web && npm run build`

## Already Included

- ✅ `favicon.svg` - SVG version (modern browsers)
- ✅ Social meta tags in `index.html`
- ✅ Open Graph tags for Discord/social previews

## What Each File Does

- **favicon.svg** - Main favicon (SVG, scalable)
- **favicon-16x16.png** - Small browser tab icon
- **favicon-32x32.png** - Standard browser icon
- **apple-touch-icon.png** - iOS home screen icon
- **og-image.png** - Social media preview (1200x630px)

## Notes

The SVG favicon works immediately. PNGs are optional but provide better compatibility with older browsers and specific platforms (Discord, iOS, etc.).
