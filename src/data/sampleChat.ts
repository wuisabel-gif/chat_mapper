/**
 * Labeled example conversations for the quick-start chips. Each spans a few
 * topics so the processor visibly splits them into multiple sections.
 */
export type Sample = { id: string; label: string; hint: string; text: string };

const programmingProject = `User: My feature branch and main have diverged and git won't let me push. How do I fix the merge conflict?
Assistant: You have a few options. The cleanest is usually to rebase your feature branch onto the latest main: run \`git fetch origin\`, then \`git rebase origin/main\`. Git will pause on each conflicting file. Open them, resolve the conflict markers, \`git add\` the resolved files, and \`git rebase --continue\`. If a rebase gets too messy you can abort with \`git rebase --abort\` and instead do a merge commit with \`git merge origin/main\`.
User: And if I already committed something I want to undo before pushing?
Assistant: Use \`git reset --soft HEAD~1\` to undo the last commit but keep the changes staged, or \`git reset --hard HEAD~1\` to discard them entirely. Since you haven't pushed yet, rewriting history here is safe.

User: Now I want to add observability to my agent. How does LangSmith tracing work?
Assistant: LangSmith captures a trace for each run, broken into spans for every LLM call, tool call, and chain step. Set the LANGCHAIN_TRACING_V2 and LANGCHAIN_API_KEY environment variables and your runs show up automatically. Each span records latency, token usage, inputs, and outputs, which makes it easy to spot slow steps or unexpected prompts.
User: Can I evaluate quality, not just latency?
Assistant: Yes. LangSmith supports offline evaluation against a dataset of examples using evaluators, and online evaluation that scores live production traces.

User: For the RAG part, how should I chunk my documents before embedding them?
Assistant: Start with a recursive splitter targeting 500-1000 tokens per chunk with ~15% overlap. Embed each chunk, store the vectors in Chroma or FAISS, and at query time retrieve the top-k most similar chunks to feed the model.

User: I'm also updating my resume for AI engineering roles. How should I describe this project?
Assistant: Lead with impact and the stack, mirror the keywords from the job description, and quantify wherever you can so applicant tracking systems flag you as a match.`;

const researchNotes = `User: I'm researching retrieval-augmented generation for a literature review. What are the main retriever types?
Assistant: Broadly: sparse retrievers like BM25 that match on keywords, dense retrievers that compare embedding vectors with cosine similarity, and hybrid retrievers that fuse both. Dense retrieval needs an embedding model and a vector store such as FAISS, Chroma, or Pinecone; hybrid often reranks the union with a cross-encoder.
User: How do I evaluate retrieval quality for the paper?
Assistant: Report recall@k and MRR against a labeled set of query-document pairs, then measure end-to-end answer faithfulness separately. Keep retrieval metrics and generation metrics distinct so you can attribute failures.

User: Switching topics — what prompt engineering techniques should I cite?
Assistant: The well-studied ones are few-shot prompting, chain-of-thought, self-consistency, and ReAct for tool use. For a literature review, group them by whether they change the input (few-shot, instructions), the decoding (self-consistency, temperature), or the control flow (ReAct, planning).
User: How does temperature interact with chain-of-thought?
Assistant: Higher temperature increases reasoning diversity, which self-consistency exploits by sampling multiple chains and voting. For a single deterministic answer, keep temperature low and rely on a strong instruction instead.`;

const studySession = `User: I'm studying ROS2 for an exam. Can you explain nodes and topics simply?
Assistant: A node is a single process that does one job, like reading a sensor or driving a motor. Nodes talk over topics using a publish/subscribe model: a publisher sends messages on a named topic, and any subscriber to that topic receives them. In rclpy you create a node, then create_publisher or create_subscription with a message type and topic name.
User: How does a robot know where it is?
Assistant: Through odometry and sensor fusion. Wheel encoders and an IMU give a rough pose, then a filter combines them with lidar-based localization to correct drift over time. The odometry topic publishes the estimated pose continuously.

User: Different subject — I also need to review embedded systems. What's the difference between I2C and SPI?
Assistant: Both are serial buses for talking to peripherals. I2C uses two wires (clock and data) and addresses multiple devices on the same bus, which is wiring-efficient but slower. SPI uses separate clock, MOSI, MISO, and a chip-select line per device, which is faster and full-duplex but needs more pins. On an STM32 you configure either through the HAL and read/write registers for the peripheral.`;

export const samples: Sample[] = [
  { id: "programming", label: "Programming project", hint: "Git, LangSmith, RAG, resume", text: programmingProject },
  { id: "research", label: "Research notes", hint: "Retrieval & prompt engineering", text: researchNotes },
  { id: "study", label: "Study session", hint: "Robotics & embedded systems", text: studySession },
];

/** Back-compat default sample. */
export const sampleChat = programmingProject;
