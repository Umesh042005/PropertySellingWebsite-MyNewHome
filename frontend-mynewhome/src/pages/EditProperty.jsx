import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PropertyForm from "../components/PropertyForm.jsx";
import RequireAuth from "../components/RequireAuth.jsx";
import { getErrorMessage, imageSrc, propertyApi } from "../api/client";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import NotFound from "./NotFound.jsx";

function EditForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [property, setProperty] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    propertyApi
      .get(id)
      .then(setProperty)
      .catch((err) => setError(err.response?.status === 404 ? "notfound" : getErrorMessage(err)));
  }, [id]);

  if (error === "notfound") return <NotFound title="This listing no longer exists" />;
  if (error) return <p className="px-4 py-24 text-center font-semibold">{error}</p>;
  if (!property) {
    return (
      <div className="flex justify-center py-24 text-cocoa-500">
        <span className="spinner h-6 w-6" aria-label="Loading" />
      </div>
    );
  }

  if (property.ownerId !== user.id && user.role !== "ROLE_ADMIN") {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">You can only edit your own listings</h1>
        <Link to={`/property/${id}`} className="btn-secondary mt-6">
          Back to listing
        </Link>
      </div>
    );
  }

  const submit = async (values, image) => {
    await propertyApi.update(id, values, image);
    toast.success("Changes saved");
    navigate(`/property/${id}`);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link to={`/property/${id}`} className="text-sm text-cocoa-500 hover:text-cocoa-900">
        ← Back to listing
      </Link>
      <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Edit listing</h1>
      <div className="mt-6">
        <PropertyForm initial={property} initialImage={imageSrc(property)} submitLabel="Save changes" onSubmit={submit} />
      </div>
    </div>
  );
}

export default function EditProperty() {
  return (
    <RequireAuth message="Log in to edit your listing">
      <EditForm />
    </RequireAuth>
  );
}
