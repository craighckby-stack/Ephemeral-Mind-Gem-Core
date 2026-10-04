Live Preview 

https://ai.studio/apps/afe7d990-842a-4a9b-ab45-6d84ca8e06d0

# EMG [KERNEL v0.3] — Ephemeral Mind Gem Core

An immersive, retro-themed multi-agent simulation and analytical synthesis sandbox. Built using **TypeScript**, **React**, **Three.js**, and a customized full-stack **Vite + Express** architecture utilizing the advanced Google Gemini SDK.

---

## 1. What is the Ephemeral Mind Gem?

The **Ephemeral Mind Gem (EMG)** is an analytical workbench mimicking a classic DOS/Unix command terminal. Instead of providing standard, singular chat answers, it decomposes any complex query or topic into **nine distinct intellectual dimensions**, simulates those perspective streams in parallel using advanced thinking configurations, synthesizes them into a unified logic report, and maps the concept topology into a vector-rendered **Knowledge Graph**.

```
                           +------------------------+
                           |  User Subject Command  |
                           +-----------+------------+
                                       |
                   +-------------------+-------------------+
                   |                                       |
        [1. Persona Stream]                         [2. Persona Stream]
  +--------------------------------+       +--------------------------------+
  | Data Analyst (gemini-3.1-pro)  |  ...  | Economist (gemini-3.1-pro)     |
  +----------------+---------------+       +----------------+---------------+
                   |                                       |
                   +-------------------+-------------------+
                                       |
                        +--------------v--------------+
                        |  Multi-Agent Core Synthesis  |
                        +--------------+--------------+
                                       |
                     +-----------------+-----------------+
                     |                                   |
         +-----------v-----------+           +-----------v-----------+
         | Synthesis Report Text |           | Mermaid Topology Map  |
         +-----------------------+           +-----------------------+
```

---

## 2. Why It Differs from a Normal Chatbot

Conventional chat interfaces follow a simple, single-turn loop: you input a prompt, and a single instance of a model produces an answer. EMG operates as a **compound agentic workflow**:

| Attribute | Standard Chatbot | Ephemeral Mind Gem Core |
| :--- | :--- | :--- |
| **Execution Loop** | Single prompt $\rightarrow$ single completion. | Nine-persona pipeline $\rightarrow$ multi-agent synthesis $\rightarrow$ concept graphing. |
| **Cognitive Depth** | Single, generalized context. | Specialized intellectual bias (Philosophers, Economists, Ethicists) modeled independently to prevent context blending. |
| **Reasoning Model** | Default inference speed-optimized. | Explicit deep chain-of-thought (`ThinkingLevel.HIGH`) active across all pro models. |
| **State Portability** | Trapped in current browser session. | Fully offline-compatible. Memory backups can be saved as encrypted/binary state dumps and restored. |
| **Output Representation** | Unstructured Markdown or codeblocks. | Multi-column comparative grid, comprehensive essay synthesis, and a dynamically-rendered topological network map. |

---

## 3. Core Architecture & System Pipeline

EMG uses a full-stack architecture to secure API keys and prevent CORS constraints on external graphing endpoints.

### Sequential Processing Pipeline:
1. **User Topic Input**: The core subject is passed via an internal `POST /api/generate-perspective` call.
2. **Cognitive Agent Execution**: The Express backend initializes nine sequential agent calls using the primary `gemini-3.1-pro-preview` model with `ThinkingLevel.HIGH`. 
3. **Synthesis**: The individual perspectives are combined. The `POST /api/synthesize` endpoint prompts the model under structured JSON output schemas to establish the comparative report and identify key underlying assumptions.
4. **Topology Map Generation**: The `POST /api/generate-graph` endpoint parses the structural variables of the report, stripping out dangerous characters, and formats the relationships as a top-down Mermaid JS network schema rendered inside a responsive vector canvas.
5. **Interactive Conversational Mind**: Once generated, users can flip the terminal view into chat mode. This initializes an active conversation referencing the exact collective intelligence results without losing the custom terminal styling.

---

## 4. Resilience and Fallback Mechanics

To safeguard against the `RESOURCE_EXHAUSTED` rate-limits and input-token quota ceilings common on free API tiers, the backend includes an automated, self-healing **Fallback Model Chain**:

1. **Primary Model**: `gemini-3.1-pro-preview` (Thinking: `HIGH`) — Maximum logical output and deep reasoning.
2. **First Resiliency Fallback**: `gemini-2.5-pro` (Thinking: `Dynamic Budget`) — Premium backup logical reasoning.
3. **Second Resiliency Fallback**: `gemini-2.5-flash` (Thinking: `Dynamic Budget`) — Fast, cost-efficient backup.
4. **Final Graceful Fail-safe**: `gemini-1.5-flash` (Standard) — High speed baseline to guarantee successful analysis.

If any tier yields a `429` (Quota Limit) or network exception, the core registers the status yellow warning, updates the WebGL canvas, and steps down to the next available tier smoothly.

---

## 5. How to Use the Preview

### Local Initialization
1. Ensure your `.env` file matches `.env.example` with your `GEMINI_API_KEY`.
2. To override default shared server limits: paste your personal Gemini API key directly into the **Credential Deviation Override** field in the console interface. This routes requests securely from the server utilizing your individual account quotas.
3. Type in any analytical query (e.g. *"The economic and legal ramifications of self-replicating artificial software agents"*).
4. Hit **Execute Analysis**.
5. Inspect individual core modules using `[READ FULL]`, review raw state outputs via `Review JSON`, or click **Init Chat** to open the direct interactive chat shell with the combined memory block.

### Memory & State Portability
* Use **Backup Memory** to package and download your entire analytical workspace state into an external `.json` file block.
* Use **Restore Memory** to select a previously exported `.json` file and inject all perspective matrices, concepts, and graphs back into your local kernel register.
