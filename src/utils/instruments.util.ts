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
  "Clay",
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
  "Google Analytics",
  "Glide",
  "Harvest",
  ["HeyGen", "Movio"],
  "HubSpot",
  "Instantly",
  "JustCall",
  ["Keap", "keap"],
  "Klaviyo",
  ["KoalaWriter", "Koala Writer"],
  "Leadpages",
  "LinkedIn",
  ["Looker Studio", "Google Data Studio"],
  "Loom",
  "Luma",
  "Mailchimp",
  ["Make.com", "make.com", "makecom", "integromat"],
  "Manatal",
  "Manychat",
  ["Marketo", "marketo"],
  "Mautic",
  "Metabase",
  "MindManager",
  "Monday",
  "n8n",
  "Noloco",
  "Notion",
  "Pabbly",
  "PandaDoc",
  "PhantomBuster",
  "Pipedrive",
  "Play.ai",
  "Podio",
  ["Power BI", "PowerBI"],
  "QuickBooks",
  "Redash",
  "Rentman",
  ["Reply.io", "Replyio"],
  "Replit",
  "Retell",
  "Retool",
  "RingCentral",
  "Salesforce",
  "SendGrid",
  "Shopify",
  "Slack",
  "SmartLead",
  "Softr",
  "Stripe",
  "Squarespace",
  "Supabase",
  ["TikTok", "tiktok"],
  "Trello",
  "Twilio",
  ["Unbounce", "unbounce"],
  "Vapi",
  "Wazuh",
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
