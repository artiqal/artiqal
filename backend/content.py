"""Curated static content for Concentric activities."""

CATEGORIES = [
    {
        "slug": "reading",
        "name": "Reading",
        "tagline": "Receipts, medication labels, and forms",
        "color": "#0EA5E9",
        "icon": "BookOpen",
        "description": "Practice reading everyday things you encounter at home and in the community.",
    },
    {
        "slug": "writing",
        "name": "Writing",
        "tagline": "Forms, messages, sentences",
        "color": "#F97316",
        "icon": "Pencil",
        "description": "Practice writing short messages, filling forms, and composing sentences.",
    },
    {
        "slug": "word-finding",
        "name": "Word Finding",
        "tagline": "Naming, cueing, associations",
        "color": "#10B981",
        "icon": "Search",
        "description": "Find the right word with cueing, naming, and association exercises.",
    },
    {
        "slug": "auditory-comprehension",
        "name": "Auditory Comprehension",
        "tagline": "Instructions and questions",
        "color": "#8B5CF6",
        "icon": "Music2",
        "description": "Listen to instructions and questions, then choose the right answer.",
    },
    {
        "slug": "functional-communication",
        "name": "Functional Tasks",
        "tagline": "Real-world conversations and everyday practice",
        "color": "#F59E0B",
        "icon": "MessagesSquare",
        "description": "Real-world conversations and everyday communication practice.",
    },
    {
        "slug": "sfa-therapy",
        "name": "SFA Therapy Tool",
        "tagline": "Semantic Feature Analysis",
        "color": "#F43F5E",
        "icon": "Brain",
        "description": "Build word retrieval by exploring features: group, use, action, location, properties, association.",
    },
    {
        "slug": "all-activities",
        "name": "All Activities",
        "tagline": "Browse everything",
        "color": "#4F46E5",
        "icon": "LayoutGrid",
        "description": "Browse the full library of Concentric activities.",
    },
]


