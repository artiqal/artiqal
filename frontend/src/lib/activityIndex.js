const toSearchText = (value) => {
  if (Array.isArray(value)) return value.join(" ");
  if (value && typeof value === "object") return Object.values(value).join(" ");
  return value || "";
};

export const normalizeSearchQuery = (query = "") =>
  query
    .toString()
    .toLowerCase()
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
    categories.map((category) => [category.slug, category]),
  );

  return activities.map((activity) => {
    const category = categoryBySlug[activity.category] || {};
    const categoryName = category.name || category.title || activity.category;
    const description =
      activity.summary ||
      activity.description ||
      category.tagline ||
      category.description ||
      "Guided communication practice.";
    const searchFields = {
      title: normalizeField(activity.title),
      category: normalizeField([categoryName, activity.category, activity.domain]),
      tags: normalizeField([activity.tags, category.tags]),
      details: normalizeField([
        activity.summary,
        activity.description,
        activity.clinical_area,
        activity.clinicalArea,
        activity.skills,
        activity.clinical_skills,
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
