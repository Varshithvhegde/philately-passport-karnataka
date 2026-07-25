#!/usr/bin/env python3
"""
Enrich missing coordinates using fallback name variants and pincode-based matching.
Reads data/places_with_locations.json and writes updated version.
"""
import json
import time
import re
import urllib.request
import urllib.parse

FALLBACK_NAMES = {
    "Pattadakallu B.O":         ["Pattadakal B.O", "Pattadakal S.O"],
    "Ballary Fort S.O":         ["Ballari H.O", "Ballari Fort S.O"],
    "Belgavi Fort S.O":         ["Belagavi Fort S.O", "Belgaum H.O"],
    "Yallamma Hill S.O":        ["Yellamma Hill S.O", "Saundatti S.O"],
    "Bengaluru GPO-PB":         ["Bengaluru G.P.O", "Bangalore GPO", "Bengaluru H.O"],
    "High Court S.O":           ["High Court Of Karnataka S.O"],
    "DR.Ambedkar Veedhi S.O":   ["Dr Ambedkar Veedhi S.O", "Cubbon Park S.O"],
    "Jayanagar 3rd Block S.O":  ["Jayanagar S.O", "Jayanagar 3rd Block S.O"],
    "Science Institue S.O":     ["Science Institute S.O", "Malleswaram S.O"],
    "Bidar Gurunanak Jhira S.O":["Guru Nanak Jhira S.O", "Bidar H.O"],
    "Bandipur B.O":             ["Bandipur S.O", "Gundlupet S.O"],
    "Male Mahadeshwara Hills S.O": ["M M Hills S.O", "Hanur S.O"],
    "Moodabidri S.O":           ["Moodbidri S.O"],
    "Subrahmanya S.O":          ["Subramanya S.O", "Subrahmanya H.O"],
    "Davanagere H.O":           ["Davanagere S.O", "Davangere H.O"],
    "Narayanapura S.O":         ["Narayanpur S.O", "Dharwad H.O"],
    "Hubli H.O":                ["Hubli S.O", "Hubballi H.O"],
    "Belur(Hasan) S.O":         ["Belur S.O", "Belur H.O"],
    "Ranebennur M.D.G":         ["Ranebennur S.O", "Ranibennur S.O"],
    "Kalaburgi H.O":            ["Gulbarga H.O", "Kalaburagi H.O"],
    "Nagarhole B.O":            ["Nagarahole S.O", "Hunsur S.O"],
    "Champion Reefs S.O":       ["Kolar Gold Fields S.O", "KGF S.O"],
    "Masthi So":                ["Masthi S.O", "Masti S.O"],
    "Kokkare Bellur B.O":       ["Kokkare Bellur S.O", "Nagamangala S.O"],
    "SGS Ashram S.O":           ["Sathagalli S.O", "Mysuru H.O"],
    "Bichali B.O":              ["Bichali S.O", "Devadurga S.O"],
    "Helagali B.O":             ["Helagali S.O", "Ramanagara H.O"],
    "Devandi S.O":              ["Devandi B.O", "Thirthahalli S.O"],
    "Humcha B.O":               ["Hombuja B.O", "Shimoga S.O"],
    "Siddaganga Mutt S.O":      ["Siddaganga S.O", "Tumkur H.O"],
    "Katapadi S.O":             ["Katpadi S.O", "Udupi H.O"],
    "Kaup S.O":                 ["Kaup B.O", "Kaup S.O"],
    "Shankarapura S.O":         ["Shankarpura S.O"],
    "Udupi H.O":                ["Udupi S.O"],
    "Manipal H.O":              ["Manipal S.O"],
    "Malpe S.O":                ["Malpe B.O"],
    "Kundapura H.O":            ["Kundapur H.O", "Kundapur S.O"],
    "Barkur S.O":               ["Barkur B.O"],
    "Mandarthi S.O":            ["Mandarthi B.O"],
    "Murudeshwara S.O":         ["Murudeshwar S.O", "Murudeshwar B.O"],
    "Kannada University Campus S.O": ["Hampi S.O", "Hospet H.O"],
}

