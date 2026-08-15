export type BotClassification =
  | "openai_searchbot"
  | "chatgpt_user_fetcher"
  | "openai_crawler"
  | "perplexity_bot"
  | "perplexity_user_fetcher"
  | "googlebot"
  | "google_ai_search_crawler"
  | "bingbot"
  | "anthropic_claude_crawler"
  | "generic_bot"
  | "normal_browser"
  | "unknown";

interface ClassificationRule {
  classification: BotClassification;
  pattern: RegExp;
}

// Ordered from specific to general so the rules remain easy to audit and extend.
const KNOWN_AGENT_RULES: ClassificationRule[] = [
  { classification: "openai_searchbot", pattern: /OAI-SearchBot/i },
  { classification: "chatgpt_user_fetcher", pattern: /ChatGPT-User/i },
  { classification: "openai_crawler", pattern: /GPTBot|OpenAI/i },
  { classification: "perplexity_user_fetcher", pattern: /Perplexity-User/i },
  { classification: "perplexity_bot", pattern: /PerplexityBot/i },
  {
    classification: "google_ai_search_crawler",
    pattern: /Google-Extended|GoogleOther|Google-InspectionTool/i,
  },
  { classification: "googlebot", pattern: /Googlebot|AdsBot-Google/i },
  { classification: "bingbot", pattern: /bingbot|BingPreview/i },
  {
    classification: "anthropic_claude_crawler",
    pattern: /ClaudeBot|Claude-User|Claude-SearchBot|anthropic-ai/i,
  },
];

const GENERIC_BOT_PATTERN =
  /\b(bot|crawler|spider|slurp|fetcher|scraper|archiver|headless)\b/i;
const BROWSER_PATTERN =
  /Mozilla\/5\.0|Chrome\/|Chromium\/|Safari\/|Firefox\/|Edg\/|OPR\//i;

export function classifyUserAgent(userAgent: string): BotClassification {
  if (!userAgent.trim()) {
    return "unknown";
  }

  for (const rule of KNOWN_AGENT_RULES) {
    if (rule.pattern.test(userAgent)) {
      return rule.classification;
    }
  }

  if (GENERIC_BOT_PATTERN.test(userAgent)) {
    return "generic_bot";
  }

  if (BROWSER_PATTERN.test(userAgent)) {
    return "normal_browser";
  }

  return "unknown";
}
