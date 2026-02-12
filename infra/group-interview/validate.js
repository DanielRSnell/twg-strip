// Validate all 3 workflow JSONs
const test = require("./n8n-workflow-test.json");
const prod = require("./n8n-workflow.json");
const bf = require("./n8n-workflow-backfill.json");

console.log("=== TEST WORKFLOW ===");
const tConfirm = test.nodes.find((n) => n.name === "Confirm Registration");
console.log("To:", tConfirm.parameters.toEmail);
console.log("BCC:", tConfirm.parameters.bccEmail);
console.log("Zoom in confirmation:", tConfirm.parameters.html.includes("zoom.us"));
console.log("Calendar in confirmation:", tConfirm.parameters.html.includes("calendar.google.com"));
// Check all test emails have BCC
const testMailNodes = test.nodes.filter((n) => n.type === "n8n-nodes-base.mailgun");
const allTestBcc = testMailNodes.every((n) => n.parameters.bccEmail === "wattstoworkers@thiswayglobal.com");
console.log(`All ${testMailNodes.length} test emails have BCC:`, allTestBcc);
// No Webhook refs in test
let webhookCount = 0;
test.nodes.forEach((n) => {
  webhookCount += (JSON.stringify(n.parameters || {}).match(/'Webhook'/g) || []).length;
});
console.log("Webhook refs:", webhookCount, webhookCount === 0 ? "(clean)" : "(BAD)");

console.log("\n=== PRODUCTION WORKFLOW ===");
const pConfirm = prod.nodes.find((n) => n.name === "Confirm Registration");
console.log("BCC on confirmation:", pConfirm.parameters.bccEmail);
// Check all candidate-facing emails have BCC
const prodMailNodes = prod.nodes.filter(
  (n) => n.type === "n8n-nodes-base.mailgun" && n.name !== "Notify Team"
);
const allProdBcc = prodMailNodes.every(
  (n) => n.parameters.bccEmail === "wattstoworkers@thiswayglobal.com"
);
console.log(`All ${prodMailNodes.length} candidate emails have BCC:`, allProdBcc);
// Check IF gates exist
const ifNodes = prod.nodes.filter((n) => n.type === "n8n-nodes-base.if");
console.log("IF gate nodes:", ifNodes.length, ifNodes.map((n) => n.name).join(", "));
// Check connections: Save Registration → IF gates
const saveConns = prod.connections["Save Registration"].main[0].map((c) => c.node);
console.log("Save Registration connects to IF gates:",
  saveConns.includes("If >3 Days Away") &&
  saveConns.includes("If >1 Day Away") &&
  saveConns.includes("If >2 Hours Away") &&
  saveConns.includes("If Not Yet Ended")
);
// Logo check across all workflows
const allNodes = [...test.nodes, ...prod.nodes, ...bf.nodes];
const noSvgLogo = allNodes.every((n) => {
  if (!n.parameters || !n.parameters.html) return true;
  return !n.parameters.html.includes("_astro/logo.");
});
console.log("All logos use PNG (no SVG):", noSvgLogo);

console.log("\n=== BACKFILL WORKFLOW ===");
const bfQuery = bf.nodes.find((n) => n.name === "Get Upcoming Registrants");
console.log("Query node exists:", !!bfQuery);
console.log("Query:", bfQuery.parameters.query.substring(0, 80) + "...");
const bfIfNodes = bf.nodes.filter((n) => n.type === "n8n-nodes-base.if");
console.log("IF gates:", bfIfNodes.length, bfIfNodes.map((n) => n.name).join(", "));
const bfMailNodes = bf.nodes.filter((n) => n.type === "n8n-nodes-base.mailgun");
const allBfBcc = bfMailNodes.every((n) => n.parameters.bccEmail === "wattstoworkers@thiswayglobal.com");
console.log(`All ${bfMailNodes.length} backfill emails have BCC:`, allBfBcc);
// No Webhook refs in backfill
let bfWebhookCount = 0;
bf.nodes.forEach((n) => {
  bfWebhookCount += (JSON.stringify(n.parameters || {}).match(/'Webhook'/g) || []).length;
});
console.log("Webhook refs:", bfWebhookCount, bfWebhookCount === 0 ? "(clean)" : "(BAD)");
