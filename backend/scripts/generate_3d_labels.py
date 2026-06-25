"""One-off: turn each Complex (Red) medication-label source image into a
photorealistic 3D product render using Gemini Nano Banana, and save PNGs
to /app/frontend/public/renders/ so the activity can use them as-is.

Usage:
    cd /app/backend && python scripts/generate_3d_labels.py
"""
import asyncio
import base64
import os
import sys
import urllib.request
from pathlib import Path

from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent

ROOT = Path(__file__).resolve().parents[2]
ENV_FILE = ROOT / "backend" / ".env"
OUT_DIR = ROOT / "frontend" / "public" / "renders"
OUT_DIR.mkdir(parents=True, exist_ok=True)

load_dotenv(ENV_FILE)
API_KEY = os.getenv("EMERGENT_LLM_KEY")
if not API_KEY:
    print("ERROR: EMERGENT_LLM_KEY missing from backend/.env")
    sys.exit(1)

# Source images: (slug, url, product_kind, brand_name)
LABELS = [
    (
        "red-1-relievex",
        "https://customer-assets.emergentagent.com/job_concentric-hub/artifacts/4krdfa9v_1.2%20Reading%20Medication%20Labels%20RED%201.png",
        "rectangular cardboard medicine box (paracetamol/ibuprofen style)",
        "Relievex extra (Ibuprofen 200mg tablets)",
    ),
    (
        "red-2-paxolin",
        "https://customer-assets.emergentagent.com/job_concentric-hub/artifacts/xhto3gc8_1.2%20Reading%20Medication%20Labels%20RED%202.png",
        "rectangular cardboard medicine box (paracetamol)",
        "Paxolin (Paracetamol 500mg tablets)",
    ),
    (
        "red-3-allergex",
        "https://customer-assets.emergentagent.com/job_concentric-hub/artifacts/f96bdc7k_1.2%20Reading%20Medication%20Labels%20RED%203.png",
        "rectangular cardboard medicine box (allergy tablets)",
        "Allergex (Cetirizine 10mg tablets)",
    ),
    (
        "red-4-rexazid",
        "https://customer-assets.emergentagent.com/job_concentric-hub/artifacts/cszaqqys_1.2%20Reading%20Medication%20Labels%20RED%204.png",
        "rectangular cardboard medicine box (heartburn/indigestion tablets)",
        "Rexazid (Ranitidine 75mg tablets)",
    ),
    (
        "red-5-throatmin",
        "https://customer-assets.emergentagent.com/job_concentric-hub/artifacts/7ml07fi1_1.2%20Reading%20Medication%20Labels%20RED%205.png",
        "rectangular cardboard medicine box (throat lozenges)",
        "Throatmin Honey & Lemon lozenges",
    ),
    (
        "red-6-throatease",
        "https://customer-assets.emergentagent.com/job_concentric-hub/artifacts/cqcxevl3_1.2%20Reading%20Medication%20Labels%20RED%206.png",
        "white glossy plastic 150ml liquid medicine bottle with white screw cap and a deep blue wrap-around label, accompanied by a small clear plastic measuring cup (showing 5/10/15/20 ml markings) sitting beside the bottle",
        "Throatease Night Dry Cough Linctus 150ml",
    ),
    (
        "red-7-reguloxin",
        "https://customer-assets.emergentagent.com/job_concentric-hub/artifacts/l57t7cri_1.2%20Reading%20Medication%20Labels%20RED%207.png",
        "white glossy plastic tablet bottle with white screw cap and a cream-coloured rectangular label with a slim olive-green border bar on the left edge",
        "Reguloxin Senna 7.5mg tablets (20 Tablets)",
    ),
    (
        "red-8-ferrovex",
        "https://customer-assets.emergentagent.com/job_concentric-hub/artifacts/60way2x8_1.2%20Reading%20Medication%20Labels%20RED%208.png",
        "white glossy plastic tablet bottle with white screw cap and a beige/cream rectangular label",
        "Ferrovex Iron Supplement Ferrous Sulfate tablets (20 Tablets)",
    ),
    (
        "red-9-voyagex",
        "https://customer-assets.emergentagent.com/job_concentric-hub/artifacts/vrt1f35n_1.2%20Reading%20Medication%20Labels%20RED%209.png",
        "white glossy plastic tablet bottle with white screw cap and a pale blue rectangular label",
        "Voyagex Cinnarizine 15mg travel sickness tablets (12 tablets)",
    ),
    (
        "red-10-derminex",
        "https://customer-assets.emergentagent.com/job_concentric-hub/artifacts/hb5o4wuq_1.2%20Reading%20Medication%20Labels%20RED%2010.png",
        "white glossy plastic short wide cream JAR with a flat round lid and a pale lavender/white rectangular front label",
        "Derminex Antiseptic Cream",
    ),
]

