import { generateAgentMarkdownDocs } from "./generate-agent-markdown";

generateAgentMarkdownDocs().catch((err) => {
  console.error(err);
  process.exit(1);
});
