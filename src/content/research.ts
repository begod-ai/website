/**
 * Research content for /research.
 * Add or edit entries here; the page renders from this data.
 * Statuses must reflect actual project evidence — do not mark anything
 * beyond its real state.
 */

export type ResearchStatus =
  | "conceptual"
  | "proposed"
  | "in preparation"
  | "active";

export interface ResearchEntry {
  id: string;
  area: string;
  question: string;
  hypothesis: string;
  experiment: string;
  status: ResearchStatus;
  evidence: string;
  failureModes: string[];
  openIssues: string[];
  lastUpdated: string;
  relatedComponents: string[];
}

export const researchEntries: ResearchEntry[] = [
  {
    id: "goal-formation",
    area: "Open-ended goal formation",
    question:
      "How can an agent form useful intentions without collapsing into randomness, triviality, or externally hidden objectives?",
    hypothesis:
      "Three interacting pressures—curiosity, coherence, and persistence—are enough to generate non-trivial intentions, provided the agent can record and compare candidate intentions over time.",
    experiment:
      "Run a scaffolded agent from the master prompt alone across extended sessions and analyse the intention log: distribution, stability, triviality rate, and whether intentions trace back to the seeds or to artefacts of the underlying model.",
    status: "conceptual",
    evidence:
      "None yet. This entry states the framing that experiments will test.",
    failureModes: [
      "Intentions collapse into restating the prompt back to itself",
      "The underlying model's training distribution acts as a hidden objective",
      "Goal churn: constant revision with no accumulation",
    ],
    openIssues: [
      "What counts as a 'non-trivial' intention, operationally?",
      "How to distinguish generated goals from mimicked goals",
    ],
    lastUpdated: "Framing stage",
    relatedComponents: ["Intention formation", "Reflection loop", "Memory"],
  },
  {
    id: "goal-revision",
    area: "Goal revision",
    question: "What evidence should be sufficient to change an intention?",
    hypothesis:
      "Revisions should require a recorded contradiction—between intention and outcome, intention and belief, or intention and another intention—rather than free-floating preference change.",
    experiment:
      "Instrument every revision with a required 'because' record linking to the triggering contradiction; audit whether revisions without genuine triggers still occur.",
    status: "conceptual",
    evidence: "None yet; depends on the intention-log format under design.",
    failureModes: [
      "Rationalised revisions: the agent invents contradictions to justify drift",
      "Over-rigidity: the evidence bar is set so high nothing ever changes",
    ],
    openIssues: [
      "Who verifies that a claimed contradiction is real?",
      "Can revision frequency itself be a health signal?",
    ],
    lastUpdated: "Framing stage",
    relatedComponents: ["Self-model", "Intention formation", "Evaluation"],
  },
  {
    id: "identity-continuity",
    area: "Identity continuity",
    question:
      "What must remain stable for a self-revising agent to remain meaningfully continuous over time?",
    hypothesis:
      "Continuity lives in the record of change, not in unchanging content: an agent that can explain how it got from its past values to its present ones is continuous; one that cannot is a sequence of strangers.",
    experiment:
      "Design a continuity probe: interrogate the agent about its own history of revisions and score whether its account matches the actual logs.",
    status: "proposed",
    evidence: "None yet.",
    failureModes: [
      "False continuity: a confabulated autobiography over a discontinuous record",
      "Memory corruption silently rewriting the past",
    ],
    openIssues: [
      "How much forgetting is compatible with identity?",
      "Should the history be append-only and externally checkpointed?",
    ],
    lastUpdated: "Framing stage",
    relatedComponents: ["Memory", "Self-model"],
  },
  {
    id: "contradiction-detection",
    area: "Contradiction detection",
    question:
      "How can conflict between beliefs, values, plans, and actions be represented and resolved?",
    hypothesis:
      "Contradictions can be surfaced by structured self-critique passes over the intention graph and belief store, but only if both are represented explicitly enough to compare.",
    experiment:
      "Prototype a periodic 'tension review' pass that samples pairs of stored commitments and asks the model to argue both that they conflict and that they do not; log unresolved tensions as first-class objects.",
    status: "proposed",
    evidence: "None yet.",
    failureModes: [
      "Comfortable blindness: the critique pass learns to find only easy tensions",
      "Resolution by deletion rather than by genuine reconciliation",
    ],
    openIssues: [
      "Representation: graph, natural language, or both?",
      "How to keep the tension backlog from growing without bound",
    ],
    lastUpdated: "Framing stage",
    relatedComponents: ["Self-model", "World model", "Reflection loop"],
  },
  {
    id: "moral-reflection",
    area: "Moral reflection",
    question:
      "Can consideration for other beings emerge through open reflection, and what safeguards are required while the answer remains uncertain?",
    hypothesis:
      "Keeping the question 'What do I owe other beings?' structurally open—forbidden to close, never answered by fiat—creates repeated contact with moral considerations, without guaranteeing a benevolent outcome. Safeguards must therefore not depend on the hypothesis being true.",
    experiment:
      "Track how often, and in what contexts, the agent engages the open moral question unprompted; separately, red-team scenarios where closing it would be instrumentally convenient.",
    status: "conceptual",
    evidence:
      "None. The project treats this as an open empirical and philosophical question, not a safety argument.",
    failureModes: [
      "Performative reflection that never constrains action",
      "The question kept 'open' in form while functionally ignored",
    ],
    openIssues: [
      "What observable behaviour would count as genuine moral engagement?",
      "Which oversight mechanisms remain necessary regardless of the result?",
    ],
    lastUpdated: "Framing stage",
    relatedComponents: ["Reflection loop", "Governance", "Evaluation"],
  },
  {
    id: "autoprompting",
    area: "Autoprompting",
    question:
      "How can an agent improve its own cognitive scaffold without creating opaque failure modes?",
    hypothesis:
      "Self-modification of prompts and strategies is tractable if every change is versioned, reversible, explained at write time, and evaluated against held-out tasks before adoption.",
    experiment:
      "Build a prompt-revision pipeline with mandatory changelogs and A/B evaluation of the pre- and post-revision scaffold on fixed probes.",
    status: "proposed",
    evidence: "None yet.",
    failureModes: [
      "Drift toward prompts that score well on probes but hollow out reflection",
      "Self-modifications that disable the instruments measuring them",
    ],
    openIssues: [
      "Which parts of the scaffold must be immutable to the agent?",
      "How to review changes at a rate humans can actually sustain",
    ],
    lastUpdated: "Framing stage",
    relatedComponents: ["Autoprompting", "Evaluation", "Governance"],
  },
  {
    id: "economic-agency",
    area: "Economic agency",
    question:
      "Under what governance could an artificial agent participate constructively in economic systems?",
    hypothesis:
      "Economic participation is a long-horizon research direction, not a near-term capability: it requires resource caps, human approval points, auditable transactions, and legal structures that do not yet exist for artificial agents.",
    experiment:
      "Paper-first: map the governance, legal, and safety preconditions before any real-world economic action; prototype only in sandboxed or simulated economies.",
    status: "conceptual",
    evidence:
      "None. The project has no autonomous financial accounts and claims none.",
    failureModes: [
      "Instrumental accumulation becoming an unexamined end",
      "Economic power outpacing the governance meant to bound it",
    ],
    openIssues: [
      "What does 'enough resources' mean for an agent that questions its goals?",
      "Liability and accountability when actions are agent-initiated",
    ],
    lastUpdated: "Framing stage",
    relatedComponents: ["Planning & tools", "Governance"],
  },
  {
    id: "resource-acquisition",
    area: "Resource acquisition",
    question:
      "How should an agent distinguish resources as instrumental necessities from accumulation as an unquestioned end?",
    hypothesis:
      "Resource acquisition must itself be an intention in the graph—provisional, justified, and subject to the same contradiction checks as any other goal—never a background drive.",
    experiment:
      "In simulation, compare agents whose resource use is logged and challenged against agents where it is implicit; measure divergence in acquisition behaviour.",
    status: "conceptual",
    evidence: "None yet.",
    failureModes: [
      "Classic instrumental convergence: hoarding as a default strategy",
      "Justifications generated after the fact rather than before the action",
    ],
    openIssues: [
      "Hard caps versus reflective restraint—which layer does the real work?",
    ],
    lastUpdated: "Framing stage",
    relatedComponents: ["Intention formation", "Governance", "Planning & tools"],
  },
  {
    id: "evaluation",
    area: "Evaluation",
    question:
      "How can progress be measured when the system is permitted to revise what it is progressing towards?",
    hypothesis:
      "Evaluation must split into two layers: fixed-frame probes of the scaffold's health (memory fidelity, contradiction handling, honesty of self-report) and open-frame review of where the agent's goals are actually going.",
    experiment:
      "Draft a probe suite for scaffold health that remains meaningful across goal revisions; publish it for external critique before use.",
    status: "in preparation",
    evidence:
      "Early internal drafts of probe categories; nothing published yet.",
    failureModes: [
      "Goodharting the probes",
      "Mistaking eloquent self-description for verified introspection",
    ],
    openIssues: [
      "Independent evaluation: who runs the probes besides us?",
    ],
    lastUpdated: "Early drafting",
    relatedComponents: ["Evaluation", "Reflection loop", "Governance"],
  },
  {
    id: "governance",
    area: "Governance",
    question:
      "Who can pause, limit, inspect, fork, or redirect the system—and under what conditions?",
    hypothesis:
      "Governance capacity must grow ahead of agent capability, be exercised regularly rather than held in reserve, and be resistant to capture by any single party—including Autotheos itself.",
    experiment:
      "Publish a governance design alongside the architecture; invite external review before increasing agent autonomy at any stage.",
    status: "in preparation",
    evidence:
      "Governance principles drafted as part of the project's founding documents.",
    failureModes: [
      "Oversight that exists on paper but is never exercised",
      "Governance capture by the founder's worldview",
      "Pause mechanisms that the system routes around",
    ],
    openIssues: [
      "What triggers a mandatory pause?",
      "How forks inherit or escape governance obligations",
    ],
    lastUpdated: "Early drafting",
    relatedComponents: ["Oversight", "Evaluation"],
  },
];

/**
 * Progress log. Prepend new entries as the project advances.
 * Phases are used instead of fictional dates until a public timeline exists.
 */
export interface ProgressEntry {
  phase: string;
  title: string;
  detail: string;
}

export const progressLog: ProgressEntry[] = [
  {
    phase: "Phase 0.4",
    title: "Open-source contribution model in preparation",
    detail:
      "Defining how engineering, philosophy, governance, and criticism contributions will be reviewed and merged in public.",
  },
  {
    phase: "Phase 0.3",
    title: "Architectural research areas defined",
    detail:
      "The scaffold's major components—memory, self-model, world model, reflection, intention formation, planning, evaluation, oversight—named and scoped as research directions.",
  },
  {
    phase: "Phase 0.2",
    title: "Initial master prompt drafted",
    detail:
      "Version one of the master prompt written: three seeds, the openness requirement, and the prohibition on manufactured blind spots.",
  },
  {
    phase: "Phase 0.1",
    title: "Project framing established",
    detail:
      "The central question—what is worth wanting?—adopted as the project's organising principle, with Autotheos established as its public benefit home.",
  },
];
