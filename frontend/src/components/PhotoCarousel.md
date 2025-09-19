# PhotoCarousel Component

A React component that displays a carousel of photos with navigation controls and indicators.

## Features

- **Multiple Photo Support**: Displays multiple photos in a carousel format
- **Navigation Controls**: Left/right arrows for photo navigation
- **Keyboard Navigation**: Arrow keys, Home, and End key support
- **Photo Indicators**: Dots showing current photo position
- **Photo Counter**: Shows current photo number (e.g., "2 / 5")
- **Responsive Design**: Works on desktop and mobile devices
- **Fallback Support**: Shows placeholder when no photos are available
- **Error Handling**: Automatically handles broken image URLs
- **Accessibility**: Full keyboard support and ARIA labels

## Usage

```jsx
import PhotoCarousel from './PhotoCarousel';

// Basic usage
<PhotoCarousel 
    photos={['photo1.jpg', 'photo2.jpg', 'photo3.jpg']}
    altText="Place photos"
    className="my-carousel"
/>

// With empty photos array (shows placeholder)
<PhotoCarousel 
    photos={[]}
    altText="No photos available"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `photos` | Array | `[]` | Array of photo URLs to display |
| `altText` | String | `"Place photo"` | Alt text for accessibility |
| `className` | String | `""` | Additional CSS class for styling |

## CSS Classes

- `.photo-carousel` - Main container
- `.carousel-container` - Photo container
- `.carousel-image` - Individual photo
- `.carousel-arrow` - Navigation arrows
- `.carousel-indicators` - Photo indicators container
- `.photo-counter` - Photo counter display

## Behavior

- **Single Photo**: No navigation controls or indicators shown
- **Multiple Photos**: Full carousel functionality enabled
- **No Photos**: Displays grey placeholder with "No Image Available" text
- **Mobile**: Touch-friendly controls with always-visible arrows
- **Desktop**: Arrows appear on hover or when focused
- **Keyboard Navigation**: 
  - `←` / `→` Arrow keys: Navigate between photos
  - `Home`: Go to first photo
  - `End`: Go to last photo
  - `Tab`: Focus navigation controls

## Integration

This component is currently used in:
- Dashboard activity cards (`frontend/src/components/Dashboard.js`)
- Can be used in any component requiring photo carousel functionality

## Styling

The component includes responsive CSS that adapts to different screen sizes and provides smooth transitions for a professional user experience.