PROMPT_TEMPLATE = (
    "Transform the medication package artwork shown in the reference image into a "
    "PHOTOREALISTIC 3D PRODUCT RENDER of a {kind} for {brand}.\n\n"
    "CRITICAL TEXT FIDELITY: Reproduce EVERY word, letter, number, and punctuation "
    "mark on the box EXACTLY as it appears in the source. Do NOT introduce typos, "
    "misspellings, abbreviations, or paraphrases. Do NOT drop letters from words. "
    "Pay extra attention to brand names and body text. The text below MUST appear "
    "on the rendered box, spelled precisely as written here:\n"
    "{exact_text}\n\n"
    "REMOVE the outer worksheet elements from the source: the 'Reading "
    "Prescription/Medication Labels' header at the top, the three red dots, the "
    "'Questions:' list below, and any 'Copyright SLP Blueprint' footer. The final "
    "image should contain ONLY the medication box product render — nothing else.\n\n"
    "STYLE: Professional studio product shot. Slight 3/4 perspective view "
    "(about 15 degrees rotation so depth is visible). Realistic surface material "
    "appropriate to the {kind} — matte cardboard with subtle paper grain for boxes, "
    "smooth glossy plastic with soft highlights for bottles and jars. Soft top-left "
    "key light with a gentle fill. A subtle soft contact shadow beneath the "
    "product. Clean light-grey seamless studio backdrop (#F0F0F2). Crisp, fully "
    "legible text. Realistic depth and volume. No reflections on the floor. "
    "Centered composition with generous padding around the product. Square output."
)


