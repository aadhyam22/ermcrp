// app/api/boq-upload/route.js
//
// Receives the raw BOQ Excel file from the browser and stores it in Supabase
// Storage (private bucket), then returns a signed URL so the app can display
// or re-download the original sheet later.

import { NextResponse } from "next/server";
import { supabaseAdmin, BOQ_BUCKET } from "@/lib/supabaseAdmin";

export const runtime = "nodejs"; // required for Buffer + service role usage

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file");
        const projectId = formData.get("projectId") || "general";

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const allowedExtensions = [".xlsx", ".xls"];
        const hasValidExtension = allowedExtensions.some((ext) =>
            file.name.toLowerCase().endsWith(ext)
        );
        if (!hasValidExtension) {
            return NextResponse.json(
                { error: "Only .xlsx or .xls files are allowed" },
                { status: 400 }
            );
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const filePath = `${projectId}/${Date.now()}_${safeName}`;

        const { error: uploadError } = await supabaseAdmin.storage
            .from(BOQ_BUCKET)
            .upload(filePath, buffer, {
                contentType:
                    file.type ||
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                upsert: false,
            });

        if (uploadError) {
            console.error("Supabase upload error:", uploadError);
            return NextResponse.json({ error: "Upload to storage failed" }, { status: 500 });
        }

        // Bucket is private, so generate a signed URL (valid 7 days) instead of a public one.
        const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin.storage
            .from(BOQ_BUCKET)
            .createSignedUrl(filePath, 60 * 60 * 24 * 7);

        if (signedUrlError) {
            console.error("Signed URL error:", signedUrlError);
            return NextResponse.json({ error: "Could not generate file URL" }, { status: 500 });
        }

        return NextResponse.json({
            path: filePath,
            signedUrl: signedUrlData.signedUrl,
        });
    } catch (err) {
        console.error("BOQ upload route error:", err);
        return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
    }
}