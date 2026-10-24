import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import PropertyCard, { PropertyCardSkeleton } from "../components/PropertyCard.jsx";
import CategoryBar from "../components/CategoryBar.jsx";
import { getErrorMessage, propertyApi } from "../api/client";
import { categoryBySlug, CITIES } from "../constants";
import NotFound from "./NotFound.jsx";

function Hero() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const submit = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/properties?search=${encodeURIComponent(q)}` : "/properties");
  };

  return (
    <section className="relative isolate overflow-hidden">
      <img src="/hero.jpg" alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-cocoa-900/70 via-cocoa-900/50 to-cocoa-900/70" />
      <div className="mx-auto max-w-4xl px-4 py-20 text-center text-white sm:py-28">
        <h1 className="m-0 text-3xl font-bold leading-tight tracking-tight sm:text-5xl">Find a place you'll love to call home</h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-white/85 sm:text-lg">
          Apartments, houses, land and commercial spaces listed directly by owners.
        </p>
        <form onSubmit={submit} role="search" className="mx-auto mt-8 flex max-w-2xl flex-col gap-2 rounded-2xl bg-white p-2 shadow-2xl sm:flex-row sm:rounded-full">
          <label htmlFor="hero-search" className="sr-only">
            Search by city, locality or project
          </label>
          <input
            id="hero-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by city, locality or project"
            className="min-w-0 flex-1 rounded-full px-5 py-3 text-cocoa-900 placeholder:text-cocoa-400 focus:outline-none"
          />
          <button type="submit" className="btn-primary px-8 py-3 text-base">
            Search
          </button>
        </form>
        <div className="mt-5 flex flex-wrap justify-center gap-2 text-sm">
          <span className="text-white/70">Popular:</span>
          {Object.keys(CITIES)
            .slice(0, 5)
            .map((city) => (
              <Link key={city} to={`/properties?search=${encodeURIComponent(city)}`} className="rounded-full bg-white/15 px-3 py-1 text-white backdrop-blur hover:bg-white/25">
                {city}
              </Link>
            ))}
        </div>
      </div>
    </section>
  );
}

export default function PropertyList() {
  const { category: slug } = useParams();
  const [params] = useSearchParams();
  const keyword = params.get("search")?.trim() || "";
  const category = slug ? categoryBySlug(slug) : null;

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sort, setSort] = useState("newest");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const load = useCallback(() => {
    if (slug && !category) return undefined;
    let cancelled = false;
    setLoading(true);
    setError("");
    propertyApi
      .list({ category: category?.label, search: keyword || undefined })
      .then((data) => !cancelled && setProperties(data))
      .catch((err) => !cancelled && setError(getErrorMessage(err, "Couldn't load properties")))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [slug, category, keyword]);

  useEffect(() => load(), [load]);

  const visible = useMemo(() => {
    const min = Number(minPrice) || 0;
    const max = Number(maxPrice) || Infinity;
    const list = properties.filter((p) => p.price >= min && p.price <= max);
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    return list;
  }, [properties, minPrice, maxPrice, sort]);

  if (slug && !category) return <NotFound />;

  const showHero = !category && !keyword;
  const heading = category ? category.label : keyword ? `Results for “${keyword}”` : "Latest properties";
  const filtersActive = minPrice || maxPrice;

  return (
    <>
      {showHero && <Hero />}

      <div className="mx-auto max-w-7xl px-4 pt-8">
        <CategoryBar activeSlug={slug} />

        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="m-0 text-2xl font-bold sm:text-3xl">{heading}</h2>
            {!loading && !error && (
              <p className="mt-1 text-sm text-cocoa-500">
                {visible.length} {visible.length === 1 ? "property" : "properties"}
                {filtersActive && properties.length !== visible.length ? ` (of ${properties.length})` : ""}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-end">
            <div>
              <label htmlFor="min-price" className="mb-1 block text-xs font-medium text-cocoa-500">
                Min ₹
              </label>
              <input id="min-price" type="number" min="0" inputMode="numeric" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="No min" className="input py-2 sm:w-32" />
            </div>
            <div>
              <label htmlFor="max-price" className="mb-1 block text-xs font-medium text-cocoa-500">
                Max ₹
              </label>
              <input id="max-price" type="number" min="0" inputMode="numeric" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="No max" className="input py-2 sm:w-32" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label htmlFor="sort" className="mb-1 block text-xs font-medium text-cocoa-500">
                Sort by
              </label>
              <select id="sort" value={sort} onChange={(e) => setSort(e.target.value)} className="input py-2 sm:w-44">
                <option value="newest">Newest first</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <PropertyCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="card px-6 py-14 text-center">
              <p className="text-4xl" aria-hidden="true">⚠️</p>
              <p className="mt-3 font-semibold">{error}</p>
              <button type="button" onClick={load} className="btn-primary mt-5">
                Try again
              </button>
            </div>
          ) : visible.length === 0 ? (
            <div className="card px-6 py-14 text-center">
              <p className="text-4xl" aria-hidden="true">🏘️</p>
              <p className="mt-3 text-lg font-semibold">No properties found</p>
              <p className="mt-1 text-sm text-cocoa-500">
                {filtersActive ? "Try widening your price range." : keyword ? "Try a different city or locality." : "Be the first to post a property here."}
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {filtersActive && (
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setMinPrice("");
                      setMaxPrice("");
                    }}
                  >
                    Clear price filter
                  </button>
                )}
                {(keyword || category) && (
                  <Link to="/" className="btn-secondary">
                    See all properties
                  </Link>
                )}
                <Link to="/property/add" className="btn-gold">
                  Post a property
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visible.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
