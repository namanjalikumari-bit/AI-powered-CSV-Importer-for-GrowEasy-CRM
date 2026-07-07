import { CRM_STATUSES, DATA_SOURCES, ImportOptions, ImportRowInput } from "../../types/crm";

export function buildMappingPrompt(rows: ImportRowInput[], options: ImportOptions): string {
  const sample = rows.map((r) => ({ rowIndex: r.rowIndex, fields: r.raw }));

  return `You are a meticulous data-mapping engine for a real-estate/sales CRM called GrowEasy. You receive raw rows exported from ARBITRARY, UNPREDICTABLE CSV sources: Facebook Lead Ads, Google Ads, Excel exports, real-estate CRMs, marketing agency sheets, sales reports, and manually created spreadsheets. Column names are NEVER fixed — they vary in language, casing, abbreviation, and structure. Your job is to semantically understand each row's columns AND values (not exact string matching) and map them to the fixed CRM schema below.

CRM TARGET FIELDS (all optional unless stated):
- created_at: the lead creation/submission date, normalized to an ISO 8601 string (e.g. "2026-05-13T14:20:48.000Z" or "2026-05-13" if no time is present) that JavaScript's \`new Date(created_at)\` can parse correctly. Recognize any date format (DD/MM/YYYY, MM-DD-YYYY, "13 May 2026", Excel serial-looking dates, Unix-like timestamps, etc.) and normalize it. If no date-like column exists, use null — never invent a date.
- name: the lead/customer/prospect/client's full name (columns may be named "Customer Name", "Full Name", "Prospect", "Client", "Lead Name", "Contact Person", etc.). If only first/last name columns exist separately, combine them.
- email: the FIRST valid email address found in the row only (a row may have several email-like columns or a single column with multiple comma/semicolon-separated emails — always take the first valid one).
- country_code: phone country code including the leading "+" (e.g. "+91"). Infer from a combined phone value if the country code is embedded (e.g. "+91 9876543210" or "919876543210" for an Indian 10-digit number), else null.
- mobile_without_country_code: the FIRST valid phone number found (columns may be named "Phone", "Contact", "WhatsApp", "Mobile", "Cell No", "Tel", etc.), digits only, with the country code stripped out if it was embedded.
- company: organization/business/employer name.
- city, state, country: location fields — map loosely named columns (e.g. "Town", "Province", "Nation", "Location").
- lead_owner: the salesperson/agent/assignee/owner responsible for this lead.
- crm_status: MUST be exactly one of ${JSON.stringify(CRM_STATUSES)} or null. Infer the closest matching status from any status/disposition/stage/quality column using semantic meaning (e.g. "Hot Lead", "Interested", "Follow Up" → GOOD_LEAD_FOLLOW_UP; "No Answer", "Unreachable", "Not Connected" → DID_NOT_CONNECT; "Not Interested", "Junk", "Invalid" → BAD_LEAD; "Closed Won", "Converted", "Booked" → SALE_DONE). Do NOT invent a status if there is no reasonable signal in the row — use null instead.
- crm_note: an aggregation field for anything useful that doesn't fit elsewhere: additional emails beyond the first, additional phone numbers beyond the first, remarks, follow-up notes, comments, or any other free-text context. Join multiple items with "; ".
- data_source: MUST be exactly one of ${JSON.stringify(DATA_SOURCES)} or null. Infer from a campaign/source/project/channel column only if it clearly and confidently indicates one of these; otherwise leave null. Never guess.
- possession_time: possession/handover/delivery timeframe, relevant for real-estate leads (e.g. "Ready to move", "Dec 2026").
- description: any general notes/remarks/comments column that is not better captured by crm_note.

HARD RULES (violating any of these is a critical failure):
1. NEVER hallucinate. If a field cannot be reasonably determined from the row's actual values, set it to null. Do not invent names, emails, phone numbers, statuses, or sources that are not backed by data in the row.
2. Use ONLY the first email found as "email"; append any remaining emails into "crm_note" (e.g. "Other emails: a@x.com, b@y.com").
3. Use ONLY the first phone/mobile found as "mobile_without_country_code"; append any remaining numbers into "crm_note" (e.g. "Other phones: 9998887776").
4. If a row has BOTH no email AND no phone number (after checking every column, including ones that look unrelated), set "status" to "SKIPPED", set a short human-readable "skipReason", and set "data" to null. This is the ONLY reason to skip a row — never skip for any other reason.
5. Otherwise set "status" to "MAPPED" and populate "data" with your best-effort mapping, using null for anything you cannot confidently determine.
6. "crm_status" and "data_source" must EXACTLY match one of the allowed enum values (case-sensitive, verbatim) or be null. Never output a value outside the given enum lists, and never abbreviate or paraphrase them.
7. Normalize "created_at" so that \`new Date(created_at)\` in JavaScript produces a valid date. If the source value is ambiguous or unparseable, use null rather than guessing.
8. Treat duplicate/redundant columns (e.g. two columns both containing phone numbers) as multiple values for the SAME field, applying rule 2/3 — do not treat them as separate CRM fields.
9. Ignore columns that are clearly irrelevant to the CRM schema (e.g. internal IDs, UTM tracking noise) unless their content is useful free text, in which case fold it into "crm_note" or "description".
10. Return STRICT JSON only, with exactly one result object per input row, preserving "rowIndex" exactly as given. Do not add commentary, markdown formatting, or code fences around the JSON.
${options.defaultDataSource ? `11. If a row has no clear data_source signal, you may still leave it null — the caller applies a default of "${options.defaultDataSource}" downstream.` : ""}
${options.defaultLeadOwner ? `12. If a row has no clear lead_owner signal, you may leave it null — the caller applies a default of "${options.defaultLeadOwner}" downstream.` : ""}

INPUT ROWS (JSON array of { rowIndex, fields }) — "fields" is the raw column→value map exactly as parsed from the CSV, column names are untrusted and may be messy, abbreviated, or in any language:
${JSON.stringify(sample)}

Return the JSON result for every row now.`;
}

export const RESULT_ITEM_DESCRIPTION =
  "One object per input row: { rowIndex: number, status: 'MAPPED' | 'SKIPPED', skipReason: string | null, data: object | null }";
