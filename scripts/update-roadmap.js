const fs = require("fs");
const path = require("path");

const README_PATH = path.join(__dirname, "..", "README.md");
const PROJECTS_PATH = path.join(__dirname, "..", "data", "projects.json");
const START_MARKER = "<!-- ROADMAP:START -->";
const END_MARKER = "<!-- ROADMAP:END -->";

const STATUS_LABEL = {
  live: "🟢 Live",
  progress: "🟡 In Development",
  "not-started": "⚪ Upcoming",
};

const LINK_LABELS = [
  ["appStore", "App Store"],
  ["playStore", "Play Store"],
  ["web", "Web"],
  ["repo", "Repo"],
];

function buildLinksAndStatus(project) {
  const status = STATUS_LABEL[project.status] || STATUS_LABEL["not-started"];
  const links = LINK_LABELS.filter(([key]) => project.links && project.links[key]).map(
    ([key, label]) => `[${label}](${project.links[key]})`
  );
  return links.length > 0 ? `${status} · ${links.join(" \\| ")}` : status;
}

function buildRow(project) {
  const month = String(project.month).padStart(2, "0");
  const name = project.name ? `**${project.name}**` : "—";
  const description = project.description || "Building in Public... 🛠️";
  return `| ${month}    | ${name} | ${description} | ${buildLinksAndStatus(project)} |`;
}

function buildTable(projects) {
  const header = [
    "| Month | App Name       | Description                                                                                         | Links & Status                                           |",
    "| ----- | -------------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |",
  ];
  const rows = projects
    .slice()
    .sort((a, b) => a.month - b.month)
    .map(buildRow);
  return [...header, ...rows].join("\n");
}

function main() {
  const readme = fs.readFileSync(README_PATH, "utf8");
  const projects = JSON.parse(fs.readFileSync(PROJECTS_PATH, "utf8"));

  const startIdx = readme.indexOf(START_MARKER);
  const endIdx = readme.indexOf(END_MARKER);

  if (startIdx === -1 || endIdx === -1) {
    console.error("Roadmap markers not found in README.md");
    process.exit(1);
  }

  const table = buildTable(projects);
  const before = readme.slice(0, startIdx + START_MARKER.length);
  const after = readme.slice(endIdx);
  const updated = `${before}\n\n${table}\n\n${after}`;

  if (updated !== readme) {
    fs.writeFileSync(README_PATH, updated);
    console.log(`Updated roadmap table from ${projects.length} projects.`);
  } else {
    console.log("Roadmap table already up to date.");
  }
}

main();
