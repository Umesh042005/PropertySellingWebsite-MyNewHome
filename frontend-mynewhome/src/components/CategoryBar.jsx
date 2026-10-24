import React from "react";
import { Link } from "react-router-dom";
import { CATEGORIES } from "../constants";

const base =
  "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition whitespace-nowrap";
const active = "border-cocoa-800 bg-cocoa-800 text-white";
const inactive = "border-sand-300 bg-white text-cocoa-700 hover:border-gold-500 hover:text-cocoa-900";

// Horizontally scrollable on small screens
export default function CategoryBar({ activeSlug }) {
  return (
    <nav aria-label="Categories" className="-mx-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
      <ul className="flex gap-2">
        <li>
          <Link to="/" className={`${base} ${!activeSlug ? active : inactive}`} aria-current={!activeSlug ? "page" : undefined}>
            All
          </Link>
        </li>
        {CATEGORIES.map((cat) => (
          <li key={cat.slug}>
            <Link
              to={`/properties/${cat.slug}`}
              className={`${base} ${activeSlug === cat.slug ? active : inactive}`}
              aria-current={activeSlug === cat.slug ? "page" : undefined}
            >
              <span aria-hidden="true">{cat.icon}</span>
              {cat.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
