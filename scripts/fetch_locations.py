#!/usr/bin/env python3
"""
Fetch lat/lon for each post office in the Karnataka Philately Passport V3
using the India Post API.
"""
import json
import time
import re
import urllib.request
import urllib.parse

PLACES = [
    {"sno": 1,  "district": "Bagalkot",         "place": "Aihole",                              "post_office": "Aihole BO 587124",                              "category": "Monument"},
    {"sno": 2,  "district": "Bagalkot",         "place": "Badami",                              "post_office": "Badami SO 587201",                              "category": "Monument"},
    {"sno": 3,  "district": "Bagalkot",         "place": "Pattadakallu",                        "post_office": "Pattadakallu BO 587201",                        "category": "Monument"},
    {"sno": 4,  "district": "Ballari",          "place": "Ballari Fort",                        "post_office": "Ballary Fort SO 583102",                        "category": "Monument"},
    {"sno": 5,  "district": "Ballari",          "place": "Kumaraswamy Temple",                  "post_office": "Sandur SO 583119",                              "category": "Monument"},
    {"sno": 6,  "district": "Belagavi",         "place": "Belagavi Clock Tower",                "post_office": "Belagavi HO 590001",                            "category": "Monument"},
    {"sno": 7,  "district": "Belagavi",         "place": "Belagavi Fort",                       "post_office": "Belgavi Fort SO 590016",                        "category": "Monument"},
    {"sno": 8,  "district": "Belagavi",         "place": "Kittur Rani Channamma",               "post_office": "Kittur SO 591115",                              "category": "Personality"},
    {"sno": 9,  "district": "Belagavi",         "place": "Sangoli Rayanna",                     "post_office": "Nandgad SO 591115",                             "category": "Personality"},
    {"sno": 10, "district": "Belagavi",         "place": "Halashi",                             "post_office": "Halashi BO 591142",                             "category": "Monument"},
    {"sno": 11, "district": "Belagavi",         "place": "Hooli",                               "post_office": "Hooli BO 591126",                               "category": "Monument"},
    {"sno": 12, "district": "Belagavi",         "place": "Yellamma Temple",                     "post_office": "Yallamma Hill SO 591173",                       "category": "Monument"},
    {"sno": 13, "district": "Belagavi",         "place": "Bhimgad Wildlife Sanctuary",          "post_office": "Shiroli BO 591302",                             "category": "Flora and Fauna"},
    {"sno": 14, "district": "Belagavi",         "place": "Gokak Falls",                         "post_office": "Gokak Falls SO 591308",                         "category": "Natural Stream"},
    {"sno": 15, "district": "Bengaluru",        "place": "Vidhana Soudha",                      "post_office": "Bengaluru GPO-PB 560001",                       "category": "Monument"},
    {"sno": 16, "district": "Bengaluru",        "place": "High Court of Karnataka",             "post_office": "High Court SO 560001",                          "category": "Monument"},
    {"sno": 17, "district": "Bengaluru",        "place": "Beaulieu",                            "post_office": "DR.Ambedkar Veedhi SO 560001",                  "category": "Monument"},
    {"sno": 18, "district": "Bengaluru",        "place": "Watch Tower Lalbagh",                 "post_office": "Basavanagudi HO 560004",                        "category": "Monument"},
    {"sno": 19, "district": "Bengaluru",        "place": "Rajajinagar Foundation Pillar",       "post_office": "Rajajinagar HO 560010",                         "category": "Monument"},
    {"sno": 20, "district": "Bengaluru",        "place": "Ashoka Pillar",                       "post_office": "Jayanagar 3rd Block SO 560011",                 "category": "Monument"},
    {"sno": 21, "district": "Bengaluru",        "place": "Indian Institute of Science",         "post_office": "Science Institue SO 560012",                    "category": "Monument"},
    {"sno": 22, "district": "Bengaluru",        "place": "ISRO",                                "post_office": "N A L SO 560017",                               "category": "Science & Technology"},
    {"sno": 23, "district": "Bengaluru",        "place": "Sandesh Museum",                      "post_office": "Museum Road SO 560025",                         "category": "Monument"},
    {"sno": 24, "district": "Bengaluru",        "place": "Bannerghatta National Park",          "post_office": "Bannerghatta SO 560083",                        "category": "Flora and Fauna"},
    {"sno": 25, "district": "Bidar",            "place": "Parshvanath Bhagwan Digamber",        "post_office": "Kamthana SO 585226",                            "category": "Personality"},
    {"sno": 26, "district": "Bidar",            "place": "Basavakalyan",                        "post_office": "Basavakalyan SO 585327",                        "category": "Monument"},
    {"sno": 27, "district": "Bidar",            "place": "Mahamud Gawan Arabic University",     "post_office": "Bidar HO 585401",                               "category": "Monument"},
    {"sno": 28, "district": "Bidar",            "place": "Guru Nanak Jhira Sahib",              "post_office": "Bidar Gurunanak Jhira SO 585402",               "category": "Monument"},
    {"sno": 29, "district": "Chamarajanagara",  "place": "Bandipur National Park",              "post_office": "Bandipur BO 571126",                            "category": "Flora and Fauna"},
    {"sno": 30, "district": "Chamarajanagara",  "place": "Kyathadevaragudi",                    "post_office": "Kyathadevaragudi BO 571342",                    "category": "Flora and Fauna"},
    {"sno": 31, "district": "Chamarajanagara",  "place": "Male Mahadeshwara Betta",             "post_office": "Male Mahadeshwara Hills SO 571490",             "category": "Flora and Fauna"},
    {"sno": 32, "district": "Chikkaballapura",  "place": "Nandi Hills",                         "post_office": "Nandi Hills BO 562101",                         "category": "Monument"},
    {"sno": 33, "district": "Chikkamagaluru",   "place": "Chikmagaluru Coffee Plantations",     "post_office": "Chikkamagaluru HO 577101",                      "category": "Natural Heritage"},
    {"sno": 34, "district": "Chikkamagaluru",   "place": "Sringeri",                            "post_office": "Sringeri SO 577139",                            "category": "Monument"},
    {"sno": 35, "district": "Chitradurga",      "place": "Chitradurga Fort (Onake Obavva)",     "post_office": "Chitradurga HO 577501",                         "category": "Personality"},
    {"sno": 36, "district": "Dakshina Kannada", "place": "Kateel",                              "post_office": "Kateel SO 574148",                              "category": "Monument"},
    {"sno": 37, "district": "Dakshina Kannada", "place": "Dharmasthala",                        "post_office": "Dharmasthala SO 574216",                        "category": "Monument"},
    {"sno": 38, "district": "Dakshina Kannada", "place": "Moodbidri Jain Pilgrimage",           "post_office": "Moodabidri SO 574227",                          "category": "Monument"},
    {"sno": 39, "district": "Dakshina Kannada", "place": "Subrahmanya Temple",                  "post_office": "Subrahmanya SO 574238",                         "category": "Monument"},
    {"sno": 40, "district": "Dakshina Kannada", "place": "Venur Gommateshwara Idol",            "post_office": "Venur SO 574242",                               "category": "Monument"},
    {"sno": 41, "district": "Dakshina Kannada", "place": "Mangaluru Light House",               "post_office": "Mangaluru HO 575001",                           "category": "Monument"},
    {"sno": 42, "district": "Dakshina Kannada", "place": "Rani Abbakka Chowta",                 "post_office": "Ullal SO 575020",                               "category": "Personality"},
    {"sno": 43, "district": "Davanagere",       "place": "Chennagiri Rangappa Clock Tower",     "post_office": "Davanagere HO 577001",                          "category": "Monument"},
    {"sno": 44, "district": "Dharwad",          "place": "Bhendre Bhavan",                      "post_office": "Narayanapura SO 580008",                        "category": "Monument"},
    {"sno": 45, "district": "Dharwad",          "place": "Unkal Lake",                          "post_office": "Hubli HO 580020",                               "category": "Monument"},
    {"sno": 46, "district": "Dharwad",          "place": "Pampa",                               "post_office": "Annigeri SO 582201",                            "category": "Personality"},
    {"sno": 47, "district": "Gadag",            "place": "Kumaravyasa",                         "post_office": "Gadag HO 582101",                               "category": "Personality"},
    {"sno": 48, "district": "Gadag",            "place": "Lakkundi",                            "post_office": "Lakkundi SO 582115",                            "category": "Monument"},
    {"sno": 49, "district": "Hassan",           "place": "Belur Chennakeshava Temple",          "post_office": "Belur(Hasan) SO 573115",                        "category": "Monument"},
    {"sno": 50, "district": "Hassan",           "place": "Halebeedu",                           "post_office": "Halebeedu SO 573121",                           "category": "Monument"},
    {"sno": 51, "district": "Hassan",           "place": "Gommateshwara Shravanabelagola",      "post_office": "Shravanabelagola SO 573135",                    "category": "Monument"},
    {"sno": 52, "district": "Haveri",           "place": "Ranebennur Blackbuck Sanctuary",      "post_office": "Ranebennur MDG 581115",                         "category": "Flora and Fauna"},
    {"sno": 53, "district": "Haveri",           "place": "Santa Shishunala Sharifa",            "post_office": "Shishuvinhal BO 581126",                        "category": "Personality"},
    {"sno": 54, "district": "Kalaburgi",        "place": "Bara Gazi Toph",                      "post_office": "Kalaburgi HO 585101",                           "category": "Monument"},
    {"sno": 55, "district": "Kodagu",           "place": "Madikeri",                            "post_office": "Madikeri HO 571201",                            "category": "Weapons"},
    {"sno": 56, "district": "Kodagu",           "place": "Nagarahole National Park",            "post_office": "Nagarhole BO 571258",                           "category": "Flora and Fauna"},
    {"sno": 57, "district": "Kolar",            "place": "Kolar Gold Fields",                   "post_office": "Champion Reefs SO 563117",                      "category": "Industry"},
    {"sno": 58, "district": "Kolar",            "place": "Masti Venkatesha Iyengar",            "post_office": "Masthi So 563139",                              "category": "Personality"},
    {"sno": 59, "district": "Koppal",           "place": "Anjanadri Hill",                      "post_office": "Anegundi BO 583227",                            "category": "Monument"},
    {"sno": 60, "district": "Koppal",           "place": "Shri Gavi Siddeshwar Gavimath",       "post_office": "Koppal HO 583231",                              "category": "Personality"},
    {"sno": 61, "district": "Mandya",           "place": "Kokkare Bellur",                      "post_office": "Kokkare Bellur BO 571433",                      "category": "Flora and Fauna"},
    {"sno": 62, "district": "Mandya",           "place": "Srirangapatna",                       "post_office": "Srirangapatna HO 571438",                       "category": "Weapon and Attire"},
    {"sno": 63, "district": "Mysuru",           "place": "Mysuru Dasara",                       "post_office": "Mysuru HO 570001",                              "category": "Heritage Celebration"},
    {"sno": 64, "district": "Mysuru",           "place": "Silver Jubilee Clock Tower",          "post_office": "Lakshmipuram SO 570004",                        "category": "Monument"},
    {"sno": 65, "district": "Mysuru",           "place": "Brindavan Garden & Mysore Palace",    "post_office": "Saraswathipuram HO 570009",                     "category": "Heritage & Celebration"},
    {"sno": 66, "district": "Mysuru",           "place": "Chamundi Hills",                      "post_office": "Chamundi Betta BO 570010",                      "category": "Monument"},
    {"sno": 67, "district": "Mysuru",           "place": "Sri Ganapati Sachidananda Ashram",    "post_office": "SGS Ashram SO 570025",                          "category": "Monument"},
    {"sno": 68, "district": "Mysuru",           "place": "Somanathapura",                       "post_office": "Somanathapura BO 571120",                       "category": "Monument"},
    {"sno": 69, "district": "Mysuru",           "place": "Talakad",                             "post_office": "Talakad SO 571122",                             "category": "Monument"},
    {"sno": 70, "district": "Raichur",          "place": "Appannacharya",                       "post_office": "Bichali BO 584140",                             "category": "Monument"},
    {"sno": 71, "district": "Ramanagara",       "place": "Grizzled Giant Squirrel",             "post_office": "Helagali BO 562117",                            "category": "Flora and Fauna"},
    {"sno": 72, "district": "Shivamogga",       "place": "Agumbe",                              "post_office": "Agumbe SO 577411",                              "category": "Flora and Fauna"},
    {"sno": 73, "district": "Shivamogga",       "place": "Kundadri",                            "post_office": "Kendalbailu BO 577411",                         "category": "Monument"},
    {"sno": 74, "district": "Shivamogga",       "place": "Kavishaila",                          "post_office": "Devandi SO 577415",                             "category": "Monument"},
    {"sno": 75, "district": "Shivamogga",       "place": "Jog Falls",                           "post_office": "Jog Falls SO 577435",                           "category": "Natural Heritage"},
    {"sno": 76, "district": "Shivamogga",       "place": "Humcha / Hombuja",                    "post_office": "Humcha BO 577436",                              "category": "Monument"},
    {"sno": 77, "district": "Tumakuru",         "place": "Siddaganga Mutt",                     "post_office": "Siddaganga Mutt SO 572104",                     "category": "Personality"},
    {"sno": 78, "district": "Tumakuru",         "place": "Pinchi Basadi",                       "post_office": "Hirehalli SO 572168",                           "category": "Monument"},
    {"sno": 79, "district": "Udupi",            "place": "Karkala Gommateshwara",               "post_office": "karkala HO 574104",                             "category": "Monument"},
    {"sno": 80, "district": "Udupi",            "place": "Mattu Galla",                         "post_office": "Katapadi SO 574105",                            "category": "Flora and Fauna"},
    {"sno": 81, "district": "Udupi",            "place": "Kaup",                                "post_office": "Kaup SO 574106",                                "category": "Monument"},
    {"sno": 82, "district": "Udupi",            "place": "Varanga Kere Basadi",                 "post_office": "Varanga BO 574108",                             "category": "Monument"},
    {"sno": 83, "district": "Udupi",            "place": "Shankarpura Mallige",                 "post_office": "Shankarapura SO 574115",                        "category": "Flora and Fauna"},
    {"sno": 84, "district": "Udupi",            "place": "Krishna Temple Udupi",                "post_office": "Udupi HO 576101",                               "category": "Monument"},
    {"sno": 85, "district": "Udupi",            "place": "Manipal",                             "post_office": "Manipal HO 576104",                             "category": "Monument"},
    {"sno": 86, "district": "Udupi",            "place": "Malpe",                               "post_office": "Malpe SO 576108",                               "category": "Monument"},
    {"sno": 87, "district": "Udupi",            "place": "Mahakavi Muddana",                    "post_office": "Nandalike BO 576111",                           "category": "Personality"},
    {"sno": 88, "district": "Udupi",            "place": "Someshwara Wildlife Sanctuary",       "post_office": "Someshwara BO 576112",                          "category": "Flora and Fauna"},
    {"sno": 89, "district": "Udupi",            "place": "St Lawrence Church Attur",            "post_office": "Attur BO 576117",                               "category": "Monument"},
    {"sno": 90, "district": "Udupi",            "place": "Panchagangavali River",               "post_office": "Kundapura HO 576201",                           "category": "Natural Heritage"},
    {"sno": 91, "district": "Udupi",            "place": "Barkur",                              "post_office": "Barkur SO 576210",                              "category": "Monument"},
    {"sno": 92, "district": "Udupi",            "place": "Kollur Mookambika Temple",            "post_office": "Kollur SO 576220",                              "category": "Monument"},
    {"sno": 93, "district": "Udupi",            "place": "K. Shivaram Karanth",                 "post_office": "Kota SO 576221",                                "category": "Personality"},
    {"sno": 94, "district": "Udupi",            "place": "Mandarthi",                           "post_office": "Mandarthi SO 576223",                           "category": "Monument"},
    {"sno": 95, "district": "Uttara Kannada",   "place": "Manjuguni",                           "post_office": "Manjuguni BO 581315",                           "category": "Monument"},
    {"sno": 96, "district": "Uttara Kannada",   "place": "Murudeshwara",                        "post_office": "Murudeshwara SO 581350",                        "category": "Monument"},
    {"sno": 97, "district": "Vijayanagara",     "place": "Hampi",                               "post_office": "Hampi SO 583239",                               "category": "Monument"},
    {"sno": 98, "district": "Vijayanagara",     "place": "Kannada University",                  "post_office": "Kannada University Campus SO 583276",           "category": "Flora and Fauna"},
    {"sno": 99, "district": "Vijayapura",       "place": "Vijayapura City",                     "post_office": "Vijayapura HO 586101",                          "category": "Monument"},
    {"sno": 100, "district": "Yadagiri",        "place": "Bonal Bird Sanctuary",                "post_office": "Bonal BO 585224",                               "category": "Flora and Fauna"},
]

