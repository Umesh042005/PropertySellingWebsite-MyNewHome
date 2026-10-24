import React from "react";
import { Link } from "react-router-dom";
import { CATEGORIES } from "../constants";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-sand-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="" width={36} height={36} className="h-9 w-9 rounded-lg" />
            <span className="text-lg font-bold">MyNewHome</span>
          </Link>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-cocoa-500">
            Buy, rent or sell homes, land and commercial spaces directly from owners.
          </p>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-cocoa-500">Browse</h2>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link to={`/properties/${c.slug}`} className="text-cocoa-700 hover:text-gold-700">
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-cocoa-500">Owners</h2>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/property/add" className="text-cocoa-700 hover:text-gold-700">
                Post a property
              </Link>
            </li>
            <li>
              <Link to="/my-listings" className="text-cocoa-700 hover:text-gold-700">
                My listings
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-sand-200 py-4 text-center text-xs text-cocoa-500">
        © {new Date().getFullYear()} MyNewHome. All rights reserved.
      </div>
    </footer>
  );
}
