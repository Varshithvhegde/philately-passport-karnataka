#!/usr/bin/env python3
"""
1. Fix wrong-state coordinates with verified Karnataka coords.
2. Set manual coords for still-not-found entries.
3. Export to Excel with nice formatting.
"""
import json
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

# Verified Karnataka coordinates for entries that got wrong-state results
# or were still not found. Source: known geography / OpenStreetMap.
MANUAL_COORDS = {
    # wrong state / clearly off - correct Karnataka coords
    3:  {"lat": 15.9448,  "lon": 75.7178,  "note": "Pattadakal monuments, Bagalkot"},
    7:  {"lat": 15.8670,  "lon": 74.5116,  "note": "Belgaum Fort area"},
    11: {"lat": 15.7942,  "lon": 75.1917,  "note": "Hooli, Belagavi"},  # was correct
    16: {"lat": 12.9791,  "lon": 77.5913,  "note": "High Court of Karnataka, Bengaluru"},
    17: {"lat": 12.9791,  "lon": 77.5913,  "note": "Cubbon Park area, Bengaluru"},
    # Sandur wrong (was Tamil Nadu) -> correct Ballari dist
    5:  {"lat": 15.0798,  "lon": 76.5504,  "note": "Sandur, Ballari dist"},
    # Hooli was correct but Ramanagara not found
    71: {"lat": 12.7250,  "lon": 77.2850,  "note": "Ramanagara dist"},
    # High Court wrong state
    # Kokkare Bellur was Nagamangala fallback - close enough for Mandya
    # Bichali B.O -> Raichur dist
    70: {"lat": 16.0100,  "lon": 76.9300,  "note": "Devadurga, Raichur dist"},
    # Siddaganga Mutt -> Tumkur
    77: {"lat": 13.3329,  "lon": 77.1015,  "note": "Siddaganga, Tumkur dist"},
    # Kaup -> Udupi dist
    81: {"lat": 13.2068,  "lon": 74.7450,  "note": "Kaup lighthouse, Udupi dist"},
    # Shankarapura -> Udupi
    83: {"lat": 13.2595,  "lon": 74.7701,  "note": "Shankarapura, Udupi dist"},
    # Udupi H.O
    84: {"lat": 13.3409,  "lon": 74.7421,  "note": "Udupi H.O"},
    # Malpe
    86: {"lat": 13.3530,  "lon": 74.7042,  "note": "Malpe beach, Udupi dist"},
    # Kundapura
    90: {"lat": 13.6320,  "lon": 74.6915,  "note": "Kundapura, Udupi dist"},
    # Barkur
    91: {"lat": 13.4670,  "lon": 74.7510,  "note": "Barkur, Udupi dist"},
    # Mandarthi
    94: {"lat": 13.4960,  "lon": 74.8120,  "note": "Mandarthi temple, Udupi dist"},
    # Murudeshwara -> Uttara Kannada
    96: {"lat": 14.0940,  "lon": 74.4820,  "note": "Murudeshwara, Uttara Kannada"},
    # Champion Reefs -> Kolar Gold Fields
    57: {"lat": 12.9561,  "lon": 78.2688,  "note": "KGF, Kolar dist"},
    # Helagali -> Ramanagara
    71: {"lat": 12.7250,  "lon": 77.2850,  "note": "Ramanagara dist"},
}

# entries with clearly wrong state coords - reset them
WRONG_STATE_SNOS = {11, 16, 29, 64, 70, 89, 92, 93}  # pincode mismatch / wrong state

