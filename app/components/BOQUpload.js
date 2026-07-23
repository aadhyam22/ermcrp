"use client";

import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { parseBOQExcel, recalculateItem, calculateBOQSummary } from "@/utils/boqParser";

export default function BOQUpload({ projectId, boqTitle = "" }) {
    const [items, setItems] = useState([]);
    const [fileName, setFileName] = useState("");
    const [title, setTitle] = useState(boqTitle);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [supabaseFile, setSupabaseFile] = useState(null); // { path, signedUrl }
    const [uploadingToSupabase, setUploadingToSupabase] = useState(false);

    const summary = calculateBOQSummary(items);

    async function handleFileChange(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        setError("");
        setLoading(true);
        setItems([]);
        setSupabaseFile(null);

        // 1. Parse locally first so the preview appears immediately, regardless
        //    of upload speed.
        try {
            const parsedItems = await parseBOQExcel(file);
            if (parsedItems.length === 0) {
                setError(
                    "No usable rows found. Make sure the sheet has Description, Quantity, and Rate columns."
                );
            }
            setItems(parsedItems);
        } catch (err) {
            console.error(err);
            setError("Could not read this file. Please upload a valid .xlsx or .xls sheet.");
            setLoading(false);
            e.target.value = "";
            return;
        }
        setLoading(false);

        // 2. Upload the original file to Supabase Storage so there's a source
        //    record of exactly what was submitted.
        setUploadingToSupabase(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("projectId", projectId || "general");

            const res = await fetch("/api/boq-upload", { method: "POST", body: formData });
            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.error || "Upload to Supabase failed");
            }

            setSupabaseFile({ path: result.path, signedUrl: result.signedUrl });
        } catch (err) {
            console.error(err);
            setError(
                (prev) =>
                    prev || "File was read successfully, but storing the original in Supabase failed."
            );
        } finally {
            setUploadingToSupabase(false);
            e.target.value = ""; // allow re-uploading the same file name
        }
    }

    function updateItem(id, field, rawValue) {
        setItems((prev) =>
            prev.map((item) => {
                if (item.id !== id) return item;
                const isNumeric = field === "quantity" || field === "rate";
                const value = isNumeric ? parseFloat(rawValue) || 0 : rawValue;
                return recalculateItem({ ...item, [field]: value });
            })
        );
    }

    function removeItem(id) {
        setItems((prev) => prev.filter((item) => item.id !== id));
    }

    function addBlankRow() {
        setItems((prev) => [
            ...prev,
            recalculateItem({
                id: `boq_manual_${Date.now()}`,
                srNo: prev.length + 1,
                description: "",
                unit: "",
                hsnCode: "",
                quantity: 0,
                rate: 0,
            }),
        ]);
    }

    async function handleSave() {
        if (items.length === 0) {
            setError("Add at least one line item before saving.");
            return;
        }
        setSaving(true);
        setError("");
        try {
            await addDoc(collection(db, "boqs"), {
                projectId: projectId || null,
                title: title || fileName || "Untitled BOQ",
                sourceFileName: fileName || null,
                sourceFile: supabaseFile
                    ? { path: supabaseFile.path, signedUrl: supabaseFile.signedUrl }
                    : null,
                items,
                summary,
                gstRate: 18,
                createdAt: serverTimestamp(),
            });
            alert("BOQ saved successfully.");
        } catch (err) {
            console.error(err);
            setError("Failed to save BOQ. Please try again.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="p-6 space-y-4 max-w-6xl mx-auto">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Bill of Quantities</h2>
                    <p className="text-sm text-gray-500">
                        Upload a BOQ sheet with description, quantity, and rate (excl. GST). GST @ 18% is
                        calculated automatically.
                    </p>
                </div>

                <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md cursor-pointer hover:bg-blue-700">
                    Upload BOQ Excel
                    <input type="file" accept=".xlsx,.xls" onChange={handleFileChange} className="hidden" />
                </label>
            </div>

            <div className="flex items-center gap-3">
                <input
                    type="text"
                    placeholder="BOQ title (e.g. Site A - Electrical Works)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="border rounded-md px-3 py-2 text-sm w-80"
                />
                {fileName && <span className="text-sm text-gray-500">Source: {fileName}</span>}
                {loading && <span className="text-sm text-gray-500">Reading file…</span>}
                {uploadingToSupabase && (
                    <span className="text-sm text-gray-500">Storing original in Supabase…</span>
                )}
                {supabaseFile && !uploadingToSupabase && (
                    <a
                        href={supabaseFile.signedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-green-700 hover:underline"
                    >
                        ✓ Original file stored
                    </a>
                )}
            </div>

            {error && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                    {error}
                </div>
            )}

            {items.length > 0 && (
                <>
                    <div className="overflow-x-auto border rounded-md">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50 text-gray-600">
                                <tr>
                                    <th className="p-2 text-left w-14">Sr No</th>
                                    <th className="p-2 text-left">Description</th>
                                    <th className="p-2 text-left w-24">Unit</th>
                                    <th className="p-2 text-left w-24">HSN/SAC</th>
                                    <th className="p-2 text-right w-24">Qty</th>
                                    <th className="p-2 text-right w-32">Rate (excl. GST)</th>
                                    <th className="p-2 text-right w-28">Amount</th>
                                    <th className="p-2 text-right w-28">GST @18%</th>
                                    <th className="p-2 text-right w-32">Total</th>
                                    <th className="p-2 w-16"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => (
                                    <tr key={item.id} className="border-t">
                                        <td className="p-2 text-gray-500">{item.srNo}</td>
                                        <td className="p-2">
                                            <input
                                                className="w-full border rounded px-2 py-1"
                                                value={item.description}
                                                onChange={(e) => updateItem(item.id, "description", e.target.value)}
                                            />
                                        </td>
                                        <td className="p-2">
                                            <input
                                                className="w-full border rounded px-2 py-1"
                                                value={item.unit}
                                                onChange={(e) => updateItem(item.id, "unit", e.target.value)}
                                            />
                                        </td>
                                        <td className="p-2">
                                            <input
                                                className="w-full border rounded px-2 py-1"
                                                value={item.hsnCode}
                                                onChange={(e) => updateItem(item.id, "hsnCode", e.target.value)}
                                            />
                                        </td>
                                        <td className="p-2">
                                            <input
                                                type="number"
                                                className="w-full border rounded px-2 py-1 text-right"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(item.id, "quantity", e.target.value)}
                                            />
                                        </td>
                                        <td className="p-2">
                                            <input
                                                type="number"
                                                className="w-full border rounded px-2 py-1 text-right"
                                                value={item.rate}
                                                onChange={(e) => updateItem(item.id, "rate", e.target.value)}
                                            />
                                        </td>
                                        <td className="p-2 text-right text-gray-700">{item.amount.toFixed(2)}</td>
                                        <td className="p-2 text-right text-gray-700">{item.gstAmount.toFixed(2)}</td>
                                        <td className="p-2 text-right font-medium text-gray-900">
                                            {item.totalAmount.toFixed(2)}
                                        </td>
                                        <td className="p-2 text-center">
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="text-red-500 text-xs hover:underline"
                                            >
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <button onClick={addBlankRow} className="text-sm text-blue-600 hover:underline">
                        + Add line item
                    </button>

                    <div className="flex justify-end">
                        <div className="w-72 space-y-1 text-sm bg-gray-50 border rounded-md p-4">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal (excl. GST)</span>
                                <span>₹{summary.subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Total GST (18%)</span>
                                <span>₹{summary.totalGST.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between font-semibold text-gray-900 border-t pt-2">
                                <span>Grand Total</span>
                                <span>₹{summary.grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-5 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50"
                        >
                            {saving ? "Saving…" : "Save BOQ"}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}