# Activity content. Each activity includes content blocks the frontend renders.
ACTIVITIES_BY_CATEGORY = {
    "reading": [
        {
            "slug": "receipt",
            "title": "Reading a Receipt",
            "summary": "Read a grocery store receipt and answer questions.",
            "duration_min": 5,
            "type": "reading",
            "content": {
                "text": (
                    "GREEN MARKET\n"
                    "123 Main Street\n"
                    "------------------------\n"
                    "Bananas        $1.20\n"
                    "Whole milk     $3.49\n"
                    "Bread          $2.99\n"
                    "Cheese         $4.50\n"
                    "Apples (3)     $2.10\n"
                    "------------------------\n"
                    "Subtotal      $14.28\n"
                    "Tax            $1.14\n"
                    "TOTAL         $15.42\n"
                    "Cash paid     $20.00\n"
                    "Change         $4.58\n"
                    "Thank you!"
                ),
                "questions": [
                    {"q": "What is the total?", "options": ["$14.28", "$15.42", "$20.00"], "answer": 1},
                    {"q": "How much was the bread?", "options": ["$2.99", "$3.49", "$4.50"], "answer": 0},
                    {"q": "What store is this from?", "options": ["Green Market", "Main Bakery", "Apple Store"], "answer": 0},
                ],
            },
        },
        {
            "slug": "medication-package",
            "title": "Medication Package Reading",
            "summary": "Read a medication label and answer questions about dose and timing.",
            "duration_min": 5,
            "type": "reading",
            "content": {
                "text": (
                    "ACETA-500\n"
                    "Pain & Fever Relief\n"
                    "Each tablet: 500 mg acetaminophen\n\n"
                    "Dose: 1 to 2 tablets every 6 hours.\n"
                    "Do NOT take more than 8 tablets in 24 hours.\n"
                    "Take with a glass of water.\n"
                    "Warning: Do not drink alcohol while taking this medicine.\n"
                    "Keep out of reach of children.\n"
                    "Store at room temperature."
                ),
                "questions": [
                    {"q": "How many tablets is one dose?", "options": ["1 to 2", "3 to 4", "5"], "answer": 0},
                    {"q": "How often can you take it?", "options": ["Every 1 hour", "Every 6 hours", "Once a week"], "answer": 1},
                    {"q": "What should you NOT do?", "options": ["Drink water", "Drink alcohol", "Read the label"], "answer": 1},
                ],
            },
        },
        {
            "slug": "patient-form",
            "title": "Reading a Patient Form",
            "summary": "Read a short medical form and find key facts.",
            "duration_min": 6,
            "type": "reading",
            "content": {
                "text": (
                    "PATIENT INTAKE FORM\n"
                    "Name: Sara Chen\n"
                    "Date of birth: 04/12/1962\n"
                    "Address: 88 Oak Lane\n"
                    "Phone: (555) 204-7781\n"
                    "Allergies: Penicillin\n"
                    "Current medications: Lisinopril 10 mg\n"
                    "Emergency contact: Mark Chen (555) 204-7780"
                ),
                "questions": [
                    {"q": "Who is the patient?", "options": ["Mark Chen", "Sara Chen", "Dr. Oak"], "answer": 1},
                    {"q": "What is she allergic to?", "options": ["Aspirin", "Penicillin", "Peanuts"], "answer": 1},
                    {"q": "What medicine does she take?", "options": ["Lisinopril", "Tylenol", "Ibuprofen"], "answer": 0},
                ],
            },
        },
        {
            "slug": "ai-scenario",
            "title": "AI Practice Scenario",
            "summary": "Generate a fresh receipt, label, or form with AI.",
            "duration_min": 5,
            "type": "ai-reading",
            "content": {
                "options": [
                    {"key": "receipt", "label": "Grocery Receipt"},
                    {"key": "medication", "label": "Medication Label"},
                    {"key": "form", "label": "Patient Form"},
                ],
            },
        },
    ],
    "writing": [
        {
            "slug": "short-message",
            "title": "Write a Short Message",
            "summary": "Write a short message to a friend.",
            "duration_min": 5,
            "type": "writing",
            "content": {
                "prompt": "Write a short message to a friend telling them you arrived home safely.",
                "starter": "Hi ____, I am",
            },
        },
        {
            "slug": "complete-sentence",
            "title": "Complete the Sentence",
            "summary": "Finish each sentence with your own words.",
            "duration_min": 4,
            "type": "writing",
            "content": {
                "items": [
                    "Today I feel ____.",
                    "For breakfast I ate ____.",
                    "After lunch I will ____.",
                    "My favourite season is ____ because ____.",
                ],
            },
        },
        {
            "slug": "fill-form",
            "title": "Fill a Sign-up Form",
            "summary": "Practice writing your information into a form.",
            "duration_min": 6,
            "type": "writing",
            "content": {
                "fields": [
                    {"label": "First name"},
                    {"label": "Last name"},
                    {"label": "Date of birth"},
                    {"label": "Phone number"},
                    {"label": "Address"},
                    {"label": "Emergency contact"},
                ],
            },
        },
    ],
    "word-finding": [
        {
            "slug": "naming",
            "title": "Name the Picture",
            "summary": "Look at a description and name the object.",
            "duration_min": 5,
            "type": "naming",
            "content": {
                "items": [
                    {"clue": "You wear it on your head when it is sunny.", "answer": "hat"},
                    {"clue": "You sit on it.", "answer": "chair"},
                    {"clue": "You drink hot coffee from it.", "answer": "mug"},
                    {"clue": "It tells the time on your wrist.", "answer": "watch"},
                    {"clue": "You write with it.", "answer": "pen"},
                ],
            },
        },
        {
            "slug": "category-cueing",
            "title": "Category Cueing",
            "summary": "Name three things in each category.",
            "duration_min": 4,
            "type": "list",
            "content": {
                "categories": [
                    "Fruits",
                    "Animals at the zoo",
                    "Things in the kitchen",
                    "Clothing",
                    "Things that are red",
                ],
            },
        },
        {
            "slug": "associations",
            "title": "Word Associations",
            "summary": "Pick the word that goes with the prompt.",
            "duration_min": 4,
            "type": "mcq",
            "content": {
                "items": [
                    {"q": "Bread and ___", "options": ["butter", "shoe", "sky"], "answer": 0},
                    {"q": "Salt and ___", "options": ["pepper", "rain", "blue"], "answer": 0},
                    {"q": "Knife and ___", "options": ["lamp", "fork", "pillow"], "answer": 1},
                    {"q": "Dog and ___", "options": ["book", "cat", "fan"], "answer": 1},
                ],
            },
        },
    ],
    "auditory-comprehension": [
        {
            "slug": "follow-instructions",
            "title": "Follow the Instructions",
            "summary": "Listen and choose the picture or word that matches.",
            "duration_min": 5,
            "type": "mcq",
            "content": {
                "items": [
                    {"q": "Point to the thing you read.", "options": ["book", "spoon", "shoe"], "answer": 0},
                    {"q": "Choose the thing that gives light.", "options": ["lamp", "rug", "cup"], "answer": 0},
                    {"q": "Choose the thing that flies.", "options": ["bird", "fish", "tree"], "answer": 0},
                ],
            },
        },
        {
            "slug": "yes-no",
            "title": "Yes or No?",
            "summary": "Listen to a short statement and answer yes or no.",
            "duration_min": 4,
            "type": "yesno",
            "content": {
                "items": [
                    {"q": "A dog is an animal.", "answer": True},
                    {"q": "Ice is hot.", "answer": False},
                    {"q": "We sleep at night.", "answer": True},
                    {"q": "A bicycle has wings.", "answer": False},
                ],
            },
        },
    ],
    "functional-communication": [
        {
            "slug": "appointment-letter",
            "title": "Reading an Appointment Letter",
            "summary": "Read a clinic appointment letter and answer questions. Choose your difficulty.",
            "duration_min": 20,
            "type": "reading-leveled",
            "content": {
                "levels": {
                    "green": {
                        "key": "green",
                        "title": "Foundational",
                        "blurb": "10 short appointment letters with three retrieval questions targeting who, what, when, and where.",
                        "best_for": "Clients who can read short sentences and are working on finding key information within a simple page.",
                        "questions_per_letter": 3,
                        "target_letter_count": 10,
                        "est_minutes": "10–15 min",
                        "letters": [
                            {
                                "id": 1,
                                "title": "Check-up Reminder",
                                "summary": "A short reminder letter from a GP clinic.",
                                "letterhead": {
                                    "clinic_name": "Orion Medical",
                                    "tagline": "Health Begins Here",
                                    "logo": "orion",
                                    "address_lines": [
                                        "123 Orion Road",
                                        "Burnford, BR1 2AB",
                                    ],
                                    "phone": "01632 960001",
                                    "website": "www.orionmedical.org",
                                    "recipient_lines": [
                                        "Ms N. Example",
                                        "45 Willow Close",
                                        "Burnford, BR2 7QL",
                                    ],
                                    "date": "15 May",
                                    "greeting": "Dear Mr/Ms Example,",
                                    "body": [
                                        "This is a reminder of your check-up with Dr Bennett.",
                                        "Your appointment is on 15 May at 10:30 AM.",
                                        "Please check in at reception when you arrive.",
                                    ],
                                    "signoff": ["Kind regards,", "Orion Medical"],
                                    "accent_color": "#F97316",
                                },
                                "text": (
                                    "Orion Medical — Health Begins Here\n"
                                    "123 Orion Road, Burnford, BR1 2AB\n"
                                    "Tel: 01632 960001\n\n"
                                    "Date: 15 May\n\n"
                                    "Dear Mr/Ms Example,\n\n"
                                    "This is a reminder of your check-up with Dr Bennett.\n"
                                    "Your appointment is on 15 May at 10:30 AM.\n"
                                    "Please check in at reception when you arrive.\n\n"
                                    "Kind regards,\n"
                                    "Orion Medical"
                                ),
                                "questions": [
                                    {
                                        "q": "Who is the appointment with?",
                                        "options": ["Dr Bennett", "Dr Orion", "Reception"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "What date is the appointment?",
                                        "options": ["5 May", "15 May", "25 May"],
                                        "answer": 1,
                                    },
                                    {
                                        "q": "What time is the appointment?",
                                        "options": ["9:30 AM", "10:30 AM", "11:30 AM"],
                                        "answer": 1,
                                    },
                                ],
                            },
                            {
                                "id": 2,
                                "title": "Medication Review",
                                "summary": "A short reminder letter from Maple St Health Centre.",
                                "letterhead": {
                                    "clinic_name": "Maple St Health Centre",
                                    "tagline": "",
                                    "address_lines": [
                                        "8 Maple Street",
                                        "Northleigh, NL4 3HT",
                                    ],
                                    "phone": "01632 960112",
                                    "recipient_lines": [
                                        "Mr J. Sample",
                                        "2 Rowan Court",
                                        "Northleigh, NL5 2AB",
                                    ],
                                    "date": "3 June",
                                    "greeting": "Dear Mr/Ms Sample,",
                                    "body": [
                                        "You have a medication review booked with Dr Khan.",
                                        "The appointment is on 3 June at 11:15 AM.",
                                        "Please bring your current medication with you.",
                                    ],
                                    "signoff": ["Kind regards,", "Maple St Health Centre"],
                                    "accent_color": "#2C5F7C",
                                    "variant": "maple",
                                },
                                "text": (
                                    "Maple St Health Centre\n"
                                    "8 Maple Street, Northleigh, NL4 3HT\n"
                                    "Tel: 01632 960112\n\n"
                                    "Date: 3 June\n\n"
                                    "Dear Mr/Ms Sample,\n\n"
                                    "You have a medication review booked with Dr Khan.\n"
                                    "The appointment is on 3 June at 11:15 AM.\n"
                                    "Please bring your current medication with you.\n\n"
                                    "Kind regards,\n"
                                    "Maple St Health Centre"
                                ),
                                "questions": [
                                    {
                                        "q": "What is the appointment for?",
                                        "options": ["A medication review", "An eye test", "A blood test"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "When is the appointment?",
                                        "options": ["3 June at 11:15 AM", "13 June at 11:15 AM", "3 July at 11:15 AM"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "What should you bring with you?",
                                        "options": ["Your current medication", "A urine sample", "A list of questions"],
                                        "answer": 0,
                                    },
                                ],
                            },
                            {
                                "id": 3,
                                "title": "Dental Check-up",
                                "summary": "A reminder letter from Westside Dental Practice.",
                                "letterhead": {
                                    "clinic_name": "Westside Dental Practice",
                                    "tagline": "",
                                    "address_lines": [
                                        "19 Orchard Lane",
                                        "Westbridge, WB3 6JP",
                                    ],
                                    "phone": "01632 960245",
                                    "recipient_lines": [
                                        "Ms L. Example",
                                        "Flat 2",
                                        "7 Hilltop View",
                                        "Westbridge, WB2 1KD",
                                    ],
                                    "date": "22 April",
                                    "greeting": "Dear Mr/Ms Example,",
                                    "body": [
                                        "This is a reminder of your dental check-up with Dr Carter.",
                                        "Your appointment is on 22 April at 9:00 AM.",
                                        "Please arrive a few minutes early.",
                                    ],
                                    "signoff": ["Kind regards,", "Westside Dental Practice"],
                                    "accent_color": "#2563EB",
                                    "variant": "westside",
                                },
                                "text": (
                                    "Westside Dental Practice\n"
                                    "19 Orchard Lane, Westbridge, WB3 6JP\n"
                                    "Tel: 01632 960245\n\n"
                                    "Date: 22 April\n\n"
                                    "Dear Mr/Ms Example,\n\n"
                                    "This is a reminder of your dental check-up with Dr Carter.\n"
                                    "Your appointment is on 22 April at 9:00 AM.\n"
                                    "Please arrive a few minutes early.\n\n"
                                    "Kind regards,\n"
                                    "Westside Dental Practice"
                                ),
                                "questions": [
                                    {
                                        "q": "Who is the appointment with?",
                                        "options": ["Dr Carter", "Dr Khan", "Dr Bennett"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "What is the appointment for?",
                                        "options": ["A dental check-up", "An eye test", "A medication review"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "What date is the appointment?",
                                        "options": ["12 April", "22 April", "22 August"],
                                        "answer": 1,
                                    },
                                ],
                            },
                            {
                                "id": 4,
                                "title": "Eye Test",
                                "summary": "A reminder letter from Clearview Opticians.",
                                "letterhead": {
                                    "clinic_name": "Clearview Opticians",
                                    "tagline": "",
                                    "address_lines": [
                                        "21 Market Square",
                                        "Westbridge, WB4 2FP",
                                    ],
                                    "phone": "+123-456-7890",
                                    "website": "www.clearviewopticians.com",
                                    "recipient_lines": [
                                        "Mr/Ms A. Example",
                                        "5 Cherry Lane",
                                        "Westbridge, WB5 7AG",
                                    ],
                                    "date": "8 May",
                                    "greeting": "Dear Mr/Ms Example,",
                                    "body": [
                                        "This is a reminder of your eye test with Mr Patel.",
                                        "Your appointment is on 8 May at 1:45 PM.",
                                        "Please arrive on time.",
                                    ],
                                    "signoff": ["Kind regards,", "Clearview Opticians"],
                                    "accent_color": "#F97316",
                                    "variant": "clearview",
                                },
                                "text": (
                                    "Clearview Opticians\n"
                                    "21 Market Square, Westbridge, WB4 2FP\n"
                                    "Tel: +123-456-7890\n\n"
                                    "Date: 8 May\n\n"
                                    "Dear Mr/Ms Example,\n\n"
                                    "This is a reminder of your eye test with Mr Patel.\n"
                                    "Your appointment is on 8 May at 1:45 PM.\n"
                                    "Please arrive on time.\n\n"
                                    "Kind regards,\n"
                                    "Clearview Opticians"
                                ),
                                "questions": [
                                    {
                                        "q": "Who is the appointment with?",
                                        "options": ["Mr Patel", "Dr Carter", "Mr Thomas"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "What is the appointment for?",
                                        "options": ["An eye test", "A hearing test", "A dental check-up"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "What time is the appointment?",
                                        "options": ["1:15 PM", "1:45 PM", "1:45 AM"],
                                        "answer": 1,
                                    },
                                ],
                            },
                            {
                                "id": 5,
                                "title": "Physiotherapy Appointment",
                                "summary": "A reminder letter from Meadow Physiotherapy Clinic.",
                                "letterhead": {
                                    "clinic_name": "Meadow Physiotherapy Clinic",
                                    "tagline": "",
                                    "address_lines": [
                                        "16 Meadow Road",
                                        "Eastmere, EM2 3NC",
                                    ],
                                    "phone": "01632 960771",
                                    "recipient_lines": [
                                        "Mr/Ms D. Sample",
                                        "11 Poplar Street",
                                        "Eastmere, EM4 6PH",
                                    ],
                                    "date": "19 June",
                                    "greeting": "Dear Mr/Ms Sample,",
                                    "body": [
                                        "You have a physiotherapy appointment with Jane Roberts.",
                                        "The appointment is on 19 June at 10:00 AM.",
                                        "Please wear loose, comfortable clothing.",
                                    ],
                                    "signoff": ["Kind regards,", "Meadow Physiotherapy Clinic"],
                                    "accent_color": "#059669",
                                    "variant": "meadow",
                                },
                                "text": (
                                    "Meadow Physiotherapy Clinic\n"
                                    "16 Meadow Road, Eastmere, EM2 3NC\n"
                                    "Tel: 01632 960771\n\n"
                                    "Date: 19 June\n\n"
                                    "Dear Mr/Ms Sample,\n\n"
                                    "You have a physiotherapy appointment with Jane Roberts.\n"
                                    "The appointment is on 19 June at 10:00 AM.\n"
                                    "Please wear loose, comfortable clothing.\n\n"
                                    "Kind regards,\n"
                                    "Meadow Physiotherapy Clinic"
                                ),
                                "questions": [
                                    {
                                        "q": "Who is the appointment with?",
                                        "options": ["Jane Roberts", "Dr Lindsay", "Nurse Collins"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "When is the appointment?",
                                        "options": ["19 June at 10:00 AM", "9 June at 10:00 AM", "19 July at 10:00 AM"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "What should you wear?",
                                        "options": ["Loose, comfortable clothing", "A suit", "Sports shoes only"],
                                        "answer": 0,
                                    },
                                ],
                            },
                            {
                                "id": 6,
                                "title": "Stroke Clinic Follow Up",
                                "summary": "A follow-up letter from Northfield Stroke Clinic.",
                                "letterhead": {
                                    "clinic_name": "Northfield Stroke Clinic",
                                    "tagline": "",
                                    "address_lines": [
                                        "8 Northfield Road",
                                        "Kingsford, KF3 7MT",
                                    ],
                                    "phone": "01632 960771",
                                    "recipient_lines": [
                                        "Mr/Ms B. Sample",
                                        "19 Laurel Way",
                                        "Kingsford, KF5 2BQ",
                                    ],
                                    "date": "5 May",
                                    "greeting": "Dear Mr/Ms Sample,",
                                    "body": [
                                        "Subject: Follow Up",
                                        "You have a follow-up appointment at the stroke clinic with Dr Owens.",
                                        "The appointment is on 5 May at 11:30 AM.",
                                        "Please bring a list of your current medication.",
                                    ],
                                    "signoff": ["Kind regards,", "Northfield Stroke Clinic"],
                                    "accent_color": "#7C3AED",
                                    "variant": "northfield",
                                },
                                "text": (
                                    "Northfield Stroke Clinic\n"
                                    "8 Northfield Road, Kingsford, KF3 7MT\n"
                                    "Tel: 01632 960771\n\n"
                                    "Date: 5 May\n\n"
                                    "Subject: Follow Up\n\n"
                                    "Dear Mr/Ms Sample,\n\n"
                                    "You have a follow-up appointment at the stroke clinic with Dr Owens.\n"
                                    "The appointment is on 5 May at 11:30 AM.\n"
                                    "Please bring a list of your current medication.\n\n"
                                    "Kind regards,\n"
                                    "Northfield Stroke Clinic"
                                ),
                                "questions": [
                                    {
                                        "q": "Who is the appointment with?",
                                        "options": ["Dr Owens", "Dr Lindsay", "Dr Khan"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "What is the appointment for?",
                                        "options": ["A stroke clinic follow-up", "A dental check-up", "An eye test"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "What should you bring?",
                                        "options": ["A list of your current medication", "A urine sample", "Your hearing aid"],
                                        "answer": 0,
                                    },
                                ],
                            },
                            {
                                "id": 7,
                                "title": "Neurology Follow Up",
                                "summary": "A follow-up letter from Lakeside Neurology Clinic.",
                                "letterhead": {
                                    "clinic_name": "Lakeside Neurology Clinic",
                                    "tagline": "",
                                    "address_lines": [
                                        "24 Lakeside Drive",
                                        "Harford, HF6 1PR",
                                    ],
                                    "phone": "+123-4567-890",
                                    "website": "hello@neurology.com",
                                    "recipient_lines": [
                                        "Mr/Ms C. Example",
                                        "41 Birch Avenue",
                                        "Harford, HF7 4DS",
                                    ],
                                    "date": "28 May",
                                    "greeting": "Dear Mr/Ms Example,",
                                    "body": [
                                        "Subject: Follow Up",
                                        "You have an appointment with Dr Lindsay at the neurology clinic.",
                                        "The appointment is on 28 May at 2:00 PM.",
                                        "Please arrive 10 minutes early.",
                                    ],
                                    "signoff": ["Kind regards,", "Lakeside Neurology Clinic"],
                                    "accent_color": "#06B6D4",
                                    "variant": "lakeside",
                                },
                                "text": (
                                    "Lakeside Neurology Clinic\n"
                                    "24 Lakeside Drive, Harford, HF6 1PR\n"
                                    "Tel: +123-4567-890\n\n"
                                    "Date: 28 May\n\n"
                                    "Subject: Follow Up\n\n"
                                    "Dear Mr/Ms Example,\n\n"
                                    "You have an appointment with Dr Lindsay at the neurology clinic.\n"
                                    "The appointment is on 28 May at 2:00 PM.\n"
                                    "Please arrive 10 minutes early.\n\n"
                                    "Kind regards,\n"
                                    "Lakeside Neurology Clinic"
                                ),
                                "questions": [
                                    {
                                        "q": "Who is the appointment with?",
                                        "options": ["Dr Lindsay", "Dr Owens", "Mr Patel"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "What time is the appointment?",
                                        "options": ["2:00 AM", "12:00 PM", "2:00 PM"],
                                        "answer": 2,
                                    },
                                    {
                                        "q": "When should you arrive?",
                                        "options": ["10 minutes early", "10 minutes late", "On time"],
                                        "answer": 0,
                                    },
                                ],
                            },
                            {
                                "id": 8,
                                "title": "Hearing Test",
                                "summary": "A reminder letter from Soundwell Audiology.",
                                "letterhead": {
                                    "clinic_name": "Soundwell Audiology",
                                    "tagline": "",
                                    "address_lines": [
                                        "5 Soundwell Road",
                                        "Northleigh, NL6 4GQ",
                                    ],
                                    "phone": "01632 961925",
                                    "recipient_lines": [
                                        "Mr/Ms G. Sample",
                                        "28 Juniper Way",
                                        "Northleigh, NL7 8RP",
                                    ],
                                    "date": "30 May",
                                    "greeting": "Dear Mr/Ms Sample,",
                                    "body": [
                                        "You have a hearing test with Mr Thomas.",
                                        "The appointment is on 30 May at 11:00 AM.",
                                        "Please bring your current hearing aid if you have one.",
                                    ],
                                    "signoff": ["Kind regards,", "Soundwell Audiology"],
                                    "accent_color": "#0EA5E9",
                                    "variant": "soundwell",
                                },
                                "text": (
                                    "Soundwell Audiology\n"
                                    "5 Soundwell Road, Northleigh, NL6 4GQ\n"
                                    "Tel: 01632 961925\n\n"
                                    "Date: 30 May\n\n"
                                    "Dear Mr/Ms Sample,\n\n"
                                    "You have a hearing test with Mr Thomas.\n"
                                    "The appointment is on 30 May at 11:00 AM.\n"
                                    "Please bring your current hearing aid if you have one.\n\n"
                                    "Kind regards,\n"
                                    "Soundwell Audiology"
                                ),
                                "questions": [
                                    {
                                        "q": "Who is the appointment with?",
                                        "options": ["Mr Thomas", "Mr Patel", "Dr Owens"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "What is the appointment for?",
                                        "options": ["A hearing test", "An eye test", "A foot check"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "What should you bring?",
                                        "options": ["Your current hearing aid", "A list of medication", "Comfortable socks"],
                                        "answer": 0,
                                    },
                                ],
                            },
                            {
                                "id": 9,
                                "title": "Foot Clinic Appointment",
                                "summary": "A reminder letter from Willowbank Foot Clinic.",
                                "letterhead": {
                                    "clinic_name": "Willowbank Foot Clinic",
                                    "tagline": "",
                                    "address_lines": [
                                        "14 Willowbank Road",
                                        "Burnford, BR4 6HS",
                                    ],
                                    "phone": "+123-456-7890",
                                    "website": "hello@willowbank.com",
                                    "recipient_lines": [
                                        "Mr/Ms H. Example",
                                        "4 Ivy Crescent",
                                        "Burnford, BR5 2LE",
                                    ],
                                    "date": "9 June",
                                    "greeting": "Dear Mr/Ms Example,",
                                    "body": [
                                        "You have an appointment at the foot clinic with Nurse Collins.",
                                        "The appointment is on 9 June at 10:45 AM.",
                                        "Please bring comfortable socks.",
                                    ],
                                    "signoff": ["Kind regards,", "Willowbank Foot Clinic"],
                                    "accent_color": "#1E3A8A",
                                    "variant": "willowbank",
                                },
                                "text": (
                                    "Willowbank Foot Clinic\n"
                                    "14 Willowbank Road, Burnford, BR4 6HS\n"
                                    "Tel: +123-456-7890\n\n"
                                    "Date: 9 June\n\n"
                                    "Dear Mr/Ms Example,\n\n"
                                    "You have an appointment at the foot clinic with Nurse Collins.\n"
                                    "The appointment is on 9 June at 10:45 AM.\n"
                                    "Please bring comfortable socks.\n\n"
                                    "Kind regards,\n"
                                    "Willowbank Foot Clinic"
                                ),
                                "questions": [
                                    {
                                        "q": "Who is the appointment with?",
                                        "options": ["Nurse Collins", "Dr Carter", "Mr Thomas"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "What is the appointment for?",
                                        "options": ["A foot clinic appointment", "An eye test", "A hearing test"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "What should you bring?",
                                        "options": ["Comfortable socks", "A hearing aid", "A list of medication"],
                                        "answer": 0,
                                    },
                                ],
                            },
                            {
                                "id": 10,
                                "title": "Pre-assessment Appointment",
                                "summary": "A pre-assessment letter from Greenhill Hospital.",
                                "letterhead": {
                                    "clinic_name": "Greenhill Hospital",
                                    "tagline": "",
                                    "address_lines": [
                                        "2 Greenhill Way",
                                        "Eastmere, EM6 7TK",
                                    ],
                                    "phone": "01632 961703",
                                    "website": "hello@greenhill.com",
                                    "recipient_lines": [
                                        "Mr/Ms P. Sample",
                                        "33 Ashfield Road",
                                        "Eastmere, EM8 1LJ",
                                    ],
                                    "date": "17 July",
                                    "greeting": "Dear Mr/Ms Sample,",
                                    "body": [
                                        "You have a pre-assessment appointment at Greenhill Hospital.",
                                        "The appointment is on 17 July at 1:00 PM.",
                                        "Please arrive 15 minutes early.",
                                    ],
                                    "signoff": ["Kind regards,", "Greenhill Hospital"],
                                    "accent_color": "#0D9488",
                                    "variant": "greenhill",
                                },
                                "text": (
                                    "Greenhill Hospital\n"
                                    "2 Greenhill Way, Eastmere, EM6 7TK\n"
                                    "Tel: 01632 961703\n\n"
                                    "Date: 17 July\n\n"
                                    "Dear Mr/Ms Sample,\n\n"
                                    "You have a pre-assessment appointment at Greenhill Hospital.\n"
                                    "The appointment is on 17 July at 1:00 PM.\n"
                                    "Please arrive 15 minutes early.\n\n"
                                    "Kind regards,\n"
                                    "Greenhill Hospital"
                                ),
                                "questions": [
                                    {
                                        "q": "Where is the appointment?",
                                        "options": ["Greenhill Hospital", "Lakeside Neurology Clinic", "Maple St Health Centre"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "What is the appointment for?",
                                        "options": ["A pre-assessment", "A medication review", "A hearing test"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "When should you arrive?",
                                        "options": ["15 minutes early", "5 minutes early", "On time"],
                                        "answer": 0,
                                    },
                                ],
                            },
                        ],
                    },
                    "amber": {
                        "key": "amber",
                        "title": "Intermediate",
                        "blurb": "10 longer appointment letters with four retrieval questions mixing who, what, when, where, and why. Embedded instructions and details.",
                        "best_for": "Clients who can read short paragraphs and are working on linking information across sentences.",
                        "questions_per_letter": 4,
                        "target_letter_count": 10,
                        "est_minutes": "20–25 min",
                        "letters": [
                            {
                                "id": 1,
                                "title": "Medication Review",
                                "summary": "A medication review letter from Riverbank Surgery.",
                                "letterhead": {
                                    "clinic_name": "Riverbank Surgery",
                                    "address_lines": ["4 Riverbank Road", "Northleigh, NL2 5GT"],
                                    "phone": "01632 960913",
                                    "website": "www.riverbankhealth.com",
                                    "recipient_lines": [
                                        "Mr/Ms L. Sample",
                                        "9 Hazel Close",
                                        "Northleigh, NL3 7KP",
                                    ],
                                    "date": "3 June",
                                    "ref": "RBS/MED/1087",
                                    "subject": "Medication Review Appointment",
                                    "greeting": "Dear Mr/Ms Sample,",
                                    "body": [
                                        "We are writing to confirm your medication review with Dr Khan at Riverbank Surgery. This appointment helps us make sure your prescriptions are still safe and working well for you.",
                                    ],
                                    "details_label": "Appointment Details:",
                                    "details": [
                                        "Date: 3 June",
                                        "Time: 11:15 AM",
                                        "Location: Room 2, First Floor",
                                    ],
                                    "body_after": [
                                        "Please bring all of your current medication to the appointment, including tablets, inhalers, creams, and any over-the-counter products you take regularly.",
                                        "If you cannot attend, please contact reception so we can offer the appointment to another patient.",
                                    ],
                                    "signoff": ["Kind regards,", "Appointments Team", "Riverbank Surgery"],
                                    "accent_color": "#4A6B8A",
                                    "variant": "riverbank",
                                },
                                "text": "Riverbank Surgery — Medication Review",
                                "questions": [
                                    {
                                        "q": "What is the purpose of the appointment?",
                                        "options": ["A medication review", "An eye test", "A dental check-up"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "When is the appointment?",
                                        "options": ["3 June at 11:15 AM", "13 June at 11:15 AM", "3 June at 1:15 PM"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "What must you bring with you?",
                                        "options": ["All of your current medication", "A urine sample", "A list of questions"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "What should you do if you cannot attend?",
                                        "options": ["Contact reception", "Send an email to Dr Khan", "Arrive on a different day"],
                                        "answer": 0,
                                    },
                                ],
                            },
                            {
                                "id": 2,
                                "title": "Dental Treatment",
                                "summary": "A dental treatment letter from Westside Dental Practice.",
                                "letterhead": {
                                    "clinic_name": "Westside Dental Practice",
                                    "address_lines": ["19 Orchard Lane", "Westbridge, WB3 6JP"],
                                    "phone": "01632 960245",
                                    "recipient_lines": [
                                        "Mr/Ms T. Example",
                                        "14 Willow Grove",
                                        "Burnford, BR2 6DL",
                                    ],
                                    "date": "22 April",
                                    "ref": "BDP/TR/3325",
                                    "subject": "Dental Treatment Appointment",
                                    "greeting": "Dear Mr/Ms Example,",
                                    "body": [
                                        "This letter confirms your upcoming dental treatment with Dr Carter at Westside Dental Practice. You are booked in for a filling on one of your back teeth.",
                                    ],
                                    "details_label": "Appointment Details:",
                                    "details": [
                                        "Date: 22 April",
                                        "Time: 9:00 AM",
                                        "Duration: approximately 45 minutes",
                                    ],
                                    "body_after": [
                                        "Please eat a light meal before you arrive, as you may feel numb for a few hours after the treatment.",
                                        "We recommend you do not plan any important meetings or meals for the rest of the morning.",
                                    ],
                                    "signoff": ["Kind regards,", "Appointment Coordinator", "Westside Dental Practice"],
                                    "accent_color": "#2563EB",
                                    "variant": "westside",
                                },
                                "text": "Westside Dental Practice — Dental Treatment",
                                "questions": [
                                    {
                                        "q": "Who is the appointment with?",
                                        "options": ["Dr Carter", "Dr Khan", "Dr Bennett"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "What treatment will you have?",
                                        "options": ["A filling", "A check-up", "A scale and polish"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "How long will the appointment take?",
                                        "options": ["Approximately 45 minutes", "Approximately 15 minutes", "Approximately 2 hours"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "Why should you eat a light meal before you arrive?",
                                        "options": [
                                            "Because you may feel numb after the treatment",
                                            "Because you cannot eat for the rest of the day",
                                            "Because the appointment is very long",
                                        ],
                                        "answer": 0,
                                    },
                                ],
                            },
                            {
                                "id": 3,
                                "title": "Contact Lens Fitting",
                                "summary": "A contact lens fitting letter from Clearview Opticians.",
                                "letterhead": {
                                    "clinic_name": "Clearview Opticians",
                                    "address_lines": ["21 Market Square", "Westbridge, WB4 2FP"],
                                    "phone": "01632 960934",
                                    "website": "www.clearview.com",
                                    "recipient_lines": [
                                        "Mr/Ms A. Example",
                                        "5 Cherry Lane",
                                        "Westbridge, WB5 7AG",
                                    ],
                                    "date": "8 May",
                                    "ref": "CVO/CL/5521",
                                    "subject": "Contact Lens Fitting Appointment",
                                    "greeting": "Dear Mr/Ms Example,",
                                    "body": [
                                        "This letter is to confirm your contact lens fitting appointment with Mr Patel at Clearview Opticians. The appointment includes an eye examination and time to practise putting the lenses in and out.",
                                    ],
                                    "details_label": "Appointment Details:",
                                    "details": [
                                        "Date: 8 May",
                                        "Time: 1:45 PM",
                                        "Duration: approximately one hour",
                                    ],
                                    "body_after": [
                                        "Please do not wear eye makeup on the day of your appointment, as this can interfere with the fitting.",
                                        "If you wear glasses, please bring them with you.",
                                    ],
                                    "signoff": ["Kind regards,", "Reception Team", "Clearview Opticians"],
                                    "accent_color": "#0F766E",
                                    "variant": "clearview-amber",
                                },
                                "text": "Clearview Opticians — Contact Lens Fitting",
                                "questions": [
                                    {
                                        "q": "What is the appointment for?",
                                        "options": ["A contact lens fitting", "An eye test", "A glasses repair"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "How long will the appointment take?",
                                        "options": ["Approximately one hour", "Approximately 15 minutes", "Approximately 3 hours"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "Why should you avoid wearing eye makeup?",
                                        "options": [
                                            "It can interfere with the fitting",
                                            "It is not allowed in the clinic",
                                            "It costs extra to remove",
                                        ],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "What should you bring if you wear glasses?",
                                        "options": ["Your glasses", "A list of medication", "A urine sample"],
                                        "answer": 0,
                                    },
                                ],
                            },
                            {
                                "id": 4,
                                "title": "Physiotherapy Assessment",
                                "summary": "A physiotherapy assessment letter from Meadow Physiotherapy Clinic.",
                                "letterhead": {
                                    "clinic_name": "Meadow Physiotherapy Clinic",
                                    "address_lines": ["16 Meadow Road", "Eastmere, EM2 3NC"],
                                    "phone": "01632 960771",
                                    "recipient_lines": [
                                        "Mr/Ms D. Sample",
                                        "11 Poplar Street",
                                        "Eastmere, EM4 6PH",
                                    ],
                                    "date": "19 June",
                                    "ref": "MPC/ASS/6608",
                                    "subject": "Physiotherapy Assessment",
                                    "greeting": "Dear Mr/Ms Sample,",
                                    "body": [
                                        "We are writing to confirm your first physiotherapy appointment with Jane Roberts at Meadow Physiotherapy Clinic. This is an assessment appointment, where we will discuss your symptoms and plan your treatment.",
                                    ],
                                    "details_label": "Appointment Details:",
                                    "details": [
                                        "Date: 19 June",
                                        "Time: 10:00 AM",
                                        "Location: Treatment Room 1",
                                    ],
                                    "body_after": [
                                        "Please arrive 15 minutes early to complete a health questionnaire at reception.",
                                        "Wear loose, comfortable clothing that allows you to move easily.",
                                    ],
                                    "signoff": ["Kind regards,", "Appointments Team", "Meadow Physiotherapy Clinic"],
                                    "accent_color": "#059669",
                                    "variant": "meadow",
                                },
                                "text": "Meadow Physiotherapy Clinic — Physiotherapy Assessment",
                                "questions": [
                                    {
                                        "q": "What is the purpose of this appointment?",
                                        "options": ["An assessment", "A follow-up", "A discharge appointment"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "Why should you arrive 15 minutes early?",
                                        "options": [
                                            "To complete a health questionnaire",
                                            "To pay for the appointment",
                                            "To have a hot drink",
                                        ],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "What should you wear?",
                                        "options": ["Loose, comfortable clothing", "A suit", "Sports shoes only"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "Where will the appointment take place?",
                                        "options": ["Treatment Room 1", "Reception", "Room 2, First Floor"],
                                        "answer": 0,
                                    },
                                ],
                            },
                            {
                                "id": 5,
                                "title": "Annual Health Review",
                                "summary": "An annual health review letter from Oakwood Medical Practice.",
                                "letterhead": {
                                    "clinic_name": "Oakwood Medical Practice",
                                    "address_lines": ["12 Oakwood Lane", "Harford, HF3 4BN"],
                                    "phone": "01632 960520",
                                    "website": "www.oakwoodmed.com",
                                    "recipient_lines": [
                                        "Mr/Ms J. Example",
                                        "27 Elm Road",
                                        "Harford, HF4 1QR",
                                    ],
                                    "date": "15 May",
                                    "ref": "OMP/AR/2214",
                                    "subject": "Annual Health Review",
                                    "greeting": "Dear Mr/Ms Example,",
                                    "body": [
                                        "This letter is to confirm your annual health review with Dr Bennett at Oakwood Medical Practice. This review helps us check your general health and update your records.",
                                    ],
                                    "details_label": "Appointment Details:",
                                    "details": [
                                        "Date: 15 May",
                                        "Time: 10:30 AM",
                                        "Location: Consulting Room 3, Ground Floor",
                                    ],
                                    "body_after": [
                                        "Please arrive 10 minutes early so we can take your blood pressure and weight before you see the doctor.",
                                        "If you are currently taking any medication, please bring a list with you.",
                                    ],
                                    "signoff": ["Kind regards,", "Appointments Team", "Oakwood Medical Practice"],
                                    "accent_color": "#15803D",
                                    "variant": "oakwood",
                                },
                                "text": "Oakwood Medical Practice — Annual Health Review",
                                "questions": [
                                    {
                                        "q": "What is the appointment for?",
                                        "options": ["An annual health review", "A medication review", "An eye test"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "What time is the appointment?",
                                        "options": ["10:30 AM", "10:30 PM", "1:30 PM"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "Why should you arrive 10 minutes early?",
                                        "options": [
                                            "So they can take your blood pressure and weight",
                                            "So you can fill out a registration form",
                                            "So you can pay for the appointment",
                                        ],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "What should you bring with you?",
                                        "options": ["A list of your medication", "A urine sample", "A friend"],
                                        "answer": 0,
                                    },
                                ],
                            },
                            {
                                "id": 6,
                                "title": "Cardiology Appointment",
                                "summary": "A cardiology appointment letter from Highfield Cardiology Unit.",
                                "letterhead": {
                                    "clinic_name": "Highfield Cardiology Unit",
                                    "address_lines": ["17 Highfield Avenue", "Westbridge, WB7 3QK"],
                                    "phone": "01632 961485",
                                    "website": "hello@highfield.com",
                                    "recipient_lines": [
                                        "Mr/Ms F. Sample",
                                        "6 Orchard Way",
                                        "Westbridge, WB8 9JH",
                                    ],
                                    "date": "12 June",
                                    "ref": "HCU/ECG/1023",
                                    "subject": "Cardiology Appointment",
                                    "greeting": "Dear Mr/Ms Sample,",
                                    "body": [
                                        "We are writing to confirm your appointment with Dr Marsh at Highfield Cardiology Unit. The appointment will include an ECG, which is a simple test that records the activity of your heart, followed by a consultation to discuss the results.",
                                    ],
                                    "details_label": "Appointment Details:",
                                    "details": [
                                        "Date: 12 June",
                                        "Time: 9:45 AM",
                                        "Location: Cardiology Suite, Ground Floor",
                                    ],
                                    "body_after": [
                                        "Please wear a loose-fitting top that is easy to remove or adjust.",
                                        "Avoid using body lotion or cream on your chest on the day of the appointment.",
                                    ],
                                    "signoff": ["Kind regards,", "Cardiology Team", "Highfield Cardiology Unit"],
                                    "accent_color": "#EAB308",
                                    "variant": "highfield",
                                },
                                "text": "Highfield Cardiology Unit — Cardiology Appointment",
                                "questions": [
                                    {
                                        "q": "What is an ECG?",
                                        "options": [
                                            "A simple test that records the activity of your heart",
                                            "A scan of your brain",
                                            "A blood pressure check",
                                        ],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "What will happen after the ECG?",
                                        "options": [
                                            "A consultation to discuss the results",
                                            "You will go straight home",
                                            "You will have a blood test",
                                        ],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "What should you wear?",
                                        "options": ["A loose-fitting top", "A swimming costume", "A suit"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "Why should you avoid body lotion on your chest?",
                                        "options": [
                                            "It can interfere with the ECG",
                                            "It is against clinic rules",
                                            "It costs extra to remove",
                                        ],
                                        "answer": 0,
                                    },
                                ],
                            },
                            {
                                "id": 7,
                                "title": "Neurology Consultation",
                                "summary": "A neurology consultation letter from Lakeside Neurology Clinic.",
                                "letterhead": {
                                    "clinic_name": "Lakeside Neurology Clinic",
                                    "address_lines": ["24 Lakeside Drive", "Harford, HF6 1PR"],
                                    "phone": "+123-4567-890",
                                    "website": "hello@neurology.com",
                                    "recipient_lines": [
                                        "Mr/Ms C. Example",
                                        "41 Birch Avenue",
                                        "Harford, HF7 4DS",
                                    ],
                                    "date": "28 May",
                                    "ref": "LNC/CON/9917",
                                    "subject": "Neurology Consultation",
                                    "greeting": "Dear Mr/Ms Example,",
                                    "body": [
                                        "This letter confirms your consultation with Dr Lindsay at Lakeside Neurology Clinic. Dr Lindsay will discuss the results of your recent scan and answer any questions you may have.",
                                    ],
                                    "details_label": "Appointment Details:",
                                    "details": [
                                        "Date: 28 May",
                                        "Time: 2:00 PM",
                                        "Location: Consulting Room 5, First Floor",
                                    ],
                                    "body_after": [
                                        "Please arrive 10 minutes early to check in at reception.",
                                        "It may help to write down any questions you would like to ask before you come.",
                                    ],
                                    "signoff": ["Kind regards,", "Neurology Team", "Lakeside Neurology Clinic"],
                                    "accent_color": "#06B6D4",
                                    "variant": "lakeside",
                                },
                                "text": "Lakeside Neurology Clinic — Neurology Consultation",
                                "questions": [
                                    {
                                        "q": "What will the doctor discuss at this appointment?",
                                        "options": [
                                            "The results of your recent scan",
                                            "Your medication list",
                                            "A new prescription",
                                        ],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "When should you arrive?",
                                        "options": ["10 minutes early", "10 minutes late", "On time"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "Why is it helpful to write down your questions beforehand?",
                                        "options": [
                                            "So you remember what to ask",
                                            "So the clinic can read them in advance",
                                            "Because the doctor will not answer unwritten questions",
                                        ],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "Where is the consulting room?",
                                        "options": [
                                            "Consulting Room 5, First Floor",
                                            "Consulting Room 1, Ground Floor",
                                            "Consulting Room 5, Lower Ground",
                                        ],
                                        "answer": 0,
                                    },
                                ],
                            },
                            {
                                "id": 8,
                                "title": "Stroke Follow-up Appointment",
                                "summary": "A stroke follow-up letter from Northfield Stroke Clinic.",
                                "letterhead": {
                                    "clinic_name": "Northfield Stroke Clinic",
                                    "address_lines": ["8 Northfield Road", "Kingsford, KF3 7MT"],
                                    "phone": "01632 960771",
                                    "recipient_lines": [
                                        "Mr/Ms B. Sample",
                                        "19 Laurel Way",
                                        "Kingsford, KF5 2BQ",
                                    ],
                                    "date": "5 May",
                                    "ref": "NSC/FU/8820",
                                    "subject": "Stroke Follow-up Appointment",
                                    "greeting": "Dear Mr/Ms Sample,",
                                    "body": [
                                        "We are writing to confirm your follow-up appointment at Northfield Stroke Clinic with Dr Owens. The appointment will review your recovery and may include some short assessments.",
                                    ],
                                    "details_label": "Appointment Details:",
                                    "details": [
                                        "Date: 5 May",
                                        "Time: 11:30 AM",
                                        "Location: Stroke Clinic, Outpatient Wing",
                                    ],
                                    "body_after": [
                                        "Please bring a list of your current medication and any notes you have made about your symptoms since your last visit.",
                                        "If possible, please bring a family member or friend who can help during the appointment.",
                                    ],
                                    "signoff": ["Kind regards,", "Stroke Clinic Team", "Northfield Stroke Clinic"],
                                    "accent_color": "#7C3AED",
                                    "variant": "northfield",
                                },
                                "text": "Northfield Stroke Clinic — Stroke Follow-up Appointment",
                                "questions": [
                                    {
                                        "q": "Who is the appointment with?",
                                        "options": ["Dr Owens", "Dr Lindsay", "Dr Marsh"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "What might happen during the appointment?",
                                        "options": [
                                            "Some short assessments",
                                            "A blood test",
                                            "An eye examination",
                                        ],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "What two things should you bring?",
                                        "options": [
                                            "A list of medication and notes about your symptoms",
                                            "A swimming costume and towel",
                                            "A urine sample and a friend",
                                        ],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "Why might it help to bring a family member or friend?",
                                        "options": [
                                            "They can help during the appointment",
                                            "They can take notes for the doctor",
                                            "They can pay for the appointment",
                                        ],
                                        "answer": 0,
                                    },
                                ],
                            },
                            {
                                "id": 9,
                                "title": "Hydrotherapy Class",
                                "summary": "A hydrotherapy class letter from Parkview Physiotherapy Clinic.",
                                "letterhead": {
                                    "clinic_name": "Parkview Physiotherapy Clinic",
                                    "address_lines": ["3 Park Lane", "Rivertown, RT1 9QD"],
                                    "phone": "01632 960771",
                                    "email": "parkviewPhysiotherapy@queries.com",
                                    "recipient_lines": [
                                        "Mr/Ms E. Example",
                                        "22 Rowan Close",
                                        "Rivertown, RT2 5KN",
                                    ],
                                    "date": "14 April",
                                    "ref": "PVP/HYD/7714",
                                    "subject": "Hydrotherapy Class",
                                    "greeting": "Dear Mr/Ms Example,",
                                    "body": [
                                        "This letter confirms your first hydrotherapy class with Tom Harris at Parkview Physiotherapy. Hydrotherapy is gentle exercise carried out in a warm pool, which can help reduce pain and improve movement.",
                                    ],
                                    "details_label": "Class Details:",
                                    "details": [
                                        "Date: 14 April",
                                        "Time: 3:00 PM",
                                        "Location: Hydrotherapy Pool, Lower Ground Floor",
                                    ],
                                    "body_after": [
                                        "Please bring a swimming costume, a towel, and a plastic bag for your wet items.",
                                        "Please do not eat a large meal in the hour before your class.",
                                    ],
                                    "signoff": ["Kind regards,", "Physiotherapy Team", "Parkview Physiotherapy"],
                                    "accent_color": "#16A34A",
                                    "variant": "parkview",
                                },
                                "text": "Parkview Physiotherapy Clinic — Hydrotherapy Class",
                                "questions": [
                                    {
                                        "q": "What is hydrotherapy?",
                                        "options": [
                                            "Gentle exercise in a warm pool",
                                            "A talking therapy",
                                            "A type of massage",
                                        ],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "Where will the class take place?",
                                        "options": [
                                            "Hydrotherapy Pool, Lower Ground Floor",
                                            "Treatment Room 1",
                                            "Reception",
                                        ],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "What three things should you bring?",
                                        "options": [
                                            "A swimming costume, a towel, and a plastic bag",
                                            "A list of medication, a friend, and a notepad",
                                            "Comfortable shoes, a hat, and a water bottle",
                                        ],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "Why should you avoid a large meal beforehand?",
                                        "options": [
                                            "It can make exercise in the pool uncomfortable",
                                            "It is not allowed in the clinic",
                                            "It will cancel your appointment",
                                        ],
                                        "answer": 0,
                                    },
                                ],
                            },
                            {
                                "id": 10,
                                "title": "Fasting Blood Test",
                                "summary": "A fasting blood test letter from Elmtree Clinic Phlebotomy Department.",
                                "letterhead": {
                                    "clinic_name": "Elmtree Clinic",
                                    "address_lines": ["10 Elmtree Road", "Lowford, LF2 8RG"],
                                    "phone": "01632 961138",
                                    "recipient_lines": [
                                        "Mr/Ms M. Example",
                                        "8 Sycamore Drive",
                                        "Lowford, LF4 3CE",
                                    ],
                                    "date": "2 May",
                                    "ref": "ETC/FAST/1138",
                                    "subject": "Fasting Blood Test",
                                    "greeting": "Dear Mr/Ms Example,",
                                    "body": [
                                        "This letter is to confirm your fasting blood test at Elmtree Clinic. A fasting test means you cannot eat or drink anything except water before the appointment.",
                                    ],
                                    "details_label": "Appointment Details:",
                                    "details": [
                                        "Date: 2 May",
                                        "Time: 8:30 AM",
                                        "Location: Blood Test Room, Ground Floor",
                                    ],
                                    "body_after": [
                                        "Please do not eat or drink anything other than water for at least eight hours before the test.",
                                        "Small sips of water are allowed and encouraged to help with the blood draw.",
                                    ],
                                    "signoff": ["Kind regards,", "Phlebotomy Team", "Elmtree Clinic"],
                                    "accent_color": "#1D4ED8",
                                    "variant": "elmtree",
                                },
                                "text": "Elmtree Clinic Phlebotomy Department — Fasting Blood Test",
                                "questions": [
                                    {
                                        "q": "What is a fasting blood test?",
                                        "options": [
                                            "A test where you cannot eat or drink anything except water beforehand",
                                            "A test that takes a very long time",
                                            "A test that is done while you eat",
                                        ],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "How long must you avoid eating before the test?",
                                        "options": [
                                            "At least eight hours",
                                            "At least two hours",
                                            "At least twenty-four hours",
                                        ],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "What is the one thing you can drink?",
                                        "options": ["Water", "Tea", "Orange juice"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "Why is drinking water encouraged?",
                                        "options": [
                                            "To help with the blood draw",
                                            "To prevent hunger",
                                            "To check your kidneys",
                                        ],
                                        "answer": 0,
                                    },
                                ],
                            },
                        ],
                    },
                    "red": {
                        "key": "red",
                        "title": "Complex",
                        "blurb": "10 dense multi-section letters with five questions per letter. Safety advice, conditional instructions, and action-required scenarios requiring inference and decision-making.",
                        "best_for": "Clients who can read paragraphs and are working on integrating information across sections.",
                        "questions_per_letter": 5,
                        "target_letter_count": 10,
                        "est_minutes": "30–40 min",
                        "letters": [
                            {
                                "id": 1,
                                "title": "Diabetic Eye Screening",
                                "summary": "A diabetic eye screening letter from Clearview Opticians.",
                                "letterhead": {
                                    "clinic_name": "Clearview Opticians",
                                    "address_lines": ["21 Market Square", "Westbridge, WB4 2FP"],
                                    "phone": "+123-456-7890",
                                    "website": "www.clearviewopticians.com",
                                    "email": "hello@clearview.com",
                                    "recipient_lines": [
                                        "Mr/Ms A. Example",
                                        "5 Cherry Lane",
                                        "Westbridge, WB5 7AG",
                                    ],
                                    "date": "8 May",
                                    "ref": "CVO/DES/7742",
                                    "subject": "Diabetic Eye Screening",
                                    "greeting": "Dear Mr/Ms Example,",
                                    "body": [
                                        "This letter is to confirm your diabetic eye screening appointment with Mr Patel at Clearview Opticians. This screening checks for changes in the back of the eye that can happen in people living with diabetes.",
                                    ],
                                    "details_label": "Appointment Details:",
                                    "details": [
                                        "Date: 8 May",
                                        "Time: 1:45 PM",
                                        "Location: Screening Suite, Ground Floor",
                                    ],
                                    "sections": [
                                        {
                                            "heading": "Before Your Appointment",
                                            "paragraphs": [
                                                "Eye drops will be used to make the pupils larger so we can see the back of the eye clearly. These drops take about 20 minutes to work and can make your vision blurry for several hours afterwards.",
                                            ],
                                        },
                                        {
                                            "heading": "Important Safety Advice",
                                            "paragraphs": [
                                                "You must not drive to or from this appointment. Please arrange alternative transport, such as a taxi, a lift from a family member, or public transport.",
                                                "If you have any sudden loss of vision or severe eye pain before your appointment, do not wait for the screening. Call 111 for advice or 999 if the symptoms are severe.",
                                            ],
                                        },
                                    ],
                                    "signoff": ["Kind regards,", "Screening Team", "Clearview Opticians"],
                                    "accent_color": "#F97316",
                                    "variant": "clearview",
                                },
                                "text": "Clearview Opticians — Diabetic Eye Screening",
                                "questions": [
                                    {
                                        "q": "What is this screening checking for?",
                                        "options": [
                                            "Changes in the back of the eye",
                                            "Whether you need new glasses",
                                            "Whether you can drive at night",
                                        ],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "Why are eye drops used at this appointment?",
                                        "options": [
                                            "To make the pupils larger so the back of the eye can be seen",
                                            "To stop you from blinking during the test",
                                            "To wash dust out of your eyes",
                                        ],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "Why must you not drive to or from the appointment?",
                                        "options": [
                                            "Because the eye drops make your vision blurry",
                                            "Because there is no parking at the clinic",
                                            "Because you will be tired after the test",
                                        ],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "Name two alternative forms of transport suggested in the letter.",
                                        "options": [
                                            "A taxi and a lift from a family member",
                                            "A bicycle and a scooter",
                                            "Driving yourself and a hire car",
                                        ],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "What should you do if you have sudden loss of vision before the appointment?",
                                        "options": [
                                            "Call 111 for advice or 999 if the symptoms are severe",
                                            "Wait until the appointment to mention it",
                                            "Try wearing sunglasses",
                                        ],
                                        "answer": 0,
                                    },
                                ],
                            },
                            {
                                "id": 2,
                                "title": "Urgent Review Appointment",
                                "summary": "An urgent review letter from Oakwood Medical Practice.",
                                "letterhead": {
                                    "clinic_name": "Oakwood Medical Practice",
                                    "address_lines": ["12 Oakwood Lane", "Harford, HF3 4BN"],
                                    "phone": "01632 960520",
                                    "website": "www.oakwoodmed.com",
                                    "recipient_lines": [
                                        "Mr/Ms J. Example",
                                        "27 Elm Road",
                                        "Harford, HF4 1QR",
                                    ],
                                    "date": "15 May",
                                    "ref": "OMP/AR/2214",
                                    "subject": "Urgent Review Appointment",
                                    "greeting": "Dear Mr/Ms Example,",
                                    "body": [
                                        "Following your recent telephone call with our triage nurse, we have arranged an urgent review appointment with Dr Bennett at Oakwood Medical Practice to discuss your symptoms in more detail.",
                                    ],
                                    "details_label": "Appointment Details:",
                                    "details": [
                                        "Date: 15 May",
                                        "Time: 10:30 AM",
                                        "Location: Consulting Room 3, Ground Floor",
                                    ],
                                    "sections": [
                                        {
                                            "heading": "Before Your Appointment",
                                            "paragraphs": [
                                                "Please make a note of when your symptoms began and anything that makes them better or worse. Bring a list of your current medication, including anything bought without a prescription.",
                                            ],
                                        },
                                        {
                                            "heading": "Important Safety Advice",
                                            "paragraphs": [
                                                "If your symptoms become significantly worse before your appointment, including:",
                                            ],
                                            "bullets": [
                                                "severe chest pain,",
                                                "difficulty breathing, or",
                                                "sudden weakness or confusion,",
                                            ],
                                            "paragraphs_after": [
                                                "do not wait for this appointment. You must call 999/911 immediately.",
                                            ],
                                        },
                                        {
                                            "heading": "If You Cannot Attend",
                                            "paragraphs": [
                                                "Please telephone reception on 01632 960520 as soon as possible so we can offer the appointment to another patient and arrange a new time for you.",
                                            ],
                                        },
                                    ],
                                    "signoff": ["Kind regards,", "Reception Team", "Oakwood Medical Practice"],
                                    "accent_color": "#15803D",
                                    "variant": "oakwood",
                                },
                                "text": "Oakwood Medical Practice — Urgent Review Appointment",
                                "questions": [
                                    {
                                        "q": "Why has this appointment been arranged?",
                                        "options": [
                                            "To discuss symptoms in more detail after a triage call",
                                            "For a routine annual check",
                                            "To start a new medication",
                                        ],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "What two things should you prepare before the appointment?",
                                        "options": [
                                            "Notes on when symptoms began and a list of medication",
                                            "A urine sample and a friend",
                                            "A meal and a drink",
                                        ],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "If you developed severe chest pain the night before, what should you do?",
                                        "options": [
                                            "Call 999/911 immediately and do not wait for the appointment",
                                            "Wait until the morning appointment",
                                            "Send an email to Dr Bennett",
                                        ],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "What should you do if you cannot attend?",
                                        "options": [
                                            "Telephone reception as soon as possible",
                                            "Just turn up on a different day",
                                            "Wait for the surgery to call you",
                                        ],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "Why is it important to tell the surgery if you cannot attend?",
                                        "options": [
                                            "So they can offer the appointment to another patient",
                                            "Because you will be charged otherwise",
                                            "So they can send a taxi for you",
                                        ],
                                        "answer": 0,
                                    },
                                ],
                            },
                            {
                                "id": 3,
                                "title": "Anticoagulant Medication Review",
                                "summary": "An anticoagulant medication review letter from Riverbank Surgery.",
                                "letterhead": {
                                    "clinic_name": "Riverbank Surgery",
                                    "address_lines": ["4 Riverbank Road", "Northleigh, NL2 5GT"],
                                    "phone": "01632 960634",
                                    "email": "medication.reviews@riverbanksurgery.net",
                                    "recipient_lines": [
                                        "Mr/Ms L. Sample",
                                        "9 Hazel Close",
                                        "Northleigh, NL3 7KP",
                                    ],
                                    "date": "3 June",
                                    "ref": "MS/NU/1189",
                                    "subject": "Anticoagulant Medication Review",
                                    "greeting": "Dear Mr/Ms Sample,",
                                    "body": [
                                        "This letter is to confirm your anticoagulant medication review with Dr Khan at Riverbank Surgery. Anticoagulants are medicines that help prevent blood clots, and regular reviews are important to make sure the dose is right for you.",
                                    ],
                                    "details_label": "Appointment Details:",
                                    "details": [
                                        "Date: 3 June",
                                        "Time: 11:15 AM",
                                        "Location: Room 2, First Floor",
                                    ],
                                    "sections": [
                                        {
                                            "heading": "Before Your Appointment",
                                            "paragraphs": [
                                                "You will need a blood test one week before the appointment. Please book this at reception as soon as possible. Bring all of your current medication, including tablets, inhalers, and any supplements, to the review itself.",
                                            ],
                                        },
                                        {
                                            "heading": "Important Safety Advice",
                                            "paragraphs": [
                                                "If you notice any of the following before your appointment, contact the surgery on the same day:",
                                            ],
                                            "bullets": [
                                                "unusual bruising or bleeding,",
                                                "blood in your urine or stools, or",
                                                "a severe headache that is not like your usual headaches.",
                                            ],
                                            "paragraphs_after": [
                                                "If you have heavy bleeding that will not stop, call 999/911 immediately.",
                                            ],
                                        },
                                    ],
                                    "signoff": ["Kind regards,", "Medication Review Team", "Riverbank Surgery"],
                                    "accent_color": "#3F5872",
                                    "variant": "riverbank-red",
                                },
                                "text": "Riverbank Surgery — Anticoagulant Medication Review",
                                "questions": [
                                    {
                                        "q": "What are anticoagulants and why are they reviewed regularly?",
                                        "options": [
                                            "Medicines that prevent blood clots; reviews ensure the dose is right",
                                            "Painkillers; reviews check the cost",
                                            "Vitamins; reviews check the colour",
                                        ],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "What must you do one week before the appointment?",
                                        "options": [
                                            "Have a blood test",
                                            "Stop all medication",
                                            "Have an eye test",
                                        ],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "Which symptoms should prompt you to contact the surgery the same day?",
                                        "options": [
                                            "Unusual bruising or bleeding, blood in urine or stools, or a severe headache",
                                            "A mild cold or sore throat",
                                            "Hunger or thirst",
                                        ],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "In which situation must you call 999 instead of the surgery?",
                                        "options": [
                                            "Heavy bleeding that will not stop",
                                            "Mild bruising on your arm",
                                            "A small headache",
                                        ],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "What should you bring to the review itself?",
                                        "options": [
                                            "All of your current medication, including tablets, inhalers, and supplements",
                                            "A swimming costume and a towel",
                                            "Just your appointment letter",
                                        ],
                                        "answer": 0,
                                    },
                                ],
                            },
                            {
                                "id": 4,
                                "title": "Outpatient Appointment - Parking and Access",
                                "summary": "An outpatient appointment letter with parking information from Greenhill Hospital.",
                                "letterhead": {
                                    "clinic_name": "Greenhill Hospital",
                                    "address_lines": ["2 Greenhill Way", "Eastmere, EM6 7TK"],
                                    "phone": "01632 961703",
                                    "website": "hello@greenhill.com",
                                    "recipient_lines": [
                                        "Mr/Ms P. Sample",
                                        "33 Ashfield Road",
                                        "Eastmere, EM8 1LJ",
                                    ],
                                    "date": "17 July",
                                    "ref": "GHH/OP/1856",
                                    "subject": "Outpatient Appointment - Parking and Access Information",
                                    "greeting": "Dear Mr/Ms Sample,",
                                    "body": [
                                        "This letter confirms your outpatient appointment with Dr Reid at Greenhill Hospital. As we have received feedback that parking can be difficult, this letter includes additional information to help you plan your visit.",
                                    ],
                                    "details_label": "Appointment Details:",
                                    "details": [
                                        "Date: 17 July",
                                        "Time: 1:00 PM",
                                        "Location: Outpatient Department, Green Zone, Level 2",
                                    ],
                                    "sections": [
                                        {
                                            "heading": "Parking",
                                            "paragraphs": [
                                                "The main hospital car park is often full between 10:00 AM and 2:00 PM. We recommend the Green Zone multi-storey car park on Beech Lane, a 5-minute walk from the outpatient entrance. Parking charges apply and must be paid by card at the machines on Level 1 of the car park.",
                                                "Blue Badge spaces are available in the main car park and in the Green Zone car park. Please display your Blue Badge clearly on the dashboard.",
                                            ],
                                        },
                                        {
                                            "heading": "Public Transport",
                                            "paragraphs": [
                                                "Bus routes 12, 14, and 46 stop directly outside the hospital. The nearest train station is Eastmere Central, which is a 10-minute walk or a short taxi ride from the hospital.",
                                            ],
                                        },
                                        {
                                            "heading": "Finding the Outpatient Department",
                                            "paragraphs": [
                                                "From the main entrance, follow the green signs to the Green Zone. The outpatient department is on Level 2. Lifts are available near the main entrance.",
                                            ],
                                        },
                                        {
                                            "heading": "If You Are Running Late",
                                            "paragraphs": [
                                                "Telephone the outpatient department on 01632 961703 as soon as possible. If you are more than 15 minutes late, your appointment may be rescheduled.",
                                            ],
                                        },
                                    ],
                                    "signoff": ["Kind regards,", "Outpatient Appointments Team", "Greenhill Hospital"],
                                    "accent_color": "#0D9488",
                                    "variant": "greenhill",
                                },
                                "text": "Greenhill Hospital — Outpatient Appointment Parking and Access",
                                "questions": [
                                    {
                                        "q": "Which car park is recommended, and how far is it from the outpatient entrance?",
                                        "options": [
                                            "Green Zone multi-storey on Beech Lane, a 5-minute walk",
                                            "The main car park, right next to the entrance",
                                            "Eastmere Central station car park, 10 minutes away",
                                        ],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "What should you do if you have a Blue Badge?",
                                        "options": [
                                            "Display it clearly on the dashboard",
                                            "Hand it to reception",
                                            "Leave it at home",
                                        ],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "Name two public transport options for reaching the hospital.",
                                        "options": [
                                            "Bus and train",
                                            "Tram and taxi only",
                                            "Bicycle and ferry",
                                        ],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "Which coloured signs should you follow from the main entrance?",
                                        "options": ["Green signs", "Red signs", "Blue signs"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "What could happen if you arrive more than 15 minutes late?",
                                        "options": [
                                            "Your appointment may be rescheduled",
                                            "You will be given a discount",
                                            "You will be asked to pay extra parking",
                                        ],
                                        "answer": 0,
                                    },
                                ],
                            },
                            {
                                "id": 5,
                                "title": "Change of Building",
                                "summary": "A change-of-building letter from Lakeside Neurology Clinic.",
                                "letterhead": {
                                    "clinic_name": "Lakeside Neurology Clinic",
                                    "address_lines": ["24 Lakeside Drive", "Harford, HF6 1PR"],
                                    "phone": "+123-4567-890",
                                    "website": "hello@neurology.com",
                                    "recipient_lines": [
                                        "Mr/Ms C. Example",
                                        "41 Birch Avenue",
                                        "Harford, HF7 4DS",
                                    ],
                                    "date": "28 May",
                                    "ref": "LNC/BC/1967",
                                    "subject": "Important - Change of Building for Your Appointment",
                                    "greeting": "Dear Mr/Ms Example,",
                                    "body": [
                                        "We are writing to let you know that your upcoming neurology consultation with Dr Lindsay will now take place in a different building. The main Lakeside Neurology Clinic building is closed for refurbishment.",
                                    ],
                                    "details_label": "Appointment Details:",
                                    "details": [
                                        "Date: 28 May",
                                        "Time: 2:00 PM",
                                        "New Location: Harford Community Hospital, Neurology Outpatient Department, 48 Hill Road, Harford, HF6 2TP",
                                    ],
                                    "sections": [
                                        {
                                            "heading": "Getting to the New Location",
                                            "paragraphs": [
                                                "Harford Community Hospital is 1.5 miles from the original clinic. There is a free shuttle bus that runs between the two sites every 30 minutes during weekday mornings and afternoons.",
                                            ],
                                        },
                                        {
                                            "heading": "Parking",
                                            "paragraphs": [
                                                "A pay-and-display car park is available at the new location. Charges are £2 for up to two hours and £4 for up to four hours. Card payment only.",
                                            ],
                                        },
                                        {
                                            "heading": "Accessibility",
                                            "paragraphs": [
                                                "The new building has step-free access from the main entrance. Lifts serve all floors. If you use a wheelchair or have mobility difficulties and need additional support, please telephone the neurology team on 01632 961372 at least 48 hours in advance so we can arrange assistance.",
                                            ],
                                        },
                                        {
                                            "heading": "If You Cannot Attend",
                                            "paragraphs": [
                                                "Contact the neurology team as soon as possible. Rearrangement may add several weeks to your wait.",
                                            ],
                                        },
                                    ],
                                    "signoff": ["Kind regards,", "Neurology Appointments Team", "Lakeside Neurology Clinic"],
                                    "accent_color": "#06B6D4",
                                    "variant": "lakeside",
                                },
                                "text": "Lakeside Neurology Clinic — Change of Building",
                                "questions": [
                                    {
                                        "q": "Why has the location of the appointment changed?",
                                        "options": [
                                            "The main building is closed for refurbishment",
                                            "Dr Lindsay has moved practice",
                                            "The original clinic has closed permanently",
                                        ],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "How far is the new location from the original clinic?",
                                        "options": ["1.5 miles", "5 miles", "150 metres"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "What transport option is available between the two sites?",
                                        "options": [
                                            "A free shuttle bus every 30 minutes on weekdays",
                                            "A taxi paid by the clinic",
                                            "A train every hour",
                                        ],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "What must you do if you need mobility support at the new building?",
                                        "options": [
                                            "Telephone the neurology team at least 48 hours in advance",
                                            "Arrive 10 minutes early and ask at reception",
                                            "Bring your own ramp",
                                        ],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "What is one reason you should not delay telling the clinic if you cannot attend?",
                                        "options": [
                                            "Rearrangement may add several weeks to your wait",
                                            "You will be charged a cancellation fee",
                                            "You will need to fill in a long form",
                                        ],
                                        "answer": 0,
                                    },
                                ],
                            },
                            {
                                "id": 6,
                                "title": "Back Care Group Class",
                                "summary": "A group class confirmation from Meadow Physiotherapy Clinic.",
                                "letterhead": {
                                    "clinic_name": "Meadow Physiotherapy Clinic",
                                    "address_lines": ["16 Meadow Road", "Eastmere, EM2 3NC"],
                                    "phone": "01632 960771",
                                    "email": "MeadowPhysiotherapy@queries.com",
                                    "recipient_lines": [
                                        "Mr/Ms D. Sample",
                                        "11 Poplar Street",
                                        "Eastmere, EM4 6PH",
                                    ],
                                    "date": "19 June",
                                    "ref": "MPC/GRP/8849",
                                    "subject": "Back Care Group Class",
                                    "greeting": "Dear Mr/Ms Sample,",
                                    "body": [
                                        "We are writing to confirm your place in the Back Care Group Class at Meadow Physiotherapy Clinic. The class is led by Jane Roberts, Senior Physiotherapist, and is designed to help you manage back pain through gentle exercise and education.",
                                    ],
                                    "details_label": "Class Details:",
                                    "details": [
                                        "Date: 19 June",
                                        "Time: 10:00 AM",
                                        "Duration: 90 minutes",
                                        "Location: Group Exercise Room, First Floor",
                                    ],
                                    "sections": [
                                        {
                                            "heading": "Before You Attend",
                                            "paragraphs": [
                                                "Wear loose, comfortable clothing and bring a bottle of water. Eat a light snack at least one hour before the class to keep your energy levels steady.",
                                            ],
                                        },
                                        {
                                            "heading": "Please Do Not Attend If You Have",
                                            "paragraphs": [
                                                "Please do not attend the class if you have:",
                                            ],
                                            "bullets": [
                                                "new or worsening back pain in the last 48 hours,",
                                                "numbness, weakness, or tingling in your legs, or",
                                                "any loss of bladder or bowel control.",
                                            ],
                                            "paragraphs_after": [
                                                "If you develop any of these symptoms, contact the clinic on 01632 961048 before attending. If you have sudden loss of bladder or bowel control, call 999/911 immediately, as this can be a sign of a serious condition.",
                                            ],
                                        },
                                    ],
                                    "signoff": ["Kind regards,", "Physiotherapy Team", "Meadow Physiotherapy Clinic"],
                                    "accent_color": "#059669",
                                    "variant": "meadow",
                                },
                                "text": "Meadow Physiotherapy Clinic — Back Care Group Class",
                                "questions": [
                                    {
                                        "q": "What is the purpose of this group class?",
                                        "options": [
                                            "To help manage back pain through gentle exercise and education",
                                            "To assess whether you need surgery",
                                            "To prescribe new medication",
                                        ],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "How long does the class last?",
                                        "options": ["90 minutes", "30 minutes", "Three hours"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "Name two symptoms that mean you should contact the clinic before attending.",
                                        "options": [
                                            "New worsening back pain and numbness or tingling in the legs",
                                            "A mild headache and a runny nose",
                                            "Hunger and thirst",
                                        ],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "Which symptom requires you to call 999/911 rather than the clinic?",
                                        "options": [
                                            "Sudden loss of bladder or bowel control",
                                            "Mild back stiffness",
                                            "Tiredness after exercise",
                                        ],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "Why is it important to eat a light snack before the class?",
                                        "options": [
                                            "To keep your energy levels steady",
                                            "Because food is not allowed afterwards",
                                            "To avoid feeling thirsty",
                                        ],
                                        "answer": 0,
                                    },
                                ],
                            },
                            {
                                "id": 7,
                                "title": "Stroke Clinic Follow-up",
                                "summary": "A follow-up appointment letter from Northfield Stroke Clinic.",
                                "letterhead": {
                                    "clinic_name": "Northfield Stroke Clinic",
                                    "address_lines": ["8 Northfield Road", "Kingsford, KF3 7MT"],
                                    "phone": "01632 960771",
                                    "recipient_lines": [
                                        "Mr/Ms B. Sample",
                                        "19 Laurel Way",
                                        "Kingsford, KF5 2BQ",
                                    ],
                                    "date": "5 May",
                                    "ref": "NSC/FU/1063",
                                    "subject": "Stroke Clinic Follow-up",
                                    "greeting": "Dear Mr/Ms Sample,",
                                    "body": [
                                        "This letter confirms your follow-up appointment at Northfield Stroke Clinic with Dr Owens. The appointment will review your recovery, assess any ongoing symptoms, and update your care plan.",
                                    ],
                                    "details_label": "Appointment Details:",
                                    "details": [
                                        "Date: 5 May",
                                        "Time: 11:30 AM",
                                        "Location: Stroke Clinic, Outpatient Wing, Level 2",
                                    ],
                                    "sections": [
                                        {
                                            "heading": "Before Your Appointment",
                                            "paragraphs": [
                                                "Bring a list of your current medication and any notes about new or changed symptoms since your last visit. If you have a family member or friend who can attend with you, their support is welcome.",
                                            ],
                                        },
                                        {
                                            "heading": "Important Safety Advice",
                                            "paragraphs": [
                                                "If you notice any of the following before your appointment, do not wait. These are signs of a stroke and require emergency care:",
                                            ],
                                            "bullets": [
                                                "Face drooping on one side,",
                                                "Arm weakness,",
                                                "Speech difficulty,",
                                                "Time to call 999/911 immediately.",
                                            ],
                                        },
                                        {
                                            "heading": "If You Cannot Attend",
                                            "paragraphs": [
                                                "Telephone the clinic on 01632 961267 at least 24 hours in advance so we can offer the appointment to another patient.",
                                            ],
                                        },
                                    ],
                                    "signoff": ["Kind regards,", "Stroke Clinic Team", "Northfield Stroke Clinic"],
                                    "accent_color": "#7C3AED",
                                    "variant": "northfield",
                                },
                                "text": "Northfield Stroke Clinic — Follow-up Appointment",
                                "questions": [
                                    {
                                        "q": "What will happen at this appointment?",
                                        "options": [
                                            "A review of your recovery, an assessment of ongoing symptoms, and an update of your care plan",
                                            "A blood test only",
                                            "A new prescription with no examination",
                                        ],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "Name two things you should bring with you.",
                                        "options": [
                                            "A list of medication and notes about new or changed symptoms",
                                            "A swimming costume and a towel",
                                            "A urine sample and a hot drink",
                                        ],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "What does the word FAST stand for in the safety advice?",
                                        "options": [
                                            "Face drooping, Arm weakness, Speech difficulty, Time to call 999",
                                            "Fast Arrival Saves Time",
                                            "First Aid for Strokes Today",
                                        ],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "If you noticed sudden arm weakness before the appointment, what should you do?",
                                        "options": [
                                            "Call 999/911 immediately",
                                            "Wait for the scheduled appointment",
                                            "Send an email to the clinic",
                                        ],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "How much notice should you give if you cannot attend?",
                                        "options": ["At least 24 hours", "At least 1 hour", "At least 72 hours"],
                                        "answer": 0,
                                    },
                                ],
                            },
                            {
                                "id": 8,
                                "title": "Urgent Diabetic Foot Review",
                                "summary": "An urgent diabetic foot review letter from Willowbank Foot Clinic.",
                                "letterhead": {
                                    "clinic_name": "Willowbank Foot Clinic",
                                    "address_lines": ["14 Willowbank Road", "Burnford, BR4 6HS"],
                                    "phone": "+123-456-7890",
                                    "email": "hello@willowbank.com",
                                    "recipient_lines": [
                                        "Mr/Ms H. Example",
                                        "4 Ivy Crescent",
                                        "Burnford, BR5 2LE",
                                    ],
                                    "date": "9 June",
                                    "ref": "WFC/URG/1749",
                                    "subject": "Urgent Diabetic Foot Review",
                                    "greeting": "Dear Mr/Ms Example,",
                                    "body": [
                                        "Following the concerns raised at your recent GP appointment, we have arranged an urgent diabetic foot review with Nurse Collins at Willowbank Foot Clinic. It is important to attend this appointment so that any changes can be assessed early.",
                                    ],
                                    "details_label": "Appointment Details:",
                                    "details": [
                                        "Date: 9 June",
                                        "Time: 10:45 AM",
                                        "Location: Clinic Room 1, Ground Floor",
                                    ],
                                    "sections": [
                                        {
                                            "heading": "Before Your Appointment",
                                            "paragraphs": [
                                                "Wear shoes and socks that are easy to remove. Wash and dry your feet carefully on the morning of the appointment, but do not apply cream, lotion, or nail polish.",
                                                "Bring a list of your current medication and your most recent blood sugar readings if you have them.",
                                            ],
                                        },
                                        {
                                            "heading": "Important Safety Advice",
                                            "paragraphs": [
                                                "If you notice any of the following before your appointment, telephone the foot clinic on 01632 962034 the same day:",
                                            ],
                                            "bullets": [
                                                "new redness, warmth, or swelling in the foot,",
                                                "a wound that is not healing, or",
                                                "a new or deeper ulcer on the foot.",
                                            ],
                                            "paragraphs_after": [
                                                "If you develop a high fever, severe pain, or feel generally unwell, this may be a sign of serious infection. Do not wait for the appointment. Contact 111 for urgent advice, or attend A&E if you feel very unwell.",
                                            ],
                                        },
                                        {
                                            "heading": "If You Cannot Attend",
                                            "paragraphs": [
                                                "Please rearrange as soon as possible. Diabetic foot problems can worsen quickly, and we want to make sure you are seen without delay.",
                                            ],
                                        },
                                    ],
                                    "signoff": ["Kind regards,", "Podiatry Team", "Willowbank Foot Clinic"],
                                    "accent_color": "#1E3A8A",
                                    "variant": "willowbank",
                                },
                                "text": "Willowbank Foot Clinic — Urgent Diabetic Foot Review",
                                "questions": [
                                    {
                                        "q": "Why has this appointment been arranged as urgent?",
                                        "options": [
                                            "Because of concerns raised at your recent GP appointment, so changes can be assessed early",
                                            "Because the clinic has spare capacity",
                                            "Because all reviews are urgent at this clinic",
                                        ],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "Name two things you should not put on your feet on the morning of the appointment.",
                                        "options": [
                                            "Cream and nail polish",
                                            "Socks and shoes",
                                            "Water and soap",
                                        ],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "Which symptoms should prompt you to telephone the clinic the same day?",
                                        "options": [
                                            "New redness, warmth or swelling, a wound that is not healing, or a new or deeper ulcer",
                                            "A mild ache after walking",
                                            "Cold feet in the evening",
                                        ],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "Which symptoms suggest a serious infection?",
                                        "options": [
                                            "A high fever, severe pain, or feeling generally unwell",
                                            "A small blister",
                                            "Feeling tired after exercise",
                                        ],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "Why is it important not to delay rearranging if you cannot attend?",
                                        "options": [
                                            "Diabetic foot problems can worsen quickly",
                                            "You will be charged a fee",
                                            "The clinic will lose your records",
                                        ],
                                        "answer": 0,
                                    },
                                ],
                            },
                            {
                                "id": 9,
                                "title": "Cardiology Review Appointment",
                                "summary": "A cardiology review letter from Highfield Cardiology Unit.",
                                "letterhead": {
                                    "clinic_name": "Highfield Cardiology Unit",
                                    "address_lines": ["17 Highfield Avenue", "Westbridge, WB7 3QK"],
                                    "phone": "01632 961485",
                                    "website": "hello@highfield.com",
                                    "recipient_lines": [
                                        "Mr/Ms F. Sample",
                                        "6 Orchard Way",
                                        "Westbridge, WB8 9JH",
                                    ],
                                    "date": "12 June",
                                    "ref": "HCU/REV/1287",
                                    "subject": "Cardiology Review Appointment",
                                    "greeting": "Dear Mr/Ms Sample,",
                                    "body": [
                                        "Your cardiology review appointment with Dr Marsh, Consultant Cardiologist, has been arranged at Highfield Cardiology Unit. The appointment will review your heart health and may include an ECG or other tests depending on your symptoms.",
                                    ],
                                    "details_label": "Appointment Details:",
                                    "details": [
                                        "Date: 12 June",
                                        "Time: 9:45 AM",
                                        "Location: Cardiology Outpatients, Ground Floor (follow red signs)",
                                    ],
                                    "sections": [
                                        {
                                            "heading": "Before Your Appointment",
                                            "paragraphs": [
                                                "Allow extra time in case additional tests are needed. Wear a loose-fitting top that is easy to remove. Do not use body lotion or cream on your chest on the day of the appointment, as this can interfere with the ECG.",
                                            ],
                                        },
                                        {
                                            "heading": "Important Safety Advice",
                                            "paragraphs": [
                                                "If you experience any of the following before your appointment:",
                                            ],
                                            "bullets": [
                                                "chest pain,",
                                                "severe breathlessness,",
                                                "new swelling of the legs, or",
                                                "fainting or collapse,",
                                            ],
                                            "paragraphs_after": [
                                                "do not wait for your appointment. You must call 999/911 immediately.",
                                            ],
                                        },
                                        {
                                            "heading": "If You Need to Rearrange",
                                            "paragraphs": [
                                                "Telephone the cardiology team on 01632 961485 during office hours.",
                                            ],
                                        },
                                    ],
                                    "signoff": ["Kind regards,", "Cardiology Appointments Office", "Highfield Cardiology Unit"],
                                    "accent_color": "#EAB308",
                                    "variant": "highfield",
                                },
                                "text": "Highfield Cardiology Unit — Cardiology Review Appointment",
                                "questions": [
                                    {
                                        "q": "What is the purpose of this appointment?",
                                        "options": [
                                            "To review your heart health, possibly including an ECG or other tests",
                                            "To collect a prescription only",
                                            "To check your eyes and hearing",
                                        ],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "Why should you avoid body lotion on your chest on the day of the appointment?",
                                        "options": [
                                            "It can interfere with the ECG",
                                            "It is not allowed in the clinic",
                                            "It will stain the bed sheets",
                                        ],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "Which four symptoms listed mean you must call 999/911?",
                                        "options": [
                                            "Chest pain, severe breathlessness, new swelling of the legs, fainting or collapse",
                                            "Mild headache, sneezing, sore throat, tiredness",
                                            "Hunger, thirst, sweating, mild cough",
                                        ],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "What should you do if you need to rearrange the appointment?",
                                        "options": [
                                            "Telephone the cardiology team during office hours",
                                            "Send a letter by post",
                                            "Just turn up on a different day",
                                        ],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "Why might you need to allow extra time for this appointment?",
                                        "options": [
                                            "In case additional tests are needed",
                                            "Because the clinic is always running late",
                                            "To find a parking space",
                                        ],
                                        "answer": 0,
                                    },
                                ],
                            },
                            {
                                "id": 10,
                                "title": "Pre-assessment Appointment for Surgery",
                                "summary": "A pre-assessment letter from Greenhill Hospital.",
                                "letterhead": {
                                    "clinic_name": "Greenhill Hospital",
                                    "address_lines": ["2 Greenhill Way", "Eastmere, EM6 7TK"],
                                    "phone": "01632 961703",
                                    "website": "hello@greenhill.com",
                                    "recipient_lines": [
                                        "Mr/Ms P. Sample",
                                        "33 Ashfield Road",
                                        "Eastmere, EM8 1LJ",
                                    ],
                                    "date": "17 July",
                                    "ref": "GHH/PRE/1418",
                                    "subject": "Pre-assessment Appointment for Surgery",
                                    "greeting": "Dear Mr/Ms Sample,",
                                    "body": [
                                        "We are writing to confirm your pre-assessment appointment at Greenhill Hospital ahead of your upcoming surgery. This appointment checks that you are fit for the procedure and typically includes blood tests, a health questionnaire, and discussion of the operation.",
                                    ],
                                    "details_label": "Appointment Details:",
                                    "details": [
                                        "Date: 17 July",
                                        "Time: 1:00 PM",
                                        "Location: Pre-assessment Unit, Level 2",
                                    ],
                                    "sections": [
                                        {
                                            "heading": "What to Bring",
                                            "bullets": [
                                                "A complete list of all your current medication, including tablets, inhalers, creams, and any supplements",
                                                "Photo identification, such as a passport or driving licence",
                                                "A list of any allergies you have",
                                                "The name and contact details of someone who can collect you after surgery",
                                            ],
                                        },
                                        {
                                            "heading": "Before Your Appointment",
                                            "paragraphs": [
                                                "Eat and drink normally on the day of the pre-assessment. If you have a cold, chest infection, or any sign of illness in the week before the appointment, contact the unit as the surgery may need to be postponed.",
                                            ],
                                        },
                                        {
                                            "heading": "If You Cannot Attend",
                                            "paragraphs": [
                                                "Telephone the pre-assessment team on 01632 961703 at least 72 hours in advance. Failure to attend may result in your surgery being delayed.",
                                            ],
                                        },
                                    ],
                                    "signoff": ["Kind regards,", "Pre-assessment Team", "Greenhill Hospital"],
                                    "accent_color": "#0D9488",
                                    "variant": "greenhill",
                                },
                                "text": "Greenhill Hospital — Pre-assessment Appointment for Surgery",
                                "questions": [
                                    {
                                        "q": "What is the purpose of a pre-assessment appointment?",
                                        "options": [
                                            "To check that you are fit for the procedure",
                                            "To replace the surgery itself",
                                            "To collect a prescription",
                                        ],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "Name three things you should bring with you.",
                                        "options": [
                                            "A list of medication, photo identification, and a list of allergies",
                                            "A swimming costume, a towel, and a snack",
                                            "Your appointment letter only",
                                        ],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "What should you do if you have a cold in the week before the appointment?",
                                        "options": [
                                            "Contact the unit, as the surgery may need to be postponed",
                                            "Take extra medication and attend anyway",
                                            "Wait until the day to decide",
                                        ],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "How much notice should you give if you cannot attend?",
                                        "options": [
                                            "At least 72 hours",
                                            "At least 24 hours",
                                            "Just before the appointment",
                                        ],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "What could happen if you miss the pre-assessment without notice?",
                                        "options": [
                                            "Your surgery may be delayed",
                                            "You will be charged a fine",
                                            "Nothing will happen",
                                        ],
                                        "answer": 0,
                                    },
                                ],
                            },
                        ],
                    },
                },
            },
        },
        {
            "slug": "prescription-medication-labels",
            "title": "Reading Prescription and Medication Labels",
            "summary": "Read pharmacy and medication labels and answer questions. Choose your difficulty.",
            "duration_min": 15,
            "type": "reading-leveled",
            "content": {
                "levels": {
                    "green": {
                        "key": "green",
                        "title": "Foundational",
                        "blurb": "10 single pharmacy dispensing labels with three retrieval questions covering the medication, dose, and timing.",
                        "best_for": "Clients who can read short sentences and are working on finding key information on a medication label.",
                        "questions_per_letter": 3,
                        "target_letter_count": 10,
                        "item_label_singular": "Label",
                        "item_label_plural": "labels",
                        "est_minutes": "8–12 min",
                        "letters": [
                            {
                                "id": 1,
                                "title": "Paracetamol",
                                "summary": "A dispensing label from Oakwood Pharmacy.",
                                "letterhead": {
                                    "format": "label",
                                    "variant": "oakwood-rx",
                                    "clinic_name": "Oakwood Pharmacy",
                                    "brand_color": "#0F4C9F",
                                    "address_lines": ["15 High Street", "Harford, HF3 4BP"],
                                    "phone": "01632 960520",
                                    "recipient_lines": [
                                        "Mr/Ms J. Example",
                                        "27 Elm Road, Harford, HF4 1QR",
                                    ],
                                    "medication": {
                                        "name": "Paracetamol 500mg tablets",
                                        "instruction": "Take 2 tablets, four times a day.",
                                        "instruction_uppercase": False,
                                        "quantity": "32 tablets",
                                        "date_dispensed": "xx/xx/xxxx",
                                        "prescriber": "Dr Bennett",
                                    },
                                },
                                "text": "Oakwood Pharmacy — Paracetamol 500mg",
                                "questions": [
                                    {
                                        "q": "What is the name of the medication?",
                                        "options": ["Paracetamol", "Ibuprofen", "Amoxicillin"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "How many tablets should you take each time?",
                                        "options": ["2 tablets", "1 tablet", "4 tablets"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "How many times a day should you take it?",
                                        "options": ["Four times a day", "Twice a day", "Once a day"],
                                        "answer": 0,
                                    },
                                ],
                            },
                            {
                                "id": 2,
                                "title": "Amoxicillin",
                                "summary": "A dispensing label from Brightside Pharmacy.",
                                "letterhead": {
                                    "format": "label",
                                    "variant": "brightside-rx",
                                    "clinic_name": "Brightside Pharmacy",
                                    "brand_color": "#1D4ED8",
                                    "address_lines": ["20 High Street", "Burnford, BR1 3HN"],
                                    "phone": "01632 960712",
                                    "recipient_lines": [
                                        "Mr/Ms J. Example",
                                        "14 Willow Grove, Burnford, BR2 6DL",
                                    ],
                                    "medication": {
                                        "name": "Amoxicillin 500mg capsules",
                                        "instruction": "Take 1 capsule, three times a day.",
                                        "instruction_uppercase": False,
                                        "quantity": "21 capsules",
                                        "date_dispensed": "xx/xx/xxxx",
                                        "prescriber": "Dr Carter",
                                    },
                                },
                                "text": "Brightside Pharmacy — Amoxicillin 500mg",
                                "questions": [
                                    {
                                        "q": "What is the name of this medication?",
                                        "options": ["Amoxicillin", "Paracetamol", "Atorvastatin"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "What dose should you take each time?",
                                        "options": ["1 capsule", "2 capsules", "3 capsules"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "How many capsules are in the pack?",
                                        "options": ["21", "12", "32"],
                                        "answer": 0,
                                    },
                                ],
                            },
                            {
                                "id": 3,
                                "title": "Amlodipine",
                                "summary": "A dispensing label from Maple Pharmacy.",
                                "letterhead": {
                                    "format": "label",
                                    "variant": "maple-rx",
                                    "clinic_name": "Maple Pharmacy",
                                    "brand_color": "#0F766E",
                                    "address_lines": ["9 Maple Avenue", "Southbridge, SB2 4RQ"],
                                    "phone": "01632 960825",
                                    "recipient_lines": [
                                        "Mr/Ms R. Sample",
                                        "32 Beech Road, Southbridge, SB3 8JL",
                                    ],
                                    "medication": {
                                        "name": "Amlodipine 5mg tablets",
                                        "instruction": "Take 1 tablet, once a day in the morning.",
                                        "instruction_uppercase": True,
                                        "quantity": "28 tablets",
                                        "date_dispensed": "xx/xx/xxxx",
                                        "prescriber": "Dr Wells",
                                    },
                                },
                                "text": "Maple Pharmacy — Amlodipine 5mg",
                                "questions": [
                                    {
                                        "q": "What medication is on this label?",
                                        "options": ["Amlodipine", "Amoxicillin", "Atorvastatin"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "What time of day should you take it?",
                                        "options": ["In the morning", "At night", "After food"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "Who is the prescriber?",
                                        "options": ["Dr Wells", "Dr Bennett", "Dr Carter"],
                                        "answer": 0,
                                    },
                                ],
                            },
                            {
                                "id": 4,
                                "title": "Atorvastatin",
                                "summary": "A dispensing label from Clearview Pharmacy.",
                                "letterhead": {
                                    "format": "label",
                                    "variant": "clearview-rx",
                                    "clinic_name": "Clearview Pharmacy",
                                    "brand_color": "#0F766E",
                                    "address_lines": ["23 Market Square", "Westbridge, WB4 2FP"],
                                    "phone": "01632 960934",
                                    "recipient_lines": [
                                        "Mr/Ms A. Example",
                                        "5 Cherry Lane, Westbridge, WB5 7AG",
                                    ],
                                    "medication": {
                                        "name": "Atorvastatin 20mg tablets",
                                        "instruction": "Take 1 tablet, once a day at night.",
                                        "instruction_uppercase": True,
                                        "quantity": "28 tablets",
                                        "date_dispensed": "xx/xx/xxxx",
                                        "prescriber": "Dr Patel",
                                    },
                                },
                                "text": "Clearview Pharmacy — Atorvastatin 20mg",
                                "questions": [
                                    {
                                        "q": "Which medication has been dispensed?",
                                        "options": ["Atorvastatin", "Amlodipine", "Paracetamol"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "When should you take this medication?",
                                        "options": ["At night", "In the morning", "Before food"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "How many tablets are in the pack?",
                                        "options": ["28", "21", "32"],
                                        "answer": 0,
                                    },
                                ],
                            },
                            {
                                "id": 5,
                                "title": "Omeprazole",
                                "summary": "A dispensing label from Meadow Pharmacy.",
                                "letterhead": {
                                    "format": "label",
                                    "variant": "meadow-rx",
                                    "clinic_name": "Meadow Pharmacy",
                                    "brand_color": "#1FA8A3",
                                    "address_lines": ["18 Meadow Road", "Eastmere, EM2 3NC"],
                                    "phone": "01632 961048",
                                    "recipient_lines": [
                                        "Mr/Ms D. Sample",
                                        "11 Poplar Street, Eastmere, EM4 6PH",
                                    ],
                                    "medication": {
                                        "name": "Omeprazole 20mg capsules",
                                        "instruction": "Take 1 capsule, once a day before food.",
                                        "instruction_uppercase": True,
                                        "quantity": "30 capsules",
                                        "date_dispensed": "xx/xx/xxxx",
                                        "prescriber": "Dr Roberts",
                                    },
                                },
                                "text": "Meadow Pharmacy — Omeprazole 20mg",
                                "questions": [
                                    {
                                        "q": "What medication is this?",
                                        "options": ["Omeprazole", "Amoxicillin", "Atorvastatin"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "How many capsules should you take each day?",
                                        "options": ["1 capsule", "2 capsules", "3 capsules"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "Should you take it before or after food?",
                                        "options": ["Before food", "After food", "With food"],
                                        "answer": 0,
                                    },
                                ],
                            },
                            {
                                "id": 6,
                                "title": "Levothyroxine",
                                "summary": "A dispensing label from Parkview Pharmacy.",
                                "letterhead": {
                                    "format": "label",
                                    "variant": "parkview-rx",
                                    "clinic_name": "Parkview Pharmacy",
                                    "brand_color": "#1E3A8A",
                                    "address_lines": ["5 Park Lane", "Rivertown, RT1 9QD"],
                                    "phone": "01632 961156",
                                    "recipient_lines": [
                                        "Mr/Ms E. Example",
                                        "22 Rowan Close, Rivertown, RT2 5KN",
                                    ],
                                    "medication": {
                                        "name": "Levothyroxine 50 micrograms tablets",
                                        "instruction": "Take 1 tablet, once a day in the morning.",
                                        "instruction_uppercase": True,
                                        "quantity": "28 tablets",
                                        "date_dispensed": "xx/xx/xxxx",
                                        "prescriber": "Dr Harris",
                                    },
                                },
                                "text": "Parkview Pharmacy — Levothyroxine 50 micrograms",
                                "questions": [
                                    {
                                        "q": "What is the name of the medication?",
                                        "options": ["Levothyroxine", "Metformin", "Salbutamol"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "What is the strength of each tablet?",
                                        "options": ["50 micrograms", "500 micrograms", "5mg"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "When should you take this medication?",
                                        "options": ["In the morning", "At night", "Before food"],
                                        "answer": 0,
                                    },
                                ],
                            },
                            {
                                "id": 7,
                                "title": "Metformin",
                                "summary": "A dispensing label from Northfield Pharmacy.",
                                "letterhead": {
                                    "format": "label",
                                    "variant": "northfield-rx",
                                    "clinic_name": "Northfield Pharmacy",
                                    "brand_color": "#0EA5E9",
                                    "address_lines": ["10 Northfield Road", "Kingsford, KF3 7MT"],
                                    "phone": "01632 961267",
                                    "recipient_lines": [
                                        "Mr/Ms B. Sample",
                                        "19 Laurel Way, Kingsford, KF5 2BQ",
                                    ],
                                    "medication": {
                                        "name": "Metformin 500mg tablets",
                                        "instruction": "Take 1 tablet, twice a day with food.",
                                        "instruction_uppercase": True,
                                        "quantity": "56 tablets",
                                        "date_dispensed": "xx/xx/xxxx",
                                        "prescriber": "Dr Owens",
                                    },
                                },
                                "text": "Northfield Pharmacy — Metformin 500mg",
                                "questions": [
                                    {
                                        "q": "What medication has been prescribed?",
                                        "options": ["Metformin", "Levothyroxine", "Atorvastatin"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "How many times a day should you take it?",
                                        "options": ["Twice a day", "Once a day", "Three times a day"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "What should you take it with?",
                                        "options": ["Food", "Water only", "Juice"],
                                        "answer": 0,
                                    },
                                ],
                            },
                            {
                                "id": 8,
                                "title": "Salbutamol Inhaler",
                                "summary": "A dispensing label from Highfield Pharmacy.",
                                "letterhead": {
                                    "format": "label",
                                    "variant": "highfield-rx",
                                    "clinic_name": "Highfield Pharmacy",
                                    "brand_color": "#0F172A",
                                    "address_lines": ["19 Highfield Avenue", "Westbridge, WB7 3QK"],
                                    "phone": "01632 961485",
                                    "recipient_lines": [
                                        "Mr/Ms F. Sample",
                                        "6 Orchard Way, Westbridge, WB8 9JH",
                                    ],
                                    "medication": {
                                        "name": "Salbutamol 100 micrograms inhaler",
                                        "instruction": "Use 1 to 2 puffs when needed for breathlessness.",
                                        "instruction_uppercase": True,
                                        "quantity": "1 inhaler",
                                        "date_dispensed": "xx/xx/xxxx",
                                        "prescriber": "Dr Marsh",
                                    },
                                },
                                "text": "Highfield Pharmacy — Salbutamol 100 micrograms inhaler",
                                "questions": [
                                    {
                                        "q": "What is this medication for?",
                                        "options": ["Breathlessness", "Headaches", "Indigestion"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "How many puffs should you use each time?",
                                        "options": ["1 to 2 puffs", "3 to 4 puffs", "5 puffs"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "When should you use this inhaler?",
                                        "options": ["When needed", "At night only", "In the morning only"],
                                        "answer": 0,
                                    },
                                ],
                            },
                            {
                                "id": 9,
                                "title": "Hydrocortisone Cream",
                                "summary": "A dispensing label from Willowbank Pharmacy.",
                                "letterhead": {
                                    "format": "label",
                                    "variant": "willowbank-rx",
                                    "clinic_name": "Willowbank Pharmacy",
                                    "brand_color": "#7C5BB8",
                                    "address_lines": ["16 Willowbank Road", "Burnford, BR4 6HS"],
                                    "phone": "01632 962034",
                                    "recipient_lines": [
                                        "Mr/Ms H. Example",
                                        "4 Ivy Crescent, Burnford, BR5 2LE",
                                    ],
                                    "medication": {
                                        "name": "Hydrocortisone 1% cream",
                                        "instruction": "Apply a thin layer to the affected area, twice a day.",
                                        "instruction_uppercase": True,
                                        "quantity": "30g tube",
                                        "date_dispensed": "xx/xx/xxxx",
                                        "prescriber": "Dr Whitehouse",
                                    },
                                },
                                "text": "Willowbank Pharmacy — Hydrocortisone 1% cream",
                                "questions": [
                                    {
                                        "q": "What is the name of this medication?",
                                        "options": ["Hydrocortisone cream", "Antibiotic cream", "Sun cream"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "How should you apply the cream?",
                                        "options": ["A thin layer", "A thick layer", "All over the body"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "How many times a day should you apply it?",
                                        "options": ["Twice a day", "Once a day", "Four times a day"],
                                        "answer": 0,
                                    },
                                ],
                            },
                            {
                                "id": 10,
                                "title": "Lubricating Eye Drops",
                                "summary": "A dispensing label from Soundwell Pharmacy.",
                                "letterhead": {
                                    "format": "label",
                                    "variant": "soundwell-rx",
                                    "clinic_name": "Soundwell Pharmacy",
                                    "brand_color": "#0F766E",
                                    "address_lines": ["7 Soundwell Road", "Northleigh, NL6 4GQ"],
                                    "phone": "01632 961925",
                                    "recipient_lines": [
                                        "Mr/Ms G. Sample",
                                        "28 Juniper Way, Northleigh, NL7 8RP",
                                    ],
                                    "medication": {
                                        "name": "Lubricating eye drops",
                                        "instruction": "Use 1 drop in each eye, four times a day.",
                                        "instruction_uppercase": True,
                                        "quantity": "10ml bottle",
                                        "date_dispensed": "xx/xx/xxxx",
                                        "prescriber": "Dr Carpenter",
                                    },
                                },
                                "text": "Soundwell Pharmacy — Lubricating eye drops",
                                "questions": [
                                    {
                                        "q": "What are these drops used for?",
                                        "options": ["Eyes", "Ears", "Nose"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "How many drops should you use in each eye?",
                                        "options": ["1 drop", "2 drops", "3 drops"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "How often should you use the drops?",
                                        "options": ["Four times a day", "Twice a day", "Once a day"],
                                        "answer": 0,
                                    },
                                ],
                            },
                        ],
                    },
                    "amber": {
                        "key": "amber",
                        "title": "Intermediate",
                        "blurb": "10 dispensing labels with four questions per label. Includes secondary instructions, warning stickers, and more complex dosing schedules.",
                        "best_for": "Clients who can read short paragraphs and are working on linking a main instruction to a secondary warning.",
                        "questions_per_letter": 4,
                        "target_letter_count": 10,
                        "item_label_singular": "Label",
                        "item_label_plural": "labels",
                        "est_minutes": "15–20 min",
                        "letters": [
                            {
                                "id": 1,
                                "title": "Co-codamol",
                                "summary": "A dispensing label from Oakwood Pharmacy with a drowsiness warning.",
                                "letterhead": {
                                    "format": "label",
                                    "variant": "oakwood-rx",
                                    "clinic_name": "Oakwood Pharmacy",
                                    "brand_color": "#0F4C9F",
                                    "address_lines": ["15 High Street, Harford, HF3 4BP"],
                                    "phone": "01632 960520",
                                    "recipient_lines": [
                                        "Ms Smith",
                                        "27 Elm Road, Harford, HF4 1QR",
                                    ],
                                    "medication": {
                                        "name": "Co-codamol 8/500mg tablets",
                                        "instruction": "Take 2 tablets, four times a day for pain. Do not take more than 8 tablets in 24 hours.",
                                        "instruction_uppercase": False,
                                        "quantity": "32 tablets",
                                        "prescriber": "Dr Bennett",
                                        "rx_number": "02418-11624",
                                        "warning": "May cause drowsiness. Do not drive or operate machinery.",
                                    },
                                },
                                "text": "Oakwood Pharmacy — Co-codamol 8/500mg",
                                "questions": [
                                    {
                                        "q": "Which medication has been prescribed?",
                                        "options": ["Co-codamol", "Paracetamol", "Ibuprofen"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "What is the maximum number of tablets you can take in 24 hours?",
                                        "options": ["8 tablets", "2 tablets", "4 tablets"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "Why should you avoid driving while taking this medication?",
                                        "options": [
                                            "It may cause drowsiness",
                                            "It must be taken with food",
                                            "It can blur your vision",
                                        ],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "How many tablets should you take in one dose?",
                                        "options": ["2 tablets", "1 tablet", "4 tablets"],
                                        "answer": 0,
                                    },
                                ],
                            },
                            {
                                "id": 2,
                                "title": "Flucloxacillin",
                                "summary": "A dispensing label from Brightside Medical Practice with course-completion advice.",
                                "letterhead": {
                                    "format": "label",
                                    "variant": "brightside-rx",
                                    "clinic_name": "Brightside Medical Practice",
                                    "brand_color": "#1D4ED8",
                                    "address_lines": ["20 High Street, Burnford, BR1 3HN"],
                                    "phone": "01632 960712",
                                    "recipient_lines": [
                                        "Ms Seren",
                                        "4 Willow Grove, Burnford, BR2 6DL",
                                    ],
                                    "medication": {
                                        "name": "Flucloxacillin 500mg capsules",
                                        "instruction": "Take 1 capsule, four times a day for 7 days. Take on an empty stomach, at least 1 hour before food or 2 hours after food.",
                                        "instruction_uppercase": False,
                                        "quantity": "28 capsules",
                                        "prescriber": "Dr Nanunes",
                                        "rx_number": "02418-11624",
                                        "warning": "Complete the full course even if you feel better.",
                                    },
                                },
                                "text": "Brightside Medical Practice — Flucloxacillin 500mg",
                                "questions": [
                                    {
                                        "q": "What is the name of this medication?",
                                        "options": ["Flucloxacillin", "Amoxicillin", "Co-codamol"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "How many days should you take this medication for?",
                                        "options": ["7 days", "4 days", "14 days"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "When should you take the capsules in relation to food?",
                                        "options": [
                                            "On an empty stomach",
                                            "With every meal",
                                            "Straight after food",
                                        ],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "Why is it important to complete the full course?",
                                        "options": [
                                            "To make sure the infection is fully treated",
                                            "Because the pharmacy will not give you more",
                                            "So the capsules do not go out of date",
                                        ],
                                        "answer": 0,
                                    },
                                ],
                            },
                            {
                                "id": 3,
                                "title": "Bendroflumethiazide",
                                "summary": "A dispensing label from Maple Pharmacy with a morning-dose warning.",
                                "letterhead": {
                                    "format": "label",
                                    "variant": "maple-rx",
                                    "clinic_name": "Maple Pharmacy",
                                    "brand_color": "#0F766E",
                                    "address_lines": ["9 Maple Avenue, Southbridge, SB2 4RQ"],
                                    "phone": "01632 960825",
                                    "recipient_lines": [
                                        "Ms Antonia",
                                        "32 Beech Road, Southbridge, SB3 8JL",
                                    ],
                                    "medication": {
                                        "name": "Bendroflumethiazide 2.5mg tablets",
                                        "instruction": "Take 1 tablet, once a day in the morning. This medication may make you pass urine more often.",
                                        "instruction_uppercase": True,
                                        "quantity": "28 tablets",
                                        "prescriber": "Dr Marques",
                                        "rx_number": "02634-17095",
                                        "warning": "Take in the morning to avoid needing the toilet at night.",
                                    },
                                },
                                "text": "Maple Pharmacy — Bendroflumethiazide 2.5mg",
                                "questions": [
                                    {
                                        "q": "What is the name of this medication?",
                                        "options": ["Bendroflumethiazide", "Amlodipine", "Atorvastatin"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "How many tablets should you take each day?",
                                        "options": ["1 tablet", "2 tablets", "3 tablets"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "Why should you take this medication in the morning?",
                                        "options": [
                                            "To avoid needing the toilet at night",
                                            "Because it must be taken with breakfast",
                                            "So it does not upset your stomach",
                                        ],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "What effect might this medication have on your body?",
                                        "options": [
                                            "You may pass urine more often",
                                            "You may feel hungrier than usual",
                                            "You may sweat more",
                                        ],
                                        "answer": 0,
                                    },
                                ],
                            },
                            {
                                "id": 4,
                                "title": "Sertraline",
                                "summary": "A dispensing label from Clearview Pharmacy with an alcohol warning.",
                                "letterhead": {
                                    "format": "label",
                                    "variant": "clearview-rx",
                                    "clinic_name": "Clearview Pharmacy",
                                    "brand_color": "#0F766E",
                                    "address_lines": ["23 Market Square, Westbridge, WB4 2FP"],
                                    "phone": "01632 960934",
                                    "recipient_lines": [
                                        "Mr Jones",
                                        "5 Cherry Lane, Westbridge, WB5 7AG",
                                    ],
                                    "medication": {
                                        "name": "Sertraline 50mg tablets",
                                        "instruction": "Take 1 tablet, once a day in the morning. This medication may take 2 to 4 weeks to start working.",
                                        "instruction_uppercase": True,
                                        "quantity": "28 tablets",
                                        "prescriber": "Dr Smith",
                                        "rx_number": "02746-19418",
                                        "warning": "Avoid alcohol while taking this medication.",
                                    },
                                },
                                "text": "Clearview Pharmacy — Sertraline 50mg",
                                "questions": [
                                    {
                                        "q": "What medication has been prescribed?",
                                        "options": ["Sertraline", "Atorvastatin", "Amlodipine"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "When should you take this medication?",
                                        "options": ["Once a day in the morning", "At night", "Twice a day with food"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "How long might it take before this medication starts working?",
                                        "options": ["2 to 4 weeks", "A few hours", "1 to 2 days"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "What should you avoid while taking this medication?",
                                        "options": ["Alcohol", "Dairy products", "Caffeine"],
                                        "answer": 0,
                                    },
                                ],
                            },
                            {
                                "id": 5,
                                "title": "Gabapentin",
                                "summary": "A dispensing label from Maple Pharmacy with a step-up dosing schedule.",
                                "letterhead": {
                                    "format": "label",
                                    "variant": "meadow-rx",
                                    "clinic_name": "Maple Pharmacy",
                                    "brand_color": "#1FA8A3",
                                    "address_lines": ["18 Meadow Road, Eastmere, EM2 3NC"],
                                    "phone": "01632 961048",
                                    "recipient_lines": [
                                        "Mrs Kim",
                                        "11 Poplar Street, Eastmere, EM4 6PH",
                                    ],
                                    "medication": {
                                        "name": "Gabapentin 300mg capsules",
                                        "instruction": "Take 1 capsule at night for the first 3 days. Then take 1 capsule twice a day for 3 days. Then take 1 capsule three times a day.",
                                        "instruction_uppercase": True,
                                        "quantity": "100 capsules",
                                        "prescriber": "Dr Green",
                                        "rx_number": "02857-21731",
                                        "warning": "May cause drowsiness or dizziness. Do not drive until you know how this medicine affects you.",
                                    },
                                },
                                "text": "Maple Pharmacy — Gabapentin 300mg",
                                "questions": [
                                    {
                                        "q": "What is the name of this medication?",
                                        "options": ["Gabapentin", "Sertraline", "Co-codamol"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "How should you take the medication in the first 3 days?",
                                        "options": [
                                            "1 capsule at night",
                                            "1 capsule three times a day",
                                            "1 capsule in the morning",
                                        ],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "How does the dose change after the first week?",
                                        "options": [
                                            "It increases to three times a day",
                                            "It stays the same",
                                            "It decreases to once a day",
                                        ],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "Why should you avoid driving when you first start this medication?",
                                        "options": [
                                            "It may cause drowsiness or dizziness",
                                            "It can blur your vision permanently",
                                            "It may give you a headache",
                                        ],
                                        "answer": 0,
                                    },
                                ],
                            },
                            {
                                "id": 6,
                                "title": "Doxycycline",
                                "summary": "A dispensing label from Parklane Pharmacy with a sun-sensitivity warning.",
                                "letterhead": {
                                    "format": "label",
                                    "variant": "parkview-rx",
                                    "clinic_name": "Parklane Pharmacy",
                                    "brand_color": "#1E3A8A",
                                    "address_lines": ["5 Park Lane, Rivertown, RT1 9QD"],
                                    "phone": "01632 961156",
                                    "recipient_lines": [
                                        "Mrs Harris",
                                        "22 Rowan Close, Rivertown, RT2 5KN",
                                    ],
                                    "medication": {
                                        "name": "Doxycycline 100mg capsules",
                                        "instruction": "Take 1 capsule, once a day for 7 days. Swallow whole with a full glass of water. Do not lie down for 30 minutes after taking.",
                                        "instruction_uppercase": True,
                                        "quantity": "7 capsules",
                                        "prescriber": "Dr Manon",
                                        "rx_number": "530011-24234",
                                        "warning": "This medicine may make your skin more sensitive to sunlight. Use sun screen and avoid strong sunlight.",
                                    },
                                },
                                "text": "Parklane Pharmacy — Doxycycline 100mg",
                                "questions": [
                                    {
                                        "q": "What medication is on this label?",
                                        "options": ["Doxycycline", "Amoxicillin", "Flucloxacillin"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "How should you swallow the capsule?",
                                        "options": [
                                            "Whole, with a full glass of water",
                                            "Chewed with food",
                                            "Crushed in a drink",
                                        ],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "What should you not do for 30 minutes after taking the capsule?",
                                        "options": ["Lie down", "Eat anything", "Drink water"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "Why should you avoid strong sunlight while taking this medication?",
                                        "options": [
                                            "It can make your skin more sensitive to sunlight",
                                            "It can stop the medication from working",
                                            "It can cause headaches in bright light",
                                        ],
                                        "answer": 0,
                                    },
                                ],
                            },
                            {
                                "id": 7,
                                "title": "Naproxen",
                                "summary": "A dispensing label from Northfield Pharmacy with stomach-side-effect advice.",
                                "letterhead": {
                                    "format": "label",
                                    "variant": "northfield-rx",
                                    "clinic_name": "Northfield Pharmacy",
                                    "brand_color": "#0EA5E9",
                                    "address_lines": ["10 Northfield Road, Kingsford, KF3 7MT"],
                                    "phone": "01632 961267",
                                    "recipient_lines": [
                                        "Mrs Gear",
                                        "19 Laurel Way, Kingsford, KF5 2BQ",
                                    ],
                                    "medication": {
                                        "name": "Naproxen 250mg tablets",
                                        "instruction": "Take 1 tablet, twice a day with food. Do not take on an empty stomach.",
                                        "instruction_uppercase": False,
                                        "quantity": "28 tablets",
                                        "prescriber": "Dr Smith",
                                        "rx_number": "522111-24041",
                                        "warning": "Tell your doctor if you experience stomach pain, black stools, or vomit that looks like coffee grounds.",
                                    },
                                },
                                "text": "Northfield Pharmacy — Naproxen 250mg",
                                "questions": [
                                    {
                                        "q": "What is the name of this medication?",
                                        "options": ["Naproxen", "Paracetamol", "Sertraline"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "How many times a day should you take it?",
                                        "options": ["Twice a day", "Once a day", "Three times a day"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "Why should you take this medication with food?",
                                        "options": [
                                            "To protect your stomach",
                                            "So it tastes better",
                                            "So it dissolves faster",
                                        ],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "Which symptoms should you tell your doctor about?",
                                        "options": [
                                            "Stomach pain, black stools, or vomit that looks like coffee grounds",
                                            "A mild headache or runny nose",
                                            "Feeling a little tired",
                                        ],
                                        "answer": 0,
                                    },
                                ],
                            },
                            {
                                "id": 8,
                                "title": "Citalopram",
                                "summary": "A dispensing label from Highfield Pharmacy with stop-suddenly advice.",
                                "letterhead": {
                                    "format": "label",
                                    "variant": "highfield-rx",
                                    "clinic_name": "Highfield Pharmacy",
                                    "brand_color": "#0F172A",
                                    "address_lines": ["19 Highfield Avenue, Westbridge, WB7 3QK"],
                                    "phone": "01632 961485",
                                    "recipient_lines": [
                                        "Ms Pitt",
                                        "6 Orchard Way, Westbridge, WB8 9JH",
                                    ],
                                    "medication": {
                                        "name": "Citalopram 20mg tablets",
                                        "instruction": "Take 1 tablet, once a day in the morning. Do not stop taking this medication suddenly.",
                                        "instruction_uppercase": True,
                                        "quantity": "28 tablets",
                                        "prescriber": "Dr Serinity",
                                        "rx_number": "52851-24054",
                                        "warning": "Avoid alcohol. Speak to your doctor before stopping this medicine.",
                                    },
                                },
                                "text": "Highfield Pharmacy — Citalopram 20mg",
                                "questions": [
                                    {
                                        "q": "Which medication has been prescribed?",
                                        "options": ["Citalopram", "Sertraline", "Amlodipine"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "What time of day should you take this medication?",
                                        "options": ["In the morning", "At night", "After lunch"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "What should you not do without speaking to your doctor first?",
                                        "options": [
                                            "Stop taking the medication suddenly",
                                            "Eat with the tablet",
                                            "Drink water with the tablet",
                                        ],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "What should you avoid while taking this medication?",
                                        "options": ["Alcohol", "Dairy products", "Caffeine"],
                                        "answer": 0,
                                    },
                                ],
                            },
                            {
                                "id": 9,
                                "title": "Prednisolone",
                                "summary": "A dispensing label from Elmtree Pharmacy with a tapering dose schedule.",
                                "letterhead": {
                                    "format": "label",
                                    "variant": "oakwood-rx",
                                    "clinic_name": "Elmtree Pharmacy",
                                    "brand_color": "#0F4C9F",
                                    "address_lines": ["12 Elmtree Road, Lowford, LF2 8RG"],
                                    "phone": "01632 961594",
                                    "recipient_lines": [
                                        "Mr Park",
                                        "8 Sycamore Drive, Lowford, LF4 3CE",
                                    ],
                                    "medication": {
                                        "name": "Prednisolone 5mg tablets",
                                        "instruction": "Take 6 tablets, once a day in the morning for 5 days. Then take 4 tablets for 5 days, then 2 tablets for 5 days.",
                                        "instruction_uppercase": True,
                                        "quantity": "60 tablets",
                                        "prescriber": "Dr Hammersmith",
                                        "rx_number": "03292-31013",
                                        "warning": "Do not stop taking this medication suddenly. Take with food.",
                                    },
                                },
                                "text": "Elmtree Pharmacy — Prednisolone 5mg",
                                "questions": [
                                    {
                                        "q": "What is the name of this medication?",
                                        "options": ["Prednisolone", "Paracetamol", "Doxycycline"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "How many tablets should you take each day for the first 5 days?",
                                        "options": ["6 tablets", "4 tablets", "2 tablets"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "How does the dose change over time?",
                                        "options": [
                                            "It reduces from 6 to 4 to 2 tablets",
                                            "It increases week by week",
                                            "It stays the same",
                                        ],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "Why should this medication be taken with food?",
                                        "options": [
                                            "To protect your stomach",
                                            "So it works faster",
                                            "Because it tastes bitter",
                                        ],
                                        "answer": 0,
                                    },
                                ],
                            },
                            {
                                "id": 10,
                                "title": "Tramadol",
                                "summary": "A dispensing label from Greenhill Pharmacy with an as-needed pain dosing schedule.",
                                "letterhead": {
                                    "format": "label",
                                    "variant": "brightside-rx",
                                    "clinic_name": "Greenhill Pharmacy",
                                    "brand_color": "#65A30D",
                                    "address_lines": ["4 Greenhill Way, Eastmere, EM6 7TK"],
                                    "phone": "01632 961703",
                                    "recipient_lines": [
                                        "Mr Petty",
                                        "33 Ashfield Road, Eastmere, EM8 1LJ",
                                    ],
                                    "medication": {
                                        "name": "Tramadol 50mg capsules",
                                        "instruction": "Take 1 to 2 capsules when needed for pain. Do not take more often than every 4 to 6 hours. Maximum 8 capsules in 24 hours.",
                                        "instruction_uppercase": False,
                                        "quantity": "30 capsules",
                                        "prescriber": "Dr Earl",
                                        "rx_number": "03403-33336",
                                        "warning": "May cause drowsiness. Do not drive or drink alcohol.",
                                    },
                                },
                                "text": "Greenhill Pharmacy — Tramadol 50mg",
                                "questions": [
                                    {
                                        "q": "What is this medication used for?",
                                        "options": ["Pain", "An infection", "Indigestion"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "How many capsules can you take in one dose?",
                                        "options": ["1 to 2 capsules", "3 to 4 capsules", "5 capsules"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "How long should you wait between doses?",
                                        "options": ["At least 4 to 6 hours", "1 to 2 hours", "12 hours"],
                                        "answer": 0,
                                    },
                                    {
                                        "q": "What is the maximum number of capsules you can take in 24 hours?",
                                        "options": ["8 capsules", "4 capsules", "12 capsules"],
                                        "answer": 0,
                                    },
                                ],
                            },
                        ],
                    },
                    "red": {
                        "key": "red",
                        "title": "Complex",
                        "blurb": "10 medication labels including over-the-counter boxes, bottles, creams, and supplements. Five questions per label requiring integration across multiple sections.",
                        "best_for": "Clients who can read paragraphs and are working on navigating dense, multi-section medication information.",
                        "questions_per_letter": 5,
                        "target_letter_count": 10,
                        "item_label_singular": "Label",
                        "item_label_plural": "labels",
                        "est_minutes": "25–35 min",
                        "letters": [
                            {
                                "id": 1,
                                "title": "Relievex extra (Ibuprofen)",
                                "summary": "An over-the-counter pain-relief box.",
                                "letterhead": {
                                    "format": "label",
                                    "variant": "relievex-pkg",
                                    "image_url": "/renders/red-1-relievex.png",
                                    "image_alt": "Relievex extra Ibuprofen 200mg tablets carton",
                                    "medication": {
                                        "subtitle": "Extra Strength Pain Relief",
                                        "name": "Ibuprofen 200mg tablets",
                                        "intro": "For the temporary relief of pain associated with headache, toothache, period pain, muscle aches, and for the reduction of fever.",
                                        "sections": [
                                            {"label": "Directions", "body": "Adults and children over 12 years: Take 2 tablets every 6 hours with water. Do not exceed 6 tablets in 24 hours. Take with or after food."},
                                            {"label": "Caution", "body": "Do not give to children under 12 years of age. Do not take for longer than 3 days for fever or 10 days for pain without speaking to your doctor."},
                                        ],
                                        "storage": "Store below 25°C in a dry place. Keep out of reach of children.",
                                        "warning": "Stop taking and see a doctor if you experience stomach pain, black stools, or vomit that looks like coffee grounds.",
                                        "barcode_value": "1122334455667",
                                    },
                                },
                                "text": "Relievex extra — Ibuprofen 200mg tablets",
                                "questions": [
                                    {"q": "What is this medication used for?", "options": ["Pain and fever", "Heartburn", "Allergies"], "answer": 0},
                                    {"q": "What is the maximum number of tablets you can take in 24 hours?", "options": ["6 tablets", "8 tablets", "10 tablets"], "answer": 0},
                                    {"q": "What is the minimum age for taking this medication?", "options": ["12 years", "6 years", "16 years"], "answer": 0},
                                    {"q": "If you vomited something that looked like coffee grounds, what should you do?", "options": ["Stop taking it and see a doctor", "Take another dose", "Drink water and wait"], "answer": 0},
                                    {"q": "Why should this medication be taken with food?", "options": ["To protect your stomach", "So it tastes better", "So it dissolves faster"], "answer": 0},
                                ],
                            },
                            {
                                "id": 2,
                                "title": "Paxolin (Paracetamol)",
                                "summary": "An over-the-counter paracetamol box.",
                                "letterhead": {
                                    "format": "label",
                                    "variant": "paxolin-pkg",
                                    "image_url": "/renders/red-2-paxolin.png",
                                    "image_alt": "Paxolin Paracetamol 500mg tablets carton",
                                    "medication": {
                                        "name": "Paracetamol 500mg tablets",
                                        "intro": "For the temporary relief of mild to moderate pain, including headache, muscle pain, period pain, and toothache. Also for the reduction of fever associated with colds and flu.",
                                        "sections": [
                                            {"label": "Directions", "body": "Adults and children over 16 years: Take 1 or 2 tablets every 4 to 6 hours when needed. Do not take more than 8 tablets in 24 hours. Wait at least 4 hours between doses. Children aged 12 to 15 years: Take 1 tablet every 4 to 6 hours. Do not exceed 4 tablets in 24 hours."},
                                            {"label": "Caution", "body": "Do not take with any other medicine containing paracetamol. Many cold and flu remedies contain paracetamol. Taking too much paracetamol can cause serious liver damage."},
                                            {"label": "If Symptoms Persist", "body": "Speak to your doctor or pharmacist if pain or fever does not improve after 3 days."},
                                        ],
                                    },
                                },
                                "text": "Paxolin — Paracetamol 500mg tablets",
                                "questions": [
                                    {"q": "What is this medication used for?", "options": ["Pain and fever", "Heartburn", "Allergies"], "answer": 0},
                                    {"q": "How long should you wait between doses?", "options": ["At least 4 hours", "1 hour", "12 hours"], "answer": 0},
                                    {"q": "What is the maximum number of tablets a 14-year-old can take in 24 hours?", "options": ["4 tablets", "8 tablets", "6 tablets"], "answer": 0},
                                    {"q": "Why should you not take this medication with cold and flu remedies?", "options": ["Many of them already contain paracetamol", "They cancel each other out", "They taste bad together"], "answer": 0},
                                    {"q": "What should you do if pain does not improve after 3 days?", "options": ["Speak to your doctor or pharmacist", "Double the dose", "Keep taking it for another week"], "answer": 0},
                                ],
                            },
                            {
                                "id": 3,
                                "title": "Allergex (Cetirizine)",
                                "summary": "An over-the-counter allergy-relief box.",
                                "letterhead": {
                                    "format": "label",
                                    "variant": "allergex-pkg",
                                    "image_url": "/renders/red-3-allergex.png",
                                    "image_alt": "Allergex Cetirizine 10mg tablets carton",
                                    "medication": {
                                        "name": "Cetirizine 10mg tablets",
                                        "intro": "For the relief of symptoms of hay fever and other allergies, including sneezing, runny nose, itchy eyes, and skin rashes.",
                                        "sections_left": [
                                            {"label": "Directions", "body": "Adults and children over 12 years: Take 1 tablet once a day, preferably in the evening. Swallow whole with water. Children aged 6 to 12 years: Take half a tablet twice a day."},
                                            {"label": "Speak to Your Doctor If", "body": "Symptoms do not improve after 7 days, or if you develop a rash or swelling of the face or throat."},
                                        ],
                                        "sections_right": [
                                            {"label": "Caution", "body": "this medication may cause drowsiness in some people. Do not drive or operate machinery until you know how this medicine affects you. Avoid alcohol while taking this medication."},
                                            {"label": "Storage", "body": "Store below 30°C. Keep in the original packaging until needed."},
                                        ],
                                    },
                                },
                                "text": "Allergex — Cetirizine 10mg tablets",
                                "questions": [
                                    {"q": "What is this medication used for?", "options": ["Allergies and hay fever", "Pain and fever", "Heartburn"], "answer": 0},
                                    {"q": "How often should an adult take this medication, and when?", "options": ["Once a day, preferably in the evening", "Twice a day with food", "Three times a day before meals"], "answer": 0},
                                    {"q": "What is the dose for a 10-year-old child?", "options": ["Half a tablet twice a day", "1 tablet once a day", "1 tablet twice a day"], "answer": 0},
                                    {"q": "Why should you avoid driving after taking this medication?", "options": ["It may cause drowsiness", "It can blur your vision permanently", "It makes you dizzy and lose memory"], "answer": 0},
                                    {"q": "What should you do if you developed swelling of the face?", "options": ["Speak to your doctor", "Take another tablet", "Apply ice to the area"], "answer": 0},
                                ],
                            },
                            {
                                "id": 4,
                                "title": "Rexazid (Ranitidine)",
                                "summary": "An over-the-counter heartburn-relief box.",
                                "letterhead": {
                                    "format": "label",
                                    "variant": "rexazid-pkg",
                                    "image_url": "/renders/red-4-rexazid.png",
                                    "image_alt": "Rexazid Ranitidine 75mg tablets carton",
                                    "medication": {
                                        "subtitle": "For the short-term relief of heartburn, indigestion, and acid reflux.",
                                        "name": "Ranitidine 75mg tablets",
                                        "sections": [
                                            {"label": "Directions", "body": "Adults and children over 16 years: Take 1 tablet when symptoms start. If symptoms continue, take another tablet after 1 hour. Do not take more than 4 tablets in 24 hours. Do not take for more than 2 weeks without speaking to your doctor."},
                                            {"label": "Caution", "body": "This product is not suitable for children under 16 years. Speak to Your Doctor If: You have unintentionally lost weight, you have difficulty swallowing, your symptoms continue for more than 2 weeks, and/or you vomit blood or pass black stools."},
                                            {"label": "Storage", "body": "Store below 25°C. Keep out of reach of children."},
                                            {"label": "Warning", "body": "If you have chest pain that spreads to your arm, neck, or jaw, or you have difficulty breathing, stop taking this medication and seek urgent medical advice."},
                                        ],
                                        "barcode_value": "011452364",
                                    },
                                },
                                "text": "Rexazid — Ranitidine 75mg tablets",
                                "questions": [
                                    {"q": "What is this medication used for?", "options": ["Heartburn, indigestion, and acid reflux", "Pain and fever", "Allergies"], "answer": 0},
                                    {"q": "When should you take the first tablet?", "options": ["When symptoms start", "Before food in the morning", "Only at night"], "answer": 0},
                                    {"q": "What is the maximum number of tablets you can take in 24 hours?", "options": ["4 tablets", "6 tablets", "8 tablets"], "answer": 0},
                                    {"q": "How long should you take this medication before speaking to a doctor?", "options": ["No more than 2 weeks", "1 week", "3 days"], "answer": 0},
                                    {"q": "Which symptoms mean you should seek urgent medical advice?", "options": ["Chest pain that spreads to your arm, neck, or jaw, or difficulty breathing", "A mild headache", "Feeling a little tired"], "answer": 0},
                                ],
                            },
                            {
                                "id": 5,
                                "title": "Throatmin Honey & Lemon",
                                "summary": "An over-the-counter sore-throat lozenge box.",
                                "letterhead": {
                                    "format": "label",
                                    "variant": "throatmin-pkg",
                                    "image_url": "/renders/red-5-throatmin.png",
                                    "image_alt": "Throatmin Honey and Lemon lozenges carton",
                                    "medication": {
                                        "brand_text": "Throatmin Honey & Lemon",
                                        "name": "Hexylresorcinol 2.5mg lozenges",
                                        "intro": "For the relief of sore throats and minor mouth infections in adults and children over 6 years.",
                                        "sections": [
                                            {"label": "Directions", "body": "Adults and children over 6 years: Suck 1 lozenge slowly. Repeat every 2 to 3 hours as needed. Do not take more than 8 lozenges in 24 hours. Do not chew or swallow whole."},
                                            {"label": "Caution", "body": "Do not use for more than 3 days in a row. Avoid giving to children under 6 years of age."},
                                            {"label": "Warning", "body": "Contains sugar. Not suitable for people with diabetes unless advised by a doctor."},
                                            {"label": "Ingredients", "body": "Active ingredient: Hexylresorcinol 2.5mg. Other ingredients: Glucose syrup, sucrose, honey, lemon oil, citric acid, menthol, water."},
                                        ],
                                    },
                                },
                                "text": "Throatmin Honey & Lemon — Hexylresorcinol 2.5mg lozenges",
                                "questions": [
                                    {"q": "What is this medication used for?", "options": ["Sore throats and minor mouth infections", "Pain and fever", "Heartburn"], "answer": 0},
                                    {"q": "How should you take the lozenge?", "options": ["Suck it slowly — do not chew or swallow whole", "Chew it well and swallow", "Crush it in water and drink"], "answer": 0},
                                    {"q": "What is the maximum number of lozenges you can take in 24 hours?", "options": ["8 lozenges", "4 lozenges", "12 lozenges"], "answer": 0},
                                    {"q": "How many days in a row can you use this medication?", "options": ["No more than 3 days in a row", "Up to 7 days", "Up to 2 weeks"], "answer": 0},
                                    {"q": "Why might this product not be suitable for someone with diabetes?", "options": ["It contains sugar", "It contains caffeine", "It contains alcohol"], "answer": 0},
                                ],
                            },
                            {
                                "id": 6,
                                "title": "Throatease Night — Dry Cough Linctus",
                                "summary": "An over-the-counter cough syrup bottle.",
                                "letterhead": {
                                    "format": "label",
                                    "variant": "throatease-pkg",
                                    "image_url": "/renders/red-6-throatease.png",
                                    "image_alt": "Throatease Night Dry Cough Linctus 150ml bottle with measuring cup",
                                },
                                "text": "Throatease Night — Dry Cough Linctus 150ml",
                                "questions": [
                                    {"q": "What is this medication used for?", "options": ["A dry, irritating cough", "Heartburn", "Travel sickness"], "answer": 0},
                                    {"q": "How long should you wait between doses?", "options": ["4 hours", "1 hour", "8 hours"], "answer": 0},
                                    {"q": "Why should you use the measuring spoon provided rather than a kitchen spoon?", "options": ["The dose may be incorrect with a kitchen spoon", "It tastes better with the right spoon", "It is easier to clean"], "answer": 0},
                                    {"q": "After how many days of coughing should you speak to a doctor?", "options": ["More than 7 days", "More than 2 days", "More than 14 days"], "answer": 0},
                                    {"q": "How long can the medicine be used after opening?", "options": ["28 days", "7 days", "6 months"], "answer": 0},
                                ],
                            },
                            {
                                "id": 7,
                                "title": "Reguloxin — Senna",
                                "summary": "An overnight constipation-relief tablet bottle.",
                                "letterhead": {
                                    "format": "label",
                                    "variant": "reguloxin-pkg",
                                    "image_url": "/renders/red-7-reguloxin.png",
                                    "image_alt": "Reguloxin Senna 7.5mg overnight constipation relief bottle",
                                },
                                "text": "Reguloxin — Senna 7.5mg tablets",
                                "questions": [
                                    {"q": "What is this medication used for?", "options": ["Short-term relief of occasional constipation", "Travel sickness", "Sore throat"], "answer": 0},
                                    {"q": "When should you take the tablets?", "options": ["At bedtime with a glass of water", "First thing in the morning", "With every meal"], "answer": 0},
                                    {"q": "How long does the medication usually take to work?", "options": ["Within 8 to 12 hours", "Within 1 hour", "Within 2 to 3 days"], "answer": 0},
                                    {"q": "Why is it important not to take this medication for more than 7 days?", "options": ["Using it for too long can damage your bowel", "It loses its effect after 7 days", "It expires after 7 days"], "answer": 0},
                                    {"q": "Which symptoms mean you should speak to your doctor?", "options": ["Severe stomach pain, nausea or vomiting; blood in your stools; or a sudden change in bowel habit", "A mild headache", "Feeling a little tired"], "answer": 0},
                                ],
                            },
                            {
                                "id": 8,
                                "title": "Ferrovex — Iron Supplement",
                                "summary": "An iron-supplement tablet bottle.",
                                "letterhead": {
                                    "format": "label",
                                    "variant": "ferrovex-pkg",
                                    "image_url": "/renders/red-8-ferrovex.png",
                                    "image_alt": "Ferrovex Iron Supplement Ferrous Sulfate tablets bottle",
                                },
                                "text": "Ferrovex — Iron Supplement for low iron levels",
                                "questions": [
                                    {"q": "What is this supplement used for?", "options": ["Prevention and treatment of iron deficiency in adults", "Constipation", "Travel sickness"], "answer": 0},
                                    {"q": "How many times a day should you take the tablets?", "options": ["Three times a day", "Once a day", "Twice a day"], "answer": 0},
                                    {"q": "What can help the iron be absorbed better?", "options": ["Orange juice or a vitamin C supplement", "A cup of tea", "A glass of milk"], "answer": 0},
                                    {"q": "Why should someone with a lactose intolerance not take this supplement?", "options": ["It contains lactose", "It contains caffeine", "It contains gluten"], "answer": 0},
                                    {"q": "Why is it especially important to keep this medication away from children?", "options": ["Accidental overdose of iron tablets is a leading cause of poisoning in young children", "Children may not like the taste", "Children may break the bottle"], "answer": 0},
                                ],
                            },
                            {
                                "id": 9,
                                "title": "Voyagex — Travel Sickness",
                                "summary": "A travel-sickness tablet bottle.",
                                "letterhead": {
                                    "format": "label",
                                    "variant": "voyagex-pkg",
                                    "image_url": "/renders/red-9-voyagex.png",
                                    "image_alt": "Voyagex Cinnarizine 15mg travel sickness tablets bottle",
                                },
                                "text": "Voyagex — Cinnarizine 15mg tablets",
                                "questions": [
                                    {"q": "What is this medication used for?", "options": ["Prevention of travel sickness", "Constipation", "Sore throat"], "answer": 0},
                                    {"q": "How long before travel should you take the first dose?", "options": ["30 minutes before travel", "2 hours before travel", "Just as you start travelling"], "answer": 0},
                                    {"q": "What is the maximum number of tablets you can take in 24 hours?", "options": ["4 tablets", "8 tablets", "12 tablets"], "answer": 0},
                                    {"q": "Why should you not drive after taking this medication?", "options": ["It may cause drowsiness", "It may upset your stomach", "It blurs your vision permanently"], "answer": 0},
                                    {"q": "What is the active/first ingredient in this medication?", "options": ["Cinnarizine", "Lactose monohydrate", "Maize starch"], "answer": 0},
                                ],
                            },
                            {
                                "id": 10,
                                "title": "Derminex — Antiseptic Cream",
                                "summary": "An antiseptic cream jar for minor cuts and grazes.",
                                "letterhead": {
                                    "format": "label",
                                    "variant": "derminex-pkg",
                                    "image_url": "/renders/red-10-derminex.png",
                                    "image_alt": "Derminex Antiseptic Cream jar for minor cuts grazes and insect bites",
                                },
                                "text": "Derminex — Antiseptic Cream",
                                "questions": [
                                    {"q": "What is this cream used for?", "options": ["Minor cuts, grazes, and insect bites", "Heartburn", "Travel sickness"], "answer": 0},
                                    {"q": "What should you do before applying the cream?", "options": ["Clean the affected area with water and dry gently", "Apply ice for 5 minutes", "Wait until the wound stops bleeding for an hour"], "answer": 0},
                                    {"q": "How many times a day can you apply the cream?", "options": ["Up to three times a day", "Once a day", "Up to ten times a day"], "answer": 0},
                                    {"q": "What should you avoid contact with when using this cream?", "options": ["The eyes, mouth, and inside of the nose", "Your hands", "Clean clothing"], "answer": 0},
                                    {"q": "What should you do if the skin becomes red or swollen after use?", "options": ["Stop using it and wash the area with water", "Apply more cream and cover with a bandage", "Take a painkiller and keep using it"], "answer": 0},
                                ],
                            },
                        ],
                    },
                },
            },
        },
        {
            "slug": "voicemails",
            "title": "Listening to a Voicemail",
            "summary": "Listen to voicemail messages and answer questions. Choose your difficulty.",
            "duration_min": 20,
            "type": "reading-leveled",
            "content": {
                "levels": {
                    "green": {
                        "key": "green",
                        "title": "Foundational",
                        "blurb": "10 short voicemails (15-30 seconds) from a single familiar caller, with five literal-recall questions each.",
                        "best_for": "Clients working on picking out key information (caller, date/time, action) from a brief message.",
                        "questions_per_letter": 5,
                        "target_letter_count": 10,
                        "item_label_singular": "Voicemail",
                        "item_label_plural": "voicemails",
                        "est_minutes": "12–18 min",
                        "letters": [
                            {
                                "id": 1,
                                "title": "GP Appointment Reminder",
                                "summary": "Orion Medical Centre confirming a GP appointment.",
                                "letterhead": {
                                    "format": "voicemail",
                                    "caller_name": "Orion Medical Centre",
                                    "caller_subtitle": "GP appointment reminder",
                                    "phone_number": "01632 960 411",
                                    "time_label": "Monday, 9:14 AM",
                                    "duration": "0:24",
                                    "avatar_color": "#0F766E",
                                    "audio_url": "https://customer-assets.emergentagent.com/job_concentric-hub/artifacts/7xol65fe_Green%201%20-%20GP%20Appt%20Reminder.mp3",
                                    "transcript": "Hello, this is Orion Medical Centre calling for Alex Morgan. This is a reminder that you have a GP appointment on Monday at 10:30 in the morning with Dr Patel. Please arrive 10 minutes early for check-in. If you need to cancel or change your appointment, please call us back. Thank you.",
                                },
                                "text": "Voicemail from Orion Medical Centre — GP appointment reminder",
                                "questions": [
                                    {"q": "Who called Alex?", "options": ["Orion Medical Centre", "Westside Pharmacy", "Bella Hair Studio"], "answer": 0},
                                    {"q": "What type of appointment does Alex have?", "options": ["A GP appointment", "A hair appointment", "A dentist appointment"], "answer": 0},
                                    {"q": "What day is the appointment?", "options": ["Monday", "Tuesday", "Saturday"], "answer": 0},
                                    {"q": "What time is the appointment?", "options": ["10:30 AM", "1:00 PM", "6:00 PM"], "answer": 0},
                                    {"q": "Who is the appointment with?", "options": ["Dr Patel", "Dr Bennett", "Dr Carter"], "answer": 0},
                                ],
                            },
                            {
                                "id": 2,
                                "title": "Pharmacy Prescription Ready",
                                "summary": "Westside Pharmacy letting you know a prescription is ready to collect.",
                                "letterhead": {
                                    "format": "voicemail",
                                    "caller_name": "Westside Pharmacy",
                                    "caller_subtitle": "Prescription ready to collect",
                                    "phone_number": "01632 961 220",
                                    "time_label": "Tuesday, 11:02 AM",
                                    "duration": "0:18",
                                    "avatar_color": "#4F46E5",
                                    "audio_url": "https://customer-assets.emergentagent.com/job_concentric-hub/artifacts/lc4ni4xi_Green%202%20-%20Prescription%20Ready.mp3",
                                    "transcript": "Hello, this is Westside Pharmacy. Your prescription is ready to collect. We are open until 6 PM today. Please bring your health card when you come in. Thank you.",
                                },
                                "text": "Voicemail from Westside Pharmacy — prescription ready",
                                "questions": [
                                    {"q": "Who called?", "options": ["Westside Pharmacy", "Orion Medical Centre", "ParcelPoint"], "answer": 0},
                                    {"q": "What is ready to collect?", "options": ["The prescription", "A parcel", "Test results"], "answer": 0},
                                    {"q": "What time does the pharmacy close?", "options": ["6 PM", "8 PM", "5 PM"], "answer": 0},
                                    {"q": "What should you bring?", "options": ["A health card", "A photo ID", "A bank card"], "answer": 0},
                                    {"q": "What do you need to do next?", "options": ["Go to the pharmacy and collect the prescription", "Call the doctor back", "Wait for a delivery"], "answer": 0},
                                ],
                            },
                            {
                                "id": 3,
                                "title": "Family Birthday Reminder",
                                "summary": "A family member reminding you about Grandma's birthday dinner.",
                                "letterhead": {
                                    "format": "voicemail",
                                    "caller_name": "Sam (family)",
                                    "caller_subtitle": "Grandma's birthday dinner",
                                    "phone_number": "07700 900 121",
                                    "time_label": "Thursday, 7:46 PM",
                                    "duration": "0:14",
                                    "avatar_color": "#DB2777",
                                    "audio_url": "https://customer-assets.emergentagent.com/job_concentric-hub/artifacts/hudgh49h_G03_%20Family%20Birthday%20Reminder.mp3",
                                    "transcript": "Hey! Just a reminder that Grandma's birthday dinner is this Saturday at 6 PM at my house. Don't forget to bring the photo album if you still have it. Okay, see you then! Bye!",
                                },
                                "text": "Voicemail from family — Grandma's birthday dinner",
                                "questions": [
                                    {"q": "Why did the person call?", "options": ["To remind the listener about a birthday dinner", "To cancel a doctor's appointment", "To say a parcel is ready"], "answer": 0},
                                    {"q": "When is the birthday dinner?", "options": ["Saturday", "Friday", "Sunday"], "answer": 0},
                                    {"q": "What time is the dinner?", "options": ["6 PM", "1 PM", "10:30 AM"], "answer": 0},
                                    {"q": "What should the listener bring?", "options": ["The photo album", "A bottle of wine", "A health card"], "answer": 0},
                                    {"q": "Who is the birthday dinner for?", "options": ["Grandma", "Mum", "Dr Patel"], "answer": 0},
                                ],
                            },
                            {
                                "id": 4,
                                "title": "Parcel Collection Notice",
                                "summary": "ParcelPoint letting you know a package is ready to collect.",
                                "letterhead": {
                                    "format": "voicemail",
                                    "caller_name": "ParcelPoint",
                                    "caller_subtitle": "Package ready to collect",
                                    "phone_number": "0300 123 4567",
                                    "time_label": "Wednesday, 2:31 PM",
                                    "duration": "0:17",
                                    "avatar_color": "#EA580C",
                                    "audio_url": "https://customer-assets.emergentagent.com/job_concentric-hub/artifacts/itcahi65_G04_Parcel%20Collection%20Notice.mp3",
                                    "transcript": "Hello, this is ParcelPoint. Your package is ready to collect from our Main Street location. Please collect it before Friday and bring a photo ID with you. Thank you.",
                                },
                                "text": "Voicemail from ParcelPoint — package ready",
                                "questions": [
                                    {"q": "Who called?", "options": ["ParcelPoint", "Westside Pharmacy", "Bella Hair Studio"], "answer": 0},
                                    {"q": "What is ready to collect?", "options": ["A package", "A prescription", "A health card"], "answer": 0},
                                    {"q": "Where should the package be collected from?", "options": ["The Main Street location", "The post office", "The pharmacy"], "answer": 0},
                                    {"q": "When should the package be collected by?", "options": ["Before Friday", "Before Monday", "Before next month"], "answer": 0},
                                    {"q": "What should you bring?", "options": ["A photo ID", "A health card", "A receipt"], "answer": 0},
                                ],
                            },
                            {
                                "id": 5,
                                "title": "Hair Appointment Reminder",
                                "summary": "Bella Hair Studio confirming a hair appointment.",
                                "letterhead": {
                                    "format": "voicemail",
                                    "caller_name": "Bella Hair Studio",
                                    "caller_subtitle": "Hair appointment reminder",
                                    "phone_number": "01632 962 015",
                                    "time_label": "Today, 10:08 AM",
                                    "duration": "0:13",
                                    "avatar_color": "#7C3AED",
                                    "audio_url": "https://customer-assets.emergentagent.com/job_concentric-hub/artifacts/n7f4pqjw_G05_GP_Hair%20Appointment%20Reminder.mp3",
                                    "transcript": "Hello, this is Bella Hair Studio. This is a reminder that you have a hair appointment tomorrow at 1 PM. Please arrive a few minutes early. Thank you.",
                                },
                                "text": "Voicemail from Bella Hair Studio — hair appointment reminder",
                                "questions": [
                                    {"q": "Who called?", "options": ["Bella Hair Studio", "Orion Medical Centre", "ParcelPoint"], "answer": 0},
                                    {"q": "What type of appointment is it?", "options": ["A hair appointment", "A GP appointment", "A dentist appointment"], "answer": 0},
                                    {"q": "When is the appointment?", "options": ["Tomorrow", "Today", "Next week"], "answer": 0},
                                    {"q": "What time is the appointment?", "options": ["1 PM", "10:30 AM", "6 PM"], "answer": 0},
                                    {"q": "What should the listener do before the appointment?", "options": ["Arrive a few minutes early", "Bring a photo ID", "Call back to confirm"], "answer": 0},
                                ],
                            },
                            {
                                "id": 6,
                                "title": "Art Class Reminder",
                                "summary": "Greenview Community Centre reminding you about an art class.",
                                "letterhead": {
                                    "format": "voicemail",
                                    "caller_name": "Greenview Community Centre",
                                    "caller_subtitle": "Art class reminder",
                                    "phone_number": "01632 962 308",
                                    "time_label": "Today, 1:42 PM",
                                    "duration": "0:18",
                                    "avatar_color": "#F59E0B",
                                    "audio_url": "https://customer-assets.emergentagent.com/job_concentric-hub/artifacts/k4ae0u8j_G06_%20Art%20Class%20Reminder.mp3",
                                    "transcript": "Hello, this is the Greenview Community Centre with a reminder that your art class starts at 4 PM today in Room 3. Please bring your painting materials with you, see you soon!",
                                },
                                "text": "Voicemail from Greenview Community Centre — art class reminder",
                                "questions": [
                                    {"q": "Who called?", "options": ["Greenview Community Centre", "Maple Grove Library", "Bella Hair Studio"], "answer": 0},
                                    {"q": "What class is being discussed?", "options": ["An art class", "A yoga class", "A cooking class"], "answer": 0},
                                    {"q": "What time does the class start?", "options": ["4 PM", "10 AM", "6 PM"], "answer": 0},
                                    {"q": "Where is the class?", "options": ["Room 3", "Room 1", "The main hall"], "answer": 0},
                                    {"q": "What should the listener bring?", "options": ["Painting materials", "A photo ID", "A packed lunch"], "answer": 0},
                                ],
                            },
                            {
                                "id": 7,
                                "title": "Blood Test Appointment",
                                "summary": "Orion Medical Laboratory confirming a blood test appointment with fasting advice.",
                                "letterhead": {
                                    "format": "voicemail",
                                    "caller_name": "Orion Medical Laboratory",
                                    "caller_subtitle": "Blood test appointment reminder",
                                    "phone_number": "01632 960 477",
                                    "time_label": "Tuesday, 4:55 PM",
                                    "duration": "0:21",
                                    "avatar_color": "#BE123C",
                                    "audio_url": "https://customer-assets.emergentagent.com/job_concentric-hub/artifacts/27bubmoj_G07_Blood%20Test%20Appointment.mp3",
                                    "transcript": "Hello, this is Orion Medical Laboratory. This is a reminder that you have a blood test appointment on Wednesday at 8:30 in the morning. Please do not eat or drink anything except water before your appointment. Thank you.",
                                },
                                "text": "Voicemail from Orion Medical Laboratory — blood test appointment",
                                "questions": [
                                    {"q": "Who called?", "options": ["Orion Medical Laboratory", "Westside Pharmacy", "Greenview Community Centre"], "answer": 0},
                                    {"q": "What type of appointment is it?", "options": ["A blood test appointment", "A GP appointment", "A hair appointment"], "answer": 0},
                                    {"q": "What day is the appointment?", "options": ["Wednesday", "Monday", "Saturday"], "answer": 0},
                                    {"q": "What should the listener avoid before the appointment?", "options": ["Eating or drinking anything", "Driving the car", "Taking their normal medication"], "answer": 0},
                                    {"q": "What is allowed before the appointment?", "options": ["Water", "Tea or coffee", "A light breakfast"], "answer": 0},
                                ],
                            },
                            {
                                "id": 8,
                                "title": "Taxi Pick Up",
                                "summary": "CityLine Taxi Services confirming a booking and pick-up.",
                                "letterhead": {
                                    "format": "voicemail",
                                    "caller_name": "CityLine Taxi Services",
                                    "caller_subtitle": "Taxi booking reminder",
                                    "phone_number": "0808 196 1118",
                                    "time_label": "Today, 6:25 PM",
                                    "duration": "0:20",
                                    "avatar_color": "#CA8A04",
                                    "audio_url": "https://customer-assets.emergentagent.com/job_concentric-hub/artifacts/t1lh4osc_G08_Taxi%20Pick%20Up.mp3",
                                    "transcript": "Hello, this is CityLine Taxi Services. This is a reminder that your taxi is booked for tomorrow at 9 AM, your driver will pick you up from your home address. Do call us back if you need to reschedule, Thank you.",
                                },
                                "text": "Voicemail from CityLine Taxi Services — taxi booking reminder",
                                "questions": [
                                    {"q": "Who called?", "options": ["CityLine Taxi Services", "ParcelPoint", "Maple Grove Library"], "answer": 0},
                                    {"q": "When is the taxi booked for?", "options": ["Tomorrow", "Today", "Next week"], "answer": 0},
                                    {"q": "What time will the taxi arrive?", "options": ["9 AM", "1 PM", "8:30 AM"], "answer": 0},
                                    {"q": "Where will the driver pick the listener up from?", "options": ["Their home address", "The train station", "The doctor's surgery"], "answer": 0},
                                    {"q": "What should the listener do if they need to change the booking?", "options": ["Call the taxi service back", "Wait at home anyway", "Send a text message"], "answer": 0},
                                ],
                            },
                            {
                                "id": 9,
                                "title": "Library Books Return",
                                "summary": "Maple Grove Library reminding you that your books are due back.",
                                "letterhead": {
                                    "format": "voicemail",
                                    "caller_name": "Maple Grove Library",
                                    "caller_subtitle": "Books due back reminder",
                                    "phone_number": "01632 963 421",
                                    "time_label": "Wednesday, 8:15 AM",
                                    "duration": "0:19",
                                    "avatar_color": "#92400E",
                                    "audio_url": "https://customer-assets.emergentagent.com/job_concentric-hub/artifacts/3ufaxy3u_G09_Library%20Books%20Return.mp3",
                                    "transcript": "Hello, this is Maple Grove Library with a reminder that your library books are due back on Friday. Please return them before 5 PM to avoid a late fee, thank you!",
                                },
                                "text": "Voicemail from Maple Grove Library — books due back reminder",
                                "questions": [
                                    {"q": "Who called?", "options": ["Maple Grove Library", "QuickShip Delivery Services", "Greenview Community Centre"], "answer": 0},
                                    {"q": "What needs to be returned?", "options": ["Library books", "A parcel", "A health card"], "answer": 0},
                                    {"q": "When are the books due back?", "options": ["Friday", "Monday", "Sunday"], "answer": 0},
                                    {"q": "What time should the books be returned by?", "options": ["5 PM", "9 AM", "Noon"], "answer": 0},
                                    {"q": "What could happen if the books are returned late?", "options": ["A late fee", "The library will call the police", "The card will be cancelled"], "answer": 0},
                                ],
                            },
                            {
                                "id": 10,
                                "title": "Parcel Pick Up",
                                "summary": "QuickShip Delivery Services letting you know a parcel is ready for collection.",
                                "letterhead": {
                                    "format": "voicemail",
                                    "caller_name": "QuickShip Delivery Services",
                                    "caller_subtitle": "Missed delivery — parcel pick up",
                                    "phone_number": "0345 778 0099",
                                    "time_label": "Today, 3:12 PM",
                                    "duration": "0:26",
                                    "avatar_color": "#16A34A",
                                    "audio_url": "https://customer-assets.emergentagent.com/job_concentric-hub/artifacts/z7b32zr8_G010_Parcel%20Pick%20Up.mp3",
                                    "transcript": "Hello, this is QuickShip Delivery Services. We missed you today while trying to deliver your package. Your parcel will be available for collection at the Oak Street pickup location after 3 PM tomorrow. Please bring a photo ID when collecting your package. Thank you.",
                                },
                                "text": "Voicemail from QuickShip Delivery Services — parcel pick up",
                                "questions": [
                                    {"q": "Who called?", "options": ["QuickShip Delivery Services", "CityLine Taxi Services", "Westside Pharmacy"], "answer": 0},
                                    {"q": "What was missed?", "options": ["A package delivery", "A doctor's appointment", "A taxi booking"], "answer": 0},
                                    {"q": "Where can the package be collected?", "options": ["The Oak Street pickup location", "The Main Street location", "The local post office"], "answer": 0},
                                    {"q": "When will the package be available for collection?", "options": ["After 3 PM tomorrow", "Before Friday", "This evening"], "answer": 0},
                                    {"q": "What should the listener bring?", "options": ["A photo ID", "A health card", "The original delivery slip"], "answer": 0},
                                ],
                            },
                        ],
                    },
                    "amber": {
                        "key": "amber",
                        "title": "Intermediate",
                        "blurb": "10 medium voicemails (30-60 seconds) with two pieces of information to integrate and five questions each.",
                        "best_for": "Clients working on linking the reason for the call with a follow-up action or date.",
                        "questions_per_letter": 5,
                        "target_letter_count": 10,
                        "item_label_singular": "Voicemail",
                        "item_label_plural": "voicemails",
                        "est_minutes": "20–28 min",
                        "letters": [
                            {
                                "id": 1,
                                "title": "Appointment Time Change",
                                "summary": "Bridgeway Clinic letting Alex know their appointment time has changed.",
                                "letterhead": {
                                    "format": "voicemail",
                                    "caller_name": "Bridgeway Clinic",
                                    "caller_subtitle": "Appointment time change",
                                    "phone_number": "01632 960 882",
                                    "time_label": "Wednesday, 9:48 AM",
                                    "duration": "0:35",
                                    "avatar_color": "#0EA5E9",
                                    "audio_url": "https://customer-assets.emergentagent.com/job_concentric-hub/artifacts/7u58foa8_Amber%201%20-%20Appointment%20Change.mp3",
                                    "transcript": "Hello, this is Bridgeway Clinic calling for Alex about your appointment next Tuesday. Your appointment time has changed from 10:30 in the morning to 11:15 in the morning, as the clinician is running a later clinic that day. Please arrive 10 minutes early and bring your medication list with you. If this new time does not work for you, please call us back before Friday. Thank you.",
                                },
                                "text": "Voicemail from Bridgeway Clinic — appointment time change",
                                "questions": [
                                    {"q": "What day is the appointment?", "options": ["Next Tuesday", "Tomorrow", "Friday"], "answer": 0},
                                    {"q": "What was the original appointment time?", "options": ["10:30 in the morning", "11:15 in the morning", "1:30 in the afternoon"], "answer": 0},
                                    {"q": "What is the new appointment time?", "options": ["11:15 in the morning", "10:30 in the morning", "2:30 in the afternoon"], "answer": 0},
                                    {"q": "What should Alex bring to the appointment?", "options": ["Their medication list", "A photo ID", "A health card"], "answer": 0},
                                    {"q": "What should Alex do if the new time does not work?", "options": ["Call the clinic back before Friday", "Just turn up at the old time", "Email the clinician"], "answer": 0},
                                ],
                            },
                            {
                                "id": 2,
                                "title": "Pharmacy Prescription Query",
                                "summary": "Parkside Pharmacy explaining that part of Alex's repeat prescription is out of stock.",
                                "letterhead": {
                                    "format": "voicemail",
                                    "caller_name": "Parkside Pharmacy",
                                    "caller_subtitle": "Repeat prescription update",
                                    "phone_number": "01632 961 504",
                                    "time_label": "Today, 11:24 AM",
                                    "duration": "0:38",
                                    "avatar_color": "#4F46E5",
                                    "audio_url": "https://customer-assets.emergentagent.com/job_concentric-hub/artifacts/ee4sbaz6_Amber%202%20-%20Pharmacy%20Prescription%20Query.mp3",
                                    "transcript": "Hello, this is Parkside Pharmacy calling for Alex. We're calling about your repeat prescription. Most of your medication is ready to collect, but one item is currently out of stock and should arrive tomorrow afternoon. You can collect the rest today before 6 PM, or wait and collect everything together tomorrow after 3 PM. Please bring your health card when you come in. Thank you.",
                                },
                                "text": "Voicemail from Parkside Pharmacy — repeat prescription query",
                                "questions": [
                                    {"q": "Who was calling Alex?", "options": ["Parkside Pharmacy", "Westside Pharmacy", "Bridgeway Clinic"], "answer": 0},
                                    {"q": "What was the call about?", "options": ["Alex's repeat prescription", "A taxi booking", "A blood test result"], "answer": 0},
                                    {"q": "What is the problem with one item?", "options": ["One item is currently out of stock", "One item has been recalled", "One item costs extra"], "answer": 0},
                                    {"q": "When should the missing item arrive?", "options": ["Tomorrow afternoon", "This evening", "Next week"], "answer": 0},
                                    {"q": "What should Alex bring when collecting the medication?", "options": ["Their health card", "A photo ID", "The empty bottles"], "answer": 0},
                                ],
                            },
                            {
                                "id": 3,
                                "title": "Community Transport Pick-Up",
                                "summary": "CityLink Community Transport confirming a ride to the therapy centre on Thursday.",
                                "letterhead": {
                                    "format": "voicemail",
                                    "caller_name": "CityLink Community Transport",
                                    "caller_subtitle": "Ride to the therapy centre",
                                    "phone_number": "0300 555 0244",
                                    "time_label": "Tuesday, 2:08 PM",
                                    "duration": "0:34",
                                    "avatar_color": "#16A34A",
                                    "audio_url": "https://customer-assets.emergentagent.com/job_concentric-hub/artifacts/xxssrmi9_Amber%203%20-%20Community%20Transport%20Pick-Up.mp3",
                                    "transcript": "Hello Alex, this is CityLink Community Transport calling about your ride to the therapy centre on Thursday. Your pick-up time is 9:10 in the morning. Please be ready at your front entrance five minutes before pick-up. If you no longer need the ride, please call us by 4 PM today. Thank you.",
                                },
                                "text": "Voicemail from CityLink Community Transport — ride to the therapy centre",
                                "questions": [
                                    {"q": "Who was calling Alex?", "options": ["CityLink Community Transport", "CityLine Taxi Services", "Parkside Pharmacy"], "answer": 0},
                                    {"q": "Where is Alex travelling to?", "options": ["The therapy centre", "The hospital", "The library"], "answer": 0},
                                    {"q": "What day is the ride booked for?", "options": ["Thursday", "Tuesday", "Saturday"], "answer": 0},
                                    {"q": "What time is the pick-up?", "options": ["9:10 in the morning", "10:30 in the morning", "4:00 in the afternoon"], "answer": 0},
                                    {"q": "What should Alex do if they no longer need the ride?", "options": ["Call by 4 PM today", "Just stay at home", "Email the driver"], "answer": 0},
                                ],
                            },
                            {
                                "id": 4,
                                "title": "Birthday Dinner",
                                "summary": "Sam letting Maya know the restaurant has moved the booking time.",
                                "letterhead": {
                                    "format": "voicemail",
                                    "caller_name": "Sam",
                                    "caller_subtitle": "Priya's birthday dinner",
                                    "phone_number": "07700 900 446",
                                    "time_label": "Friday, 6:32 PM",
                                    "duration": "0:22",
                                    "avatar_color": "#DB2777",
                                    "audio_url": "https://customer-assets.emergentagent.com/job_concentric-hub/artifacts/l3nzufcs_Amber%204%20-%20Birthday%20Dinner.mp3",
                                    "transcript": "Hi Maya, it's Sam. I'm calling about Priya's birthday dinner on Saturday. The restaurant has moved our booking from 7:00 to 7:30. Please bring the balloons if you still have them, and meet us outside the restaurant at 7:15. See you then.",
                                },
                                "text": "Voicemail from Sam — Priya's birthday dinner",
                                "questions": [
                                    {"q": "Who left the voicemail?", "options": ["Sam", "Priya", "Maya"], "answer": 0},
                                    {"q": "What is the message about?", "options": ["Priya's birthday dinner", "A doctor's appointment", "A taxi booking"], "answer": 0},
                                    {"q": "What day is the birthday dinner?", "options": ["Saturday", "Friday", "Tuesday"], "answer": 0},
                                    {"q": "What was the original booking time?", "options": ["7:00", "7:30", "7:15"], "answer": 0},
                                    {"q": "What is the new booking time?", "options": ["7:30", "7:00", "7:15"], "answer": 0},
                                    {"q": "What should Maya bring?", "options": ["The balloons", "A photo album", "A cake"], "answer": 0},
                                ],
                            },
                            {
                                "id": 5,
                                "title": "Pet Grooming Reminder",
                                "summary": "Happy Paws Grooming confirming Luna's grooming appointment.",
                                "letterhead": {
                                    "format": "voicemail",
                                    "caller_name": "Happy Paws Grooming",
                                    "caller_subtitle": "Luna's grooming appointment",
                                    "phone_number": "01632 963 905",
                                    "time_label": "Today, 8:42 AM",
                                    "duration": "0:32",
                                    "avatar_color": "#0D9488",
                                    "audio_url": "https://customer-assets.emergentagent.com/job_concentric-hub/artifacts/hx72kjfg_Amber%205%20-%20Pet%20Grooming%20Reminder.mp3",
                                    "transcript": "Hi Daniel, this is Happy Paws Grooming calling about Luna's appointment tomorrow. She's booked in for 2:00 PM for a wash and nail trim. Please remember to bring her vaccination card with you. If you need to cancel or change the appointment, please call us before 10:00 tomorrow morning. Thanks, see you soon.",
                                },
                                "text": "Voicemail from Happy Paws Grooming — Luna's grooming appointment",
                                "questions": [
                                    {"q": "Who was calling Daniel?", "options": ["Happy Paws Grooming", "Bella Hair Studio", "Parkside Pharmacy"], "answer": 0},
                                    {"q": "Who is the appointment for?", "options": ["Luna", "Daniel", "Priya"], "answer": 0},
                                    {"q": "When is the appointment?", "options": ["Tomorrow at 2:00 PM", "Today at 2:00 PM", "Next Tuesday at 10:00 AM"], "answer": 0},
                                    {"q": "What is Luna booked in for?", "options": ["A wash and nail trim", "A health check", "A vaccination"], "answer": 0},
                                    {"q": "What should Daniel bring with him?", "options": ["Luna's vaccination card", "A photo ID", "A health card"], "answer": 0},
                                    {"q": "What should Daniel do if he needs to cancel or change the appointment?", "options": ["Call before 10:00 tomorrow morning", "Just turn up at a different time", "Wait until next week"], "answer": 0},
                                ],
                            },
                            {
                                "id": 6,
                                "title": "Library Book Pick-Up",
                                "summary": "Oakwood Library letting Sofia know a reserved book is ready to collect.",
                                "letterhead": {
                                    "format": "voicemail",
                                    "caller_name": "Oakwood Library",
                                    "caller_subtitle": "Reserved book ready to collect",
                                    "phone_number": "01632 964 117",
                                    "time_label": "Wednesday, 11:09 AM",
                                    "duration": "0:31",
                                    "avatar_color": "#92400E",
                                    "audio_url": "https://customer-assets.emergentagent.com/job_concentric-hub/artifacts/yofl8qcx_Amber%206%20-%20%20Library%20Book%20Pick-Up.mp3",
                                    "transcript": "Hi Sofia, this is Oakwood Library calling about the book you reserved. It is now ready to collect and will be held for you until Friday afternoon. Please bring your library card when you come in. If you no longer want the book, you can ignore this message or cancel the reservation online. Thank you.",
                                },
                                "text": "Voicemail from Oakwood Library — reserved book ready to collect",
                                "questions": [
                                    {"q": "Who was calling Sofia?", "options": ["Oakwood Library", "Maple Grove Library", "FitWell Gym"], "answer": 0},
                                    {"q": "What was the call about?", "options": ["A reserved book", "A pet appointment", "A taxi booking"], "answer": 0},
                                    {"q": "What is ready to collect?", "options": ["The book Sofia reserved", "A parcel", "A repeat prescription"], "answer": 0},
                                    {"q": "How long will the book be held for?", "options": ["Until Friday afternoon", "Until Monday morning", "Until the end of the month"], "answer": 0},
                                    {"q": "What should Sofia bring with her?", "options": ["Her library card", "A photo ID", "A receipt"], "answer": 0},
                                    {"q": "What can Sofia do if she no longer wants the book?", "options": ["Ignore the message or cancel the reservation online", "Tear up her library card", "Pay a small fee"], "answer": 0},
                                ],
                            },
                            {
                                "id": 7,
                                "title": "Gym Class Booking",
                                "summary": "FitWell Gym letting Marcus know his yoga class start time has changed.",
                                "letterhead": {
                                    "format": "voicemail",
                                    "caller_name": "FitWell Gym",
                                    "caller_subtitle": "Yoga class booking update",
                                    "phone_number": "01632 964 528",
                                    "time_label": "Today, 3:18 PM",
                                    "duration": "0:35",
                                    "avatar_color": "#0D9488",
                                    "audio_url": "https://customer-assets.emergentagent.com/job_concentric-hub/artifacts/aiqgayhj_Amber%207%20-%20Gym%20Class%20Booking.mp3",
                                    "transcript": "Hi Marcus, this is FitWell Gym calling about your yoga class booking for tomorrow evening. The class will now start at 6:45 instead of 6:30 because the studio is being cleaned after an earlier session. Please bring your own mat if you have one. If you can't attend, please cancel through the app before midday tomorrow. Thank you.",
                                },
                                "text": "Voicemail from FitWell Gym — yoga class booking update",
                                "questions": [
                                    {"q": "Who was calling Marcus?", "options": ["FitWell Gym", "Oakwood Library", "The Corner Café"], "answer": 0},
                                    {"q": "What class is the message about?", "options": ["A yoga class", "A spin class", "A swimming class"], "answer": 0},
                                    {"q": "When is the class?", "options": ["Tomorrow evening", "Tonight", "On Saturday morning"], "answer": 0},
                                    {"q": "What is the new start time?", "options": ["6:45", "6:30", "7:00"], "answer": 0},
                                    {"q": "What should Marcus bring if he has one?", "options": ["His own mat", "His own water bottle", "His own towel"], "answer": 0},
                                    {"q": "What should Marcus do if he can't attend?", "options": ["Cancel through the app before midday tomorrow", "Phone the studio after midnight", "Just not turn up"], "answer": 0},
                                ],
                            },
                            {
                                "id": 8,
                                "title": "Dentist Appointment Reminder",
                                "summary": "Maple Dental Clinic reminding Elena about a check-up.",
                                "letterhead": {
                                    "format": "voicemail",
                                    "caller_name": "Maple Dental Clinic",
                                    "caller_subtitle": "Dental check-up reminder",
                                    "phone_number": "01632 964 873",
                                    "time_label": "Friday, 4:46 PM",
                                    "duration": "0:38",
                                    "avatar_color": "#0F766E",
                                    "audio_url": "https://customer-assets.emergentagent.com/job_concentric-hub/artifacts/o45ncyyt_Amber%208%20-%20Dentist%20Appointment%20Reminder.mp3",
                                    "transcript": "Hi Elena, this is Maple Dental Clinic calling to remind you about your check-up on Monday morning. Your appointment is at 9:30, but please arrive 10 minutes early to update your details at reception. If you have any new medication or allergies, please let the dentist know when you arrive. If you need to rearrange, please call us today. Thank you.",
                                },
                                "text": "Voicemail from Maple Dental Clinic — check-up reminder",
                                "questions": [
                                    {"q": "Who was calling Elena?", "options": ["Maple Dental Clinic", "FitWell Gym", "Oakwood Library"], "answer": 0},
                                    {"q": "What type of appointment is the message about?", "options": ["A dental check-up", "A blood test", "A hair appointment"], "answer": 0},
                                    {"q": "What day is the appointment?", "options": ["Monday morning", "Friday afternoon", "Sunday evening"], "answer": 0},
                                    {"q": "What time is the appointment?", "options": ["9:30", "10:30", "2:15"], "answer": 0},
                                    {"q": "Why should Elena arrive 10 minutes early?", "options": ["To update her details at reception", "To have a cup of tea", "To wait in the car park"], "answer": 0},
                                    {"q": "What should Elena do if she needs to rearrange?", "options": ["Call the clinic today", "Email the dentist tomorrow", "Wait until Monday"], "answer": 0},
                                ],
                            },
                            {
                                "id": 9,
                                "title": "Café Booking Update",
                                "summary": "Hannah from The Corner Café updating Olivia about a brunch table booking.",
                                "letterhead": {
                                    "format": "voicemail",
                                    "caller_name": "The Corner Café",
                                    "caller_subtitle": "Hannah · table booking update",
                                    "phone_number": "01632 965 022",
                                    "time_label": "Saturday, 5:12 PM",
                                    "duration": "0:34",
                                    "avatar_color": "#EA580C",
                                    "audio_url": "https://customer-assets.emergentagent.com/job_concentric-hub/artifacts/79likh8h_Amber%209%20-%20Caf%C3%A9%20Booking%20Update.mp3",
                                    "transcript": "Hi Olivia, it's Hannah from The Corner Café. I'm calling about your table booking for Sunday brunch. We can still seat your group for four people, but your table will be outside because the indoor area is fully booked. Your booking is at 11:00, and we will hold the table for 15 minutes. If outdoor seating doesn't work for you, please call us back today and we will see what we can do. Thanks.",
                                },
                                "text": "Voicemail from Hannah at The Corner Café — table booking update",
                                "questions": [
                                    {"q": "Who was calling Olivia?", "options": ["Hannah from The Corner Café", "Maple Dental Clinic", "Willow Hair Studio"], "answer": 0},
                                    {"q": "What was the call about?", "options": ["A table booking for brunch", "A taxi booking", "A library reservation"], "answer": 0},
                                    {"q": "What day is the booking for?", "options": ["Sunday", "Saturday", "Friday"], "answer": 0},
                                    {"q": "How many people is the booking for?", "options": ["Four people", "Two people", "Six people"], "answer": 0},
                                    {"q": "Where will the table be?", "options": ["Outside", "By the window", "Upstairs"], "answer": 0},
                                    {"q": "What should Olivia do if outdoor seating does not work?", "options": ["Call back today", "Just turn up indoors anyway", "Ignore the message"], "answer": 0},
                                ],
                            },
                            {
                                "id": 10,
                                "title": "Hair Appointment Reminder",
                                "summary": "Willow Hair Studio reminding Jamie about a haircut and colour.",
                                "letterhead": {
                                    "format": "voicemail",
                                    "caller_name": "Willow Hair Studio",
                                    "caller_subtitle": "Haircut and colour reminder",
                                    "phone_number": "01632 965 481",
                                    "time_label": "Thursday, 10:24 AM",
                                    "duration": "0:36",
                                    "avatar_color": "#7C3AED",
                                    "audio_url": "https://customer-assets.emergentagent.com/job_concentric-hub/artifacts/kpfht5f4_Amber%2010%20-%20Hair%20Appointment%20Reminder.mp3",
                                    "transcript": "Hi Jamie, this is Willow Hair Studio calling about your appointment on Friday afternoon. You're booked in for a haircut and colour at 2:15. Please arrive with dry hair, and allow about two hours for the appointment. If you need to change your booking, please call us before the end of the day tomorrow. Thank you.",
                                },
                                "text": "Voicemail from Willow Hair Studio — haircut and colour reminder",
                                "questions": [
                                    {"q": "Who was calling Jamie?", "options": ["Willow Hair Studio", "Bella Hair Studio", "Maple Dental Clinic"], "answer": 0},
                                    {"q": "What day is the appointment?", "options": ["Friday afternoon", "Thursday afternoon", "Saturday morning"], "answer": 0},
                                    {"q": "What time is the appointment?", "options": ["2:15", "1:00", "9:30"], "answer": 0},
                                    {"q": "What is Jamie booked in for?", "options": ["A haircut and colour", "Just a haircut", "A wash and blow-dry"], "answer": 0},
                                    {"q": "How should Jamie arrive for the appointment?", "options": ["With dry hair", "With wet hair", "With a hat on"], "answer": 0},
                                    {"q": "What should Jamie do if they need to change the booking?", "options": ["Call before the end of the day tomorrow", "Wait until Friday morning", "Email the salon next week"], "answer": 0},
                                ],
                            },
                        ],
                    },
                    "red": {
                        "key": "red",
                        "title": "Complex",
                        "blurb": "10 longer voicemails (60-90 seconds) with multiple instructions, conditional steps, and five questions each requiring inference.",
                        "best_for": "Clients working on holding several details in working memory and drawing conclusions from them.",
                        "questions_per_letter": 5,
                        "target_letter_count": 10,
                        "item_label_singular": "Voicemail",
                        "item_label_plural": "voicemails",
                        "est_minutes": "30–40 min",
                        "letters": [
                            {
                                "id": 1,
                                "title": "Wedding Cake Emergency",
                                "summary": "Mia leaving a slightly panicked update about the wedding cake topper, the delivery time, and a 3 PM decision deadline.",
                                "letterhead": {
                                    "format": "voicemail",
                                    "caller_name": "Mia",
                                    "caller_subtitle": "Wedding cake update",
                                    "phone_number": "07700 900 612",
                                    "time_label": "Today, 10:14 AM",
                                    "duration": "0:46",
                                    "avatar_color": "#DB2777",
                                    "audio_url": "https://customer-assets.emergentagent.com/job_concentric-hub/artifacts/ni2vc6vl_Red%201%20-%20Wedding%20Cake%20Emergency.mp3",
                                    "transcript": "Hi Chloe, it's Mia. Slight panic, but it's fixable. The bakery just called about the wedding cake for Saturday. They can still make the lemon and raspberry cake, but the gold topper we chose has cracked, so they're offering either a plain white topper or fresh flowers instead. They need our choice by 3 PM today, otherwise they'll use the white topper. Also, the cake will now be delivered to the venue at 10:30 instead of 9:00, so please let the coordinator know. Call me back when you can.",
                                },
                                "text": "Voicemail from Mia — wedding cake update",
                                "questions": [
                                    {"q": "Who left the voicemail?", "options": ["Mia", "Chloe", "The bakery"], "answer": 0},
                                    {"q": "What is the voicemail about?", "options": ["The wedding cake for Saturday", "A taxi booking", "A blood test result"], "answer": 0},
                                    {"q": "What happened to the gold topper?", "options": ["It cracked", "It was lost in the post", "It was the wrong colour"], "answer": 0},
                                    {"q": "What two replacement options did the bakery offer?", "options": ["A plain white topper or fresh flowers", "Chocolate or vanilla icing", "A bigger cake or a second tier"], "answer": 0},
                                    {"q": "What will happen if they do not reply by 3 PM?", "options": ["The bakery will use the white topper", "The cake will be cancelled", "The price will go up"], "answer": 0},
                                    {"q": "What does Chloe need to tell the venue coordinator?", "options": ["The cake will now be delivered at 10:30 instead of 9:00", "The cake will be lemon and raspberry", "The wedding is moving to Sunday"], "answer": 0},
                                ],
                            },
                            {
                                "id": 2,
                                "title": "Escape Room Booking Mix-Up",
                                "summary": "Ella passing on a change of room, start time, and a cancel-by deadline for a group escape-room booking.",
                                "letterhead": {
                                    "format": "voicemail",
                                    "caller_name": "Ella",
                                    "caller_subtitle": "Escape room booking update",
                                    "phone_number": "07700 900 884",
                                    "time_label": "Yesterday, 7:21 PM",
                                    "duration": "0:54",
                                    "avatar_color": "#4F46E5",
                                    "audio_url": "https://customer-assets.emergentagent.com/job_concentric-hub/artifacts/eb8gsmb6_Red%202%20-%20Escape%20Room%20Booking%20Mix-Up.mp3",
                                    "transcript": "Hi Ravi, it's Ella. I just got a voicemail that, uhm, from that escape room place about Saturday. So, they still have our booking for six people, but they've moved us from the detective room to the space mission room because the detective room was... I don't know they had some a technical issues with it. Anyway, so the new room starts at 5:40 instead of 5:30, and they said we need to arrive about 15 minutes early for the safety briefing. If anyone in the group doesn't wanna do the space theme, then maybe we can cancel for free, but only if we call back before 2 PM tomorrow. So, can you message the group and see what everyone thinks?",
                                },
                                "text": "Voicemail from Ella — escape room booking update",
                                "questions": [
                                    {"q": "Who left the voicemail?", "options": ["Ella", "Ravi", "The escape room"], "answer": 0},
                                    {"q": "What activity is the message about?", "options": ["An escape room booking", "A wedding cake", "A medical appointment"], "answer": 0},
                                    {"q": "Why was the group moved to a different room?", "options": ["The detective room has a technical issue", "The detective room is being painted", "There were not enough staff"], "answer": 0},
                                    {"q": "What is the new start time?", "options": ["5:40", "5:30", "6:00"], "answer": 0},
                                    {"q": "What time does the group need to arrive?", "options": ["15 minutes early, so 5:25", "Right on 5:40", "At 5:00 sharp"], "answer": 0},
                                    {"q": "What should Ravi do next?", "options": ["Message the group to see what everyone thinks", "Cancel the booking immediately", "Pay an extra fee"], "answer": 0},
                                ],
                            },
                            {
                                "id": 3,
                                "title": "Missing House Keys",
                                "summary": "Ben asking Sophie to look in her car for his keys, with two conditional follow-up plans.",
                                "letterhead": {
                                    "format": "voicemail",
                                    "caller_name": "Ben",
                                    "caller_subtitle": "Missing house keys",
                                    "phone_number": "07700 900 327",
                                    "time_label": "Today, 4:48 PM",
                                    "duration": "0:48",
                                    "avatar_color": "#0D9488",
                                    "audio_url": "https://customer-assets.emergentagent.com/job_concentric-hub/artifacts/77oe8rdq_Red%203%20-%20Missing%20House%20Keys.mp3",
                                    "transcript": "Hi Sophie, it's Ben. I think I left my house keys in your car after lunch. I checked my coat pocket and my work bag, but they're not there. If you find them, could you leave them with the receptionist at your building before 5:30? I have a spare key, but it's at my brother's flat, and he won't be home until later tonight. If you're already on your way out, just text me and I'll come to you instead.",
                                },
                                "text": "Voicemail from Ben — missing house keys",
                                "questions": [
                                    {"q": "Who left the voicemail?", "options": ["Ben", "Sophie", "Ben's brother"], "answer": 0},
                                    {"q": "What does Ben think he left in Sophie's car?", "options": ["His house keys", "His coat", "His work bag"], "answer": 0},
                                    {"q": "Where has Ben already checked?", "options": ["His coat pocket and work bag", "His brother's flat", "Sophie's office"], "answer": 0},
                                    {"q": "What should Sophie do if she finds the keys?", "options": ["Leave them with the receptionist before 5:30", "Bring them straight to Ben's flat", "Wait until tomorrow morning"], "answer": 0},
                                    {"q": "Why can't Ben easily use his spare key?", "options": ["The spare key is at his brother's flat, and his brother will not be home until later tonight", "He has lost his spare key too", "The spare key is broken"], "answer": 0},
                                    {"q": "What should Sophie do if she is already leaving?", "options": ["Text Ben, and he will come to her instead", "Leave the keys on the desk and go", "Post the keys through the letterbox"], "answer": 0},
                                ],
                            },
                            {
                                "id": 4,
                                "title": "Dog Sitter Problem",
                                "summary": "Josh realising he wrote down the wrong dog-sitting date, with a back-up plan involving a neighbour.",
                                "letterhead": {
                                    "format": "voicemail",
                                    "caller_name": "Josh",
                                    "caller_subtitle": "Dog sitting for Milo",
                                    "phone_number": "07700 900 519",
                                    "time_label": "Wednesday, 8:02 PM",
                                    "duration": "0:55",
                                    "avatar_color": "#CA8A04",
                                    "audio_url": "https://customer-assets.emergentagent.com/job_concentric-hub/artifacts/6mgakxn6_Red%204%20-%20Dog%20Sitter%20Problem.mp3",
                                    "transcript": "Hi Amelia, it's Josh. I'm really sorry, but I've just realised I wrote down the wrong date for looking after Milo. I thought you were going away next weekend, not this weekend. I can still take him on Friday night, but I have a family lunch on Saturday, so he would need to be picked up by 11 in the morning. If that doesn't work, my neighbour Claire said she might be able to help, but she'll need Milo's food, lead, and his medication instructions. Can you call me when you get this?",
                                },
                                "text": "Voicemail from Josh — dog sitting for Milo",
                                "questions": [
                                    {"q": "Who left the voicemail?", "options": ["Josh", "Amelia", "Claire"], "answer": 0},
                                    {"q": "What mistake did Josh make?", "options": ["He wrote down the wrong date for looking after Milo", "He forgot Milo's name", "He lost Milo's lead"], "answer": 0},
                                    {"q": "When can Josh still look after Milo?", "options": ["Friday night", "All of Saturday", "Sunday morning"], "answer": 0},
                                    {"q": "What time would Milo need to be picked up on Saturday?", "options": ["By 11 in the morning", "By 5 in the evening", "By midnight"], "answer": 0},
                                    {"q": "Who might be able to help if Josh's plan does not work?", "options": ["His neighbour, Claire", "His brother", "The vet"], "answer": 0},
                                    {"q": "What would Claire need for Milo?", "options": ["Milo's food, lead, and medication instructions", "Just his lead", "A new collar"], "answer": 0},
                                ],
                            },
                            {
                                "id": 5,
                                "title": "Medical Test Follow-Up",
                                "summary": "Westbrook Medical Centre booking a telephone follow-up for Priya's recent blood test.",
                                "letterhead": {
                                    "format": "voicemail",
                                    "caller_name": "Westbrook Medical Centre",
                                    "caller_subtitle": "Blood test follow-up",
                                    "phone_number": "01632 967 040",
                                    "time_label": "Tuesday, 2:11 PM",
                                    "duration": "0:50",
                                    "avatar_color": "#BE123C",
                                    "audio_url": "https://customer-assets.emergentagent.com/job_concentric-hub/artifacts/5143xech_Red%205%20-%20Medical%20Test%20Follow-Up.mp3",
                                    "transcript": "Hello Priya, this is Westbrook Medical Centre calling about your recent blood test. The doctor has reviewed your results and would like to speak with you, but this is not urgent. We have booked you a telephone appointment for Thursday at 2:40 PM. Please keep your phone nearby, as the call may come from a private number. If this time does not work for you, please call reception before 5 PM tomorrow to rearrange. Thank you.",
                                },
                                "text": "Voicemail from Westbrook Medical Centre — blood test follow-up",
                                "questions": [
                                    {"q": "Who was calling Priya?", "options": ["Westbrook Medical Centre", "Maple Dental Clinic", "Parkside Pharmacy"], "answer": 0},
                                    {"q": "What was the call about?", "options": ["Her recent blood test", "A repeat prescription", "A hair appointment"], "answer": 0},
                                    {"q": "Is the matter urgent?", "options": ["No, it is not urgent", "Yes, very urgent", "The message did not say"], "answer": 0},
                                    {"q": "When is the telephone appointment?", "options": ["Thursday at 2:40 PM", "Tomorrow at 5:00 PM", "Next Monday morning"], "answer": 0},
                                    {"q": "Why should Priya keep her phone nearby?", "options": ["The call may come from a private number", "The doctor will text first", "The line is sometimes engaged"], "answer": 0},
                                    {"q": "What should Priya do if the appointment time does not work?", "options": ["Call reception before 5 PM tomorrow to rearrange", "Just miss the call", "Wait for the doctor to ring back next week"], "answer": 0},
                                ],
                            },
                            {
                                "id": 6,
                                "title": "Utility Bill Payment Issue",
                                "summary": "Greenvale Energy explaining a payment reference number was entered incorrectly.",
                                "letterhead": {
                                    "format": "voicemail",
                                    "caller_name": "Greenvale Energy",
                                    "caller_subtitle": "Electricity account update",
                                    "phone_number": "0808 196 6800",
                                    "time_label": "Today, 11:36 AM",
                                    "duration": "0:48",
                                    "avatar_color": "#16A34A",
                                    "audio_url": "https://customer-assets.emergentagent.com/job_concentric-hub/artifacts/gz6037v7_Red%206%20-%20Utility%20Bill%20Payment%20Issue.mp3",
                                    "transcript": "Hello Daniel, this is Greenvale Energy calling about your electricity account. We received your payment yesterday, but the reference number was entered incorrectly, so it has not been matched to your account yet. Please do not make another payment. Instead, call our billing team before Friday with your payment confirmation number and the bank account it was sent from. The number for the billing team is 680 5014 3498. If we do not hear from you, you may receive an automatic reminder letter next week.",
                                },
                                "text": "Voicemail from Greenvale Energy — electricity account payment issue",
                                "questions": [
                                    {"q": "Who was calling Daniel?", "options": ["Greenvale Energy", "Northbridge Bank", "Riverside Patient Transport"], "answer": 0},
                                    {"q": "What account is the message about?", "options": ["His electricity account", "His gas account", "His bank account"], "answer": 0},
                                    {"q": "What went wrong with the payment?", "options": ["The reference number was entered incorrectly, so the payment has not been matched to his account", "The payment was sent twice", "The bank rejected the payment"], "answer": 0},
                                    {"q": "What should Daniel not do?", "options": ["Make another payment", "Call the billing team", "Open his next bill"], "answer": 0},
                                    {"q": "What number should Daniel call?", "options": ["680 5014 3498", "0300 134 8532", "0808 196 6800"], "answer": 0},
                                    {"q": "What might happen if Daniel does not call back?", "options": ["He may receive an automatic reminder letter next week", "His electricity will be cut off the same day", "He will be charged a £100 fine"], "answer": 0},
                                ],
                            },
                            {
                                "id": 7,
                                "title": "Prescription Delivery Problem",
                                "summary": "Parkside Pharmacy offering two options after a missed prescription delivery.",
                                "letterhead": {
                                    "format": "voicemail",
                                    "caller_name": "Parkside Pharmacy",
                                    "caller_subtitle": "Medication delivery — missed",
                                    "phone_number": "0300 134 8532",
                                    "time_label": "Today, 1:18 PM",
                                    "duration": "0:54",
                                    "avatar_color": "#4F46E5",
                                    "audio_url": "https://customer-assets.emergentagent.com/job_concentric-hub/artifacts/k77lzmh1_Red%207%20-%20Prescription%20Delivery%20Problem.mp3",
                                    "transcript": "Hello Aisha, this is Parkside Pharmacy calling about your medication delivery. Your usual prescription is ready, but the delivery driver could not leave it today because no one answered the door and the medication needs to be signed for. We can try again tomorrow morning, or you can collect it from the pharmacy after 4 PM today. If you choose collection, please bring photo ID and call us first so we can cancel the delivery slot. Our number is 0300 134 8532, that is 0300 134 8532. Thanks.",
                                },
                                "text": "Voicemail from Parkside Pharmacy — missed medication delivery",
                                "questions": [
                                    {"q": "Who was calling Aisha?", "options": ["Parkside Pharmacy", "Westside Pharmacy", "Greenvale Energy"], "answer": 0},
                                    {"q": "What is the message about?", "options": ["Her medication delivery", "A repeat prescription request", "A pharmacy survey"], "answer": 0},
                                    {"q": "Why could the driver not leave the medication?", "options": ["No one answered the door, and the medication needs to be signed for", "The address was wrong", "The driver could not find the building"], "answer": 0},
                                    {"q": "What are Aisha's two options?", "options": ["Try delivery again tomorrow morning, or collect it from the pharmacy after 4 PM today", "Pay extra for same-day redelivery, or wait until next week", "Collect this morning, or go without"], "answer": 0},
                                    {"q": "What should Aisha bring if she collects the medication?", "options": ["Photo ID", "A health card", "Her empty bottles"], "answer": 0},
                                    {"q": "What number should Aisha call if she chooses collection?", "options": ["0300 134 8532", "680 5014 3498", "0808 196 6800"], "answer": 0},
                                ],
                            },
                            {
                                "id": 8,
                                "title": "Housing Repair Appointment",
                                "summary": "City Homes Repairs booking a plumber visit, with a conditional emergency-line instruction.",
                                "letterhead": {
                                    "format": "voicemail",
                                    "caller_name": "City Homes Repairs",
                                    "caller_subtitle": "Bathroom leak — repair appointment",
                                    "phone_number": "0300 555 1290",
                                    "time_label": "Today, 4:02 PM",
                                    "duration": "0:55",
                                    "avatar_color": "#0EA5E9",
                                    "audio_url": "https://customer-assets.emergentagent.com/job_concentric-hub/artifacts/csk0gngj_Red%208%20-%20Housing%20Repair%20Appointment.mp3",
                                    "transcript": "Hello Elena, this is City Homes Repairs calling about the leak you reported in your bathroom. A plumber can attend tomorrow between 1 PM and 5 PM, but someone over 18 must be home for the whole appointment window. Please clear the area under the sink before they arrive. If the leak gets worse overnight or water reaches any electrical sockets, call the emergency repair line instead of waiting for tomorrow's appointment.",
                                },
                                "text": "Voicemail from City Homes Repairs — bathroom leak repair",
                                "questions": [
                                    {"q": "Who was calling Elena?", "options": ["City Homes Repairs", "Greenvale Energy", "Riverside Patient Transport"], "answer": 0},
                                    {"q": "What repair is the message about?", "options": ["A bathroom leak", "A broken boiler", "A blocked drain"], "answer": 0},
                                    {"q": "When can the plumber attend?", "options": ["Tomorrow between 1 PM and 5 PM", "Today between 9 AM and 12 PM", "Next Monday afternoon"], "answer": 0},
                                    {"q": "Who needs to be home during the appointment window?", "options": ["Someone over 18", "Only Elena", "Anyone, including children"], "answer": 0},
                                    {"q": "What should Elena do before the plumber arrives?", "options": ["Clear the area under the sink", "Turn off the water", "Move all the furniture"], "answer": 0},
                                    {"q": "What should Elena do if water reaches electrical sockets?", "options": ["Call the emergency repair line instead of waiting", "Just turn off the lights", "Wait until tomorrow as planned"], "answer": 0},
                                ],
                            },
                            {
                                "id": 9,
                                "title": "Hospital Transport Confirmation",
                                "summary": "Riverside Patient Transport confirming a hospital pick-up with an updated time window.",
                                "letterhead": {
                                    "format": "voicemail",
                                    "caller_name": "Riverside Patient Transport",
                                    "caller_subtitle": "Hospital transport update",
                                    "phone_number": "0300 555 2748",
                                    "time_label": "Sunday, 6:14 PM",
                                    "duration": "0:56",
                                    "avatar_color": "#0F766E",
                                    "audio_url": "https://customer-assets.emergentagent.com/job_concentric-hub/artifacts/a652ju69_Red%209%20-%20Hospital%20Transport%20Confirmation.mp3",
                                    "transcript": "Hello Grace, this is Riverside Patient Transport calling about your hospital appointment on Tuesday. Your transport is confirmed, but the pick-up window has changed. The driver may arrive any time between 7:50 and 8:20 in the morning. Please be ready by 7:45 and bring your appointment letter, medication list, and mobility aid if you need one. If you no longer need transport, please call us by midday on Monday so we can offer the space to another patient.",
                                },
                                "text": "Voicemail from Riverside Patient Transport — hospital transport update",
                                "questions": [
                                    {"q": "Who was calling Grace?", "options": ["Riverside Patient Transport", "CityLink Community Transport", "City Homes Repairs"], "answer": 0},
                                    {"q": "What is the message about?", "options": ["Her hospital transport", "A taxi booking", "A bathroom leak"], "answer": 0},
                                    {"q": "What day is the hospital appointment?", "options": ["Tuesday", "Monday", "Sunday"], "answer": 0},
                                    {"q": "What is the new pick-up window?", "options": ["Between 7:50 and 8:20 in the morning", "Between 9:00 and 9:30 in the morning", "Between 6:00 and 6:30 in the morning"], "answer": 0},
                                    {"q": "What time should Grace be ready by?", "options": ["By 7:45", "By 8:20", "By 9:00"], "answer": 0},
                                    {"q": "What should Grace do if she no longer needs transport?", "options": ["Call by midday on Monday", "Just stay at home", "Email the hospital next week"], "answer": 0},
                                ],
                            },
                            {
                                "id": 10,
                                "title": "Bank Card Security Check",
                                "summary": "Northbridge Bank checking two unusual online purchases on Marcus's debit card.",
                                "letterhead": {
                                    "format": "voicemail",
                                    "caller_name": "Northbridge Bank",
                                    "caller_subtitle": "Card security — unusual activity",
                                    "phone_number": "0345 600 2200",
                                    "time_label": "Today, 9:02 AM",
                                    "duration": "0:58",
                                    "avatar_color": "#1E3A8A",
                                    "audio_url": "https://customer-assets.emergentagent.com/job_concentric-hub/artifacts/xj9mlcvy_Red%2010%20-%20%20Bank%20Card%20Security%20Check.mp3",
                                    "transcript": "Hello Marcus, this is Northbridge Bank calling about your debit card. We noticed two online purchases this morning that are unusual for your account. Your card has not yet been cancelled, but online payments have been temporarily paused just until we confirm whether the purchases were yours. Please check your banking app and respond to the security message, or call the number on the back of your card. Do not reply to this voicemail with any personal details.",
                                },
                                "text": "Voicemail from Northbridge Bank — debit card security check",
                                "questions": [
                                    {"q": "Who was calling Marcus?", "options": ["Northbridge Bank", "Greenvale Energy", "Parkside Pharmacy"], "answer": 0},
                                    {"q": "What is the call about?", "options": ["His debit card", "His electricity bill", "A hospital appointment"], "answer": 0},
                                    {"q": "What did the bank notice?", "options": ["Two unusual online purchases", "A failed direct debit", "A duplicate payment"], "answer": 0},
                                    {"q": "Has the card been cancelled?", "options": ["No, the card has not been cancelled — online payments have been temporarily paused", "Yes, the card has been cancelled", "Yes, and a new one is in the post"], "answer": 0},
                                    {"q": "What should Marcus do next?", "options": ["Check the banking app and respond to the security message, or call the number on the back of the card", "Send a text reply to this voicemail", "Wait for the bank to ring again"], "answer": 0},
                                    {"q": "What should Marcus avoid doing?", "options": ["Replying to the voicemail with personal details", "Checking his banking app", "Calling the number on his card"], "answer": 0},
                                ],
                            },
                        ],
                    },
                    "pink": {
                        "key": "pink",
                        "title": "Bonus",
                        "blurb": "10 automated phone menus. Listen to the options, read the scenario, and press the right number on the keypad.",
                        "best_for": "Clients working on navigating real-world automated phone systems — a key independence goal.",
                        "questions_per_letter": 1,
                        "target_letter_count": 10,
                        "item_label_singular": "Phone menu",
                        "item_label_plural": "phone menus",
                        "est_minutes": "12–18 min",
                        "letters": [
                            {
                                "id": 1,
                                "title": "GP Appointment Line",
                                "summary": "Calling Westbrook Medical Centre to book a GP appointment.",
                                "letterhead": {
                                    "format": "phone-menu",
                                    "caller_name": "Westbrook Medical Centre",
                                    "caller_subtitle": "GP appointment line",
                                    "phone_number": "01632 967 040",
                                    "time_label": "Phone menu",
                                    "duration": "0:18",
                                    "avatar_color": "#EC4899",
                                    "audio_url": "https://customer-assets.emergentagent.com/job_concentric-hub/artifacts/c8tw5mq7_1.%20GP%20Appointment%20Line.mp3",
                                    "transcript": "Thank you for calling Westbrook Medical Centre. For appointments, press 1. For repeat prescriptions, press 2. For test results, press 3. To speak to reception, press 4. To hear these options again, press 5.",
                                },
                                "text": "Phone menu — Westbrook Medical Centre",
                                "questions": [
                                    {
                                        "q": "You are calling to book a GP appointment. What should you press?",
                                        "options": ["Press 1", "Press 2", "Press 3", "Press 4", "Press 5", "Stay on the line", "Hang up"],
                                        "answer": 0,
                                        "replay_key": "5",
                                    },
                                ],
                            },
                            {
                                "id": 2,
                                "title": "Pharmacy Phone Menu",
                                "summary": "Calling Parkside Pharmacy to check whether a prescription is ready.",
                                "letterhead": {
                                    "format": "phone-menu",
                                    "caller_name": "Parkside Pharmacy",
                                    "caller_subtitle": "Automated phone menu",
                                    "phone_number": "0300 134 8500",
                                    "time_label": "Phone menu",
                                    "duration": "0:20",
                                    "avatar_color": "#EC4899",
                                    "audio_url": "https://customer-assets.emergentagent.com/job_concentric-hub/artifacts/kd5rua5b_2.%20Pharmacy%20Phone%20Menu.mp3",
                                    "transcript": "Thank you for calling Parkside Pharmacy. For opening hours, press 1. For prescription collections, press 2. For medication delivery, press 3. To speak to a pharmacist, press 4. To repeat these options, press 5.",
                                },
                                "text": "Phone menu — Parkside Pharmacy",
                                "questions": [
                                    {
                                        "q": "You are calling because you want to check whether your prescription is ready to pick up. What should you press?",
                                        "options": ["Press 1", "Press 2", "Press 3", "Press 4", "Press 5", "Stay on the line", "Hang up"],
                                        "answer": 1,
                                        "replay_key": "5",
                                    },
                                ],
                            },
                            {
                                "id": 3,
                                "title": "Hospital Appointments Line",
                                "summary": "Calling Riverside Hospital to change the time of an outpatient appointment.",
                                "letterhead": {
                                    "format": "phone-menu",
                                    "caller_name": "Riverside Hospital",
                                    "caller_subtitle": "Appointments line",
                                    "phone_number": "0300 555 2000",
                                    "time_label": "Phone menu",
                                    "duration": "0:22",
                                    "avatar_color": "#EC4899",
                                    "audio_url": "https://customer-assets.emergentagent.com/job_concentric-hub/artifacts/5onflbmx_3.%20Hospital%20Appointments%20Line.mp3",
                                    "transcript": "Thank you for calling Riverside Hospital. For directions and parking, press 1. For outpatient appointment bookings or changes, press 2. For test results, press 3. For patient transport, press 4. For all other enquiries, please stay on the line.",
                                },
                                "text": "Phone menu — Riverside Hospital",
                                "questions": [
                                    {
                                        "q": "You are calling because you need to change the time of your outpatient appointment. What should you press?",
                                        "options": ["Press 1", "Press 2", "Press 3", "Press 4", "Stay on the line", "Hang up"],
                                        "answer": 1,
                                    },
                                ],
                            },
                            {
                                "id": 4,
                                "title": "Council Services Menu",
                                "summary": "Calling City Council Services about urgent home damage.",
                                "letterhead": {
                                    "format": "phone-menu",
                                    "caller_name": "City Council Services",
                                    "caller_subtitle": "Automated phone menu",
                                    "phone_number": "0300 555 7700",
                                    "time_label": "Phone menu",
                                    "duration": "0:36",
                                    "avatar_color": "#EC4899",
                                    "audio_url": "https://customer-assets.emergentagent.com/job_concentric-hub/artifacts/mla36u2t_4.%20Council%20Services%20Menu.mp3",
                                    "transcript": "Thank you for calling City Council Services. Please listen carefully to the options as some may have recently changed. For council tax payments or balance enquiries, press 1. For rubbish, recycling, or missed bin collections, press 2. For housing repairs in a council property, press 3. For parking permits or parking fines, press 4. For blue badge or accessible parking enquiries, press 5. If your issue is urgent and may cause damage to your home, please stay on the line.",
                                },
                                "text": "Phone menu — City Council Services",
                                "questions": [
                                    {
                                        "q": "You are calling because water is leaking through your ceiling and dripping near a plug socket. What should you do?",
                                        "options": ["Press 1", "Press 2", "Press 3", "Press 4", "Press 5", "Stay on the line", "Hang up"],
                                        "answer": 5,
                                    },
                                ],
                            },
                            {
                                "id": 5,
                                "title": "Delivery Company Menu",
                                "summary": "Calling Northway Delivery after missing a parcel.",
                                "letterhead": {
                                    "format": "phone-menu",
                                    "caller_name": "Northway Delivery",
                                    "caller_subtitle": "Automated phone menu",
                                    "phone_number": "0345 778 0099",
                                    "time_label": "Phone menu",
                                    "duration": "0:21",
                                    "avatar_color": "#EC4899",
                                    "audio_url": "https://customer-assets.emergentagent.com/job_concentric-hub/artifacts/5q0k714b_5.%20Delivery%20Company%20Menu.mp3",
                                    "transcript": "Thank you for calling Northway Delivery. To track a parcel, press 1. To rearrange a missed delivery, press 2. To report a damaged parcel, press 3. To speak to customer services, press 4. To hear these options again, press 5.",
                                },
                                "text": "Phone menu — Northway Delivery",
                                "questions": [
                                    {
                                        "q": "You were out when the driver came, and you need another delivery time. What should you press?",
                                        "options": ["Press 1", "Press 2", "Press 3", "Press 4", "Press 5", "Stay on the line", "Hang up"],
                                        "answer": 1,
                                        "replay_key": "5",
                                    },
                                ],
                            },
                            {
                                "id": 6,
                                "title": "Dental Clinic Menu",
                                "summary": "Calling Maple Dental Clinic about a toothache with swelling.",
                                "letterhead": {
                                    "format": "phone-menu",
                                    "caller_name": "Maple Dental Clinic",
                                    "caller_subtitle": "Automated phone menu",
                                    "phone_number": "01632 964 873",
                                    "time_label": "Phone menu",
                                    "duration": "0:28",
                                    "avatar_color": "#EC4899",
                                    "audio_url": "https://customer-assets.emergentagent.com/job_concentric-hub/artifacts/vpm8mp3c_6.%20Dental%20Clinic%20Menu.mp3",
                                    "transcript": "Thank you for calling Maple Dental Clinic. Please listen carefully to the following options, as some of these may have recently changed. For new appointments, press 1. To change or cancel an appointment, press 2. For dental emergencies, press 3. For payment or insurance questions, press 4. To speak to reception, stay on the line.",
                                },
                                "text": "Phone menu — Maple Dental Clinic",
                                "questions": [
                                    {
                                        "q": "You have a toothache and swelling, and you need urgent advice today. What should you press?",
                                        "options": ["Press 1", "Press 2", "Press 3", "Press 4", "Stay on the line", "Hang up"],
                                        "answer": 2,
                                    },
                                ],
                            },
                            {
                                "id": 7,
                                "title": "Restaurant Booking Menu",
                                "summary": "Calling The Lantern Bistro to change the time of an existing booking.",
                                "letterhead": {
                                    "format": "phone-menu",
                                    "caller_name": "The Lantern Bistro",
                                    "caller_subtitle": "Bookings line",
                                    "phone_number": "01632 965 022",
                                    "time_label": "Phone menu",
                                    "duration": "0:30",
                                    "avatar_color": "#EC4899",
                                    "audio_url": "https://customer-assets.emergentagent.com/job_concentric-hub/artifacts/zgv162ov_7.%20Restaurant%20Booking%20Menu.mp3",
                                    "transcript": "Thank you for calling The Lantern Bistro. To make a new booking, press 1. To change or cancel an existing booking, press 2. For opening hours and location, press 3. For allergy or dietary questions, press 4. To speak to a member of staff, stay on the line.",
                                },
                                "text": "Phone menu — The Lantern Bistro",
                                "questions": [
                                    {
                                        "q": "You already have a table booked, but you need to change the time. What should you press?",
                                        "options": ["Press 1", "Press 2", "Press 3", "Press 4", "Stay on the line", "Hang up"],
                                        "answer": 1,
                                    },
                                ],
                            },
                            {
                                "id": 8,
                                "title": "Escape Room Phone Menu",
                                "summary": "Calling Locked In Escape Rooms because you're running late for an imminent booking.",
                                "letterhead": {
                                    "format": "phone-menu",
                                    "caller_name": "Locked In Escape Rooms",
                                    "caller_subtitle": "Bookings line",
                                    "phone_number": "0300 555 4188",
                                    "time_label": "Phone menu",
                                    "duration": "0:34",
                                    "avatar_color": "#EC4899",
                                    "audio_url": "https://customer-assets.emergentagent.com/job_concentric-hub/artifacts/01afm6pj_8.%20Escape%20Room%20Phone%20Menu.mp3",
                                    "transcript": "Thank you for calling Locked In Escape Rooms. To make a new booking, press 1. To change or cancel an existing booking, press 2. For directions and parking, press 3. For party packages or group events, press 4. If your game starts in the next 30 minutes and you are running late, please stay on the line.",
                                },
                                "text": "Phone menu — Locked In Escape Rooms",
                                "questions": [
                                    {
                                        "q": "Your escape room starts in 20 minutes, but your taxi is stuck in traffic and you may arrive late. What should you do?",
                                        "options": ["Press 1", "Press 2", "Press 3", "Press 4", "Stay on the line", "Hang up"],
                                        "answer": 4,
                                    },
                                ],
                            },
                            {
                                "id": 9,
                                "title": "Cinema Phone Menu",
                                "summary": "Calling Starlight Cinema after leaving your glasses behind.",
                                "letterhead": {
                                    "format": "phone-menu",
                                    "caller_name": "Starlight Cinema",
                                    "caller_subtitle": "Automated phone menu",
                                    "phone_number": "0300 555 3221",
                                    "time_label": "Phone menu",
                                    "duration": "0:32",
                                    "avatar_color": "#EC4899",
                                    "audio_url": "https://customer-assets.emergentagent.com/job_concentric-hub/artifacts/n5l0otep_9.%20Cinema%20Phone%20Menu.mp3",
                                    "transcript": "Thank you for calling Starlight Cinema. To book tickets, press 1. To change or cancel an existing booking, press 2. For movie times, press 3. For accessibility information, press 4. For lost property, press 5. To speak to a member of staff, stay on the line.",
                                },
                                "text": "Phone menu — Starlight Cinema",
                                "questions": [
                                    {
                                        "q": "You left your glasses in the cinema after the film. What should you press?",
                                        "options": ["Press 1", "Press 2", "Press 3", "Press 4", "Press 5", "Stay on the line", "Hang up"],
                                        "answer": 4,
                                    },
                                ],
                            },
                            {
                                "id": 10,
                                "title": "Hair Salon Phone Menu",
                                "summary": "Calling Willow Hair Studio to move an existing haircut to a different day.",
                                "letterhead": {
                                    "format": "phone-menu",
                                    "caller_name": "Willow Hair Studio",
                                    "caller_subtitle": "Bookings line",
                                    "phone_number": "01632 965 481",
                                    "time_label": "Phone menu",
                                    "duration": "0:30",
                                    "avatar_color": "#EC4899",
                                    "audio_url": "https://customer-assets.emergentagent.com/job_concentric-hub/artifacts/awhwstam_10.%20Hair%20Salon%20Phone%20Menu.mp3",
                                    "transcript": "Thank you for calling Willow Hair Studio. To book a new appointment, press 1. To change or cancel an existing appointment, press 2. For prices and services, press 3. For colour patch test information, press 4. To speak to a stylist, stay on the line.",
                                },
                                "text": "Phone menu — Willow Hair Studio",
                                "questions": [
                                    {
                                        "q": "You already have a haircut booked, but you need to move it to a different day. What should you press?",
                                        "options": ["Press 1", "Press 2", "Press 3", "Press 4", "Stay on the line", "Hang up"],
                                        "answer": 1,
                                    },
                                ],
                            },
                        ],
                    },
                },
            },
        },
        {
            "slug": "ordering-coffee",
            "title": "Ordering Coffee",
            "summary": "Practice ordering at a cafe.",
            "duration_min": 5,
            "type": "dialogue",
            "content": {
                "scene": "You walk into a cafe. The barista smiles and says hello.",
                "lines": [
                    {"speaker": "Barista", "text": "Hi! What can I get for you today?"},
                    {"speaker": "You", "text": "(Order a small coffee with milk.)"},
                    {"speaker": "Barista", "text": "For here or to go?"},
                    {"speaker": "You", "text": "(Choose: for here OR to go.)"},
                    {"speaker": "Barista", "text": "That'll be three dollars."},
                    {"speaker": "You", "text": "(Pay and say thank you.)"},
                ],
            },
        },
        {
            "slug": "doctor-visit",
            "title": "At the Doctor",
            "summary": "Practice telling the doctor how you feel.",
            "duration_min": 6,
            "type": "dialogue",
            "content": {
                "scene": "You are at the doctor's office. The doctor asks how you are feeling.",
                "lines": [
                    {"speaker": "Doctor", "text": "Hello. What brings you in today?"},
                    {"speaker": "You", "text": "(Say you have a headache and it started yesterday.)"},
                    {"speaker": "Doctor", "text": "On a scale from 1 to 10, how bad is the pain?"},
                    {"speaker": "You", "text": "(Choose a number.)"},
                    {"speaker": "Doctor", "text": "Have you taken any medicine?"},
                    {"speaker": "You", "text": "(Say yes or no, and what you took.)"},
                ],
            },
        },
        {
            "slug": "asking-directions",
            "title": "Asking for Directions",
            "summary": "Politely ask a stranger how to find a place.",
            "duration_min": 5,
            "type": "dialogue",
            "content": {
                "scene": "You are looking for the library. Ask someone on the street.",
                "lines": [
                    {"speaker": "You", "text": "(Greet the person.)"},
                    {"speaker": "You", "text": "(Ask the way to the library.)"},
                    {"speaker": "Stranger", "text": "Walk two blocks, then turn left."},
                    {"speaker": "You", "text": "(Repeat the directions to be sure.)"},
                    {"speaker": "You", "text": "(Say thank you.)"},
                ],
            },
        },
    ],
    "sfa-therapy": [
        {
            "slug": "sfa-tool",
            "title": "SFA Therapy Tool",
            "summary": "Use Semantic Feature Analysis on a target word.",
            "duration_min": 8,
            "type": "sfa",
            "content": {
                "instructions": (
                    "Pick a target word, then answer six feature prompts: Group, Use, Action, "
                    "Location, Properties, and Association. Try to say the target word at the end."
                ),
            },
        },
    ],
}


# Semantic Feature Analysis target words
SFA_WORDS = [
    {"word": "apple", "group": "fruit", "use": "to eat", "action": "bite, chew", "location": "kitchen, store",
     "properties": "red, round, sweet", "association": "doctor, teacher"},
    {"word": "hammer", "group": "tool", "use": "drive nails", "action": "swing, hit", "location": "garage, toolbox",
     "properties": "heavy, hard, metal", "association": "nail, wood"},
    {"word": "dog", "group": "animal", "use": "companion, pet", "action": "bark, run, fetch", "location": "home, park",
     "properties": "furry, friendly, four-legged", "association": "leash, bone"},
    {"word": "guitar", "group": "musical instrument", "use": "make music", "action": "strum, pluck",
     "location": "stage, room", "properties": "wooden, six strings", "association": "song, band"},
    {"word": "umbrella", "group": "accessory", "use": "stay dry", "action": "open, hold up", "location": "by the door",
     "properties": "waterproof, foldable", "association": "rain, wind"},
    {"word": "telephone", "group": "device", "use": "talk to people far away", "action": "call, ring",
     "location": "pocket, table", "properties": "small, electronic", "association": "voice, message"},
    {"word": "bread", "group": "food", "use": "to eat", "action": "slice, toast", "location": "kitchen, bakery",
     "properties": "soft, brown crust", "association": "butter, sandwich"},
    {"word": "car", "group": "vehicle", "use": "go places", "action": "drive, brake", "location": "road, garage",
     "properties": "four wheels, engine", "association": "key, gas"},
    {"word": "chair", "group": "furniture", "use": "to sit", "action": "sit, push in", "location": "kitchen, office",
     "properties": "four legs, back", "association": "table, desk"},
    {"word": "scissors", "group": "tool", "use": "to cut", "action": "snip, open and close",
     "location": "drawer, desk", "properties": "two blades, sharp", "association": "paper, hair"},
]


def get_activity(category_slug: str, activity_slug: str):
    for a in ACTIVITIES_BY_CATEGORY.get(category_slug, []):
        if a["slug"] == activity_slug:
            return {**a, "category": category_slug}
    return None
