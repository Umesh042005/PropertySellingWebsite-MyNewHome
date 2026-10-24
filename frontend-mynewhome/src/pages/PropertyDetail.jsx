import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getErrorMessage, imageSrc, propertyApi } from "../api/client";
import { ImageWithFallback } from "../components/PropertyCard.jsx";
import { ConfirmDialog } from "../components/Modal.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { CATEGORIES } from "../constants";
import { formatPrice, formatPriceShort, timeAgo } from "../utils/format";
import NotFound from "./NotFound.jsx";

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [property, setProperty] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ok | notfound | error
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showPhone, setShowPhone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    propertyApi
      .get(id)
      .then((data) => {
        if (cancelled) return;
        setProperty(data);
        setStatus("ok");
        document.title = `${data.title} · MyNewHome`;
      })
      .catch((err) => {
        if (cancelled) return;
        setStatus(err.response?.status === 404 ? "notfound" : "error");
        setError(getErrorMessage(err));
      });
    return () => {
      cancelled = true;
      document.title = "MyNewHome · Find, Rent & Sell Properties";
    };
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await propertyApi.remove(id);
      toast.success("Listing deleted");
      navigate("/my-listings", { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: property.title, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      }
    } catch {
      /* user cancelled the share sheet */
    }
  };

  if (status === "notfound") return <NotFound title="This listing is no longer available" />;

  if (status === "error") {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <p className="text-4xl" aria-hidden="true">⚠️</p>
        <p className="mt-3 font-semibold">{error}</p>
        <button type="button" className="btn-primary mt-5" onClick={() => window.location.reload()}>
          Try again
        </button>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8" aria-busy="true">
        <div className="aspect-[16/9] animate-pulse rounded-3xl bg-sand-200 sm:aspect-[21/9]" />
        <div className="mt-6 h-8 w-2/3 animate-pulse rounded bg-sand-200" />
        <div className="mt-3 h-5 w-1/3 animate-pulse rounded bg-sand-200" />
      </div>
    );
  }

  const isOwner = user && (user.id === property.ownerId || user.role === "ROLE_ADMIN");
  const place = [property.location, property.city].filter(Boolean).join(", ");
  const categorySlug = CATEGORIES.find((c) => c.label === property.category)?.slug;
  const phone = property.contact?.replace(/[^\d+]/g, "") || "";
  const waNumber = phone.length === 10 ? `91${phone}` : phone.replace("+", "");
  const posted = timeAgo(property.createdAt);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-sm text-cocoa-500">
        <Link to="/" className="hover:text-cocoa-900">
          Home
        </Link>
        {categorySlug && (
          <>
            <span aria-hidden="true">/</span>
            <Link to={`/properties/${categorySlug}`} className="hover:text-cocoa-900">
              {property.category}
            </Link>
          </>
        )}
        <span aria-hidden="true">/</span>
        <span className="truncate text-cocoa-800">{property.title}</span>
      </nav>

      <div className="overflow-hidden rounded-3xl bg-sand-200 shadow-card">
        <ImageWithFallback src={imageSrc(property)} alt={property.title} className="aspect-[4/3] w-full sm:aspect-[21/9]" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div>
            {property.category && (
              <span className="inline-block rounded-full bg-gold-100 px-3 py-1 text-xs font-semibold text-gold-700">{property.category}</span>
            )}
            <h1 className="mt-3 text-2xl font-bold leading-tight sm:text-3xl">{property.title}</h1>
            <p className="mt-2 flex items-center gap-1 text-cocoa-500">
              <span aria-hidden="true">📍</span>
              {place || "Location not specified"}
            </p>
          </div>

          <section className="card p-5 sm:p-7">
            <h2 className="m-0 text-lg font-semibold">About this property</h2>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-cocoa-700">{property.description}</p>
          </section>

          <section className="card grid grid-cols-2 gap-4 p-5 sm:grid-cols-4 sm:p-7">
            {[
              ["Price", formatPriceShort(property.price)],
              ["Type", property.category || "—"],
              ["City", property.city || "—"],
              ["Locality", property.location || "—"],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="m-0 text-xs font-medium uppercase tracking-wide text-cocoa-400">{label}</p>
                <p className="m-0 mt-1 font-semibold">{value}</p>
              </div>
            ))}
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="card p-5 sm:p-6">
            <p className="m-0 text-3xl font-bold">{formatPrice(property.price)}</p>
            {posted && <p className="m-0 mt-1 text-sm text-cocoa-500">Posted {posted}{property.ownerUsername ? ` by ${property.ownerUsername}` : ""}</p>}

            {phone && (
              <div className="mt-5 space-y-2">
                {showPhone ? (
                  <a href={`tel:${phone}`} className="btn-primary w-full py-3">
                    <span aria-hidden="true">📞</span> {property.contact}
                  </a>
                ) : (
                  <button type="button" onClick={() => setShowPhone(true)} className="btn-primary w-full py-3">
                    <span aria-hidden="true">📞</span> Show phone number
                  </button>
                )}
                <a
                  href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`Hi, I'm interested in your listing "${property.title}" on MyNewHome.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn w-full bg-[#25D366] py-3 text-white hover:bg-[#1ebe5b]"
                >
                  Chat on WhatsApp
                </a>
              </div>
            )}

            <button type="button" onClick={share} className="btn-secondary mt-2 w-full">
              Share listing
            </button>
          </div>

          {isOwner && (
            <div className="card p-5">
              <p className="m-0 text-sm font-semibold">Manage your listing</p>
              <div className="mt-3 flex gap-2">
                <Link to={`/property/${property.id}/edit`} className="btn-secondary flex-1">
                  Edit
                </Link>
                <button type="button" onClick={() => setConfirmDelete(true)} className="btn flex-1 border border-red-200 bg-white text-red-600 hover:bg-red-50">
                  Delete
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>

      {confirmDelete && (
        <ConfirmDialog
          title="Delete this listing?"
          message="It will be removed for everyone. This can't be undone."
          confirmLabel="Delete"
          busy={deleting}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  );
}