def fetch_post_office(office_name):
    query = urllib.parse.quote(office_name)
    url = f"https://www.indiapost.gov.in/post-office-details-name?officename={query}"
    data = f'["GET_POSTOFFICE_BY_NAME","GET",null,"office-name={urllib.parse.quote_plus(office_name)}&limit=0"]'
    req = urllib.request.Request(url, data=data.encode("utf-8"), method="POST")
    req.add_header("Accept", "text/x-component")
    req.add_header("Content-Type", "text/plain;charset=UTF-8")
    req.add_header("Origin", "https://www.indiapost.gov.in")
    req.add_header("Referer", url)
    req.add_header("next-action", "7f04c72a185756a3940501a7996e6b83e2a72a488e")
    req.add_header("next-router-state-tree", '%5B%22%22%2C%7B%22children%22%3A%5B%22(controller)%22%2C%7B%22children%22%3A%5B%22(home)%22%2C%7B%22children%22%3A%5B%22post-office-details-name%22%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%2Cnull%2Cnull%5D%7D%2Cnull%2Cnull%5D%7D%2Cnull%2Cnull%5D%7D%2Cnull%2Cnull%5D%7D%2Cnull%2Cnull%2Ctrue%5D')
    req.add_header("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36")
    req.add_header("Cookie", "session_visited=true")
    req.add_header("Sec-Fetch-Dest", "empty")
    req.add_header("Sec-Fetch-Mode", "cors")
    req.add_header("Sec-Fetch-Site", "same-origin")
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            raw = resp.read().decode("utf-8")
        for line in raw.splitlines():
            if line.startswith("1:"):
                payload = json.loads(line[2:])
                if payload.get("success") and payload.get("data"):
                    return payload["data"]
    except Exception as e:
        print(f"    ERROR: {e}")
    return []

def best_match(records, pincode_hint):
    karnataka = [r for r in records if str(r.get("state_name","")).lower() == "karnataka"]
    for r in (karnataka or records):
        if str(r.get("pincode","")) == str(pincode_hint):
            return r
    return (karnataka or records)[0] if (karnataka or records) else None

def main():
    with open("data/places_with_locations.json") as f:
        records = json.load(f)

    not_found = [r for r in records if r["api_status"] == "not_found"]
    print(f"Attempting to resolve {len(not_found)} not-found entries...\n")

    for item in not_found:
        queried = item["office_name_queried"]
        pincode = item["pincode"]
        fallbacks = FALLBACK_NAMES.get(queried, [])
        resolved = False

        for alt_name in fallbacks:
            print(f"  Trying '{alt_name}' for {queried}...")
            recs = fetch_post_office(alt_name)
            rec = best_match(recs, pincode) if recs else None
            if rec and rec.get("latitude"):
                item["latitude"] = rec["latitude"]
                item["longitude"] = rec["longitude"]
                item["office_type"] = rec.get("office_type_code")
                addr_parts = [rec.get("office_address1",""), rec.get("city_name","")]
                item["address"] = ", ".join(p for p in addr_parts if p)
                item["state"] = rec.get("state_name")
                item["api_status"] = "found_via_fallback"
                item["office_name_queried"] = alt_name
                print(f"    -> FOUND lat={rec['latitude']}, lon={rec['longitude']}")
                resolved = True
                break
            time.sleep(0.3)

        if not resolved:
            print(f"  Still not found: {queried}")

    with open("data/places_with_locations.json", "w") as f:
        json.dump(records, f, indent=2, ensure_ascii=False)

    found = sum(1 for r in records if r["api_status"] in ("found","found_via_fallback"))
    not_found_count = sum(1 for r in records if r["api_status"] == "not_found")
    print(f"\nFinal: {found} with coords | {not_found_count} still not found")

if __name__ == "__main__":
    main()
