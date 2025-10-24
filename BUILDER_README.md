# Landing Page Builder - Documentation

Landing Page Builder dinamis seperti Elementor yang memungkinkan user membuat landing page dengan drag & drop interface.

## 🎯 Fitur Utama

### 1. **Visual Builder Interface**
- Drag & drop sections, columns, dan components
- Real-time preview
- Undo/Redo functionality
- Responsive grid system (12 columns)

### 2. **Components yang Tersedia**
- **Text**: Paragraf teks dengan rich editing
- **Heading**: H1-H6 dengan berbagai styling
- **Image**: Upload atau URL gambar
- **Button**: Call-to-action buttons dengan link
- **Video**: Embed YouTube, Vimeo, atau custom video
- **Form**: Contact forms dengan berbagai field types
- **Spacer**: Spacing control

### 3. **Properties Panel**
Setiap component dapat di-customize:
- Content editing (text, links, images, etc)
- Styling (padding, margin, colors, fonts)
- Layout options
- Alignment controls

### 4. **Section Management**
- Tambah/hapus sections
- Duplicate sections
- Reorder sections (move up/down)
- Custom styling per section

### 5. **Column System**
- Multi-column layouts (grid 12)
- Adjustable column widths
- Add/remove columns per section
- Custom styling per column

## 📁 Struktur File

```
resources/js/
├── types/
│   └── builder.d.ts                    # TypeScript types & interfaces
├── contexts/
│   └── builder-context.tsx             # State management context
├── components/
│   └── builder/
│       ├── component-renderer.tsx      # Render individual components
│       ├── section-renderer.tsx        # Render sections & columns
│       ├── component-palette.tsx       # Component selection panel
│       ├── properties-panel.tsx        # Properties editor
│       └── page-builder.tsx            # Main builder interface
└── pages/
    └── Builder/
        ├── Index.tsx                   # Landing pages list
        ├── Editor.tsx                  # Builder editor page
        └── Preview.tsx                 # Preview page

app/
├── Models/
│   └── LandingPage.php                 # Landing page model
├── Http/
│   └── Controllers/
│       └── LandingPageController.php   # CRUD controller
└── Policies/
    └── LandingPagePolicy.php           # Authorization policy

database/
└── migrations/
    └── *_create_landing_pages_table.php
```

## 🚀 Cara Menggunakan

### 1. Akses Builder
```
GET /landing-pages              # List semua landing pages
GET /landing-pages/create       # Buat landing page baru
GET /landing-pages/{id}/edit    # Edit landing page
```

### 2. Membuat Landing Page Baru

1. Klik **"New Landing Page"** di halaman index
2. Masukkan judul page
3. Klik **"Add Section"** untuk menambah section pertama
4. Klik pada column untuk menambahkan component
5. Pilih component dari palette (kiri)
6. Edit content & styling di properties panel (kanan)
7. Klik **"Save"** untuk menyimpan

### 3. Edit Component

1. Klik component yang ingin di-edit
2. Properties panel akan muncul di kanan
3. Edit content sesuai kebutuhan
4. Styling otomatis ter-apply

### 4. Section Operations

Hover pada section untuk melihat control buttons:
- ⬆️ **Move Up**: Pindahkan section ke atas
- ⬇️ **Move Down**: Pindahkan section ke bawah
- 📋 **Duplicate**: Duplikasi section
- ➕ **Add Column**: Tambah column
- 🗑️ **Delete**: Hapus section

### 5. Column Operations

Hover pada column untuk melihat control:
- 🗑️ **Delete**: Hapus column

### 6. Component Operations (di Properties Panel)

- **Copy**: Duplikasi component
- **Delete**: Hapus component

### 7. Preview & Publish

- Klik **"Preview"** untuk melihat hasil (new tab)
- Toggle **"Published"** untuk publish/unpublish
- Public URL: `/p/{slug}`

## 🔧 API Endpoints

### RESTful Routes

```php
// List pages
GET /landing-pages

// Create page form
GET /landing-pages/create

// Store new page
POST /landing-pages
{
  "title": "My Page",
  "slug": "my-page",
  "sections": [...],
  "global_styles": {...},
  "published": false
}

// Show public page
GET /p/{slug}

// Edit page form
GET /landing-pages/{id}/edit

// Update page
PUT /landing-pages/{id}

// Delete page
DELETE /landing-pages/{id}

// Preview page (authenticated)
GET /landing-pages/{id}/preview
```

## 📦 Data Structure

### LandingPage
```typescript
{
  id: number,
  title: string,
  slug: string,
  sections: Section[],
  globalStyles: {
    fontFamily?: string,
    primaryColor?: string,
    secondaryColor?: string
  },
  published: boolean,
  created_at: string,
  updated_at: string
}
```

