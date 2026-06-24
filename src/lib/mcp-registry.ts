export interface MCPRegistryItem {
  id: string;
  pkg: string;
  desc: string;
  tags: string[];
}

export const mcpRegistry: MCPRegistryItem[] = [
  { id: "brave-search", pkg: "@modelcontextprotocol/server-brave-search", desc: "Web search via Brave Search API", tags: ["search", "web", "api"] },
  { id: "sqlite", pkg: "@modelcontextprotocol/server-sqlite", desc: "Local SQLite database interaction", tags: ["database", "sql", "local"] },
  { id: "postgres", pkg: "@modelcontextprotocol/server-postgres", desc: "PostgreSQL database interactions", tags: ["database", "sql"] },
  { id: "github", pkg: "@modelcontextprotocol/server-github", desc: "GitHub API integration (repos, issues, PRs)", tags: ["git", "vcs", "code"] },
  { id: "gitlab", pkg: "@modelcontextprotocol/server-gitlab", desc: "GitLab API integration", tags: ["git", "vcs", "code"] },
  { id: "slack", pkg: "@modelcontextprotocol/server-slack", desc: "Slack integration for messaging", tags: ["chat", "communication", "api"] },
  { id: "fetch", pkg: "@modelcontextprotocol/server-fetch", desc: "Fetch web pages and convert HTML to markdown", tags: ["web", "scraping", "utility"] },
  { id: "puppeteer", pkg: "@modelcontextprotocol/server-puppeteer", desc: "Browser automation and advanced scraping", tags: ["web", "scraping", "browser"] },
  { id: "google-maps", pkg: "@modelcontextprotocol/server-google-maps", desc: "Google Maps API integration", tags: ["maps", "location", "api"] },
  { id: "gdrive", pkg: "@modelcontextprotocol/server-gdrive", desc: "Google Drive file management integration", tags: ["files", "cloud", "google"] },
  { id: "aws", pkg: "@modelcontextprotocol/server-aws", desc: "AWS resource interaction and integration", tags: ["cloud", "infrastructure", "aws"] },
  { id: "sequential-thinking", pkg: "@modelcontextprotocol/server-sequential-thinking", desc: "Dynamic and sequential reasoning capabilities", tags: ["reasoning", "logic", "agent"] },
  { id: "filesystem", pkg: "@modelcontextprotocol/server-filesystem", desc: "Secure local file system access", tags: ["files", "local", "os"] },
  { id: "memory", pkg: "@modelcontextprotocol/server-memory", desc: "Knowledge graph based persistent memory", tags: ["memory", "knowledge", "storage"] },
  { id: "everything", pkg: "@modelcontextprotocol/server-everything", desc: "A comprehensive MCP server containing multiple utilities", tags: ["utility", "tools", "misc"] },
  { id: "npm", pkg: "@modelcontextprotocol/server-npm", desc: "Interact with the NPM registry and packages", tags: ["node", "packages", "development"] },
  { id: "notion", pkg: "mcp-server-notion", desc: "Integrate with Notion workspace and databases", tags: ["productivity", "notes", "api"] },
  { id: "linear", pkg: "mcp-server-linear", desc: "Interact with Linear issue tracker", tags: ["productivity", "planning", "api"] },
  { id: "docker", pkg: "@modelcontextprotocol/server-docker", desc: "Interact with local Docker daemon and containers", tags: ["containers", "docker", "devops"] },
  { id: "kubernetes", pkg: "@modelcontextprotocol/server-kubernetes", desc: "Interact with Kubernetes clusters", tags: ["containers", "k8s", "devops"] }
];
