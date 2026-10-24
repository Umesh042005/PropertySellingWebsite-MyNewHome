import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PropertyCard, { PropertyCardSkeleton } from "../components/PropertyCard.jsx";
import RequireAuth from "../components/RequireAuth.jsx";
import { ConfirmDialog } from "../components/Modal.jsx";
import { getErrorMessage, propertyApi } from "../api/client";
import { useToast } from "../context/ToastContext.jsx";

function Listings() {
  const toast = useToast();
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    setError("");
    setItems(null);
    propertyApi
      .mine()
      .then(setItems)
      .catch((err) => setError(getErrorMessage(err, "Couldn't load your listings")));
  }, []);

  useEffect(load, [load]);

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await propertyApi.remove(toDelete.id);
      setItems((list) => list.filter((p) => p.id !== toDelete.id));
      toast.success("Listing deleted");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
      setToDelete(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="m-0 text-2xl font-bold sm:text-3xl">My listings</h1>
          {items && <p className="mt-1 text-sm text-cocoa-500">{items.length} active {items.length === 1 ? "listing" : "listings"}</p>}
        </div>
        <Link to="/property/add" className="btn-gold">
          + Post property
        </Link>
      </div>

      <div className="mt-6">
        {error ? (
          <div className="card px-6 py-14 text-center">
            <p className="font-semibold">{error}</p>
            <button type="button" onClick={load} className="btn-primary mt-5">
              Try again
            </button>
          </div>
        ) : !items ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="card px-6 py-16 text-center">
            <p className="text-5xl" aria-hidden="true">🏡</p>
            <p className="mt-4 text-lg font-semibold">You haven't posted anything yet</p>
            <p className="mt-1 text-sm text-cocoa-500">List your first property in a couple of minutes. It's free.</p>
            <Link to="/property/add" className="btn-primary mt-6">
              Post your first property
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((p) => (
              <PropertyCard
                key={p.id}
                property={p}
                actions={
                  <>
                    <Link to={`/property/${p.id}/edit`} className="btn-secondary flex-1 py-2">
                      Edit
                    </Link>
                    <button type="button" onClick={() => setToDelete(p)} className="btn flex-1 border border-red-200 bg-white py-2 text-red-600 hover:bg-red-50">
                      Delete
                    </button>
                  </>
                }
              />
            ))}
          </div>
        )}
      </div>

      {toDelete && (
        <ConfirmDialog
          title="Delete this listing?"
          message={`"${toDelete.title}" will be removed for everyone. This can't be undone.`}
          confirmLabel="Delete"
          busy={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  );
}

export default function MyListings() {
  return (
    <RequireAuth message="Log in to see your listings">
      <Listings />
    </RequireAuth>
  );
}