### Section
```typescript
{
  id: string,
  columns: Column[],
  style: ComponentStyle
}
```

### Column
```typescript
{
  id: string,
  width: number,        // 1-12 (grid system)
  components: Component[],
  style: ComponentStyle
}
```

### Component Types
```typescript
// Text Component
{
  id: string,
  type: 'text',
  content: string,
  style: ComponentStyle
}

// Heading Component
{
  id: string,
  type: 'heading',
  content: string,
  level: 1 | 2 | 3 | 4 | 5 | 6,
  style: ComponentStyle
}

// Image Component
{
  id: string,
  type: 'image',
  content: {
    src: string,
    alt: string
  },
  style: ComponentStyle
}

// Button Component
{
  id: string,
  type: 'button',
  content: {
    text: string,
    link: string,
    target: '_blank' | '_self'
  },
  style: ComponentStyle
}

// Video Component
{
  id: string,
  type: 'video',
  content: {
    url: string,
    provider: 'youtube' | 'vimeo' | 'custom'
  },
  style: ComponentStyle
}

// Form Component
{
  id: string,
  type: 'form',
  content: {
    fields: FormField[],
    submitText: string,
    action?: string
  },
  style: ComponentStyle
}
```

## 🎨 Customization

### Menambah Component Baru

1. **Update Types** (`resources/js/types/builder.d.ts`):
```typescript
export interface YourComponent extends BaseComponent {
  type: 'your-type';
  content: {
    // your content structure
  };
}

// Add to Component union
export type Component = ... | YourComponent;
```

2. **Update Renderer** (`component-renderer.tsx`):
```typescript
case 'your-type':
  return (
    <div>
      {/* Your component rendering logic */}
    </div>
  );
```

3. **Update Palette** (`component-palette.tsx`):
```typescript
{
  type: 'your-type',
  label: 'Your Component',
  icon: YourIcon,
  template: {
    type: 'your-type',
    content: { /* default content */ },
    style: {},
  },
}
```

4. **Update Properties Panel** (`properties-panel.tsx`):
```typescript
case 'your-type':
  return (
    <div>
      {/* Your property editors */}
    </div>
  );
```

## 🔐 Authorization

Authorization menggunakan Laravel Policy:
- Users hanya bisa melihat/edit/delete landing pages milik mereka sendiri
- Public pages dapat diakses tanpa authentication (jika published)

## 📝 Database Schema

```sql
CREATE TABLE landing_pages (
  id BIGINT PRIMARY KEY,
  user_id BIGINT,
  title VARCHAR(255),
  slug VARCHAR(255) UNIQUE,
  sections JSON,
  global_styles JSON,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## 🛠️ Development

### State Management
Builder menggunakan React Context API untuk state management dengan fitur:
- Centralized state
- Undo/Redo history
- Element selection
- CRUD operations untuk sections/columns/components

### Styling
- Tailwind CSS untuk styling
- Inline styles untuk custom component styling
- Responsive grid system (12 columns)

## 🚧 Future Enhancements

Fitur yang bisa ditambahkan:
- [ ] Drag & drop reordering components
- [ ] Template library
- [ ] Animation options
- [ ] Mobile responsive preview
- [ ] A/B testing
- [ ] Analytics integration
- [ ] Export to HTML/CSS
- [ ] Theme presets
- [ ] Custom CSS injection
- [ ] Image upload & media library
- [ ] Form submission handling
- [ ] SEO meta tags editor
- [ ] Version history
- [ ] Collaboration features

## 📚 Tips & Best Practices

1. **Gunakan Sections untuk Layout Besar**: Pisahkan landing page menjadi sections (hero, features, testimonials, etc)

2. **Column Width**: Total width columns dalam 1 section sebaiknya = 12 untuk layout yang rapi

3. **Styling Hierarchy**: 
   - Global styles → Section styles → Column styles → Component styles
   - Lebih spesifik akan override yang lebih general

4. **Performance**: Hindari terlalu banyak sections dalam 1 page (< 20 sections recommended)

5. **Testing**: Selalu preview sebelum publish untuk memastikan tampilan sesuai

6. **Slug**: Gunakan slug yang SEO-friendly (lowercase, hyphen-separated)

## 🤝 Contributing

Untuk menambah fitur atau fix bugs, ikuti struktur yang sudah ada dan pastikan:
- Types definition up-to-date
- Component rendering berfungsi dengan baik
- Properties panel dapat edit semua properties
- State management bekerja dengan benar

---

Happy Building! 🎉