def parse_office_name(post_office_str):
    """Extract office name from strings like 'Aihole BO 587124' -> 'Aihole B.O'."""
    name = re.sub(r'\s+\d{6}$', '', post_office_str).strip()
    # API expects dotted format: BO->B.O, SO->S.O, HO->H.O, MDG->M.D.G
    name = re.sub(r'\bBO\b', 'B.O', name)
    name = re.sub(r'\bSO\b', 'S.O', name)
    name = re.sub(r'\bHO\b', 'H.O', name)
    name = re.sub(r'\bMDG\b', 'M.D.G', name)
    return name

def fetch_post_office(office_name):
    """Call India Post API and return first matching record."""
    query = urllib.parse.quote(office_name)
    url = f"https://www.indiapost.gov.in/post-office-details-name?officename={query}"

    data = f'["GET_POSTOFFICE_BY_NAME","GET",null,"office-name={urllib.parse.quote_plus(office_name)}&limit=0"]'
    data_bytes = data.encode("utf-8")

    req = urllib.request.Request(url, data=data_bytes, method="POST")
    req.add_header("Accept", "text/x-component")
    req.add_header("Accept-Language", "en-US,en;q=0.9")
    req.add_header("Content-Type", "text/plain;charset=UTF-8")
    req.add_header("Origin", "https://www.indiapost.gov.in")
    req.add_header("Referer", url)
    req.add_header("next-action", "7f04c72a185756a3940501a7996e6b83e2a72a488e")
    req.add_header("next-router-state-tree", '%5B%22%22%2C%7B%22children%22%3A%5B%22(controller)%22%2C%7B%22children%22%3A%5B%22(home)%22%2C%7B%22children%22%3A%5B%22post-office-details-name%22%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%2Cnull%2Cnull%5D%7D%2Cnull%2Cnull%5D%7D%2Cnull%2Cnull%5D%7D%2Cnull%2Cnull%5D%7D%2Cnull%2Cnull%2Ctrue%5D')
    req.add_header("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36")
    req.add_header("sec-ch-ua", '"Google Chrome";v="149", "Chromium";v="149", "Not)A;Brand";v="24"')
    req.add_header("sec-ch-ua-mobile", "?0")
    req.add_header("sec-ch-ua-platform", '"macOS"')
    req.add_header("Sec-Fetch-Dest", "empty")
    req.add_header("Sec-Fetch-Mode", "cors")
    req.add_header("Sec-Fetch-Site", "same-origin")
    req.add_header("Cookie", "session_visited=true")

    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            raw = resp.read().decode("utf-8")
        # Response is two lines: line 0 is metadata, line 1 has the data JSON
        for line in raw.splitlines():
            if line.startswith("1:"):
                payload = json.loads(line[2:])
                if payload.get("success") and payload.get("data"):
                    return payload["data"]
    except Exception as e:
        print(f"    ERROR fetching '{office_name}': {e}")
    return []

