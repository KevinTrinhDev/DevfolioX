#!/usr/bin/env node
// scripts/setup.js
// Interactive setup wizard for DevfolioX

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const CONFIG_DIR = path.join(process.cwd(), "config");
const SITE_JSON = path.join(CONFIG_DIR, "site.json");
const THEME_JSON = path.join(CONFIG_DIR, "theme.json");
const ENV_FILE = path.join(process.cwd(), ".env.local");

// ANSI colors
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  red: "\x1b[31m",
};

function log(message, color = "") {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✓ ${message}`, colors.green);
}

function logWarning(message) {
  log(`⚠ ${message}`, colors.yellow);
}

function logError(message) {
  log(`✗ ${message}`, colors.red);
}

function logStep(step, total, message) {
  log(`\n[${step}/${total}] ${message}`, colors.cyan + colors.bright);
}

async function prompt(rl, question, defaultValue = "") {
  const suffix = defaultValue ? ` (${defaultValue})` : "";
  return new Promise((resolve) => {
    rl.question(`${question}${suffix}: `, (answer) => {
      resolve(answer.trim() || defaultValue);
    });
  });
}

async function confirm(rl, question) {
  const answer = await prompt(rl, `${question} (y/n)`, "y");
  return answer.toLowerCase() === "y" || answer.toLowerCase() === "yes";
}

async function selectOption(rl, question, options) {
  log(`\n${question}`);
  options.forEach((opt, i) => {
    log(`  ${i + 1}. ${opt.label}`, colors.dim);
  });
  const answer = await prompt(rl, "Select option", "1");
  const index = parseInt(answer, 10) - 1;
  return options[index]?.value || options[0].value;
}

async function main() {
  log("\n" + "=".repeat(50), colors.blue);
  log("  DevfolioX Setup Wizard", colors.bright + colors.blue);
  log("=".repeat(50) + "\n", colors.blue);
  log("This wizard will help you configure your portfolio.\n");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    // Load existing config
    let siteConfig = {};
    if (fs.existsSync(SITE_JSON)) {
      siteConfig = JSON.parse(fs.readFileSync(SITE_JSON, "utf-8"));
    }

    const totalSteps = 8;
    let step = 0;

    // Step 1: Basic Info
    logStep(++step, totalSteps, "Basic Information");
    const name = await prompt(rl, "Your full name", siteConfig.name || "");
    const title = await prompt(rl, "Your title/role", siteConfig.title || "");
    const location = await prompt(rl, "Your location", siteConfig.location || "");

    // Step 2: Tagline
    logStep(++step, totalSteps, "Tagline");
    const tagline = await prompt(
      rl,
      "Write a short bio/tagline",
      siteConfig.tagline || ""
    );

    // Step 3: Social Links
    logStep(++step, totalSteps, "Social Links");
    log("Enter your social links (press Enter to skip)", colors.dim);
    const github = await prompt(rl, "GitHub username", "");
    const linkedin = await prompt(rl, "LinkedIn profile URL", "");
    const email = await prompt(rl, "Email address", "");
    const twitter = await prompt(rl, "Twitter/X handle", "");

    // Step 4: Theme
    logStep(++step, totalSteps, "Theme Settings");
    const defaultMode = await selectOption(rl, "Default theme:", [
      { label: "Dark (Recommended)", value: "dark" },
      { label: "Light", value: "light" },
      { label: "System preference", value: "system" },
    ]);

    const accentColor = await selectOption(rl, "Accent color:", [
      { label: "Indigo (Default)", value: "indigo" },
      { label: "Emerald", value: "emerald" },
      { label: "Rose", value: "rose" },
      { label: "Amber", value: "amber" },
      { label: "Cyan", value: "cyan" },
      { label: "Violet", value: "violet" },
    ]);

    // Step 5: Sections
    logStep(++step, totalSteps, "Enable Sections");
    const sections = {
      hero: true,
      about: await confirm(rl, "Enable About section?"),
      experience: await confirm(rl, "Enable Experience section?"),
      projects: await confirm(rl, "Enable Projects section?"),
      articles: await confirm(rl, "Enable Articles/Blog section?"),
      contact: await confirm(rl, "Enable Contact form?"),
    };

    // Step 6: Resume
    logStep(++step, totalSteps, "Resume Configuration");
    const hasResume = await confirm(rl, "Do you want to include a resume?");
    let resumeSource = "google";
    let googleDocId = "";
    let resumeFile = "";

    if (hasResume) {
      resumeSource = await selectOption(rl, "Resume source:", [
        { label: "Google Docs (Recommended)", value: "google" },
        { label: "PDF file", value: "file" },
      ]);

      if (resumeSource === "google") {
        googleDocId = await prompt(
          rl,
          "Google Doc ID (from URL)",
          siteConfig.resume?.googleDocId || ""
        );
      } else {
        resumeFile = await prompt(
          rl,
          "Resume filename in /public",
          "resume.pdf"
        );
      }
    }

    // Step 7: Environment Variables
    logStep(++step, totalSteps, "Environment Variables");
    log("These are optional but enable additional features.", colors.dim);
    const githubToken = await prompt(
      rl,
      "GitHub Token (for contributions graph)",
      ""
    );

    // Step 8: Review & Save
    logStep(++step, totalSteps, "Review & Save");
    log("\nConfiguration Summary:", colors.bright);
    log(`  Name: ${name}`);
    log(`  Title: ${title}`);
    log(`  Location: ${location}`);
    log(`  Theme: ${defaultMode}, ${accentColor}`);
    log(`  GitHub: ${github || "(not set)"}`);
    log(`  Resume: ${hasResume ? resumeSource : "disabled"}`);

    const shouldSave = await confirm(rl, "\nSave this configuration?");

    if (shouldSave) {
      // Update site.json
      const updatedSiteConfig = {
        ...siteConfig,
        name,
        title,
        tagline,
        location,
        sections: {
          ...siteConfig.sections,
          ...sections,
        },
        resume: hasResume
          ? {
              source: resumeSource,
              googleDocId: googleDocId || undefined,
              file:
                resumeSource === "file"
                  ? { path: resumeFile, url: "" }
                  : undefined,
              filename: resumeFile || "resume.pdf",
              cacheSeconds: 3600,
            }
          : siteConfig.resume,
      };

      // Update socials
      if (github || linkedin || email || twitter) {
        updatedSiteConfig.socials = updatedSiteConfig.socials || [];
        // This is simplified - in production you'd merge with existing
      }

      fs.writeFileSync(SITE_JSON, JSON.stringify(updatedSiteConfig, null, 2));
      logSuccess("Updated config/site.json");

      // Update theme.json
      const themeConfig = {
        defaultMode,
        allowToggle: true,
        respectSystemPreference: defaultMode === "system",
        accentColor,
        presets: {
          indigo: { accent: "#4f46e5", accentHover: "#4338ca", accentLight: "#818cf8" },
          emerald: { accent: "#10b981", accentHover: "#059669", accentLight: "#34d399" },
          rose: { accent: "#f43f5e", accentHover: "#e11d48", accentLight: "#fb7185" },
          amber: { accent: "#f59e0b", accentHover: "#d97706", accentLight: "#fbbf24" },
          cyan: { accent: "#06b6d4", accentHover: "#0891b2", accentLight: "#22d3ee" },
          violet: { accent: "#8b5cf6", accentHover: "#7c3aed", accentLight: "#a78bfa" },
        },
      };
      fs.writeFileSync(THEME_JSON, JSON.stringify(themeConfig, null, 2));
      logSuccess("Updated config/theme.json");

      // Create/update .env.local
      let envContent = "";
      if (github) {
        envContent += `GITHUB_USERNAME=${github}\n`;
      }
      if (githubToken) {
        envContent += `GITHUB_TOKEN=${githubToken}\n`;
      }
      envContent += `NEXT_PUBLIC_BASE_URL=http://localhost:3000\n`;
      envContent += `# Add other env vars as needed\n`;

      if (envContent) {
        fs.writeFileSync(ENV_FILE, envContent);
        logSuccess("Created .env.local");
      }

      log("\n" + "=".repeat(50), colors.green);
      log("  Setup Complete!", colors.bright + colors.green);
      log("=".repeat(50), colors.green);
      log("\nNext steps:");
      log("  1. Run: npm install", colors.dim);
      log("  2. Run: npm run dev", colors.dim);
      log("  3. Open: http://localhost:3000", colors.dim);
    } else {
      logWarning("Setup cancelled. No files were modified.");
    }
  } catch (error) {
    logError(`Setup failed: ${error.message}`);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();
