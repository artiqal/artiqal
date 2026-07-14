import voicemailIllustration from "@/assets/activity-card-voicemail-phone.png";
import voicemailPageIllustration from "@/assets/activity-page-voicemail.png";

const ACTIVITY_ILLUSTRATIONS_BY_SLUG = {
  voicemails: voicemailPageIllustration,
};

export const getActivityIllustration = (activity) =>
  ACTIVITY_ILLUSTRATIONS_BY_SLUG[activity?.slug] || null;

export { voicemailIllustration };
