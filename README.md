# SDH Portfolio

A minimal, spatial portfolio website for showcasing artwork. Features a 2D scrollable canvas with parallax effects and smooth zoom transitions.

## Features

- **2D Canvas Navigation**: Scroll horizontally and vertically to explore artwork
- **Drag to Explore**: Click and drag to pan around the canvas
- **Parallax Effect**: Subtle depth effect on mouse movement
- **Zoom Lightbox**: Click any artwork to smoothly zoom in with details
- **Dynamic Filtering**: Filter by medium (automatically generated from your data)
- **Keyboard Navigation**: Use arrow keys in lightbox, ESC to close
- **Mobile Responsive**: Simplified touch-friendly experience on mobile

## Quick Start

### Local Development

1. **Start a local server** (required because we load JSON):

   Using Python:
   ```bash
   python3 -m http.server 8000
   ```
   
   Using Node.js (if you have `npx`):
   ```bash
   npx serve
   ```

2. **Open in browser**: http://localhost:8000

### Deploy to Netlify (Recommended)

1. Go to [netlify.com](https://netlify.com) and sign up/login
2. Drag and drop your project folder onto the Netlify dashboard
3. Done! You'll get a URL like `https://your-site-name.netlify.app`

To update: just drag and drop again, or connect to a Git repo for automatic deploys.

## Managing Artworks

### Adding New Artwork

1. **Add your image** to the `/images` folder

2. **Edit `artworks.json`** and add a new entry:

```json
{
  "id": 41,
  "title": "Your Artwork Title",
  "year": 2024,
  "medium": "oil",
  "image": "images/your-image.jpg"
}
```

### Data Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | number | Unique identifier (increment from last) |
| `title` | string | Artwork title |
| `year` | number | Year created |
| `medium` | string | Medium type (creates filter buttons automatically) |
| `image` | string | Path to image file |

### Filter Categories

Filters are generated automatically from the `medium` values in your JSON. Common examples:
- `oil`
- `charcoal`
- `sketches`
- `watercolor`
- `mixed media`

Just use consistent naming and filters will appear automatically.

### Image Guidelines

- **Format**: JPG, PNG, or WebP recommended
- **Size**: ~1200-2000px on longest side for good quality
- **Aspect Ratio**: Any ratio works - images are contained within uniform grid cells
- **File Size**: Optimize images for web (under 500KB each ideally)

## Customization

### Colors

Edit the CSS custom properties in `style.css`:

```css
:root {
  --color-bg: #fafafa;        /* Background */
  --color-text: #1a1a1a;       /* Main text */
  --color-text-muted: #666;    /* Secondary text */
  --color-border: #e0e0e0;     /* Borders */
}
```

### Grid Size

```css
:root {
  --grid-cell-size: 280px;     /* Size of each grid cell */
  --grid-gap: 20px;            /* Gap between cells */
  --grid-columns: 8;           /* Columns in the grid */
  --grid-rows: 5;              /* Rows in the grid */
}
```

### Artist Name

Edit the header in `index.html`:

```html
<h1 class="header__title">SDH</h1>
```

## File Structure

```
/portfolio
├── index.html          # Main HTML file
├── style.css           # All styles
├── app.js              # Interactions and logic
├── artworks.json       # Your artwork data (edit this!)
├── images/             # Your artwork images
│   ├── artwork-1.jpg
│   ├── artwork-2.jpg
│   └── ...
└── README.md           # This file
```

## Browser Support

- Chrome, Edge, Firefox, Safari (latest versions)
- Mobile browsers (iOS Safari, Chrome for Android)

## Credits

- Built with vanilla HTML, CSS, and JavaScript
- Animations powered by [GSAP](https://greensock.com/gsap/)
- Typography: [Inter](https://fonts.google.com/specimen/Inter)
