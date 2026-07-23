
import * as XLSX from "xlsx";

export const GST_RATE = 0.18; // 18%

// Maps common column header variants (lowercased) to a normalized field name.
// Add more synonyms here if your team's sheets use different wording.
const HEADER_MAP = {
    "sno": "srNo",
    "s.no": "srNo",
    "s.no.": "srNo",
    "sr no": "srNo",
    "sr. no.": "srNo",
    "item no": "srNo",

    "item": "description",
    "item description": "description",
    "description": "description",
    "particulars": "description",
    "work description": "description",

    "unit": "unit",
    "uom": "unit",
    "unit of measurement": "unit",

    "hsn": "hsnCode",
    "hsn code": "hsnCode",
    "hsn/sac": "hsnCode",
    "sac": "hsnCode",

    "qty": "quantity",
    "quantity": "quantity",

    "rate": "rate",
    "price": "rate",
    "unit price": "rate",
    "rate (excl gst)": "rate",
    "rate excl. gst": "rate",
    "price excl gst": "rate",
    "basic rate": "rate",
};

function normalizeHeader(header) {
    const key = String(header).trim().toLowerCase();
    return HEADER_MAP[key] || key.replace(/\s+/g, "_");
}

function toNumber(value) {
    const n = parseFloat(String(value).replace(/,/g, ""));
    return Number.isFinite(n) ? n : 0;
}

/**
 * Parses a File object (from an <input type="file">) into an array of BOQ items.
 * Each item: { id, srNo, description, unit, hsnCode, quantity, rate, amount,
 *              gstRate, gstAmount, totalAmount }
 */
export function parseBOQExcel(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: "array" });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

                const items = rawRows
                    .map((row, idx) => {
                        const normalized = {};
                        Object.entries(row).forEach(([key, value]) => {
                            normalized[normalizeHeader(key)] = value;
                        });

                        const quantity = toNumber(normalized.quantity);
                        const rate = toNumber(normalized.rate);
                        const amount = +(quantity * rate).toFixed(2);
                        const gstAmount = +(amount * GST_RATE).toFixed(2);
                        const totalAmount = +(amount + gstAmount).toFixed(2);

                        return {
                            id: `boq_${idx}_${Date.now()}`,
                            srNo: normalized.srNo || idx + 1,
                            description: String(normalized.description || "").trim(),
                            unit: normalized.unit || "",
                            hsnCode: normalized.hsnCode || "",
                            quantity,
                            rate,
                            amount,
                            gstRate: GST_RATE * 100,
                            gstAmount,
                            totalAmount,
                        };
                    })
                    // Drop fully blank rows (common at the end of exported sheets)
                    .filter((item) => item.description || item.quantity || item.rate);

                resolve(items);
            } catch (err) {
                reject(err);
            }
        };

        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(file);
    });
}

/** Recomputes amount/GST/total for one item after an inline edit. */
export function recalculateItem(item) {
    const amount = +(item.quantity * item.rate).toFixed(2);
    const gstAmount = +(amount * GST_RATE).toFixed(2);
    const totalAmount = +(amount + gstAmount).toFixed(2);
    return { ...item, amount, gstAmount, totalAmount };
}

/** Rolls up subtotal, total GST, and grand total across all line items. */
export function calculateBOQSummary(items) {
    const subtotal = items.reduce((sum, i) => sum + i.amount, 0);
    const totalGST = items.reduce((sum, i) => sum + i.gstAmount, 0);
    const grandTotal = items.reduce((sum, i) => sum + i.totalAmount, 0);
    return {
        subtotal: +subtotal.toFixed(2),
        totalGST: +totalGST.toFixed(2),
        grandTotal: +grandTotal.toFixed(2),
    };
}