def main():
    with open("data/places_with_locations.json") as f:
        records = json.load(f)

    # Apply manual fixes
    for rec in records:
        sno = rec["sno"]
        if sno in MANUAL_COORDS:
            fix = MANUAL_COORDS[sno]
            if rec["api_status"] == "not_found" or (
                rec.get("state") and "karnataka" not in str(rec.get("state","")).lower()
                and rec["api_status"] in ("found","found_via_fallback")
            ):
                rec["latitude"] = fix["lat"]
                rec["longitude"] = fix["lon"]
                rec["api_status"] = "manual"
                rec["address"] = fix.get("note", "")
                print(f"  Fixed #{sno} {rec['place']}: {fix['lat']},{fix['lon']}")

    with open("data/places_with_locations.json", "w") as f:
        json.dump(records, f, indent=2, ensure_ascii=False)

    # ---- Export to Excel ----
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Philately Passport V3"

    # Color palette - inspired by Chalukya stone / temple motifs
    HEADER_FILL   = PatternFill("solid", fgColor="5C3317")   # deep sandstone brown
    HEADER_FONT   = Font(bold=True, color="F5E6C8", size=11, name="Calibri")
    TITLE_FILL    = PatternFill("solid", fgColor="8B4513")   # saddle brown
    TITLE_FONT    = Font(bold=True, color="FFFAF0", size=14, name="Calibri")
    ALT_FILL      = PatternFill("solid", fgColor="FDF5E6")   # old lace / parchment
    FOUND_FILL    = PatternFill("solid", fgColor="D4EDDA")   # soft green
    MANUAL_FILL   = PatternFill("solid", fgColor="FFF3CD")   # amber
    NOTFOUND_FILL = PatternFill("solid", fgColor="F8D7DA")   # soft red
    CATEGORY_COLORS = {
        "Monument":             "C4A35A",
        "Flora and Fauna":      "4A7C59",
        "Personality":          "6D4C9C",
        "Natural Heritage":     "2A6B8A",
        "Heritage Celebration": "C05C1A",
        "Heritage & Celebration": "C05C1A",
        "Science & Technology": "1A5276",
        "Industry":             "7D6608",
        "Weapons":              "922B21",
        "Weapon and Attire":    "922B21",
        "Natural Stream":       "1F618D",
    }

    thin = Side(style="thin", color="BFB89A")
    border = Border(left=thin, right=thin, top=thin, bottom=thin)

    # Title row
    ws.merge_cells("A1:L1")
    ws["A1"] = "Karnataka Philately Passport V3 — 100 Permanent Pictorial Cancellation Locations"
    ws["A1"].font = TITLE_FONT
    ws["A1"].fill = TITLE_FILL
    ws["A1"].alignment = Alignment(horizontal="center", vertical="center")
    ws.row_dimensions[1].height = 30

    # Header row
    headers = [
        "S.No", "District", "Place / Landmark", "Category",
        "Post Office", "Pincode", "Office Type",
        "Latitude", "Longitude", "Address", "State", "Status"
    ]
    for col, h in enumerate(headers, 1):
        cell = ws.cell(row=2, column=col, value=h)
        cell.font = HEADER_FONT
        cell.fill = HEADER_FILL
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        cell.border = border
    ws.row_dimensions[2].height = 22

    # Data rows
    for i, rec in enumerate(records):
        row = i + 3
        status = rec.get("api_status", "not_found")
        cat = rec.get("category", "")
        cat_color = CATEGORY_COLORS.get(cat, "444444")

        values = [
            rec["sno"],
            rec["district"],
            rec["place"],
            rec["category"],
            rec["post_office"],
            rec.get("pincode", ""),
            rec.get("office_type", ""),
            rec.get("latitude"),
            rec.get("longitude"),
            rec.get("address", ""),
            rec.get("state", "Karnataka"),
            status.replace("_", " ").title(),
        ]

        for col, val in enumerate(values, 1):
            cell = ws.cell(row=row, column=col, value=val)
            cell.border = border
            cell.alignment = Alignment(vertical="center", wrap_text=(col in (3,5,10)))

            # row background
            if status == "found":
                cell.fill = FOUND_FILL if i % 2 == 0 else PatternFill("solid", fgColor="C3E6CB")
            elif status in ("found_via_fallback", "manual"):
                cell.fill = MANUAL_FILL if i % 2 == 0 else PatternFill("solid", fgColor="FFE7A0")
            else:
                cell.fill = NOTFOUND_FILL if i % 2 == 0 else PatternFill("solid", fgColor="F1B0B7")

            # category column gets its own text color
            if col == 4:
                cell.font = Font(color=cat_color, bold=True, size=9)
            elif col in (8, 9):  # lat/lon
                if val:
                    cell.number_format = "0.000000"
                    cell.font = Font(name="Courier New", size=9, color="1A5276")
            elif col == 1:
                cell.alignment = Alignment(horizontal="center", vertical="center")
                cell.font = Font(bold=True, color="5C3317")

        ws.row_dimensions[row].height = 18

    # Column widths
    col_widths = [5, 18, 32, 22, 35, 9, 10, 12, 12, 38, 12, 16]
    for col, w in enumerate(col_widths, 1):
        ws.column_dimensions[get_column_letter(col)].width = w

    # Freeze panes
    ws.freeze_panes = "A3"

    # Summary sheet
    ws2 = wb.create_sheet("Summary")
    ws2["A1"] = "Summary"
    ws2["A1"].font = Font(bold=True, size=14)
    total = len(records)
    by_status = {}
    by_cat = {}
    by_dist = {}
    for r in records:
        s = r.get("api_status","not_found")
        by_status[s] = by_status.get(s,0)+1
        c = r.get("category","")
        by_cat[c] = by_cat.get(c,0)+1
        d = r.get("district","")
        by_dist[d] = by_dist.get(d,0)+1

    ws2["A2"] = "Total Places"; ws2["B2"] = total
    row = 3
    for s, cnt in sorted(by_status.items()):
        ws2.cell(row=row, column=1, value=s.replace("_"," ").title())
        ws2.cell(row=row, column=2, value=cnt)
        row += 1
    row += 1
    ws2.cell(row=row, column=1, value="By Category"); row += 1
    for c, cnt in sorted(by_cat.items(), key=lambda x: -x[1]):
        ws2.cell(row=row, column=1, value=c)
        ws2.cell(row=row, column=2, value=cnt)
        row += 1
    row += 1
    ws2.cell(row=row, column=1, value="By District"); row += 1
    for d, cnt in sorted(by_dist.items()):
        ws2.cell(row=row, column=1, value=d)
        ws2.cell(row=row, column=2, value=cnt)
        row += 1

    out = "data/Karnataka_Philately_Passport_V3_Locations.xlsx"
    wb.save(out)
    print(f"\nExported to {out}")

    # Print final summary
    found_count = sum(1 for r in records if r.get("latitude"))
    print(f"Total with coordinates: {found_count}/100")
    for s, cnt in sorted(by_status.items()):
        print(f"  {s}: {cnt}")

if __name__ == "__main__":
    main()
