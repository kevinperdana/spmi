# Page Builder Concept - Preview Layout

## Overview
Menambahkan visual page builder seperti landing page builder, tapi untuk Pages. User bisa drag & drop elemen untuk membuat konten page.

## UI Structure

```
┌─────────────────────────────────────────────────────────────────┐
│ Pages / Create New Page                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┬───────────────────────────┬─────────────────┐ │
│  │             │                           │                 │ │
│  │  ELEMENTS   │       CANVAS              │   PROPERTIES    │ │
│  │  PALETTE    │                           │                 │ │
│  │             │                           │                 │ │
│  │  📝 Heading │   ┌─────────────────┐    │  Selected:      │ │
│  │  📄 Text    │   │   Your content  │    │  - Heading      │ │
│  │  🖼️  Image   │   │   here          │    │                 │ │
│  │  🔗 Link    │   └─────────────────┘    │  Tag: H1        │ │
│  │  🃏 Card    │                           │  Text: ...      │ │
│  │  📋 Row     │   Add elements by         │  Color: ...     │ │
│  │  📊 Column  │   dragging from left      │  Size: ...      │ │
│  │  📹 Video   │                           │                 │ │
│  │  📝 Form    │                           │                 │ │
│  │  ➖ Spacer  │                           │                 │ │
│  │             │                           │                 │ │
│  └─────────────┴───────────────────────────┴─────────────────┘ │
│                                                                   │
│  [Save Draft]  [Publish]  [Preview]                              │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Available Elements

### 1. **Heading**
- H1, H2, H3, H4, H5, H6
- Editable text
- Font size, color, alignment
- Properties: text, tag, color, alignment, margin, padding

### 2. **Text / Paragraph**
- Rich text editor (bold, italic, underline)
- Font size, color
- Properties: content, fontSize, color, alignment, lineHeight

### 3. **Image**
- Upload image / URL
- Alt text
- Width, height, alignment
- Border radius, shadow
- Properties: src, alt, width, height, objectFit, borderRadius

### 4. **Link / Button**
- Text & URL
- Style: button / text link
- Target: _self / _blank
- Properties: text, href, variant (primary/secondary/outline), size

### 5. **Card**
- Container with border & shadow
- Can contain other elements inside
- Properties: padding, background, border, shadow, borderRadius

### 6. **Row**
- Horizontal layout container
- Contains columns
- Properties: gap, alignment, padding

### 7. **Column**
- Vertical section inside row
- Width (1-12 grid system)
- Properties: width, padding, background

### 8. **Video**
- YouTube / Vimeo embed
- Or video file URL
- Properties: src, aspectRatio, autoplay, controls

### 9. **Form**
- Contact form builder
- Fields: text, email, textarea, checkbox
- Properties: action, method, fields[]

### 10. **Spacer**
- Empty space / divider
- Height customizable
- Properties: height, background

## JSON Structure Example

```json
{
  "title": "About Us",
  "slug": "about-us",
  "content": {
    "blocks": [
      {
        "id": "block-1",
        "type": "heading",
        "data": {
          "text": "Welcome to Our Company",
          "level": "h1",
          "color": "#1e40af",
          "alignment": "center"
        }
      },
      {
        "id": "block-2",
        "type": "text",
        "data": {
          "content": "We are a leading company in...",
          "fontSize": "16px",
          "lineHeight": "1.6"
        }
      },
      {
        "id": "block-3",
        "type": "row",
        "data": {
          "columns": [
            {
              "id": "col-1",
              "width": 6,
              "blocks": [
                {
                  "id": "block-4",
                  "type": "image",
                  "data": {
                    "src": "/images/team.jpg",
                    "alt": "Our Team"
                  }
                }
              ]
            },
            {
              "id": "col-2",
              "width": 6,
              "blocks": [
                {
                  "id": "block-5",
                  "type": "card",
                  "data": {
                    "padding": "20px",
                    "blocks": [
                      {
                        "id": "block-6",
                        "type": "heading",
                        "data": {
                          "text": "Our Mission",
                          "level": "h3"
                        }
                      },
                      {
                        "id": "block-7",
                        "type": "text",
                        "data": {
                          "content": "To provide excellent service..."
                        }
                      }
                    ]
                  }
                }
              ]
            }
          ]
        }
      },
      {
        "id": "block-8",
        "type": "link",
        "data": {
          "text": "Contact Us",
          "href": "/contact",
          "variant": "primary"
        }
      }
    ]
  },
  "is_published": true
}
```

## Implementation Plan (Preview)

### Phase 1: Basic Elements
1. Heading
2. Text/Paragraph
3. Image
4. Spacer

### Phase 2: Interactive Elements
5. Link/Button
6. Video

### Phase 3: Layout Components
7. Row
8. Column
9. Card

### Phase 4: Advanced
10. Form builder

## UI Flow

1. User clicks "Create Page"
2. Opens page builder interface
3. Left sidebar: Element palette (draggable)
4. Center: Canvas (droppable area)
5. Right sidebar: Properties panel (edit selected element)
6. Bottom: Action buttons (Save, Publish, Preview)

## Technologies

- **Frontend**: React + Inertia.js
- **Drag & Drop**: react-beautiful-dnd or @dnd-kit
- **Rich Text**: TipTap or Quill
- **Image Upload**: Laravel Media Library
- **Storage**: JSON in database (content column)

## Benefits

✅ Visual editing - WYSIWYG
✅ Flexible layout - rows & columns
✅ Reusable components
✅ No code needed
✅ Mobile responsive
✅ Version control ready

## Next Steps

1. **Review this concept** - Apakah struktur ini sesuai?
2. **Choose drag-drop library** - @dnd-kit recommended
3. **Design component library** - Reusable React components
4. **Implement builder UI** - Step by step
5. **Add renderer** - Display saved content

---

**Note**: Ini adalah preview/mockup. Belum ada perubahan database atau code.
Database structure current (`content` TEXT) sudah cukup untuk menyimpan JSON ini.
