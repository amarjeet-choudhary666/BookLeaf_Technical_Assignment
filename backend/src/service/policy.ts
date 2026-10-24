import type { ticketCategories } from "../validation/ticketValidation.ts";

type Category = (typeof ticketCategories)[number];

const policies: Record<Category, string[]> = {
  royalty_payments: [
    "Author royalty share is 80% of net profit and BookLeaf share is 20%.",
    "Royalties are calculated quarterly. Payments are made within 45 days after quarter-end.",
    "Balances below ₹1,000 roll over until the minimum payout threshold is reached.",
  ],
  isbn_metadata: [
    "Metadata changes typically take 3–5 business days.",
    "ISBN errors should receive high priority. Verify the title and ISBN before promising a correction.",
  ],
  printing_quality: [
    "Verified printing defects qualify for a free reprint.",
    "Print turnaround is typically 5–7 business days.",
  ],
  distribution_availability: [
    "Distribution synchronization typically takes 24–48 hours.",
  ],
  book_status_production: [
    "New book listings typically take 7–10 business days.",
    "Print turnaround is typically 5–7 business days.",
  ],
  general_inquiry: [],
};

export function policyGuidance(category: Category): string[] {
  return policies[category];
}

export function guessPolicyCategory(subject: string, description: string): Category {
  const text = `${subject} ${description}`.toLowerCase();
  if (/royalt|payment|payout|earning/.test(text)) return "royalty_payments";
  if (/isbn|metadata|title correction/.test(text)) return "isbn_metadata";
  if (/print|damag|defect|quality/.test(text)) return "printing_quality";
  if (/distribution|availability|retailer|store/.test(text)) return "distribution_availability";
  if (/listing|production|publishing|book status/.test(text)) return "book_status_production";
  return "general_inquiry";
}
