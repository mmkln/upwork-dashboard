// instruments.util.ts

export const instruments: Array<string | string[]> = [
  "Active Campaign",
  "Airtable",
  "Apify",
  "Apollo",
  "Amwork",
  "Automation Anywhere",
  "Beehiiv",
  "bolt.new",
  "Brevo",
  "bubble.io",
  "Caspio",
  "chatbotbuilder.ai",
  "clearout",
  ["Click Funnels", "ClickFunnels", "ClickFunnels 2.0", "ClickFunnels2"],
  "ClickUp",
  "Close CRM",
  "Coda",
  "Drawio",
  "Dumpling",
  "Fireflies",
  ["Follow Up Boss", "FollowUpBoss", "fub"],
  "Funnelytics",
  "getimg",
  ["GoHighLevel", "GHL", "Go High Level", "gohighlevel"],
  "Harvest",
  ["HeyGen", "Movio"],
  "HubSpot",
  ["Keap", "keap"],
  "Klaviyo",
  "Leadpages",
  "Luma",
  "Mailchimp",
  ["Make.com", "make.com", "makecom", "integromat"],
  "Manatal",
  "Manychat",
  ["Marketo", "marketo"],
  "Mautic",
  "MindManager",
  "Monday",
  "n8n",
  "Pabbly",
  "PandaDoc",
  "PhantomBuster",
  "Pipedrive",
  "Play.ai",
  "Podio",
  "QuickBooks",
  "Rentman",
  "Retell",
  "RingCentral",
  "Salesforce",
  "SendGrid",
  "Shopify",
  "Slack",
  "Softr",
  "Squarespace",
  "Supabase",
  ["TikTok", "tiktok"],
  "Trello",
  "Twilio",
  ["Unbounce", "unbounce"],
  "Vapi",
  "Webflow",
  "Whimsical",
  "Wix",
  "Xero",
  "Zapier",
  "Zoho",
];

// Escape special characters for regex
const escapeRegExp = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// Map each main tool to its regex patterns (including synonyms)
export const toolRegexMap: { [key: string]: RegExp[] } = {};
instruments.forEach((toolEntry) => {
  const mainTool = Array.isArray(toolEntry) ? toolEntry[0] : toolEntry;
  const synonyms = Array.isArray(toolEntry) ? toolEntry : [toolEntry];
  toolRegexMap[mainTool] = synonyms.map(
    (synonym) => new RegExp(`\\b${escapeRegExp(synonym)}\\b`, "i"),
  );
});

// List of main instruments for the filter options
export const availableInstruments: string[] = instruments.map((toolEntry) =>
  Array.isArray(toolEntry) ? toolEntry[0] : toolEntry,
);
