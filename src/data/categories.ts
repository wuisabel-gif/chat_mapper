/**
 * Single source of truth for topic categories.
 *
 * Everything category-related — keyword classification, summary blurbs, and
 * the colored pills in the UI — derives from this one list. To add or change
 * a category, edit ONLY this file; the processor, the breakdown, and the tags
 * all pick it up automatically.
 */
export type CategoryDef = {
  name: string;
  /** Lowercase keywords used for topic detection. */
  keywords: string[];
  /** Sentence fragment used to build a section summary. */
  blurb: string;
  /** Tailwind classes for the category pill (bg / text / border). */
  color: string;
};

export const OTHER_CATEGORY = "Other";

export const CATEGORIES: CategoryDef[] = [
  {
    name: "Git / GitHub",
    keywords: ["git", "github", "branch", "merge", "rebase", "conflict", "commit", "pull request", "checkout", "stash", "remote", "clone"],
    blurb: "working with Git and GitHub — branches, merges, and conflict resolution",
    color: "bg-orange-100 text-orange-700 border-orange-300",
  },
  {
    name: "LangGraph",
    keywords: ["langgraph", "state graph", "stategraph", "node", "edge", "checkpointer", "graph state", "conditional edge"],
    blurb: "building stateful agent graphs with LangGraph — nodes, edges, and state",
    color: "bg-purple-100 text-purple-700 border-purple-300",
  },
  {
    name: "LangSmith",
    keywords: ["langsmith", "trace", "tracing", "span", "evaluator", "evaluation", "observability", "latency", "token usage", "dataset"],
    blurb: "LangSmith observability — tracing, spans, and online/offline evaluation",
    color: "bg-pink-100 text-pink-700 border-pink-300",
  },
  {
    name: "LangChain",
    keywords: ["langchain", "chain", "runnable", "lcel", "prompt template", "output parser", "tool calling", "memory"],
    blurb: "composing LLM pipelines with LangChain — chains, runnables, and tools",
    color: "bg-emerald-100 text-emerald-700 border-emerald-300",
  },
  {
    name: "Gemini",
    keywords: ["gemini", "bard", "google ai", "gemini pro", "gemini flash", "gemini cli", "gemini code", "gemini code assist", "vertex ai", "ai studio", "aistudio", "makersuite", "google genai"],
    blurb: "Google Gemini — prompting, the Gemini API, and Gemini Code Assist",
    color: "bg-sky-100 text-sky-700 border-sky-300",
  },
  {
    name: "RAG / Retrieval",
    keywords: ["rag", "retrieval", "retriever", "vector", "embedding", "embeddings", "chunk", "chunking", "chroma", "faiss", "pinecone", "semantic search", "similarity"],
    blurb: "retrieval-augmented generation — embeddings, vector stores, and retrievers",
    color: "bg-cyan-100 text-cyan-700 border-cyan-300",
  },
  {
    name: "Prompt Engineering",
    keywords: ["prompt", "system prompt", "few-shot", "few shot", "chain of thought", "instruction", "temperature", "persona", "guardrail"],
    blurb: "designing and refining prompts for reliable model behaviour",
    color: "bg-yellow-100 text-yellow-700 border-yellow-300",
  },
  {
    name: "AI Agents",
    keywords: ["agent", "agentic", "tool use", "react agent", "planning", "multi-agent", "autonomous", "orchestration", "workflow"],
    blurb: "designing AI agents — tool use, planning, and orchestration",
    color: "bg-blue-100 text-blue-700 border-blue-300",
  },
  {
    name: "Robotics / ROS2",
    keywords: ["ros2", "ros 2", "robot", "robotics", "node", "topic", "rclpy", "gazebo", "urdf", "actuator", "lidar", "odometry"],
    blurb: "robotics and ROS2 — nodes, topics, and robot control",
    color: "bg-red-100 text-red-700 border-red-300",
  },
  {
    name: "Embedded Systems",
    keywords: ["embedded", "microcontroller", "firmware", "stm32", "arduino", "esp32", "gpio", "i2c", "spi", "uart", "rtos", "register"],
    blurb: "embedded systems and firmware — microcontrollers and peripherals",
    color: "bg-teal-100 text-teal-700 border-teal-300",
  },
  {
    name: "Resume / Portfolio",
    keywords: ["resume", "cv", "portfolio", "cover letter", "linkedin", "interview", "job", "recruiter", "application"],
    blurb: "career materials — resume, portfolio, and job applications",
    color: "bg-indigo-100 text-indigo-700 border-indigo-300",
  },
  {
    name: "Image Generation",
    keywords: ["image generation", "stable diffusion", "midjourney", "dall-e", "dalle", "diffusion", "image prompt", "img2img", "lora", "upscale"],
    blurb: "AI image generation — diffusion models and image prompting",
    color: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-300",
  },
];

/** Fallback used when no keywords match. */
export const OTHER_DEF: CategoryDef = {
  name: OTHER_CATEGORY,
  keywords: [],
  blurb: "general discussion that didn't match a specific topic",
  color: "bg-slate-100 text-slate-700 border-slate-300",
};

/** Look up a category definition by name (falls back to Other). */
export function getCategory(name: string): CategoryDef {
  return CATEGORIES.find((c) => c.name === name) ?? OTHER_DEF;
}

/** Tailwind pill classes for a category name. */
export function categoryColor(name: string): string {
  return getCategory(name).color;
}