EXACT_TEXT = {
    "red-1-relievex": (
        "BRAND: 'Relievex extra' (orange italic script, spelled exactly R-E-L-I-E-V-E-X). "
        "Subtitle: 'Extra Strength Pain Relief'. Title: 'IBUPROFEN 200MG TABLETS'. "
        "Body: 'For the temporary relief of pain associated with headache, toothache, "
        "period pain, muscle aches, and for the reduction of fever.' "
        "'Directions Adults and children over 12 years: Take 2 tablets every 6 hours "
        "with water. Do not exceed 6 tablets in 24 hours. Take with or after food.' "
        "'Caution Do not give to children under 12 years of age. Do not take for "
        "longer than 3 days for fever or 10 days for pain without speaking to your "
        "doctor.' Storage panel (yellow rounded): 'Store below 25C in a dry place. "
        "Keep out of reach of children.' Warning block with yellow triangle: 'Warning "
        "Stop taking and see a doctor if you experience stomach pain, black stools, or "
        "vomit that looks like coffee grounds.' Barcode number under barcode: "
        "'1122334455667'."
    ),
    "red-2-paxolin": (
        "BRAND: 'Paxolin' (light pink, written vertically along the right edge). "
        "Title: 'PARACETAMOL 500MG TABLETS'. Body: 'For the temporary relief of mild "
        "to moderate pain, including headache, muscle pain, period pain, and "
        "toothache. Also for the reduction of fever associated with colds and flu.' "
        "'Directions Adults and children over 16 years: Take 1 or 2 tablets every 4 "
        "to 6 hours when needed. Do not take more than 8 tablets in 24 hours. Wait at "
        "least 4 hours between doses. Children aged 12 to 15 years: Take 1 tablet "
        "every 4 to 6 hours. Do not exceed 4 tablets in 24 hours.' 'Caution Do not "
        "take with any other medicine containing paracetamol. Many cold and flu "
        "remedies contain paracetamol. Taking too much paracetamol can cause serious "
        "liver damage.' 'If Symptoms Persist Speak to your doctor or pharmacist if "
        "pain or fever does not improve after 3 days.'"
    ),
    "red-3-allergex": (
        "BRAND: 'ALLERGEX' (large uppercase brown wordmark, right side). "
        "Title: 'CETIRIZINE 10MG TABLETS'. Left column body: 'For the relief of "
        "symptoms of hay fever and other allergies, including sneezing, runny nose, "
        "itchy eyes, and skin rashes.' 'Directions Adults and children over 12 "
        "years: Take 1 tablet once a day, preferably in the evening. Swallow whole "
        "with water. Children aged 6 to 12 years: Take half a tablet twice a day.' "
        "'Speak to Your Doctor If Symptoms do not improve after 7 days, or if you "
        "develop a rash or swelling of the face or throat.' Right column body: "
        "'Caution this medication may cause drowsiness in some people. Do not drive "
        "or operate machinery until you know how this medicine affects you. Avoid "
        "alcohol while taking this medication.' 'Storage Store below 30C. Keep in the "
        "original packaging until needed.'"
    ),
    "red-4-rexazid": (
        "BRAND: 'rexazid' (green stylized lowercase). Top-right tag: orange barcode "
        "tag with number '011452364'. Subtitle: 'For the short-term relief of "
        "heartburn, indigestion, and acid reflux.' Title: 'RANITIDINE 75MG TABLETS'. "
        "Body: 'Directions Adults and children over 16 years: Take 1 tablet when "
        "symptoms start. If symptoms continue, take another tablet after 1 hour. Do "
        "not take more than 4 tablets in 24 hours. Do not take for more than 2 weeks "
        "without speaking to your doctor.' 'Caution This product is not suitable for "
        "children under 16 years. Speak to Your Doctor If: You have unintentionally "
        "lost weight, you have difficulty swallowing, your symptoms continue for "
        "more than 2 weeks, and/or you vomit blood or pass black stools' 'Storage "
        "Store below 25C. Keep out of reach of children.' 'Warning If you have chest "
        "pain that spreads to your arm, neck, or jaw, or you have difficulty "
        "breathing, stop taking this medication and seek urgent medical advice.' "
        "IMPORTANT: spell every word fully — 'symptoms' not 'symptm', 'stools' not "
        "'stoots', 'seek' not 'seak'."
    ),
    "red-5-throatmin": (
        "Title: 'Throatmin Honey & Lemon' (large bold black). Pill blister icon left "
        "of title (showing yellow tablets). Body: 'For the relief of sore throats and "
        "minor mouth infections in adults and children over 6 years.' 'Directions "
        "Adults and children over 6 years: Suck 1 lozenge slowly. Repeat every 2 to "
        "3 hours as needed. Do not take more than 8 lozenges in 24 hours. Do not "
        "chew or swallow whole.' 'Caution Do not use for more than 3 days in a row. "
        "Avoid giving to children under 6 years of age.' 'Warning Contains sugar. "
        "Not suitable for people with diabetes unless advised by a doctor.' "
        "'Ingredients: Active ingredient: Hexylresorcinol 2.5mg. Other ingredients: "
        "Glucose syrup, sucrose, honey, lemon oil, citric acid, menthol, water.'"
    ),
    "red-6-throatease": (
        "Label brand at top of wrap-around blue label: 'THROATEASE NIGHT' with a "
        "small white stylised throat icon. Heading on label: 'DRY COUGH LINCTUS'. "
        "Intro (white text on blue): 'FOR THE SHORT-TERM RELIEF OF A DRY, IRRITATING "
        "COUGH IN ADULTS AND CHILDREN OVER 12 YEARS.' 'Directions Adults and children "
        "over 12 years: Take 10ml every 4 hours. Do not take more than 4 doses in 24 "
        "hours. Use the measuring spoon provided. Do not use a kitchen spoon as the "
        "dose may be incorrect.' 'Caution This medication may cause drowsiness. Do "
        "not drive or operate machinery after taking. Avoid alcohol while taking "
        "this medication.' 'Storage Store below 25C. Discard 28 days after opening. "
        "Keep out of reach of children.' 'Speak to your doctor if cough lasts for "
        "more than 7 days, cough produces thick or coloured mucus, your fever does "
        "not improve.' Bottom-right corner of label: '150ML'. Beside the bottle is a "
        "small clear measuring cup with markings 20 ml / 15 ml / 10 ml / 5 ml."
    ),
    "red-7-reguloxin": (
        "Brand (handwritten black script, top-left of cream label): 'Reguloxin'. "
        "Right of brand (three lines, italic): 'Gentle Overnight Relief from "
        "Constipation'. Active ingredient: 'Senna 7.5mg'. Intro: 'For the short-term "
        "relief of occasional constipation in adults and children over 12 years.' "
        "'Directions Adults and children over 12 years: Take 1 to 2 tablets at "
        "bedtime with a glass of water. This medication usually works within 8 to 12 "
        "hours, so take it the night before you expect to need it. Do not take for "
        "longer than 7 days without speaking to your doctor.' 'Caution Drink plenty "
        "of water during the day while taking this medication. Do not take if you "
        "have severe stomach pain, nausea, or vomiting.' 'Speak to Your Doctor If: "
        "you need to use laxatives every day, your constipation lasts more than 7 "
        "days, you notice blood in your stools or you have a sudden change in bowel "
        "habit'. 'Store below 25C. Keep out of reach of children.' Warning row with "
        "yellow warning triangle: 'Do not take more than the recommended dose. Using "
        "this medicine for too long can damage your bowel.' Bottom-right of label: "
        "'20 Tablets'."
    ),
    "red-8-ferrovex": (
        "Top-left of label: a small periodic-table-style 'Fe' tile with the number "
        "'26' top-left, atomic mass '55.847' below. Top-right brand (handwritten "
        "black italic script): 'Ferrovex'. Below brand: 'Iron Supplement for Low "
        "Iron Levels'. Body: 'For the prevention and treatment of iron deficiency in "
        "adults. Directions Take 1 tablet, three times a day. Swallow with a full "
        "glass of water on an empty stomach, at least 1 hour before food or 2 hours "
        "after food. Take with orange juice or a vitamin C supplement to help "
        "absorption.' 'Caution This medication may cause black stools. This is "
        "normal and not a cause for concern. Do not take within 2 hours of antacids, "
        "tea, coffee, or dairy products, as these can reduce how well the iron is "
        "absorbed.' 'Contains lactose. Not suitable if you have a lactose "
        "intolerance.' 'Speak to Your Doctor If: You experience severe stomach pain, "
        "develop constipation that does not improve, you are still feeling very "
        "tired after 4 weeks' 'Store below 25C. Keep lid tightly closed. Keep out of "
        "reach of children.' 'Warning Keep this medication well out of reach of "
        "children. Accidental overdose of iron tablets is a leading cause of "
        "poisoning in young children.' 'Ingredients: Ferrous Sulfate, "
        "Microcrystalline cellulose, lactose monohydrate, maize starch, magnesium "
        "stearate, talc, titanium dioxide, sucrose, gelatin, yellow iron oxide.' "
        "Bottom-right: '20 Tablets'."
    ),
    "red-9-voyagex": (
        "Top-left of label: small blue circular logo showing a stylised aeroplane "
        "icon. Top-centre brand (large dark blue sans-serif): 'Voyagex'. Below: "
        "'Prevention of Travel Sickness'. Top-right of label: '12 tablets' with a "
        "small dashed swoosh decoration. Body: 'For the prevention of travel "
        "sickness in adults and children over 12 years. Helps reduce nausea, "
        "dizziness, and vomiting caused by car, boat, plane, or train travel.' "
        "'Directions Adults and children over 12 years: Take 2 tablets 30 minutes "
        "before travel. Then take 1 tablet every 8 hours during travel if needed. "
        "Do not take more than 4 tablets in 24 hours.' 'Caution This medication may "
        "cause drowsiness. Do not drive or operate machinery after taking. Avoid "
        "alcohol while taking this medication.' 'Warning Because this medication "
        "causes drowsiness, you should not take it if you are driving. Ask another "
        "adult to drive, or wait until you are no longer travelling yourself as the "
        "driver.' 'Ingredients: Cinnarizine, lactose monohydrate, maize starch, "
        "magnesium stearate, talc, povidone.' Bottom-left: a small horizontal "
        "barcode. Bottom-right: 'Cinnarizine 15mg'."
    ),
    "red-10-derminex": (
        "Top-left of label (bold black serif/slab): 'Derminex'. To the right of the "
        "brand: 'Antiseptic Cream' (italic). Below that: 'For Minor Cuts, Grazes, "
        "and Insect Bites' (italic). 'Directions Clean the affected area with water "
        "and dry gently before use. Apply a thin layer to the affected area, up to "
        "three times a day. Wash your hands after applying.' 'Caution For external "
        "use only. Do not swallow. Avoid contact with the eyes, mouth, and inside "
        "of the nose. Do not apply to large open wounds, deep burns, or broken "
        "skin. Do not cover with a bandage unless advised by a doctor.' 'Warning If "
        "the skin becomes red, swollen, or more painful after using this cream, "
        "stop using it and wash the area with water.' The label has a thin black "
        "rectangular frame around it."
    ),
}


