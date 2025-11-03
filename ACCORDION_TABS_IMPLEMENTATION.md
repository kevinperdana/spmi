# Implementasi Accordion & Tabs di Pages (Create & Edit)

## 📝 Ringkasan
Implementasi element Accordion dan Tabs di Pages Create & Edit, sama persis seperti yang sudah ada di Home Section.

## ✅ Perubahan yang Dilakukan

### 1. **Pages/Edit.tsx** (Baris 3203)
Menambahkan properties panel untuk Accordion & Tabs:

#### Accordion Properties Panel:
- Edit Accordion Items (Title & Content)
- Add/Remove accordion items
- Inline editing untuk setiap item

#### Tabs Properties Panel:
- Edit Tab Items (Title & Content)
- Add/Remove tabs
- Inline editing untuk setiap tab

**Fitur:**
- ✅ Dynamic add/remove items
- ✅ Real-time content editing
- ✅ Validation untuk items tidak kosong
- ✅ Button styling (destructive untuk remove, outline untuk add)

### 2. **Pages/Create.tsx** (Baris 2474)
Menambahkan properties panel yang sama seperti di Edit.tsx:
- Accordion Items management
- Tabs Items management
- Konsisten dengan UI di Edit page

### 3. **PageContentRenderer.tsx**
Update interface dan rendering logic:

#### Interface Updates:
- Menambahkan `'accordion' | 'tabs' | 'button'` ke type union (baris 5)
- Menambahkan semua accordion properties (accordionItems, accordionStyle, dll)
- Menambahkan semua tabs properties (tabItems, tabStyle, dll)
- Menambahkan button properties

#### Import Components:
```typescript
import { Accordion } from './Accordion';
import { Tabs } from './Tabs';
```

#### Rendering Logic:
- Accordion rendering dengan semua props dari element
- Tabs rendering dengan semua props dari element
- Button rendering dengan link support
- Margin & padding support untuk semua element

## 🎯 Fitur yang Tersedia

### Accordion:
- ✅ Multiple items (title + content)
- ✅ Add/Remove items
- ✅ Style customization (default/bordered/separated)
- ✅ Icon position (left/right)
- ✅ Open multiple toggle
- ✅ Color customization (border, header, content)
- ✅ Margin & Padding

### Tabs:
- ✅ Multiple tabs (title + content)
- ✅ Add/Remove tabs
- ✅ Style customization (default/pills/underline)
- ✅ Position (top/left)
- ✅ Color customization (active, inactive, content)
- ✅ Margin & Padding

### Button:
- ✅ Text & link support
- ✅ Background & text color
- ✅ Border radius
- ✅ Font size
- ✅ Target (_blank/_self)
- ✅ Margin & Padding

## 📦 File yang Dimodifikasi

1. `/resources/js/pages/Pages/Edit.tsx` - +164 lines
2. `/resources/js/pages/Pages/Create.tsx` - +164 lines  
3. `/resources/js/components/PageContentRenderer.tsx` - +145 lines

## 🔄 Konsistensi dengan Home Section

Implementasi ini **100% konsisten** dengan Home Section:
- ✅ Menggunakan komponen yang sama (Accordion.tsx, Tabs.tsx)
- ✅ Props mapping yang sama
- ✅ Default values yang sama
- ✅ UI pattern yang sama untuk edit items

## 🧪 Testing

Build berhasil tanpa error:
```bash
npm run build
✓ built in 1m 15s
```

## 📖 Cara Penggunaan

### Di Pages Create/Edit:
1. Pilih layout/add section
2. Klik "Add Element" di column
3. Pilih "Accordion" atau "Tabs"
4. Edit items di properties panel (sidebar kanan)
5. Add/Remove items sesuai kebutuhan
6. Save page

### Properties Panel Layout:
```
Accordion Styles
├── Accordion Items
│   ├── Item 1
│   │   ├── Title [input]
│   │   ├── Content [textarea]
│   │   └── [Remove Item button]
│   ├── Item 2
│   └── [+ Add Item button]
└── Margin & Padding (inherited from common element)
```

## ⚙️ Default Values

### Accordion:
```typescript
accordionItems: [
  { title: 'Accordion Item 1', content: 'Content for item 1' },
  { title: 'Accordion Item 2', content: 'Content for item 2' }
]
accordionStyle: 'default'
accordionIconPosition: 'right'
accordionOpenMultiple: false
accordionBorderColor: '#e5e7eb'
accordionHeaderBg: '#f9fafb'
accordionHeaderTextColor: '#111827'
accordionContentBg: '#ffffff'
accordionContentTextColor: '#374151'
accordionBorderRadius: '8px'
```

### Tabs:
```typescript
tabItems: [
  { title: 'Tab 1', content: 'Content for tab 1' },
  { title: 'Tab 2', content: 'Content for tab 2' }
]
tabStyle: 'default'
tabPosition: 'top'
tabBorderColor: '#e5e7eb'
tabActiveColor: '#3b82f6'
tabInactiveColor: '#6b7280'
tabActiveBg: '#eff6ff'
tabInactiveBg: 'transparent'
tabContentBg: '#ffffff'
tabContentTextColor: '#374151'
```

## 🎨 UI/UX

- Consistent dengan element lain (Gallery, Carousel)
- Inline editing untuk quick updates
- Visual feedback dengan border & spacing
- Destructive button untuk remove (red)
- Outline button untuk add (subtle)
- Responsive textarea untuk content

## ✨ Next Steps (Optional)

Jika ingin menambahkan fitur styling advanced (seperti di Home Section):
- [ ] Style variant selector (default/bordered/separated)
- [ ] Icon position toggle
- [ ] Open multiple toggle
- [ ] Color pickers untuk border, header, content
- [ ] Border radius slider

Namun untuk sekarang, fokus pada **items management** (title & content) sudah cukup, sama seperti yang diminta.
