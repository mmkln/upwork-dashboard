// instruments.util.ts
const videoAndAnimationInstruments: Array<string | string[]> = [
    // Editing / Motion
    ["Adobe Premiere Pro", "Premiere Pro", "Adobe Premiere", "Premiere"],
    ["Adobe After Effects", "After Effects", "AfterEffects"],
    ["DaVinci Resolve", "Da Vinci Resolve"],
    ["Final Cut Pro", "Final Cut", "FCPX", "FCP"],
    ["CapCut", "CapCut Pro"],

    // Graphics for video
    ["Adobe Photoshop", "Photoshop"],
    ["Adobe Illustrator", "Illustrator"],
    ["Canva", "Canva Pro"],

    // 3D / CGI / Render / Engines
    ["Blender", "Blender 3D"],
    ["Cinema 4D", "C4D", "Cinema4D"],
    ["3ds Max", "3dsMax", "3D Studio Max"],
    ["Maya", "Autodesk Maya"],
    ["Houdini", "SideFX Houdini"],
    ["Unreal Engine", "Unreal", "UE5", "UE4"],
    ["Octane Render", "OctaneRender", "Octane"],
    ["Redshift", "Maxon Redshift"],
    ["Cycles", "Blender Cycles", "Cycles X"],

    // AI Video / Voice
    ["Runway", "RunwayML", "Runway Gen-3 Alpha", "Runway Gen 3", "Gen-3", "Gen3"],
    "Sora",
    ["ElevenLabs", "Eleven Labs"],

    // Mobile / Social editors
    ["VN Video Editor", "VN"],

    // Platforms (часто згадуються як вимога у відео-задачах)
    ["YouTube", "YouTube Shorts"],
    ["Instagram", "Instagram Reels", "IG Reels"],
];


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
  ["GoHighLevel", "GHL", "Go High Level", "gohighlevel", "HighLevel"],
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
  "Postmark",
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
  "SignWell",
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
  ...videoAndAnimationInstruments,
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
