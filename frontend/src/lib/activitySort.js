export const ACTIVITY_SORT_OPTIONS = [
  { value: "az", label: "A–Z", capability: null },
  { value: "za", label: "Z–A", capability: null },
  { value: "shortest", label: "Shortest Duration", capability: "duration" },
  { value: "longest", label: "Longest Duration", capability: "duration" },
  { value: "recent", label: "Recently Added", capability: "date" },
  { value: "used", label: "Most Used", capability: "usage" },
];

export const getActivityTitle = (activity) => activity.title || "";

export const getActivityDuration = (activity) => {
  const value =
    activity.duration_min ??
    activity.durationMin ??
    activity.estimated_minutes ??
    activity.estimatedMinutes;
  const duration = Number(value);
  return Number.isFinite(duration) ? duration : null;
};

export const getActivityDate = (activity) => {
  const value =
    activity.created_at ??
    activity.createdAt ??
    activity.added_at ??
    activity.addedAt;
  if (!value) return null;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
};

export const getActivityUsage = (activity) => {
  const value =
    activity.usage_count ??
    activity.usageCount ??
    activity.use_count ??
    activity.useCount ??
    activity.times_used ??
    activity.timesUsed;
  const usage = Number(value);
  return Number.isFinite(usage) ? usage : null;
};

export const getActivitySortCapabilities = (activities) => ({
  date: activities.some((activity) => getActivityDate(activity) !== null),
  usage: activities.some((activity) => getActivityUsage(activity) !== null),
  duration: activities.some((activity) => getActivityDuration(activity) !== null),
});

export const getActivitySortOptions = (capabilities = {}) =>
  ACTIVITY_SORT_OPTIONS.map((option) => ({
    ...option,
    disabled: Boolean(option.capability && !capabilities[option.capability]),
  }));

export const sortActivities = (activities, sortMode, { normalizedSearch = "", capabilities = {} } = {}) =>
  [...activities].sort((a, b) => {
    const titleSort = getActivityTitle(a).localeCompare(getActivityTitle(b), undefined, {
      sensitivity: "base",
    });

    if (sortMode === "az") return titleSort;
    if (sortMode === "za") return -titleSort;
    if (sortMode === "recent" && capabilities.date) {
      return (getActivityDate(b) || 0) - (getActivityDate(a) || 0) || titleSort;
    }
    if (sortMode === "used" && capabilities.usage) {
      return (getActivityUsage(b) || 0) - (getActivityUsage(a) || 0) || titleSort;
    }
    if (sortMode === "shortest" && capabilities.duration) {
      return (getActivityDuration(a) || Number.MAX_SAFE_INTEGER) - (getActivityDuration(b) || Number.MAX_SAFE_INTEGER) || titleSort;
    }
    if (sortMode === "longest" && capabilities.duration) {
      return (getActivityDuration(b) || 0) - (getActivityDuration(a) || 0) || titleSort;
    }
    return titleSort;
  });
