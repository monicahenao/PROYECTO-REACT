import 'dotenv/config';
import express from "express";
import { Octokit } from "@octokit/rest";

const app = express();
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

app.use(express.json());

app.post("/mcp", async (req, res) => {
  const { tool, args } = req.body;

  try {
    if (tool === "listarPRs") {
      const prs = await octokit.pulls.list({
        owner: process.env.OWNER,
        repo: process.env.REPO
      });

      return res.json(prs.data.map(pr => ({
        numero: pr.number,
        titulo: pr.title,
        autor: pr.user.login,
        url: pr.html_url
      })));
    }

    if (tool === "crearIssue") {
      const issue = await octokit.issues.create({
        owner: process.env.OWNER,
        repo: process.env.REPO,
        title: args.titulo,
        body: args.descripcion
      });

      return res.json({
        numero: issue.data.number,
        url: issue.data.html_url
      });
    }

    res.status(400).json({ error: "Tool no soportada" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT || 3001, () => {
  console.log("✅ MCP GitHub (simple) escuchando en http://localhost:" + (process.env.PORT || 3001) + "/mcp");
});
