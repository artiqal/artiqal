import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { DOMAIN_NAV_ITEMS, getDomainTheme } from "@/lib/domainThemes";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Grid2X2,
  Heart,
  Home,
  Search,
  Settings,
  Sparkles,
} from "lucide-react";

const therapyCategoryLinks = DOMAIN_NAV_ITEMS.map((item) => ({
  label: item.name,
  slug: item.slug,
  href: item.route,
  icon: item.sidebarIcon,
}));

const mainLinks = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Activities Hub", href: "/all-activities", icon: Grid2X2, children: therapyCategoryLinks },
  { label: "Favourite Activities", href: "/explore/favourites", icon: Heart },
  { label: "AI Practice", href: "/activity/reading/ai-scenario", icon: Sparkles },
];

const childPathMatchers = {
  "/category/word-finding": ["/category/word-finding", "/activity/word-finding/"],
  "/category/reading": ["/category/reading", "/activity/reading/"],
  "/category/writing": ["/category/writing", "/activity/writing/"],
  "/category/auditory-comprehension": ["/category/auditory-comprehension", "/activity/auditory-comprehension/"],
  "/category/functional-communication": ["/category/functional-communication", "/activity/functional-communication/"],
  "/explore/games": ["/explore/games"],
  "/explore/dysphagia": ["/explore/dysphagia"],
  "/explore/motor-speech": ["/explore/motor-speech"],
  "/explore/voice": ["/explore/voice"],
};

function matchesHref(pathname, href) {
  if (pathname === href) return true;
  return (childPathMatchers[href] || []).some((prefix) => pathname === prefix || pathname.startsWith(prefix));
}

export function HubSidebar({ previewMode = false, onPreviewAction }) {
  const [collapsed, setCollapsed] = useState(previewMode ? false : true);
  const [activitiesOpen, setActivitiesOpen] = useState(false);
  const [query, setQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const [activeHref, setActiveHref] = useState(location.pathname);
  const { user } = useAuth();

  useEffect(() => {
    setActiveHref(location.pathname);
    if (therapyCategoryLinks.some((item) => matchesHref(location.pathname, item.href))) {
      setActivitiesOpen(true);
    }
  }, [location.pathname]);

  const normalizedQuery = query.trim().toLowerCase();

  useEffect(() => {
    if (location.pathname === "/search") {
      setQuery(new URLSearchParams(location.search).get("q") || "");
    } else {
      setQuery("");
    }
  }, [location.pathname, location.search]);

  const visibleLinks = useMemo(() => mainLinks, []);

  const selectLink = (href) => {
    if (href === activeHref) return;
    setActiveHref(href);
    if (previewMode) {
      onPreviewAction?.("This is a preview of the Artiqal hub. Create a free account to use navigation and start activities.");
      return;
    }
    navigate(href);
  };

  const toggleActivities = (event) => {
    event.stopPropagation();
    if (collapsed) {
      setCollapsed(false);
      setActivitiesOpen(true);
      return;
    }
    setActivitiesOpen((value) => !value);
  };

  const updateSearch = (value) => {
    setQuery(value);
    if (previewMode) {
      onPreviewAction?.("Search is available inside the full Artiqal hub. Create a free account to explore activities.");
      return;
    }
    const trimmed = value.trim();
    if (trimmed) {
      navigate(`/search?q=${encodeURIComponent(trimmed)}`, { replace: true });
    } else if (location.pathname === "/search") {
      navigate("/all-activities", { replace: true });
    }
  };

  const displayName = user?.name || "Guest";
  const accountLabel = "Account";
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <aside className={`hub-sidebar ${collapsed ? "is-collapsed" : ""}`} aria-label="Hub navigation">
      <div className="hub-sidebar-top">
        <button
          className="hub-sidebar-toggle"
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>

        <label className="hub-search">
          <Search size={20} />
          <input
            value={query}
            onChange={(event) => updateSearch(event.target.value)}
            placeholder="Search activities..."
            aria-label="Search activities"
          />
        </label>
      </div>

      <nav className="hub-sidebar-nav">
        {visibleLinks.map(({ label, href, icon: Icon, children }) => {
          const childActive = children?.some((item) => matchesHref(location.pathname, item.href));
          const activeChildIndex = children?.findIndex((item) => matchesHref(location.pathname, item.href)) ?? -1;
          const activeChild = activeChildIndex >= 0 ? children?.[activeChildIndex] : null;
          const activeChildTheme = activeChild ? getDomainTheme(activeChild.slug) : null;
          const active = activeHref === href || (href === "/all-activities" && activeHref === "/all-activities");
          const parentOpen = href === "/all-activities" && activitiesOpen && !collapsed;
          return (
            <React.Fragment key={href}>
              <button
                type="button"
                onClick={() => selectLink(href)}
                className={`hub-sidebar-link ${active ? "is-active" : ""} ${childActive ? "has-active-child" : ""} ${children ? "has-submenu" : ""} ${parentOpen ? "is-open" : ""}`}
                aria-current={active ? "page" : undefined}
                aria-expanded={children ? parentOpen : undefined}
                title={collapsed ? label : undefined}
              >
                <Icon size={22} strokeWidth={2} />
                <span>{label}</span>
                {children ? (
                  <span
                    className="hub-submenu-chevron"
                    role="button"
                    tabIndex={collapsed ? -1 : 0}
                    aria-label={parentOpen ? "Collapse activity categories" : "Expand activity categories"}
                    onClick={toggleActivities}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        toggleActivities(event);
                      }
                    }}
                  >
                    {parentOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                  </span>
                ) : null}
              </button>
              {children && parentOpen ? (
                <div className="hub-sidebar-submenu" aria-label="Activities Hub categories">
                  {activeChildIndex >= 0 ? (
                    <span
                      className="hub-sidebar-submenu-dot"
                      style={{
                        "--domain-dot": activeChildTheme.dot,
                        transform: `translateY(${activeChildIndex * 38}px)`,
                      }}
                      aria-hidden="true"
                    />
                  ) : null}
                  {children.map(({ label: childLabel, href: childHref, icon: ChildIcon, slug: childSlug }) => {
                    const childIsActive = matchesHref(location.pathname, childHref);
                    const childTheme = getDomainTheme(childSlug);
                    return (
                      <button
                        key={childHref}
                        type="button"
                        onClick={() => selectLink(childHref)}
                        className={`hub-sidebar-submenu-link ${childIsActive ? "is-active" : ""}`}
                        style={{
                          "--domain-accent": childTheme.accent,
                          "--domain-sidebar-bg": childTheme.sidebarActiveBg,
                          "--domain-soft-bg": childTheme.softBg,
                        }}
                        aria-current={childIsActive ? "page" : undefined}
                      >
                        <ChildIcon size={16} strokeWidth={2} />
                        <span>{childLabel}</span>
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </React.Fragment>
          );
        })}
      </nav>

      <div className="hub-sidebar-footer">
        <div className="hub-account">
          <span className="hub-account-avatar">{initials || "G"}</span>
          <span className="hub-account-copy">
            <strong>{displayName}</strong>
            <small>{accountLabel}</small>
          </span>
          <ChevronRight className="hub-account-chevron" size={19} />
        </div>

        <button type="button" className="hub-settings-row" aria-label="Settings" title={collapsed ? "Settings" : undefined}>
          <span className="hub-settings-icon">
            <Settings size={15} />
          </span>
          <span>Settings</span>
          <ChevronRight className="hub-settings-chevron" size={15} />
        </button>
      </div>
    </aside>
  );
}
