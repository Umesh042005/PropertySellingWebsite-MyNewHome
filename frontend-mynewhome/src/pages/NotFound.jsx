import React from "react";
import { Link } from "react-router-dom";

export default function NotFound({ title = "Page not found" }) {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <p className="text-6xl font-bold text-gold-500">404</p>
      <h1 className="mt-4 text-2xl font-bold">{title}</h1>
      <p className="mt-2 text-cocoa-500">The page you're looking for doesn't exist or has been removed.</p>
      <Link to="/" className="btn-primary mt-6">
        Browse properties
      </Link>
    </div>
  );
}
