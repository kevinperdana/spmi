# Button Element Implementation Guide

## ✅ COMPLETED - Summary
Implementasi element **Button** telah ditambahkan ke Home Sections Builder dengan fitur lengkap:
- Button text customizable
- Link URL (optional)
- Background color dengan color picker
- Text color dengan color picker
- Border radius (0-999px)
- Font size (XS - 2XL)
- Alignment (left, center, right)
- Margin & Padding (sudah ada di semua element)
- Link target (_self / _blank)

## Files Modified

### ✅ 1. DynamicHomeSection.tsx (Frontend Display)
- Updated interface `ColumnElement` - menambahkan 'button' ke type union
- Menambahkan button properties ke interface
- Menambahkan case 'button' di renderElement() untuk menampilkan button di frontend
- Button support link wrapping (optional)
- Hover effect dengan opacity transition

### ✅ 2. Edit.tsx (Edit Page Builder)
- Updated interface `ColumnElement` 
- Updated import - menambahkan `MousePointer2` icon dari lucide-react
- Updated `addElementToColumn()` - menambahkan parameter 'button' dengan default values
- Menambahkan label dan icon untuk button (violet background)
- Menambahkan button rendering dengan:
  - Button Text input field
  - Link URL input field  
  - Real-time button preview dengan styling
- Menambahkan button ke "Add Element Buttons" section
- Updated condition untuk Settings button (include button type)

### ✅ 3. Create.tsx (Create Page Builder)
- Updated interface `ColumnElement`
- Updated import - menambahkan `MousePointer2` icon
- Updated `addElementToColumn()` - menambahkan parameter 'button' dengan default values
- Menambahkan label dan icon untuk button (violet background)
- Menambahkan button rendering (sama seperti Edit.tsx)
- Menambahkan button ke "Add Element Buttons" section

### ✅ 4. StylePanel.tsx (Styling Controls)
- Menambahkan section "Button Styling" dengan controls:
  - ✅ Button Text input
  - ✅ Background Color picker (color + hex input)
  - ✅ Text Color picker (color + hex input)
  - ✅ Border Radius slider (0-999px)
  - ✅ Font Size dropdown (XS - 2XL)
  - ✅ Alignment buttons (left, center, right)
  - ✅ Link URL input (optional)
  - ✅ Link Target selector (Same Tab / New Tab)
  - ✅ Margin controls (Top, Right, Bottom, Left)
  - ✅ Padding controls (Top, Right, Bottom, Left)

## Cara Menggunakan

### Di Builder (Edit/Create):

1. **Tambah Button Element:**
   - Pilih column yang ingin ditambahkan button
   - Klik tombol **"Button"** (warna violet dengan icon MousePointer2)
   - Button akan ditambahkan dengan default text "Click Me"

2. **Edit Content:**
   - **Button Text:** Ketik langsung di input field
   - **Link URL:** Isi jika button harus link ke halaman lain (optional)
   - Lihat preview real-time dengan styling yang diterapkan

3. **Styling (klik icon Settings ⚙️):**
   - **Background Color:** Pilih warna atau input hex code
   - **Text Color:** Pilih warna teks
   - **Border Radius:** Atur kebulatan sudut (0-999px)
   - **Font Size:** XS, SM, Base, LG, XL, 2XL
   - **Alignment:** Left, Center, atau Right
   - **Margin & Padding:** Atur jarak di semua sisi
   
