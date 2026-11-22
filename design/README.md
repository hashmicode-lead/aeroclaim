# Design files

`figma-tokens.json` holds every AeroClaim design token: 21 colours, 9 text styles, spacing, radii, shadows and sizes. It's in the Tokens Studio format, so it can be loaded straight into Figma.

## Load into Figma

1. In Figma, open **Plugins → Tokens Studio for Figma**.
2. Go to **Settings → Add new sync provider → URL**, or use **Tools → Load from file** and pick `figma-tokens.json`.
3. Under the `aeroclaim` set, click **Create Styles** to generate colour and text styles, then **Export to Figma → Variables** for spacing, radius and size.

Text styles use SF Pro / SF Mono. On Windows, install those fonts from developer.apple.com/fonts, or swap them for Inter and JetBrains Mono in the plugin.

## Screens

The current build's screens are in `docs/screenshots/`. Drop them into a Figma page as references, then rebuild frames on top using the generated styles. Frame widths: 1280 for desktop and 390 for mobile. Content columns are 768px for forms and claim pages and 1024px for dashboards.

## Source of truth

The tokens mirror `src/app/globals.css`. If you change a value in Figma, change it in `globals.css` too, then regenerate this file.
