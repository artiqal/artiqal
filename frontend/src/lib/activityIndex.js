import { DOMAIN_NAV_ITEMS } from "@/lib/domainThemes";
import { getActivityCardSearchTextValues } from "@/lib/activityCardConfig";

export const RETIRED_ACTIVITY_SLUGS = new Set([
  "patient-form",
  "ai-scenario",
  "short-message",
  "complete-sentence",
  "fill-form",
  "signup-form",
  "category-cueing",
  "associations",
  "follow-instructions",
  "yes-no",
  "ordering-coffee",
  "doctor-visit",
  "asking-directions",
]);

export const isRetiredActivity = (activity) =>
  RETIRED_ACTIVITY_SLUGS.has(activity?.slug);

export const filterRetiredActivities = (activities = []) =>
  activities.filter((activity) => !isRetiredActivity(activity));

export const isFunctionalActivity = (activity) =>
  Boolean(
    activity?.isFunctional ||
      activity?.is_functional ||
      activity?.functional ||
      activity?.slug === "voicemails" ||
      activity?.slug === "appointment-letter" ||
      activity?.slug === "prescription-medication-labels"
  );

export const getActivityPrimaryCategory = (activity) =>
  activity?.primaryCategory ||
  activity?.primary_category ||
  activity?.primaryDomain ||
  activity?.primary_domain ||
  (activity?.slug === "sfa-tool" ? "word-finding" : null) ||
  (activity?.slug === "appointment-letter" ? "reading" : null) ||
  (activity?.slug === "prescription-medication-labels" ? "reading" : null) ||
  (activity?.slug === "voicemails" ? "auditory-comprehension" : activity?.category);

export const getActivityDisplayCategory = (activity, fallbackCategory) =>
  getActivityPrimaryCategory(activity) || fallbackCategory || activity?.category;

export const activityBelongsToCategory = (activity, categorySlug) => {
  if (!categorySlug || categorySlug === "all") return true;
  if (getActivityPrimaryCategory(activity) === categorySlug) return true;
  if (activity?.category === categorySlug) return true;
  return categorySlug === "functional-communication" && isFunctionalActivity(activity);
};

const toSearchText = (value) => {
  if (Array.isArray(value)) return value.join(" ");
  if (value && typeof value === "object") return Object.values(value).join(" ");
  return value || "";
};

export const normalizeSearchQuery = (query = "") =>
  query
    .toString()
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[-–—_/]+/g, " ")
    .replace(/[.,;:!?()[\]{}"“”]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");

const normalizeField = (value) => normalizeSearchQuery(toSearchText(value));

const fieldStartsWith = (field, term) => {
  if (!field) return false;
  return field.startsWith(term) || field.split(/\s+/).some((word) => word.startsWith(term));
};

const fieldMeaningfullyIncludes = (field, term, { allowShortSubstring = false } = {}) => {
  if (!field) return false;
  if (fieldStartsWith(field, term)) return true;
  return (allowShortSubstring || term.length >= 3) && field.includes(term);
};

export function getActivityHref(activity) {
  if (activity?.type === "sfa" || activity?.slug === "sfa-tool") return "/sfa";
  return `/activity/${activity.category}/${activity.slug}`;
}

export function buildActivityIndex(activities = [], categories = []) {
  const categoryBySlug = Object.fromEntries(
    [...DOMAIN_NAV_ITEMS, ...categories].map((category) => [category.slug, category]),
  );

  return activities.map((activity) => {
    const category = categoryBySlug[activity.category] || {};
    const displayCategorySlug = getActivityDisplayCategory(activity, activity.category);
    const displayCategory = categoryBySlug[displayCategorySlug] || category;
    const categoryName = displayCategory.name || displayCategory.title || category.name || category.title || activity.category;
    const description =
      activity.summary ||
      activity.description ||
      category.tagline ||
      category.description ||
      "Guided communication practice.";
    const informationalSearchText = getActivityCardSearchTextValues(activity, displayCategorySlug);
    const searchFields = {
      title: normalizeField(activity.title),
      category: normalizeField([
        categoryName,
        displayCategorySlug,
        activity.category,
        activity.domain,
        isFunctionalActivity(activity) ? "functional functional task functional tasks" : "",
      ]),
      tags: normalizeField([
        activity.tags,
        activity.searchTerms,
        activity.search_terms,
        activity.searchKeywords,
        activity.search_keywords,
        activity.keywords,
        category.tags,
        category.searchAliases,
      ]),
      info: normalizeField(informationalSearchText),
      details: normalizeField([
        activity.summary,
        activity.description,
        activity.clinical_area,
        activity.clinicalArea,
        activity.skills,
        activity.clinical_skills,
        informationalSearchText,
        category.description,
        category.tagline,
        category.clinical_area,
      ]),
    };

    return {
      ...activity,
      categoryName,
      description,
      href: getActivityHref(activity),
      searchFields,
    };
  });
}

function scoreActivityForTerm(activity, term) {
  const fields = activity.searchFields || {};

  // Single-letter searches are intentionally strict. A random one-letter query
  // should not match letters buried in descriptions, tags, or clinical notes.
  if (term.length === 1) {
    if (fieldStartsWith(fields.title, term)) return 100;
    if (fieldStartsWith(fields.category, term)) return 80;
    return 0;
  }

  if (fieldStartsWith(fields.title, term)) return 100;
  if (fieldMeaningfullyIncludes(fields.title, term, { allowShortSubstring: true })) return 90;
  if (fieldStartsWith(fields.category, term)) return 80;
  if (fieldMeaningfullyIncludes(fields.category, term, { allowShortSubstring: true })) return 70;
  if (fieldStartsWith(fields.tags, term)) return 60;
  if (fieldMeaningfullyIncludes(fields.tags, term, { allowShortSubstring: true })) return 55;
  if (fieldStartsWith(fields.info, term)) return 58;
  if (fieldMeaningfullyIncludes(fields.info, term, { allowShortSubstring: true })) return 52;
  if (fieldStartsWith(fields.details, term)) return 45;
  if (fieldMeaningfullyIncludes(fields.details, term)) return 35;
  return 0;
}

export function activityMatchesSearch(activity, query) {
  const terms = normalizeSearchQuery(query).split(" ").filter(Boolean);
  if (!terms.length) return true;
  return terms.every((term) => scoreActivityForTerm(activity, term) > 0);
}

export function searchActivityIndex(index, query) {
  const terms = normalizeSearchQuery(query).split(" ").filter(Boolean);
  if (!terms.length) return [];

  return index
    .map((activity) => {
      const score = terms.reduce((total, term) => {
        const termScore = scoreActivityForTerm(activity, term);
        return termScore ? total + termScore : 0;
      }, 0);
      return { activity, score };
    })
    .filter((item) => item.score > 0 && terms.every((term) => scoreActivityForTerm(item.activity, term) > 0))
    .sort((a, b) => b.score - a.score || (a.activity.title || "").localeCompare(b.activity.title || ""))
    .map((item) => item.activity);
}
