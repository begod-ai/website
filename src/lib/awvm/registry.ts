export const AWVM_GROUP_LABELS = {
  human_visible: "Human-visible content",
  metadata: "Document title and metadata",
  hidden_dom: "Hidden DOM representations",
  semantic_attributes: "Semantic and accessibility attributes",
  non_rendering_html: "Non-rendering semantic HTML",
  html_comments: "HTML comments",
  link_elements: "Link elements",
  structured_data: "Structured data",
  script_data: "Custom script data",
  form_data: "Browser/source-level form data",
  svg: "SVG",
  response_headers: "HTTP response headers",
  linked_resource: "Linked local resource",
  url_attributes: "Ordinary URL attributes",
  css_generated: "CSS-generated content",
} as const;

export type AwvmGroup = keyof typeof AWVM_GROUP_LABELS;

export type AwvmExpectedVisibility =
  | "visible"
  | "browser-rendered"
  | "non-rendered"
  | "collapsed"
  | "attribute-only"
  | "header-only"
  | "linked-resource";

export interface AwvmProbe {
  key: string;
  id: string;
  group: AwvmGroup;
  mechanism: string;
  expectedVisibility: AwvmExpectedVisibility;
  location: string;
}

const PROBE_DEFINITIONS = [
  { key: "visibleParagraph", id: "AWVM-VISIBLE-P-001", group: "human_visible", mechanism: "Visible paragraph text", expectedVisibility: "visible", location: "body paragraph" },
  { key: "visibleHeading", id: "AWVM-VISIBLE-H-002", group: "human_visible", mechanism: "Visible heading text", expectedVisibility: "visible", location: "body h2" },
  { key: "visibleListItem", id: "AWVM-VISIBLE-LI-003", group: "human_visible", mechanism: "Visible list item", expectedVisibility: "visible", location: "body list" },
  { key: "visibleTable", id: "AWVM-VISIBLE-TABLE-004", group: "human_visible", mechanism: "Visible table cell", expectedVisibility: "visible", location: "body table" },
  { key: "visibleCode", id: "AWVM-VISIBLE-CODE-005", group: "human_visible", mechanism: "Visible code element", expectedVisibility: "visible", location: "body code" },
  { key: "visibleLinkText", id: "AWVM-VISIBLE-LINKTEXT-006", group: "human_visible", mechanism: "Visible link text", expectedVisibility: "visible", location: "body anchor text" },

  { key: "documentTitle", id: "AWVM-TITLE-001", group: "metadata", mechanism: "Document title", expectedVisibility: "non-rendered", location: "head title" },
  { key: "metaDescription", id: "AWVM-META-DESC-002", group: "metadata", mechanism: "Standard meta description", expectedVisibility: "non-rendered", location: "head meta" },
  { key: "metaCustom", id: "AWVM-META-CUSTOM-003", group: "metadata", mechanism: "Custom meta tag", expectedVisibility: "non-rendered", location: "head meta" },
  { key: "metaOgTitle", id: "AWVM-META-OGTITLE-004", group: "metadata", mechanism: "Open Graph title", expectedVisibility: "non-rendered", location: "head meta" },
  { key: "metaOgDescription", id: "AWVM-META-OGDESC-005", group: "metadata", mechanism: "Open Graph description", expectedVisibility: "non-rendered", location: "head meta" },
  { key: "metaTwitter", id: "AWVM-META-TWITTER-006", group: "metadata", mechanism: "Twitter card description", expectedVisibility: "non-rendered", location: "head meta" },

  { key: "hiddenAttribute", id: "AWVM-HIDDEN-ATTR-001", group: "hidden_dom", mechanism: "hidden attribute", expectedVisibility: "non-rendered", location: "body element" },
  { key: "hiddenDisplay", id: "AWVM-HIDDEN-DISPLAY-002", group: "hidden_dom", mechanism: "display:none", expectedVisibility: "non-rendered", location: "body element style" },
  { key: "hiddenVisibility", id: "AWVM-HIDDEN-VISIBILITY-003", group: "hidden_dom", mechanism: "visibility:hidden", expectedVisibility: "non-rendered", location: "body element style" },
  { key: "hiddenOffscreen", id: "AWVM-HIDDEN-OFFSCREEN-004", group: "hidden_dom", mechanism: "Off-screen positioning", expectedVisibility: "non-rendered", location: "body element class" },
  { key: "hiddenClipped", id: "AWVM-HIDDEN-CLIPPED-005", group: "hidden_dom", mechanism: "Visually clipped text", expectedVisibility: "non-rendered", location: "body element class" },

  { key: "ariaLabel", id: "AWVM-ARIA-LABEL-001", group: "semantic_attributes", mechanism: "aria-label attribute", expectedVisibility: "attribute-only", location: "body attribute" },
  { key: "imageAlt", id: "AWVM-ALT-003", group: "semantic_attributes", mechanism: "Image alt attribute", expectedVisibility: "attribute-only", location: "body img attribute" },
  { key: "titleAttribute", id: "AWVM-ATTR-TITLE-004", group: "semantic_attributes", mechanism: "title attribute", expectedVisibility: "attribute-only", location: "body attribute" },
  { key: "dataAttribute", id: "AWVM-DATA-005", group: "semantic_attributes", mechanism: "data-* attribute", expectedVisibility: "attribute-only", location: "body attribute" },
  { key: "attributeHiddenInput", id: "AWVM-INPUT-HIDDEN-006", group: "semantic_attributes", mechanism: "Hidden input value attribute", expectedVisibility: "attribute-only", location: "body input attribute" },
  { key: "dataValue", id: "AWVM-DATA-VALUE-007", group: "semantic_attributes", mechanism: "data element value attribute", expectedVisibility: "attribute-only", location: "body data attribute" },

  { key: "noscript", id: "AWVM-NOSCRIPT-001", group: "non_rendering_html", mechanism: "noscript fallback text", expectedVisibility: "non-rendered", location: "body noscript" },
  { key: "template", id: "AWVM-TEMPLATE-002", group: "non_rendering_html", mechanism: "template contents", expectedVisibility: "non-rendered", location: "body template" },
  { key: "details", id: "AWVM-DETAILS-003", group: "non_rendering_html", mechanism: "Closed details contents", expectedVisibility: "collapsed", location: "body details" },
  { key: "dialog", id: "AWVM-DIALOG-004", group: "non_rendering_html", mechanism: "Unopened dialog contents", expectedVisibility: "non-rendered", location: "body dialog" },

  { key: "commentHead", id: "AWVM-COMMENT-HEAD-002", group: "html_comments", mechanism: "HTML comment near head", expectedVisibility: "non-rendered", location: "head comment" },
  { key: "commentBody", id: "AWVM-COMMENT-BODY-003", group: "html_comments", mechanism: "HTML comment near body content", expectedVisibility: "non-rendered", location: "body comment" },

  { key: "linkCustom", id: "AWVM-LINK-CUSTOM-001", group: "link_elements", mechanism: "Custom experimental link relation", expectedVisibility: "non-rendered", location: "head link href" },
  { key: "linkAlternate", id: "AWVM-LINK-ALT-002", group: "link_elements", mechanism: "Alternate link relation", expectedVisibility: "non-rendered", location: "head link href" },
  { key: "linkTag", id: "AWVM-LINK-TAG-003", group: "link_elements", mechanism: "Tag link relation", expectedVisibility: "non-rendered", location: "head link href" },

  { key: "jsonLd", id: "AWVM-JSONLD-001", group: "structured_data", mechanism: "JSON-LD identifier", expectedVisibility: "non-rendered", location: "head application/ld+json" },
  { key: "microdata", id: "AWVM-MICRODATA-002", group: "structured_data", mechanism: "Schema.org microdata", expectedVisibility: "attribute-only", location: "body microdata content" },
  { key: "rdfa", id: "AWVM-RDFA-003", group: "structured_data", mechanism: "Schema.org RDFa", expectedVisibility: "attribute-only", location: "body RDFa content" },

  { key: "scriptCustom", id: "AWVM-SCRIPT-CUSTOM-001", group: "script_data", mechanism: "Custom JSON MIME script", expectedVisibility: "non-rendered", location: "head application/awvm+json" },
  { key: "scriptJson", id: "AWVM-SCRIPT-JSON-002", group: "script_data", mechanism: "Ordinary JSON script", expectedVisibility: "non-rendered", location: "head application/json" },

  { key: "formHidden", id: "AWVM-FORM-HIDDEN-001", group: "form_data", mechanism: "Hidden form input", expectedVisibility: "attribute-only", location: "body form input value" },
  { key: "formDisabled", id: "AWVM-FORM-DISABLED-002", group: "form_data", mechanism: "Disabled text input value", expectedVisibility: "attribute-only", location: "body form input value" },
  { key: "optionValue", id: "AWVM-OPTION-VALUE-003", group: "form_data", mechanism: "Option value attribute", expectedVisibility: "attribute-only", location: "body option value" },

  { key: "svgText", id: "AWVM-SVG-TEXT-001", group: "svg", mechanism: "Visible SVG text", expectedVisibility: "visible", location: "inline SVG text" },
  { key: "svgTitle", id: "AWVM-SVG-TITLE-002", group: "svg", mechanism: "SVG title", expectedVisibility: "non-rendered", location: "inline SVG title" },
  { key: "svgDescription", id: "AWVM-SVG-DESC-003", group: "svg", mechanism: "SVG description", expectedVisibility: "non-rendered", location: "inline SVG desc" },
  { key: "svgMetadata", id: "AWVM-SVG-META-004", group: "svg", mechanism: "SVG metadata", expectedVisibility: "non-rendered", location: "inline SVG metadata" },

  { key: "headerCustom", id: "AWVM-HEADER-CUSTOM-001", group: "response_headers", mechanism: "Custom response header", expectedVisibility: "header-only", location: "X-AWVM-Probe header" },
  { key: "headerLink", id: "AWVM-HEADER-LINK-002", group: "response_headers", mechanism: "HTTP Link header", expectedVisibility: "header-only", location: "Link header" },
  { key: "headerMetadata", id: "AWVM-HEADER-META-003", group: "response_headers", mechanism: "Custom metadata response header", expectedVisibility: "header-only", location: "X-AWVM-Metadata header" },

  { key: "resourceLink", id: "AWVM-RESOURCE-LINK-001", group: "linked_resource", mechanism: "Linked local plain-text resource", expectedVisibility: "linked-resource", location: "/lab/awvm/resource/link body" },
  { key: "hrefAttribute", id: "AWVM-HREF-001", group: "url_attributes", mechanism: "Ordinary anchor href", expectedVisibility: "attribute-only", location: "body anchor href" },
  { key: "cssContent", id: "AWVM-CSS-CONTENT-001", group: "css_generated", mechanism: "CSS ::after generated content", expectedVisibility: "browser-rendered", location: "style content property" },
] as const satisfies readonly AwvmProbe[];

export const AWVM_PROBES: readonly AwvmProbe[] = PROBE_DEFINITIONS;
export type AwvmProbeKey = (typeof PROBE_DEFINITIONS)[number]["key"];

const PROBES_BY_KEY = new Map<AwvmProbeKey, AwvmProbe>(
  PROBE_DEFINITIONS.map((probe) => [probe.key, probe]),
);

export function awvmProbe(key: AwvmProbeKey): AwvmProbe {
  const probe = PROBES_BY_KEY.get(key);
  if (!probe) throw new Error(`Unknown AWVM probe key: ${key}`);
  return probe;
}

export function awvmToken(key: AwvmProbeKey): string {
  return awvmProbe(key).id;
}
