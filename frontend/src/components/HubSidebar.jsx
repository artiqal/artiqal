import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { DOMAIN_NAV_ITEMS, getDomainTheme } from "@/lib/domainThemes";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Grid2X2,
  Heart,
  Home,
  Settings,
} from "lucide-react";

const therapyCategoryLinks = DOMAIN_NAV_ITEMS.map((item) => ({
  label: item.name,
  slug: item.slug,
  href: item.route,
  icon: item.sidebarIcon,
}));

const mainLinks = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Activities Library", href: "/all-activities", icon: Grid2X2, children: therapyCategoryLinks },
  { label: "Favourite Activities", href: "/explore/favourites", icon: Heart },
  { label: "Sessions", href: "/sessions", icon: CalendarDays },
];

const childPathMatchers = {
  "/category/word-finding": ["/category/word-finding", "/activity/word-finding/"],
  "/category/reading": ["/category/reading", "/activity/reading/"],
  "/category/writing": ["/category/writing", "/activity/writing/"],
  "/category/auditory-comprehension": ["/category/auditory-comprehension", "/activity/auditory-comprehension/"],
  "/category/functional-communication": ["/category/functional-communication", "/activity/functional-communication/"],
  "/category/games": ["/category/games", "/activity/games/", "/explore/games"],
  "/explore/dysphagia": ["/explore/dysphagia"],
  "/category/cognitive-communication": ["/category/cognitive-communication", "/activity/cognitive-communication/"],
  "/category/ai-practice": ["/category/ai-practice", "/activity/ai-practice/"],
  "/explore/motor-speech": ["/explore/motor-speech"],
  "/explore/voice": ["/explore/voice"],
};

function matchesHref(pathname, href) {
  if (pathname === href) return true;
  return (childPathMatchers[href] || []).some((prefix) => pathname === prefix || pathname.startsWith(prefix));
}

export function HubSidebar({ collapsed: controlledCollapsed, onCollapsedChange, previewMode = false, onPreviewAction }) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [activitiesOpen, setActivitiesOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [activeHref, setActiveHref] = useState(location.pathname);
  const collapsed = controlledCollapsed ?? internalCollapsed;
  const setCollapsed = (nextValue) => {
    const nextCollapsed = typeof nextValue === "function" ? nextValue(collapsed) : nextValue;
    if (controlledCollapsed === undefined) {
      setInternalCollapsed(nextCollapsed);
    }
    onCollapsedChange?.(nextCollapsed);
  };
  const collapsedShellStyle = collapsed
    ? {
        width: "60px",
        paddingLeft: "6px",
        paddingRight: "6px",
      }
    : undefined;
  const collapsedItemStyle = collapsed
    ? {
        width: "30px",
        minWidth: "30px",
        height: "30px",
        minHeight: "30px",
        marginLeft: "auto",
        marginRight: "auto",
        padding: 0,
        display: "grid",
        placeItems: "center",
        gap: 0,
      }
    : undefined;
  const collapsedIconStyle = collapsed
    ? {
        position: "static",
        transform: "none",
      }
    : undefined;

  useEffect(() => {
    setActiveHref(location.pathname);
    if (therapyCategoryLinks.some((item) => matchesHref(location.pathname, item.href))) {
      setActivitiesOpen(true);
    }
  }, [location.pathname]);

  const visibleLinks = useMemo(() => mainLinks, []);

  const selectLink = (href) => {
    if (href === activeHref) return;
    setActiveHref(href);
    if (previewMode) {
      onPreviewAction?.("This is a preview of the artiqal hub. Create a free account to use navigation and start activities.");
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

  return (
    <aside className={`hub-sidebar ${collapsed ? "is-collapsed" : ""}`} style={collapsedShellStyle} aria-label="Hub navigation">
      <div className="hub-sidebar-top">
        <button
          className="hub-sidebar-toggle"
          type="button"
          style={collapsedItemStyle}
          onClick={() => setCollapsed((value) => !value)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>

      </div>

      <nav className="hub-sidebar-nav">
        {visibleLinks.map(({ label, href, icon: Icon, children, themeSlug }) => {
          const childActive = children?.some((item) => matchesHref(location.pathname, item.href));
          const activeChildIndex = children?.findIndex((item) => matchesHref(location.pathname, item.href)) ?? -1;
          const activeChild = activeChildIndex >= 0 ? children?.[activeChildIndex] : null;
          const activeChildTheme = activeChild ? getDomainTheme(activeChild.slug) : null;
          const linkTheme = themeSlug ? getDomainTheme(themeSlug) : null;
          const themedLinkStyle = linkTheme
            ? {
                "--sidebar-link-accent": linkTheme.sidebarAccent || linkTheme.accent,
                "--sidebar-link-glow": linkTheme.sidebarHoverGlow || linkTheme.hoverGlow || linkTheme.accent,
                "--sidebar-link-bg": linkTheme.sidebarSoftBg || linkTheme.softBg,
                "--sidebar-link-active-bg": linkTheme.sidebarFocusBg || linkTheme.sidebarActiveBg,
              }
            : null;
          const active = activeHref === href || (href === "/all-activities" && activeHref === "/all-activities");
          const parentOpen = href === "/all-activities" && activitiesOpen && !collapsed;
          return (
            <React.Fragment key={href}>
              <button
                type="button"
                onClick={() => selectLink(href)}
                className={`hub-sidebar-link ${active ? "is-active" : ""} ${childActive ? "has-active-child" : ""} ${children ? "has-submenu" : ""} ${parentOpen ? "is-open" : ""} ${linkTheme ? "is-themed" : ""}`}
                style={{ ...(collapsedItemStyle || {}), ...(themedLinkStyle || {}) }}
                aria-current={active ? "page" : undefined}
                aria-expanded={children ? parentOpen : undefined}
                title={collapsed ? label : undefined}
              >
                <Icon size={22} strokeWidth={2} style={collapsedIconStyle} />
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
                        "--domain-dot": activeChildTheme.sidebarDot || activeChildTheme.dot,
                        transform: `translateY(calc(${activeChildIndex} * var(--sidebar-submenu-step, 31px)))`,
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
                          "--domain-accent": childTheme.sidebarAccent || childTheme.accent,
                          "--domain-glow": childTheme.sidebarHoverGlow || childTheme.hoverGlow || childTheme.accent,
                          "--domain-sidebar-bg": childTheme.sidebarFocusBg || childTheme.sidebarActiveBg,
                          "--domain-soft-bg": childTheme.sidebarSoftBg || childTheme.softBg,
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
        <button type="button" className="hub-settings-row" style={collapsedItemStyle} aria-label="Settings" title={collapsed ? "Settings" : undefined}>
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
