export const ACTIVITY_SETUP_CONFIGS = {
  voicemails: {
    defaultDifficultyId: "green",
    defaultThemePackId: "mixed-bag",
    defaultLanguageId: "en",
    defaultItemCount: 4,
    defaultQuestionsPerVoicemail: 3,
    itemCounts: [2, 4, 6, 8, 10],
    questionCounts: [1, 2, 3, 4, 5],
    levelOverrides: {
      green: {
        blurb:
          "Short everyday voicemails with direct-recall questions. Targets caller, message purpose, time, place, items, and next steps.",
        best_for:
          "Clients practising key detail recall from brief spoken messages.",
      },
      amber: {
        blurb:
          "Medium-length functional voicemails with questions about appointment changes, collection options, deadlines, and simple instructions.",
        best_for:
          "Clients linking multiple spoken details and identifying next steps.",
      },
      red: {
        blurb:
          "Longer functional voicemails with questions about changed plans, options, deadlines, safety details, and conditional steps.",
        best_for:
          "Clients holding details in mind, comparing options, and choosing the correct action.",
      },
      pink: {
        title: "Extended",
        blurb:
          "Scenario-based automated phone menus. Navigate realistic call systems and choose the correct option to reach the intended service.",
        best_for:
          "Clients practising phone navigation, auditory scanning, and option selection.",
      },
    },
    languages: [
      { id: "en", label: "English (UK/US)", available: true },
      { id: "pt-BR", label: "Português (BR)", available: false },
      { id: "es", label: "Español", available: false },
    ],
    themePacks: [
      {
        id: "mixed-bag",
        label: "Mixed Bag",
        subtitle: "Everyday mixed voicemail scenarios",
        available: true,
      },
      {
        id: "social-family-friends",
        label: "Social / Family / Friends",
        subtitle: "Family updates, plans, and social messages",
        available: false,
      },
      {
        id: "medical",
        label: "Medical",
        subtitle: "Appointments, clinics, prescriptions, and health services",
        available: false,
      },
      {
        id: "work-business",
        label: "Work / Business",
        subtitle: "Colleagues, meetings, scheduling, and workplace tasks",
        available: false,
      },
      {
        id: "appointments-services",
        label: "Appointments / Services",
        subtitle: "Bookings, collections, utilities, and community services",
        available: false,
      },
      {
        id: "community-errands",
        label: "Community / Errands",
        subtitle: "Shops, transport, deliveries, and local services",
        available: false,
      },
    ],
  },
};

export function getActivitySetupConfig(activitySlug) {
  return ACTIVITY_SETUP_CONFIGS[activitySlug] || null;
}

export function getValidSetupItemCount(config, value) {
  const numericValue = Number(value);
  return config?.itemCounts?.includes(numericValue)
    ? numericValue
    : config?.defaultItemCount || 4;
}
