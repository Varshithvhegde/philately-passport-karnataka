# Digital Karnataka Philately Passport — Full Technical Plan

## Vision

A digital companion app to the physical Philately Passport V3, styled in **Chalukya architectural aesthetics** — the 6th–12th century stone temple style of Karnataka (Badami, Aihole, Pattadakal, Lakkundi). The app lets collectors track their 100 stamp visits, view an interactive map of Karnataka, and share their journey.

---

## Design Theme: Chalukya Architecture

### Visual Language
- **Color palette**: Sandstone ochre (#C4A35A), temple brown (#5C3317), deep laterite (#8B4513), cream parchment (#FDF5E6), muted gold (#D4AC0D)
- **Typography**: Tiro Kannada or Noto Serif Kannada for headings; Inter/Lora for body
- **Motifs**: Shikhara (temple spire) silhouettes, kirtimukha (lion-face), pillar carvings, bracket figures from Badami caves
- **Stamp pages**: Cream/aged-yellow background like the physical passport, with faded temple-frieze watermarks at the bottom (as seen in the real book)
- **Icons**: Each category gets a carved-stone style SVG icon (monument = temple tower, flora = lotus, personality = portrait medallion, etc.)
- **UI surfaces**: Stone-textured cards with subtle emboss; ink-stamp effect for collected locations

### Chalukya Reference
The Badami Chalukyas (543–753 CE) built rock-cut cave temples at Badami, the Durga Temple at Aihole, and the Virupaksha Temple at Pattadakal — all in this passport. Their style features:
- Vesara architecture (blend of Nagara and Dravida)
- Red sandstone and soapstone construction
- Intricate bracket figures, scrollwork friezes
- Star/stellate plan ground floors

---

## App Architecture

### Tech Stack
| Layer | Choice | Reason |
|-------|--------|--------|
| Framework | Next.js 14 (App Router) | SSR for SEO, fast routing |
| Styling | Tailwind CSS + shadcn/ui | Rapid theming |
| Map | Leaflet.js / react-leaflet | Open-source, works offline |
| Database | Supabase (PostgreSQL) | Auth + row-level security per user |
| Auth | Supabase Auth (Google/email) | Simple, free tier |
| Hosting | Vercel | Zero-config Next.js |
| Image storage | Supabase Storage | For stamp scan uploads |

### Database Schema

```sql
-- Core passport data (seeded from our JSON)
CREATE TABLE locations (
  id          SERIAL PRIMARY KEY,
  sno         INT UNIQUE,
  district    TEXT,
  place       TEXT,
  category    TEXT,
  post_office TEXT,
  pincode     TEXT,
  latitude    FLOAT,
  longitude   FLOAT,
  office_type TEXT,
  address     TEXT
);

-- User visit records
CREATE TABLE visits (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users ON DELETE CASCADE,
  location_id INT REFERENCES locations(sno),
  visited_at  DATE,
  notes       TEXT,
  stamp_image TEXT,   -- Supabase Storage path
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, location_id)
);

-- RLS: users can only see/write their own visits
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own visits" ON visits USING (auth.uid() = user_id);
```

---

## Features (Phased)

### Phase 1 — Data & Map (Week 1)
- [x] Extract all 100 places from Excel
- [x] Fetch coordinates via India Post API
- [x] Export formatted Excel + JSON
- [ ] Seed Supabase `locations` table
- [ ] Interactive Leaflet map of Karnataka showing all 100 pins
  - Color pins by category
  - Popup with place name, district, post office
  - Cluster markers at district level

### Phase 2 — Auth & Progress Tracker (Week 2)
- [ ] Supabase Auth (Google login)
- [ ] "Mark as Visited" button on each location card
  - Date picker for visit date
  - Optional notes field
  - Photo upload (stamp scan)
- [ ] Progress bar: X / 100 collected
- [ ] District-wise progress breakdown

### Phase 3 — Passport View (Week 3)
- [ ] Digital passport booklet UI
  - Aged-parchment page layout mirroring physical passport
  - Each page shows: place photo, classification, description, stamp slot
  - Collected: shows ink-stamp overlay with visit date
  - Uncollected: blank stamp circle (dashed)
- [ ] Page-flip animation between entries
- [ ] Kannada / English toggle for place names

### Phase 4 — Social & Gamification (Week 4)
- [ ] Shareable progress card ("I've visited 45/100!")
  - Auto-generated image with Karnataka map silhouette + visited pins highlighted
- [ ] Leaderboard (opt-in, anonymous by default)
- [ ] Badges: "Bagalkot Explorer", "Coastal Karnataka", "Wildlife Watcher", etc.
- [ ] Category completion challenges

---

## File / Folder Structure

```
philately-passport-karnataka/
├── data/
│   ├── places_with_locations.json          # master data (100 records)
│   └── Karnataka_Philately_Passport_V3_Locations.xlsx
├── scripts/
│   ├── fetch_locations.py                  # India Post API fetch
│   ├── enrich_locations.py                 # fallback enrichment
│   └── fix_and_export.py                   # Excel export
├── app/                                    # Next.js app (to be created)
│   ├── layout.tsx
│   ├── page.tsx                            # landing / map view
│   ├── passport/
│   │   └── [sno]/page.tsx                  # individual location passport page
│   ├── profile/page.tsx                    # user progress
│   └── api/
│       └── seed/route.ts                   # seed DB from JSON
├── components/
│   ├── Map.tsx                             # Leaflet map
│   ├── PassportPage.tsx                    # single parchment page
│   ├── StampOverlay.tsx                    # ink stamp SVG
│   ├── ProgressBar.tsx
│   └── CategoryBadge.tsx
├── lib/
│   ├── supabase.ts
│   └── locations.ts                        # data helpers
├── public/
│   └── motifs/                             # Chalukya SVG motifs
├── PLAN.md
└── README.md
```

---

## Map Design Detail

```
Karnataka map view:
- Base tile: CartoDB Voyager or OSM (warm-toned)
- Karnataka boundary highlighted
- 100 pins, colored by category:
    Monument        = #C4A35A (sandstone gold)
    Flora & Fauna   = #4A7C59 (forest green)
    Personality     = #6D4C9C (royal purple)
    Natural Heritage= #2A6B8A (river blue)
    Heritage Celeb. = #C05C1A (festival orange)
    Science & Tech  = #1A5276 (deep blue)
    Industry        = #7D6608 (dark gold)
    Weapons/Attire  = #922B21 (deep red)
- Visited pins: filled, with checkmark
- Unvisited: outlined/grey
- District-level zoom: shows label + count "Udupi: 16 locations"
```

---

## API Notes

India Post API endpoint used:
```
POST https://www.indiapost.gov.in/post-office-details-name?officename={NAME}
Payload: ["GET_POSTOFFICE_BY_NAME","GET",null,"office-name={NAME}&limit=0"]
Header: next-action: 7f04c72a185756a3940501a7996e6b83e2a72a488e
```

Name format: `Aihole B.O`, `Badami S.O`, `Belagavi H.O` (dots required).
Returns latitude/longitude directly in the response.

---

## Data Coverage

| Status | Count |
|--------|-------|
| Found via API (exact name) | 59 |
| Found via fallback name variant | 25 |
| Manual verification (known Karnataka geography) | 16 |
| **Total with coordinates** | **100 / 100** |

---

## Next Steps (Immediate)

1. `cd philately-passport-karnataka && npx create-next-app@latest . --ts --tailwind --app`
2. Install: `leaflet react-leaflet @supabase/supabase-js openpyxl`
3. Seed Supabase from `data/places_with_locations.json`
4. Build the map component with category-colored pins
5. Build passport page layout with parchment styling
