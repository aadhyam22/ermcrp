// utils/boqStorageClient.js
//
// Client-side helpers for the BOQ file storage flow. These call our own
// Next.js API routes (never Supabase directly) — the routes verify the
// user's Firebase ID token, then use the Supabase service role key
// server-side to talk to Storage. See:
//   app/api/boq/upload/route.js
//   app/api/boq/file-link/route.js

import { getAuth } from "firebase/auth";

/** Uploads a File to Supabase Storage via our API route. Returns { path, signedUrl }. */
export async function uploadBOQFile(file) {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error("You must be logged in to upload a BOQ file.");
    const idToken = await user.getIdToken();

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/boq-upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}` },
        body: formData,
    });

    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || "File upload failed.");
    return body;
}

/** Given a storage path, fetches a fresh short-lived signed URL to view/download the file. */
export async function getBOQFileLink(path) {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error("You must be logged in.");
    const idToken = await user.getIdToken();

    const res = await fetch(`/api/boq-file-link?path=${encodeURIComponent(path)}`, {
        headers: { Authorization: `Bearer ${idToken}` },
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || "Could not load file link.");
    return body.signedUrl;
}