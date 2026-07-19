import React from "react";

const FOCUS_TAG_TONES = ["sage", "blue", "sand", "plum"];

export function FocusTags({ items, label = "Focus" }) {
  if (!items?.length) return null;

  return (
    <ul className="focus-tag-list" aria-label={label}>
      {items.map((item, index) => (
        <li
          key={item}
          className="focus-tag"
          data-tone={FOCUS_TAG_TONES[index % FOCUS_TAG_TONES.length]}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