def best_match(records, pincode_hint):
    """Pick the record whose pincode matches the hint, else first record."""
    for r in records:
        if str(r.get("pincode", "")) == str(pincode_hint):
            return r
    return records[0] if records else None

def extract_pincode(post_office_str):
    m = re.search(r'(\d{6})$', post_office_str.strip())
    return m.group(1) if m else ""

def main():
    results = []
    for item in PLACES:
        po_full = item["post_office"]
        office_name = parse_office_name(po_full)
        pincode = extract_pincode(po_full)
        print(f"[{item['sno']:3d}/100] Fetching: {office_name} ...")

        records = fetch_post_office(office_name)
        rec = best_match(records, pincode)

        row = {
            "sno": item["sno"],
            "district": item["district"],
            "place": item["place"],
            "category": item["category"],
            "post_office": po_full,
            "office_name_queried": office_name,
            "pincode": pincode,
            "latitude": None,
            "longitude": None,
            "office_type": None,
            "address": None,
            "state": None,
            "api_status": "not_found",
        }

        if rec:
            row["latitude"] = rec.get("latitude")
            row["longitude"] = rec.get("longitude")
            row["office_type"] = rec.get("office_type_code")
            addr_parts = [rec.get("office_address1",""), rec.get("office_address2",""), rec.get("city_name","")]
            row["address"] = ", ".join(p for p in addr_parts if p)
            row["state"] = rec.get("state_name")
            row["api_status"] = "found" if rec.get("latitude") else "no_coords"
            print(f"         -> lat={rec.get('latitude')}, lon={rec.get('longitude')}")
        else:
            print(f"         -> NOT FOUND")

        results.append(row)
        time.sleep(0.4)  # polite rate limiting

    out_path = "data/places_with_locations.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    print(f"\nSaved {len(results)} records to {out_path}")

    found = sum(1 for r in results if r["api_status"] == "found")
    no_coords = sum(1 for r in results if r["api_status"] == "no_coords")
    not_found = sum(1 for r in results if r["api_status"] == "not_found")
    print(f"Summary: {found} with coords | {no_coords} found but no coords | {not_found} not found")

if __name__ == "__main__":
    main()
