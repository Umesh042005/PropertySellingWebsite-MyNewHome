import React from "react";
import { useNavigate } from "react-router-dom";
import PropertyForm from "../components/PropertyForm.jsx";
import RequireAuth from "../components/RequireAuth.jsx";
import { propertyApi } from "../api/client";
import { useToast } from "../context/ToastContext.jsx";

export default function AddProperty() {
  const navigate = useNavigate();
  const toast = useToast();

  const submit = async (values, image) => {
    const created = await propertyApi.create(values, image);
    toast.success("Your property is live!");
    navigate(`/property/${created.id}`);
  };

  return (
    <RequireAuth message="Log in to post a property">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="m-0 text-2xl font-bold sm:text-3xl">Post a property</h1>
        <p className="mt-1 text-cocoa-500">Free listing. Buyers contact you directly.</p>
        <div className="mt-6">
          <PropertyForm submitLabel="Publish listing" onSubmit={submit} />
        </div>
      </div>
    </RequireAuth>
  );
}
