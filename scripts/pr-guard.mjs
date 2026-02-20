import { Octokit } from "@octokit/rest";

/**
 * Debugly PR Guard
 * Automatically analyzes CI failure logs and comments on the Pull Request.
 */

async function run() {
  const {
    DEBUGLY_TOKEN,
    GITHUB_TOKEN,
    GITHUB_REPOSITORY,
    GITHUB_EVENT_PATH,
    API_URL = "https://debugly-ai.vercel.app/api/analyze", // Default production URL
    ERROR_TRACE
  } = process.env;

  if (!DEBUGLY_TOKEN) {
    console.error("❌ DEBUGLY_TOKEN is missing. Please add it to GitHub Secrets.");
    process.exit(1);
  }

  if (!GITHUB_TOKEN || !GITHUB_REPOSITORY) {
    console.error("❌ GITHUB_TOKEN or GITHUB_REPOSITORY is missing.");
    process.exit(1);
  }

  const octokit = new Octokit({ auth: GITHUB_TOKEN });
  const [owner, repo] = GITHUB_REPOSITORY.split("/");

  // 1. Identify PR Number
  let prNumber = process.env.GITHUB_PR_NUMBER;
  if (!prNumber && GITHUB_EVENT_PATH) {
    try {
      const { readFileSync } = await import('fs');
      const event = JSON.parse(readFileSync(GITHUB_EVENT_PATH, 'utf8'));
      prNumber = event.pull_request?.number || event.number;
    } catch (e) {
      console.warn("⚠️ Could not parse GITHUB_EVENT_PATH:", e.message);
    }
  }

  if (!prNumber) {
    console.error("❌ Could not identify Pull Request number.");
    process.exit(1);
  }

  // 2. Prepare Analysis Payload
  const trace = ERROR_TRACE || "Unknown error occurred during CI process.";
  
  console.log(`🧠 Contacting Debugly Intelligence for PR #${prNumber}...`);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${DEBUGLY_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        error: trace,
        context: [{ name: "CI_Failure_Log", content: trace, isMainError: true }],
        locale: "English"
      })
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || "Analysis API failed");
    }

    const result = await response.json();

    // 3. Format Markdown Comment
    const commentBody = `
## 🤖 Debugly PR Guard: Analysis Report

### 🔴 What Broke
${result.whatBroke}

### 🧠 Why It Happened
${result.whyHappened}

### 🛠️ Recommended Fix
${result.fixSteps.map(s => `- **${s.id}**: ${s.text}`).join('\n')}

\`\`\`${result.language.toLowerCase()}
${result.codePatch.comment}
${result.codePatch.code}
\`\`\`

> [!TIP]
> **Prevention**: ${result.prevention}
> *Analysis by Debugly AI (Model: ${result.framework || 'Universal'})*
    `;

    // 4. Post Comment to PR
    await octokit.issues.createComment({
      owner,
      repo,
      issue_number: prNumber,
      body: commentBody
    });

    console.log("✅ Analysis posted to PR successfully.");

  } catch (error) {
    console.error("❌ PR Guard Failed:", error.message);
    process.exit(1);
  }
}

run();
