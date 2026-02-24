#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "emails");

const html = (name) =>
  fs
    .readFileSync(path.join(dir, name), "utf-8")
    .replace(/\r?\n/g, "")
    .replace(/\t/g, "")
    .trim();

// Read compiled HTML templates
const ttcAdmin = html("texas-tech-compute-admin.html");
const ttcConfirm = html("texas-tech-compute-confirm.html");
const w4wAdmin = html("watts-for-workers-admin.html");
const w4wConfirm = html("watts-for-workers-confirm.html");

// Credentials
const mailgunCred = {
  mailgunApi: { id: "lHQnhWsSULcKXB4f", name: "Amalgamy.ai" },
};
const pgCred = { postgres: { id: "qYLP1qqStnwaPbh4", name: "TWG | PG" } };
const from = "notifications@m.thiswayglobal.com";

// Admin recipients
const adminTo = "daniel.snell@thiswayglobal.com";
const adminCc = "courtney.gwynn@thiswayglobal.com";

// Helper: rewrite n8n expressions from Validate Input to Set Test Data
const rewriteHtml = (h) =>
  h.replace(
    /\$\('Validate Input'\)\.item\.json\.data\./g,
    "$('Set Test Data').item.json."
  );

// --- Production workflow ---
const workflow = {
  name: "Generic Form Submissions",
  active: true,
  settings: {
    executionOrder: "v1",
  },
  tags: [],
  nodes: [
    // --- Sticky Note ---
    {
      parameters: {
        content:
          "## Generic Form Submissions Workflow\n\nAccepts POST requests at `/webhook/forms` with payload:\n```json\n{ \"form_type\": \"some-form\", \"data\": { ... } }\n```\n\nInserts into the `form_submissions` table with JSONB data column.\n\n### Email Notifications\nAfter insert, routes by `form_type` to send:\n- **Admin notification** to daniel.snell@ (cc: courtney.gwynn@)\n- **User confirmation** to the submitter's email\n\nSupported forms: `texas-tech-compute`, `watts-for-workers`\n\n### Editing Emails\nEdit the `.mjml` source files in `emails/`, then run:\n```\ncd emails && for f in *.mjml; do [[ \"$f\" == _* ]] && continue; mjml \"$f\" -o \"${f%.mjml}.html\" --config.minify true; done\n```\nThen run `node build-workflow.js` to regenerate this workflow JSON.",
      },
      id: "00000000-0000-0000-0000-000000000001",
      name: "Notes",
      type: "n8n-nodes-base.stickyNote",
      typeVersion: 1,
      position: [-192, 640],
    },
    // --- Webhook ---
    {
      parameters: {
        httpMethod: "POST",
        path: "forms",
        responseMode: "responseNode",
        options: {
          responseHeaders: {
            entries: [
              {
                name: "Access-Control-Allow-Origin",
                value: "*",
              },
            ],
          },
        },
      },
      id: "a1b2c3d4-0001-0001-0001-000000000001",
      name: "Webhook",
      type: "n8n-nodes-base.webhook",
      typeVersion: 1.1,
      position: [-192, 1040],
      webhookId: "forms",
    },
    // --- Validate Input ---
    {
      parameters: {
        jsCode: `const body = $input.first().json.body;\n\nif (!body.form_type || typeof body.form_type !== 'string' || body.form_type.trim() === '') {\n  return [{ json: { valid: false, message: 'Missing or invalid form_type' } }];\n}\n\nif (!body.data || typeof body.data !== 'object' || Array.isArray(body.data)) {\n  return [{ json: { valid: false, message: 'Missing or invalid data object' } }];\n}\n\nreturn [{ json: { valid: true, form_type: body.form_type.trim(), data: body.data } }];`,
      },
      id: "a1b2c3d4-0001-0001-0001-000000000002",
      name: "Validate Input",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: [28, 1040],
    },
    // --- Route (valid/invalid) ---
    {
      parameters: {
        rules: {
          values: [
            {
              conditions: {
                options: {
                  caseSensitive: false,
                  leftValue: "",
                  typeValidation: "loose",
                },
                conditions: [
                  {
                    leftValue: "={{ $json.valid }}",
                    rightValue: true,
                    operator: {
                      type: "boolean",
                      operation: "equals",
                    },
                  },
                ],
                combinator: "and",
              },
              renameOutput: true,
              outputKey: "valid",
            },
            {
              conditions: {
                options: {
                  caseSensitive: false,
                  leftValue: "",
                  typeValidation: "loose",
                },
                conditions: [
                  {
                    leftValue: "={{ $json.valid }}",
                    rightValue: false,
                    operator: {
                      type: "boolean",
                      operation: "equals",
                    },
                  },
                ],
                combinator: "and",
              },
              renameOutput: true,
              outputKey: "invalid",
            },
          ],
        },
        options: {},
      },
      id: "a1b2c3d4-0001-0001-0001-000000000003",
      name: "Route",
      type: "n8n-nodes-base.switch",
      typeVersion: 3,
      position: [248, 1040],
    },
    // --- Insert Submission ---
    {
      parameters: {
        operation: "executeQuery",
        query:
          "INSERT INTO form_submissions (form_type, data) VALUES ($1, $2::jsonb) RETURNING id, form_type, created_at",
        options: {
          queryReplacement:
            "={{ $json.form_type }},={{ JSON.stringify($json.data) }}",
        },
      },
      id: "a1b2c3d4-0001-0001-0001-000000000004",
      name: "Insert Submission",
      type: "n8n-nodes-base.postgres",
      typeVersion: 2.5,
      position: [468, 940],
      credentials: pgCred,
    },
    // --- Success Response ---
    {
      parameters: {
        respondWith: "json",
        responseBody:
          "={{ JSON.stringify({ success: true, id: $json.id }) }}",
        options: {
          responseCode: 200,
          responseHeaders: {
            entries: [
              {
                name: "Access-Control-Allow-Origin",
                value: "*",
              },
            ],
          },
        },
      },
      id: "a1b2c3d4-0001-0001-0001-000000000005",
      name: "Success Response",
      type: "n8n-nodes-base.respondToWebhook",
      typeVersion: 1.1,
      position: [688, 940],
    },
    // --- Error Response ---
    {
      parameters: {
        respondWith: "json",
        responseBody:
          "={{ JSON.stringify({ success: false, message: $json.message || 'Validation failed' }) }}",
        options: {
          responseCode: 400,
          responseHeaders: {
            entries: [
              {
                name: "Access-Control-Allow-Origin",
                value: "*",
              },
            ],
          },
        },
      },
      id: "a1b2c3d4-0001-0001-0001-000000000006",
      name: "Error Response",
      type: "n8n-nodes-base.respondToWebhook",
      typeVersion: 1.1,
      position: [468, 1140],
    },
    // --- Switch on Form Type ---
    {
      parameters: {
        rules: {
          values: [
            {
              conditions: {
                options: {
                  caseSensitive: false,
                  leftValue: "",
                  typeValidation: "loose",
                },
                conditions: [
                  {
                    leftValue:
                      "={{ $('Validate Input').item.json.form_type }}",
                    rightValue: "texas-tech-compute",
                    operator: {
                      type: "string",
                      operation: "equals",
                    },
                  },
                ],
                combinator: "and",
              },
              renameOutput: true,
              outputKey: "texas-tech-compute",
            },
            {
              conditions: {
                options: {
                  caseSensitive: false,
                  leftValue: "",
                  typeValidation: "loose",
                },
                conditions: [
                  {
                    leftValue:
                      "={{ $('Validate Input').item.json.form_type }}",
                    rightValue: "watts-for-workers",
                    operator: {
                      type: "string",
                      operation: "equals",
                    },
                  },
                ],
                combinator: "and",
              },
              renameOutput: true,
              outputKey: "watts-for-workers",
            },
          ],
        },
        options: {},
      },
      id: "a1b2c3d4-0001-0001-0001-000000000010",
      name: "Switch on Form Type",
      type: "n8n-nodes-base.switch",
      typeVersion: 3,
      position: [688, 1140],
    },
    // --- TTC: Notify Admin ---
    {
      parameters: {
        fromEmail: from,
        toEmail: adminTo,
        ccEmail: adminCc,
        subject: `=New Compute Inquiry: {{ $('Validate Input').item.json.data.first_name }} {{ $('Validate Input').item.json.data.last_name }}`,
        html: "=" + ttcAdmin,
      },
      type: "n8n-nodes-base.mailgun",
      typeVersion: 1,
      position: [928, 1040],
      id: "a1b2c3d4-0001-0001-0001-000000000011",
      name: "TTC: Notify Admin",
      credentials: mailgunCred,
    },
    // --- TTC: Confirm User ---
    {
      parameters: {
        fromEmail: from,
        toEmail: `={{ $('Validate Input').item.json.data.email }}`,
        subject: "=Thank You for Your Inquiry",
        html: "=" + ttcConfirm,
      },
      type: "n8n-nodes-base.mailgun",
      typeVersion: 1,
      position: [928, 1140],
      id: "a1b2c3d4-0001-0001-0001-000000000012",
      name: "TTC: Confirm User",
      credentials: mailgunCred,
    },
    // --- W4W: Notify Admin ---
    {
      parameters: {
        fromEmail: from,
        toEmail: adminTo,
        ccEmail: adminCc,
        subject: `=New WattsForWorkers Interest: {{ $('Validate Input').item.json.data.first_name }} {{ $('Validate Input').item.json.data.last_name }}`,
        html: "=" + w4wAdmin,
      },
      type: "n8n-nodes-base.mailgun",
      typeVersion: 1,
      position: [928, 1300],
      id: "a1b2c3d4-0001-0001-0001-000000000013",
      name: "W4W: Notify Admin",
      credentials: mailgunCred,
    },
    // --- W4W: Confirm User ---
    {
      parameters: {
        fromEmail: from,
        toEmail: `={{ $('Validate Input').item.json.data.email }}`,
        subject: "=Thank You for Your Interest",
        html: "=" + w4wConfirm,
      },
      type: "n8n-nodes-base.mailgun",
      typeVersion: 1,
      position: [928, 1400],
      id: "a1b2c3d4-0001-0001-0001-000000000014",
      name: "W4W: Confirm User",
      credentials: mailgunCred,
    },
  ],
  connections: {
    Webhook: {
      main: [
        [{ node: "Validate Input", type: "main", index: 0 }],
      ],
    },
    "Validate Input": {
      main: [
        [{ node: "Route", type: "main", index: 0 }],
      ],
    },
    Route: {
      main: [
        // Output 0: valid
        [{ node: "Insert Submission", type: "main", index: 0 }],
        // Output 1: invalid
        [{ node: "Error Response", type: "main", index: 0 }],
      ],
    },
    "Insert Submission": {
      main: [
        [
          { node: "Success Response", type: "main", index: 0 },
          { node: "Switch on Form Type", type: "main", index: 0 },
        ],
      ],
    },
    "Switch on Form Type": {
      main: [
        // Output 0: texas-tech-compute
        [
          { node: "TTC: Notify Admin", type: "main", index: 0 },
          { node: "TTC: Confirm User", type: "main", index: 0 },
        ],
        // Output 1: watts-for-workers
        [
          { node: "W4W: Notify Admin", type: "main", index: 0 },
          { node: "W4W: Confirm User", type: "main", index: 0 },
        ],
      ],
    },
  },
  pinData: {},
};

