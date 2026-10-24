import React, { useEffect, useMemo, useState } from "react";
import { CATEGORIES, CITIES } from "../constants";
import { getErrorMessage, propertyApi } from "../api/client";
import { useToast } from "../context/ToastContext.jsx";
import { formatPrice } from "../utils/format";

const EMPTY = { title: "", description: "", price: "", city: "", location: "", category: "", contact: "" };
const MAX_IMAGE_MB = 5;

function Field({ id, label, hint, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-1 text-xs font-medium text-red-600">{error}</p>
      ) : (
        hint && <p className="mt-1 text-xs text-cocoa-500">{hint}</p>
      )}
    </div>
  );
}

/**
 * Shared create/edit form. `initial` pre-fills values (edit), `initialImage` shows the current photo.
 * `onSubmit(values, imageFile)` must return a promise.
 */
export default function PropertyForm({ initial, initialImage, submitLabel, onSubmit }) {
  const toast = useToast();
  const [values, setValues] = useState(() => ({ ...EMPTY, ...pick(initial) }));
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(initialImage || null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Free the object URL created for the preview
  useEffect(() => {
    if (!image) return undefined;
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  const cityNames = useMemo(() => {
    const names = Object.keys(CITIES);
    return values.city && !names.includes(values.city) ? [values.city, ...names] : names;
  }, [values.city]);
  const localitySuggestions = CITIES[values.city] || [];

  const set = (name, value) => {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => ({ ...e, [name]: undefined }));
  };
  const handleChange = (e) => set(e.target.name, e.target.value);

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors((er) => ({ ...er, image: "Please choose an image file (JPG, PNG, WebP)" }));
      return;
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      setErrors((er) => ({ ...er, image: `Image must be smaller than ${MAX_IMAGE_MB} MB` }));
      return;
    }
    setErrors((er) => ({ ...er, image: undefined }));
    setImage(file);
  };

  const validate = () => {
    const e = {};
    if (!values.title.trim()) e.title = "Add a short title";
    if (!values.description.trim()) e.description = "Describe the property";
    if (!(Number(values.price) > 0)) e.price = "Enter a price greater than 0";
    if (!values.category) e.category = "Choose a category";
    if (!values.city) e.city = "Choose a city";
    if (!values.location.trim()) e.location = "Enter the locality";
    if (!/^\+?[0-9]{10,15}$/.test(values.contact.replace(/[\s-]/g, ""))) e.contact = "Enter a 10-15 digit phone number";
    if (!image && !initialImage) e.image = "Add a photo of the property";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleGenerate = async () => {
    if (!values.title.trim()) {
      setErrors((e) => ({ ...e, title: "Enter a title first so AI knows what to write about" }));
      return;
    }
    setGenerating(true);
    try {
      const description = await propertyApi.generateDescription(values);
      set("description", description);
      toast.success("Description generated. Feel free to edit it.");
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't generate a description"));
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the highlighted fields");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({ ...values, price: Number(values.price) }, image);
    } catch (err) {
      toast.error(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  const err = (name) => (errors[name] ? "border-red-400 focus:border-red-500 focus:ring-red-400/20" : "");

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="card space-y-5 p-5 sm:p-7">
        <Field id="title" label="Title" error={errors.title} hint="E.g. Spacious 2BHK near metro with balcony">
          <input id="title" name="title" value={values.title} onChange={handleChange} maxLength={150} className={`input ${err("title")}`} />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="category" label="Category" error={errors.category}>
            <select id="category" name="category" value={values.category} onChange={handleChange} className={`input ${err("category")}`}>
              <option value="">Select category</option>
              {CATEGORIES.map((c) => (
                <option key={c.slug} value={c.label}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>
          <Field id="price" label="Price (₹)" error={errors.price} hint={Number(values.price) > 0 ? formatPrice(values.price) : "Total price or monthly rent"}>
            <input id="price" name="price" type="number" inputMode="numeric" min="1" step="1" value={values.price} onChange={handleChange} className={`input ${err("price")}`} />
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="city" label="City" error={errors.city}>
            <select
              id="city"
              name="city"
              value={values.city}
              onChange={(e) => {
                set("city", e.target.value);
                set("location", "");
              }}
              className={`input ${err("city")}`}
            >
              <option value="">Select city</option>
              {cityNames.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field id="location" label="Locality" error={errors.location} hint={values.city ? "Pick a suggestion or type your own" : undefined}>
            <input
              id="location"
              name="location"
              list="locality-options"
              value={values.location}
              onChange={handleChange}
              disabled={!values.city}
              placeholder={values.city ? "E.g. Baner" : "Select a city first"}
              className={`input ${err("location")}`}
            />
            <datalist id="locality-options">
              {localitySuggestions.map((l) => (
                <option key={l} value={l} />
              ))}
            </datalist>
          </Field>
        </div>

        <Field id="description" label="Description" error={errors.description}>
          <textarea
            id="description"
            name="description"
            value={values.description}
            onChange={handleChange}
            rows={7}
            maxLength={5000}
            placeholder="Size, rooms, furnishing, nearby schools and transport, parking..."
            className={`input resize-y leading-relaxed ${err("description")}`}
          />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <button type="button" onClick={handleGenerate} disabled={generating} className="btn-secondary px-4 py-2 text-xs">
              {generating ? <span className="spinner" /> : <span aria-hidden="true">✨</span>}
              {generating ? "Writing..." : "Write it with AI"}
            </button>
            <span className="text-xs text-cocoa-400">{values.description.length}/5000</span>
          </div>
        </Field>

        <Field id="contact" label="Contact number" error={errors.contact} hint="Buyers will call or WhatsApp you on this number">
          <input id="contact" name="contact" type="tel" inputMode="tel" autoComplete="tel" value={values.contact} onChange={handleChange} placeholder="9876543210" className={`input ${err("contact")}`} />
        </Field>
      </div>

      <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <div className="card p-5">
          <p className="label">Photo</p>
          <label
            htmlFor="image"
            className={`group relative flex aspect-[4/3] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed bg-sand-50 text-center transition hover:border-gold-500 ${
              errors.image ? "border-red-400" : "border-sand-300"
            }`}
          >
            {preview ? (
              <>
                <img src={preview} alt="Selected property" className="absolute inset-0 h-full w-full object-cover" />
                <span className="absolute bottom-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold shadow">Change photo</span>
              </>
            ) : (
              <span className="px-4 text-sm text-cocoa-500">
                <span className="mb-1 block text-3xl" aria-hidden="true">📷</span>
                Click to upload
                <span className="block text-xs text-cocoa-400">JPG, PNG or WebP, up to {MAX_IMAGE_MB} MB</span>
              </span>
            )}
          </label>
          <input id="image" type="file" accept="image/*" onChange={handleImage} className="sr-only" />
          {errors.image && <p className="mt-1 text-xs font-medium text-red-600">{errors.image}</p>}
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full py-3 text-base">
          {submitting && <span className="spinner" />}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

function pick(p) {
  if (!p) return {};
  const out = {};
  Object.keys(EMPTY).forEach((k) => {
    if (p[k] !== undefined && p[k] !== null) out[k] = String(p[k]);
  });
  return out;
}
