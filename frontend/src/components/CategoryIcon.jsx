import React from "react";
import {
  BookOpen,
  Pencil,
  Search,
  Music2,
  MessagesSquare,
  LayoutGrid,
  Brain,
} from "lucide-react";

const map = {
  BookOpen,
  Pencil,
  Search,
  Music2,
  MessagesSquare,
  LayoutGrid,
  Brain,
};

export function CategoryIcon({ name, className = "w-6 h-6" }) {
  const Icon = map[name] || LayoutGrid;
  return <Icon className={className} />;
}
