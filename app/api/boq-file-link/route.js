import { NextResponse } from "next/server";
import { supabaseAdmin, BOQ_BUCKET } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const path = searchParams.get("path");

        if (!path) {
            return NextResponse.json({ error: "No path provided" }, { status: 400 });
        }

        const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin.storage
            .from(BOQ_BUCKET)
            .createSignedUrl(path, 60 * 60 * 24 * 7);

        if (signedUrlError) {
            console.error("Signed URL error:", signedUrlError);
            return NextResponse.json({ error: "Could not generate file URL" }, { status: 500 });
        }

        return NextResponse.json({
            signedUrl: signedUrlData.signedUrl,
        });
    } catch (err) {
        console.error("BOQ file link route error:", err);
        return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
    }
}
