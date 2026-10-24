import React, { useState } from "react";
import { Link } from "react-router-dom";
import { imageSrc } from "../api/client";
import { formatPriceShort, timeAgo } from "../utils/format";

export function ImageWithFallback({ src, alt, className }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className={`flex items-center justify-center bg-sand-200 text-4xl text-cocoa-400 ${className}`} aria-label={alt}>
        <span aria-hidden="true">🏠</span>
      </div>
    );
  }
  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className={`object-cover ${className}`} />;
}

export default function PropertyCard({ property, actions }) {
  const { id, title, price, city, location, category, createdAt } = property;
  const place = [location, city].filter(Boolean).join(", ");
  const posted = timeAgo(createdAt);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover">
      <div className="relative aspect-[4/3] overflow-hidden">
        <ImageWithFallback
          src={imageSrc(property)}
          alt={title}
          className="h-full w-full transition duration-500 group-hover:scale-105"
        />
        {category && (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-cocoa-800 shadow-sm backdrop-blur">
            {category}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className="m-0 text-xl font-bold text-cocoa-900">{formatPriceShort(price)}</p>
        <h3 className="m-0 line-clamp-1 text-base font-semibold text-cocoa-800">
          {/* Stretched link: the whole card is clickable */}
          <Link to={`/property/${id}`} className="after:absolute after:inset-0 focus:outline-none">
            {title}
          </Link>
        </h3>
        <p className="m-0 flex items-center gap-1 text-sm text-cocoa-500">
          <span aria-hidden="true">📍</span>
          <span className="line-clamp-1">{place || "Location not specified"}</span>
        </p>
        {posted && <p className="m-0 mt-auto pt-2 text-xs text-cocoa-400">Posted {posted}</p>}
        {actions && <div className="relative z-10 mt-3 flex gap-2 border-t border-sand-200 pt-3">{actions}</div>}
      </div>
    </article>
  );
}

export function PropertyCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-sand-200 bg-white" aria-hidden="true">
      <div className="aspect-[4/3] animate-pulse bg-sand-200" />
      <div className="space-y-2.5 p-4">
        <div className="h-5 w-1/3 animate-pulse rounded bg-sand-200" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-sand-200" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-sand-200" />
      </div>
    </div>
  );
}
