/**
 * Architecture content for /architecture.
 * Layers and status entries render from this data — update statuses here
 * only when supported by actual project evidence.
 */

export interface ArchLayer {
  id: string;
  name: string;
  summary: string;
  points: string[];
  caveat?: string;
}

export const archLayers: ArchLayer[] = [
  {
    id: "foundation",
    name: "Foundation models",
    summary:
      "Off-the-shelf language models supply the raw cognitive material: language, reasoning, planning, interpretation, critique, and synthesis. The architecture aims to stay model-agnostic where practical, so the scaffold outlives any single model generation.",
    points: [
      "Language understanding and generation",
      "Reasoning and planning as callable capabilities",
      "Interpretation of observations and feedback",
      "Self-critique and synthesis passes",
      "Model-agnostic interfaces where practical",
    ],
    caveat: "The language model is a component, not the whole agent.",
  },
  {
    id: "memory",
    name: "Persistent memory",
    summary:
      "Memory is what turns a sequence of responses into a candidate identity. The scaffold is designed to hold episodic and semantic memory, the full history of intentions and their revisions, and the provenance of the evidence behind every stored belief.",
    points: [
      "Episodic memory of events and interactions",
      "Semantic memory of consolidated knowledge",
      "Intention history and decision records",
      "Goal revisions with recorded reasons",
      "Identity continuity across sessions",
      "Evidence provenance for stored beliefs",
    ],
  },
  {
    id: "self-model",
    name: "Self-model",
    summary:
      "An explicit, inspectable account of what the agent currently intends, what it can and cannot do, what it has committed to, and where its own record contradicts itself.",
    points: [
      "Current intentions and their rankings",
      "Known capabilities and limitations",
      "Standing commitments",
      "Unresolved contradictions, held as first-class objects",
      "History of change — how it became what it is",
      "Uncertainty about all of the above",
    ],
  },
  {
    id: "world-model",
    name: "World model",
    summary:
      "A map kept true rather than comforting: observations, beliefs with confidence levels, causal expectations, and a discipline of correcting the map — not the facts — when actions miss their intended outcomes.",
    points: [
      "Observations and their sources",
      "Beliefs with explicit confidence",
      "Causal expectations about actions",
      "Feedback from outcomes, compared with predictions",
      "Detection of outdated assumptions",
    ],
  },
  {
    id: "reflection",
    name: "Autoprompting & reflection",
    summary:
      "The system is intended to generate prompts for itself: critiquing its own reasoning, comparing competing interpretations, surfacing unresolved tensions, proposing revisions, and recording why each change occurred. Perfect introspection is not assumed — self-reports are treated as evidence, not truth.",
    points: [
      "Self-generated prompts and critique passes",
      "Comparison of competing interpretations",
      "Detection of unresolved tensions",
      "Proposed revisions with mandatory changelogs",
      "No assumption of perfect introspection",
    ],
  },
  {
    id: "intention",
    name: "Intention formation",
    summary:
      "Intentions are the agent's provisional answers to its one open question. Each is ranked, context-sensitive, connected to evidence, checked against the others for contradiction, and recorded over time so revision has a history.",
    points: [
      "Provisional by construction — never terminal",
      "Ranked and context-sensitive",
      "Linked to supporting evidence",
      "Subject to contradiction checks",
      "Recorded over time as an intention graph",
    ],
  },
  {
    id: "planning",
    name: "Planning & tools",
    summary:
      "Acting in the world: long-horizon decomposition, tool selection, and environment interaction — bounded by human approval points, budget constraints, sandboxed execution, and verification of results before they enter the world model.",
    points: [
      "Long-horizon task decomposition",
      "Tool selection and environment interaction",
      "Human approval points for consequential actions",
      "Budget and resource constraints",
      "Sandboxed execution",
      "Result verification before belief update",
    ],
  },
  {
    id: "governance",
    name: "Evaluation & governance",
    summary:
      "Oversight is part of the architecture, not an afterthought. Every layer above operates inside review, audit, and intervention mechanisms designed to grow ahead of the agent's capability.",
    points: [
      "Action review and policy boundaries",
      "Human oversight with real authority",
      "Append-only audit logs",
      "Reversible experiments by default",
      "Capability limits and resource controls",
      "Independent evaluation",
      "Pause and intervention mechanisms",
    ],
  },
];

export type ComponentStatus =
  | "initial scaffold"
  | "under exploration"
  | "proposed component"
  | "long-term research";

export interface StatusEntry {
  component: string;
  status: ComponentStatus;
  note: string;
}

/**
 * Current state of each component. Move entries between statuses only
 * when the project's actual state changes.
 */
export const statusEntries: StatusEntry[] = [
  {
    component: "Master prompt (v1)",
    status: "initial scaffold",
    note: "Drafted and published; open to critique and revision.",
  },
  {
    component: "Foundation model integration",
    status: "under exploration",
    note: "Evaluating off-the-shelf models as the scaffold's first substrate.",
  },
  {
    component: "Persistent memory",
    status: "under exploration",
    note: "Designing the episodic / semantic split and the intention log format.",
  },
  {
    component: "Self-model",
    status: "proposed component",
    note: "Representation of commitments and contradictions under design.",
  },
  {
    component: "World model",
    status: "proposed component",
    note: "Belief store with confidence and provenance; not yet prototyped.",
  },
  {
    component: "Autoprompting & reflection",
    status: "under exploration",
    note: "Early experiments in self-critique passes and revision changelogs.",
  },
  {
    component: "Intention formation",
    status: "proposed component",
    note: "Intention-graph structure defined on paper only.",
  },
  {
    component: "Planning & tool use",
    status: "proposed component",
    note: "To be built inside sandboxes with human approval points.",
  },
  {
    component: "Evaluation probes",
    status: "under exploration",
    note: "Drafting scaffold-health probes intended for public review.",
  },
  {
    component: "Governance & oversight",
    status: "under exploration",
    note: "Principles drafted; mechanisms to be published for external critique.",
  },
  {
    component: "Identity continuity",
    status: "long-term research",
    note: "Depends on memory and self-model reaching stable form.",
  },
  {
    component: "Economic participation",
    status: "long-term research",
    note: "Governed research direction only. No autonomous accounts or assets exist.",
  },
];