def fetch_bytes(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": "soniva-renderer/1.0"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read()


async def generate_one(slug: str, url: str, kind: str, brand: str) -> Path:
    out_path = OUT_DIR / f"{slug}.png"
    print(f"\n→ {slug} ({brand})")
    print(f"  fetching source: {url[:70]}…")
    src = fetch_bytes(url)
    src_b64 = base64.b64encode(src).decode("utf-8")

    chat = (
        LlmChat(api_key=API_KEY, session_id=f"render-{slug}", system_message="You are a photorealistic product visualisation engine.")
        .with_model("gemini", "gemini-3.1-flash-image-preview")
        .with_params(modalities=["image", "text"])
    )

    prompt = PROMPT_TEMPLATE.format(
        kind=kind,
        brand=brand,
        exact_text=EXACT_TEXT.get(slug, ""),
    )
    msg = UserMessage(text=prompt, file_contents=[ImageContent(src_b64)])

    print("  calling Nano Banana…")
    text, images = await chat.send_message_multimodal_response(msg)
    if text:
        print(f"  text: {text[:120]}")
    if not images:
        raise RuntimeError(f"no image returned for {slug}")

    img = images[0]
    img_bytes = base64.b64decode(img["data"])
    out_path.write_bytes(img_bytes)
    print(f"  saved → {out_path}  ({len(img_bytes) // 1024} KB)")
    return out_path


async def main() -> None:
    only = os.environ.get("ONLY")  # e.g. ONLY=red-1-relievex
    for slug, url, kind, brand in LABELS:
        if only and slug != only:
            continue
        try:
            await generate_one(slug, url, kind, brand)
        except Exception as exc:  # noqa: BLE001
            print(f"  FAILED: {exc!r}")


if __name__ == "__main__":
    asyncio.run(main())
