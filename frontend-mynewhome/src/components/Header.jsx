import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function SearchForm({ className = "", onDone }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get("search") || "");

  useEffect(() => {
    setQuery(params.get("search") || "");
  }, [params]);

  const submit = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/properties?search=${encodeURIComponent(q)}` : "/properties");
    onDone?.();
  };

  return (
    <form onSubmit={submit} role="search" className={`relative ${className}`}>
      <label htmlFor="header-search" className="sr-only">
        Search properties
      </label>
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-cocoa-400" aria-hidden="true">
        ⌕
      </span>
      <input
        id="header-search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search city, locality or project"
        className="input rounded-full py-2 pl-10 pr-24"
      />
      <button type="submit" className="btn-primary absolute right-1 top-1/2 -translate-y-1/2 px-4 py-1.5">
        Search
      </button>
    </form>
  );
}

function Avatar({ user, size = "h-9 w-9" }) {
  if (user.picture) {
    return <img src={user.picture} alt="" referrerPolicy="no-referrer" className={`${size} rounded-full object-cover`} />;
  }
  return (
    <span className={`${size} flex items-center justify-center rounded-full bg-gold-400 text-sm font-bold uppercase text-cocoa-900`}>
      {(user.username || "?").charAt(0)}
    </span>
  );
}

function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onClick = (e) => !ref.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const go = (to) => {
    setOpen(false);
    navigate(to);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-sand-300 bg-white p-0.5 pr-3 hover:border-gold-500"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Avatar user={user} size="h-8 w-8" />
        <span className="max-w-[8rem] truncate text-sm font-medium">{user.username}</span>
        <span className="text-xs text-cocoa-400" aria-hidden="true">▾</span>
      </button>
      {open && (
        <div role="menu" className="absolute right-0 mt-2 w-56 animate-fade-in overflow-hidden rounded-xl border border-sand-200 bg-white py-1 shadow-card-hover">
          <div className="border-b border-sand-200 px-4 py-3">
            <p className="m-0 truncate text-sm font-semibold">{user.username}</p>
            {user.email && <p className="m-0 truncate text-xs text-cocoa-500">{user.email}</p>}
          </div>
          <button role="menuitem" type="button" onClick={() => go("/my-listings")} className="block w-full px-4 py-2.5 text-left text-sm hover:bg-sand-100">
            My listings
          </button>
          <button role="menuitem" type="button" onClick={() => go("/property/add")} className="block w-full px-4 py-2.5 text-left text-sm hover:bg-sand-100">
            Post a property
          </button>
          <button
            role="menuitem"
            type="button"
            onClick={() => {
              setOpen(false);
              logout();
              navigate("/");
            }}
            className="block w-full border-t border-sand-200 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const { user, isLoggedIn, openLogin, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => setMobileOpen(false), [pathname]);

  const sell = () => (isLoggedIn ? navigate("/property/add") : openLogin(() => navigate("/property/add")));

  return (
    <header className="sticky top-0 z-50 border-b border-sand-200 bg-sand-50/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        <Link to="/" className="flex shrink-0 items-center gap-2.5">
          <img src="/logo.png" alt="" width={40} height={40} className="h-10 w-10 rounded-xl shadow-sm" />
          <span className="leading-tight">
            <span className="block text-base font-bold">MyNewHome</span>
            <span className="hidden text-xs text-cocoa-500 sm:block">Find · Rent · Sell</span>
          </span>
        </Link>

        <SearchForm className="mx-auto hidden w-full max-w-md md:block" />

        <div className="ml-auto hidden items-center gap-2 md:flex">
          {isLoggedIn ? (
            <UserMenu />
          ) : (
            <button type="button" onClick={() => openLogin()} className="btn-secondary">
              Log in
            </button>
          )}
          <button type="button" onClick={sell} className="btn-gold">
            + Post property
          </button>
        </div>

        <button
          type="button"
          className="ml-auto rounded-lg p-2 text-2xl leading-none md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>

      {mobileOpen && (
        <div id="mobile-menu" className="animate-fade-in border-t border-sand-200 bg-sand-50 px-4 pb-4 pt-3 md:hidden">
          <SearchForm onDone={() => setMobileOpen(false)} />
          <nav className="mt-3 flex flex-col text-sm font-medium">
            <NavLink to="/" end className="rounded-lg px-3 py-2.5 hover:bg-sand-200">
              Browse properties
            </NavLink>
            {isLoggedIn && (
              <NavLink to="/my-listings" className="rounded-lg px-3 py-2.5 hover:bg-sand-200">
                My listings
              </NavLink>
            )}
          </nav>
          <div className="mt-3 flex flex-col gap-2">
            <button type="button" onClick={sell} className="btn-gold w-full">
              + Post property
            </button>
            {isLoggedIn ? (
              <div className="flex items-center justify-between rounded-xl border border-sand-200 bg-white p-2 pl-3">
                <span className="flex min-w-0 items-center gap-2">
                  <Avatar user={user} size="h-8 w-8" />
                  <span className="truncate text-sm font-medium">{user.username}</span>
                </span>
                <button type="button" onClick={() => { logout(); navigate("/"); }} className="rounded-full px-3 py-1.5 text-sm text-red-600 hover:bg-red-50">
                  Log out
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => openLogin()} className="btn-secondary w-full">
                Log in / Sign up
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