4. **Link Settings (optional):**
   - **Link URL:** Masukkan URL tujuan (https://example.com atau /page)
   - **Open In:** Same Tab atau New Tab
   - Jika kosong, button tidak akan menjadi link

### Di Frontend:

Button akan muncul dengan styling yang sudah dikonfigurasi:
- Jika ada `buttonHref`, akan menjadi clickable link (a tag wrapping button)
- Jika `buttonHref` kosong, hanya button non-clickable
- Hover effect: opacity 90% dengan smooth transition
- URL validation otomatis (auto-add https:// jika perlu)

## Contoh Data Structure

```json
{
  "type": "button",
  "value": "Get Started",
  "buttonText": "Get Started",
  "buttonHref": "https://example.com/signup",
  "buttonTarget": "_blank",
  "buttonBgColor": "#3b82f6",
  "buttonTextColor": "#ffffff",
  "buttonBorderRadius": "8",
  "buttonFontSize": "text-lg",
  "align": "center",
  "marginTop": "0",
  "marginBottom": "24",
  "marginLeft": "0",
  "marginRight": "0",
  "paddingTop": "12",
  "paddingBottom": "12",
  "paddingLeft": "32",
  "paddingRight": "32"
}
```

## Testing Checklist

### ✅ Builder (Create/Edit Pages):
- [ ] Button muncul di element list dengan icon violet
- [ ] Klik "Add Button" menambahkan button ke column
- [ ] Button Text input berfungsi
- [ ] Link URL input berfungsi
- [ ] Preview button update real-time
- [ ] Remove button berfungsi
- [ ] Settings icon membuka StylePanel

### ✅ StylePanel:
- [ ] Button Text dapat diubah
- [ ] Background Color picker berfungsi
- [ ] Text Color picker berfungsi
- [ ] Border Radius slider berfungsi (0-999)
- [ ] Font Size dropdown berfungsi
- [ ] Alignment buttons berfungsi (left/center/right)
- [ ] Link URL input berfungsi
- [ ] Link Target selector muncul jika ada URL
- [ ] Margin controls berfungsi (4 sisi)
- [ ] Padding controls berfungsi (4 sisi)

### ✅ Frontend Display:
- [ ] Button tampil dengan styling yang benar
- [ ] Background color sesuai
- [ ] Text color sesuai
- [ ] Border radius sesuai
- [ ] Font size sesuai
- [ ] Alignment sesuai (left/center/right)
- [ ] Margin sesuai
- [ ] Padding sesuai
- [ ] Button dengan link dapat diklik
- [ ] Link target berfungsi (_blank/_self)
- [ ] Button tanpa link tidak clickable
- [ ] Hover effect berfungsi (opacity 90%)

### ✅ Edge Cases:
- [ ] Button tanpa text menampilkan "Button"
- [ ] Button tanpa styling menggunakan default
- [ ] Link URL tanpa protocol auto-add https://
- [ ] Link internal (/ atau #) berfungsi
- [ ] Mailto dan tel links berfungsi

## Default Values

```typescript
{
  buttonText: 'Click Me',
  buttonBgColor: '#3b82f6',      // Blue
  buttonTextColor: '#ffffff',    // White
  buttonBorderRadius: '6',       // 6px
  buttonFontSize: 'text-base',   // Base
  buttonHref: '',                // No link
  buttonTarget: '_self',         // Same tab
  align: 'left',                 // Left align
  paddingTop: '16',              // 16px
  paddingBottom: '16',           // 16px
  paddingLeft: '16',             // 16px
  paddingRight: '16',            // 16px
}
```

## Color Presets (Suggested)

Anda bisa menambahkan color presets di StylePanel untuk kemudahan:

**Primary:** #3b82f6 (Blue)
**Secondary:** #6b7280 (Gray)
**Success:** #10b981 (Green)
**Danger:** #ef4444 (Red)
**Warning:** #f59e0b (Orange)
**Info:** #06b6d4 (Cyan)
**Dark:** #1f2937 (Dark Gray)
**Light:** #f3f4f6 (Light Gray)

## Next Steps (Optional Enhancements)

1. **Button Size Presets:** Small, Medium, Large
2. **Button Variants:** Solid, Outline, Ghost, Link
3. **Icon Support:** Add icon before/after text
4. **Loading State:** Add spinner option
5. **Disabled State:** Toggle disabled state
6. **Gradient Background:** Support gradient like section background
7. **Border Options:** Border width, border color, border style
8. **Shadow Options:** Box shadow presets
9. **Animation:** Hover animations (scale, shake, etc)
10. **Button Group:** Multiple buttons in a row

## Implementation Complete! 🎉

Semua file sudah di-update dan button element sudah siap digunakan.
Silakan test di browser untuk memastikan semuanya berfungsi dengan baik.