const out = path.join(__dirname, "n8n-workflow.json");
fs.writeFileSync(out, JSON.stringify(workflow, null, 2));
console.log(`Wrote ${out} (${(fs.statSync(out).size / 1024).toFixed(1)} KB)`);

// --- Test workflow: manual trigger, all emails to test recipient, mock data ---
const testTo = "drsnell711@gmail.com";

const testWorkflow = {
  name: "TEST - Generic Form Emails",
  active: false,
  settings: { executionOrder: "v1" },
  tags: [],
  nodes: [
    {
      parameters: {},
      id: "t0000000-0000-0000-0001-000000000001",
      name: "Manual Trigger",
      type: "n8n-nodes-base.manualTrigger",
      typeVersion: 1,
      position: [-192, 1040],
    },
    // Set test data with union of all fields from both forms
    {
      parameters: {
        mode: "manual",
        duplicateItem: false,
        assignments: {
          assignments: [
            { id: "a1", name: "first_name", value: "Daniel", type: "string" },
            { id: "a2", name: "last_name", value: "Snell", type: "string" },
            { id: "a3", name: "email", value: testTo, type: "string" },
            { id: "a4", name: "company", value: "Acme Corp", type: "string" },
            {
              id: "a5",
              name: "title",
              value: "VP of Engineering",
              type: "string",
            },
            {
              id: "a6",
              name: "urgency",
              value: "Within 30 days",
              type: "string",
            },
            {
              id: "a7",
              name: "note",
              value:
                "Looking for GPU cluster access for ML training workloads.",
              type: "string",
            },
            {
              id: "a8",
              name: "phone",
              value: "512-555-1234",
              type: "string",
            },
            {
              id: "a9",
              name: "role_interest",
              value: "AI Software Installer",
              type: "string",
            },
            {
              id: "a10",
              name: "message",
              value:
                "I have 3 years of experience in data center operations and am interested in transitioning to AI infrastructure roles.",
              type: "string",
            },
          ],
        },
        options: {},
      },
      id: "t0000000-0000-0000-0001-000000000002",
      name: "Set Test Data",
      type: "n8n-nodes-base.set",
      typeVersion: 3.4,
      position: [32, 1040],
    },
    // TTC: Notify Admin
    {
      parameters: {
        fromEmail: from,
        toEmail: testTo,
        subject: `=[TEST] New Compute Inquiry: {{ $('Set Test Data').item.json.first_name }} {{ $('Set Test Data').item.json.last_name }}`,
        html: "=" + rewriteHtml(ttcAdmin),
      },
      type: "n8n-nodes-base.mailgun",
      typeVersion: 1,
      position: [280, 840],
      id: "t0000000-0000-0000-0001-000000000003",
      name: "TTC: Notify Admin",
      credentials: mailgunCred,
    },
    // TTC: Confirm User
    {
      parameters: {
        fromEmail: from,
        toEmail: testTo,
        subject: "=[TEST] Thank You for Your Inquiry",
        html: "=" + rewriteHtml(ttcConfirm),
      },
      type: "n8n-nodes-base.mailgun",
      typeVersion: 1,
      position: [280, 940],
      id: "t0000000-0000-0000-0001-000000000004",
      name: "TTC: Confirm User",
      credentials: mailgunCred,
    },
    // W4W: Notify Admin
    {
      parameters: {
        fromEmail: from,
        toEmail: testTo,
        subject: `=[TEST] New WattsForWorkers Interest: {{ $('Set Test Data').item.json.first_name }} {{ $('Set Test Data').item.json.last_name }}`,
        html: "=" + rewriteHtml(w4wAdmin),
      },
      type: "n8n-nodes-base.mailgun",
      typeVersion: 1,
      position: [280, 1040],
      id: "t0000000-0000-0000-0001-000000000005",
      name: "W4W: Notify Admin",
      credentials: mailgunCred,
    },
    // W4W: Confirm User
    {
      parameters: {
        fromEmail: from,
        toEmail: testTo,
        subject: "=[TEST] Thank You for Your Interest",
        html: "=" + rewriteHtml(w4wConfirm),
      },
      type: "n8n-nodes-base.mailgun",
      typeVersion: 1,
      position: [280, 1140],
      id: "t0000000-0000-0000-0001-000000000006",
      name: "W4W: Confirm User",
      credentials: mailgunCred,
    },
  ],
  connections: {
    "Manual Trigger": {
      main: [[{ node: "Set Test Data", type: "main", index: 0 }]],
    },
    "Set Test Data": {
      main: [
        [
          { node: "TTC: Notify Admin", type: "main", index: 0 },
          { node: "TTC: Confirm User", type: "main", index: 0 },
          { node: "W4W: Notify Admin", type: "main", index: 0 },
          { node: "W4W: Confirm User", type: "main", index: 0 },
        ],
      ],
    },
  },
  pinData: {},
  meta: {
    templateCredsSetupCompleted: true,
    instanceId:
      "6abfb47bea51a6f610a03c2f772741bc5d6bf3fa9900a4ec5d91227cefde6c68",
  },
};

const testOut = path.join(__dirname, "n8n-workflow-test.json");
fs.writeFileSync(testOut, JSON.stringify(testWorkflow, null, 2));
console.log(
  `Wrote ${testOut} (${(fs.statSync(testOut).size / 1024).toFixed(1)} KB)`
);
