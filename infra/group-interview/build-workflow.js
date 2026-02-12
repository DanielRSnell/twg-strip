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

// Calendar URL n8n expressions (use string ops to avoid quote issues in HTML attrs)
// Webhook path: $('Webhook').item.json.body.interview_date
// Set Test Data path: $('Set Test Data').item.json.interview_date
const dateRef = (node) =>
  node === "Webhook"
    ? `$('Webhook').item.json.body.interview_date`
    : `$('${node}').item.json.interview_date`;
const zoomLink = "https://us02web.zoom.us/j/88151751115?pwd=k1wvAbCpQ3fN5FHarOgY0W1dtd5Agb.1";
const calDetails = encodeURIComponent(
  `Group Interview with ThisWay Global\n\nJoin Zoom Meeting:\n${zoomLink}\n\nPlease be ready to join at your scheduled time.`
);
const calGoogle = (node) =>
  `{{ 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=Group%20Interview%20-%20ThisWay%20Global&dates=' + DateTime.fromISO(${dateRef(node)}).toUTC().toISO().replace(/[-:]/g, '').replace(/\\.\\d+Z$/, 'Z') + '/' + DateTime.fromISO(${dateRef(node)}).plus({minutes:30}).toUTC().toISO().replace(/[-:]/g, '').replace(/\\.\\d+Z$/, 'Z') + '&details=${calDetails}&location=${encodeURIComponent(zoomLink)}' }}`;
const calOutlook = (node) =>
  `{{ 'https://outlook.live.com/calendar/0/action/compose?subject=Group%20Interview%20-%20ThisWay%20Global&startdt=' + DateTime.fromISO(${dateRef(node)}).toUTC().toISO() + '&enddt=' + DateTime.fromISO(${dateRef(node)}).plus({minutes:30}).toUTC().toISO() + '&body=${calDetails}&location=${encodeURIComponent(zoomLink)}' }}`;

// Read compiled HTML and inject calendar URLs
const htmlRaw = (name) =>
  fs
    .readFileSync(path.join(dir, name), "utf-8")
    .replace(/\r?\n/g, "")
    .replace(/\t/g, "")
    .trim();

const injectCalendar = (h, node) =>
  h
    .replace(/CALENDAR_GOOGLE_URL/g, calGoogle(node))
    .replace(/CALENDAR_OUTLOOK_URL/g, calOutlook(node));

const confirm = injectCalendar(htmlRaw("01-confirm-registration.html"), "Webhook");
const notify = htmlRaw("02-notify-team.html");
const rem3d = htmlRaw("03-reminder-3-days.html");
const rem1d = htmlRaw("04-reminder-1-day.html");
const remSoon = htmlRaw("05-reminder-starting-soon.html");
const postInterview = htmlRaw("06-post-interview.html");

const mailgunCred = {
  mailgunApi: { id: "lHQnhWsSULcKXB4f", name: "Amalgamy.ai" },
};
const pgCred = { postgres: { id: "qYLP1qqStnwaPbh4", name: "TWG | PG" } };
const from = "notifications@m.thiswayglobal.com";

const workflow = {
  name: "Group Interview Registration",
  active: true,
  settings: {
    executionOrder: "v1",
  },
  tags: [],
  nodes: [
    {
      parameters: {
        content:
          "## Group Interview Workflow\n\n### Email Sequence\n1. **Confirm Registration** — immediate confirmation to candidate\n2. **Notify Team** — internal alert to wattstoworkers@thiswayglobal.com\n3. **Reminder: 3 Days** — sent 3 days before interview\n4. **Reminder: 1 Day** — sent 1 day before interview\n5. **Reminder: Starting Soon** — sent 2 hours before interview\n6. **Post-Interview Follow-up** — sent 90 min after interview start\n\n### Setup Required\n- **Mailgun credential**: Ensure `m.thiswayglobal.com` is a verified sending domain in the Mailgun account\n- **Reply-To**: Configure default Reply-To as `wattstoworkers@thiswayglobal.com` in Mailgun domain settings for `m.thiswayglobal.com`\n- **Interview Link**: Update the link in MJML templates + recompile if a dedicated interview-join page exists (currently points to `/group-interview`)\n\n### Editing Emails\nEdit the `.mjml` source files in `emails/`, then run:\n```\ncd emails && for f in 0*.mjml; do mjml \"$f\" -o \"${f%.mjml}.html\" --config.minify true; done\n```\nThen run `node build-workflow.js` to regenerate this workflow JSON.",
      },
      id: "00000000-0000-0000-0000-000000000000",
      name: "Setup Notes",
      type: "n8n-nodes-base.stickyNote",
      typeVersion: 1,
      position: [-192, 640],
    },
    {
      parameters: {
        httpMethod: "POST",
        path: "group-interview",
        responseMode: "responseNode",
        options: {},
      },
      id: "47cfba9c-0390-40c1-ac6d-a81fc7006e60",
      name: "Webhook",
      type: "n8n-nodes-base.webhook",
      typeVersion: 1.1,
      position: [-192, 1040],
      webhookId: "group-interview",
    },
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
                    leftValue: "={{ $json.body.action }}",
                    rightValue: "check",
                    operator: { type: "string", operation: "equals" },
                  },
                ],
                combinator: "and",
              },
              renameOutput: true,
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
                    leftValue: "={{ $json.body.action }}",
                    rightValue: "save",
                    operator: { type: "string", operation: "equals" },
                  },
                ],
                combinator: "and",
              },
              renameOutput: true,
            },
          ],
        },
        options: {},
      },
      id: "d59ef1cd-c65e-42da-8f10-8d33d8d1dedf",
      name: "Route Action",
      type: "n8n-nodes-base.switch",
      typeVersion: 3,
      position: [32, 1040],
    },
    {
      parameters: {
        operation: "executeQuery",
        query:
          "SELECT COUNT(*)::int as count FROM group_interview_registrations WHERE interview_date = '{{ $json.body.interview_date }}'",
        options: {},
      },
      id: "cd473a4a-544f-4bae-ac1b-8dd11c5c6049",
      name: "Count Registrations",
      type: "n8n-nodes-base.postgres",
      typeVersion: 2.3,
      position: [256, 840],
      credentials: pgCred,
    },
    {
      parameters: {
        respondWith: "json",
        responseBody:
          "={{ JSON.stringify({ available: (100 - $json.count), total: 100, registered: $json.count, is_available: $json.count < 100 }) }}",
        options: {},
      },
      id: "571d3ca5-6cbe-4e80-a314-cb7878d909a5",
      name: "Respond Availability",
      type: "n8n-nodes-base.respondToWebhook",
      typeVersion: 1,
      position: [480, 840],
    },
    {
      parameters: {
        operation: "executeQuery",
        query:
          "INSERT INTO group_interview_registrations (first_name, last_name, email, phone, interview_date, interview_label, role) VALUES ('{{ $json.body.first_name }}', '{{ $json.body.last_name }}', '{{ $json.body.email }}', '{{ $json.body.phone }}', '{{ $json.body.interview_date }}', '{{ $json.body.interview_label }}', '{{ $json.body.role }}') ON CONFLICT (email, interview_date) DO NOTHING RETURNING id",
        options: {},
      },
      id: "2418eccc-09ee-4baf-8ca2-0794b73df592",
      name: "Save Registration",
      type: "n8n-nodes-base.postgres",
      typeVersion: 2.3,
      position: [256, 1040],
      credentials: pgCred,
    },
    {
      parameters: {
        respondWith: "json",
        responseBody:
          "={{ JSON.stringify({ success: true, message: 'Registration saved successfully' }) }}",
        options: {},
      },
      id: "2aa6a854-93f7-4b5b-9e5c-2a49b98c4d1e",
      name: "Respond Success",
      type: "n8n-nodes-base.respondToWebhook",
      typeVersion: 1,
      position: [480, 940],
    },
    // --- Internal notification ---
    {
      parameters: {
        fromEmail: from,
        toEmail: "wattstoworkers@thiswayglobal.com",
        ccEmail: "daniel.snell@thiswayglobal.com",
        subject:
          "=New Group Interview Sign-up: {{ $('Webhook').item.json.body.first_name }} {{ $('Webhook').item.json.body.last_name }}",
        html: "=" + notify,
      },
      type: "n8n-nodes-base.mailgun",
      typeVersion: 1,
      position: [480, 1040],
      id: "9e2540bf-6c10-4d3d-b3ef-e8ec0d545a09",
      name: "Notify Team",
      credentials: mailgunCred,
    },
    // --- Confirmation email to user ---
    {
      parameters: {
        fromEmail: from,
        toEmail: "={{ $('Webhook').item.json.body.email }}",
        bccEmail: "wattstoworkers@thiswayglobal.com",
        subject:
          "=Interview Registration Confirmed - {{ $('Webhook').item.json.body.interview_label }}",
        html: "=" + confirm,
      },
      type: "n8n-nodes-base.mailgun",
      typeVersion: 1,
      position: [480, 1140],
      id: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
      name: "Confirm Registration",
      credentials: mailgunCred,
    },
    // --- Gate: 3 days before (only if interview is > 3 days away) ---
    {
      parameters: {
        conditions: {
          options: { caseSensitive: true, leftValue: "", typeValidation: "strict" },
          conditions: [
            {
              id: "g3d",
              leftValue: "={{ DateTime.fromISO($('Webhook').item.json.body.interview_date).minus({days: 3}).toMillis() }}",
              rightValue: "={{ DateTime.now().toMillis() }}",
              operator: { type: "number", operation: "gt" },
            },
          ],
          combinator: "and",
        },
        options: {},
      },
      id: "g0000000-0000-0000-0000-000000000001",
      name: "If >3 Days Away",
      type: "n8n-nodes-base.if",
      typeVersion: 2,
      position: [480, 1340],
    },
    {
      parameters: {
        resume: "specificTime",
        dateTime:
          "={{ DateTime.fromISO($('Webhook').item.json.body.interview_date).minus({days: 3}).toISO() }}",
      },
      id: "b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e",
      name: "Wait 3 Days Before",
      type: "n8n-nodes-base.wait",
      typeVersion: 1.1,
      position: [720, 1300],
    },
    {
      parameters: {
        fromEmail: from,
        toEmail: "={{ $('Webhook').item.json.body.email }}",
        bccEmail: "wattstoworkers@thiswayglobal.com",
        subject: "=Reminder: Your Interview with ThisWay Global",
        html: "=" + rem3d,
      },
      type: "n8n-nodes-base.mailgun",
      typeVersion: 1,
      position: [960, 1300],
      id: "c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f",
      name: "Reminder: 3 Days",
      credentials: mailgunCred,
    },
    // --- Gate: 1 day before (only if interview is > 1 day away) ---
    {
      parameters: {
        conditions: {
          options: { caseSensitive: true, leftValue: "", typeValidation: "strict" },
          conditions: [
            {
              id: "g1d",
              leftValue: "={{ DateTime.fromISO($('Webhook').item.json.body.interview_date).minus({days: 1}).toMillis() }}",
              rightValue: "={{ DateTime.now().toMillis() }}",
              operator: { type: "number", operation: "gt" },
            },
          ],
          combinator: "and",
        },
        options: {},
      },
      id: "g0000000-0000-0000-0000-000000000002",
      name: "If >1 Day Away",
      type: "n8n-nodes-base.if",
      typeVersion: 2,
      position: [480, 1540],
    },
    {
      parameters: {
        resume: "specificTime",
        dateTime:
          "={{ DateTime.fromISO($('Webhook').item.json.body.interview_date).minus({days: 1}).toISO() }}",
      },
      id: "d4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a",
      name: "Wait 1 Day Before",
      type: "n8n-nodes-base.wait",
      typeVersion: 1.1,
      position: [720, 1500],
    },
    {
      parameters: {
        fromEmail: from,
        toEmail: "={{ $('Webhook').item.json.body.email }}",
        bccEmail: "wattstoworkers@thiswayglobal.com",
        subject: "=Tomorrow: Your Group Interview with ThisWay Global",
        html: "=" + rem1d,
      },
      type: "n8n-nodes-base.mailgun",
      typeVersion: 1,
      position: [960, 1500],
      id: "e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b",
      name: "Reminder: 1 Day",
      credentials: mailgunCred,
    },
    // --- Gate: 2 hours before (only if interview is > 2 hours away) ---
    {
      parameters: {
        conditions: {
          options: { caseSensitive: true, leftValue: "", typeValidation: "strict" },
          conditions: [
            {
              id: "g2h",
              leftValue: "={{ DateTime.fromISO($('Webhook').item.json.body.interview_date).minus({hours: 2}).toMillis() }}",
              rightValue: "={{ DateTime.now().toMillis() }}",
              operator: { type: "number", operation: "gt" },
            },
          ],
          combinator: "and",
        },
        options: {},
      },
      id: "g0000000-0000-0000-0000-000000000003",
      name: "If >2 Hours Away",
      type: "n8n-nodes-base.if",
      typeVersion: 2,
      position: [480, 1740],
    },
    {
      parameters: {
        resume: "specificTime",
        dateTime:
          "={{ DateTime.fromISO($('Webhook').item.json.body.interview_date).minus({hours: 2}).toISO() }}",
      },
      id: "f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c",
      name: "Wait 2 Hours Before",
      type: "n8n-nodes-base.wait",
      typeVersion: 1.1,
      position: [720, 1700],
    },
    {
      parameters: {
        fromEmail: from,
        toEmail: "={{ $('Webhook').item.json.body.email }}",
        bccEmail: "wattstoworkers@thiswayglobal.com",
        subject: "=Starting Soon: Your Interview with ThisWay Global",
        html: "=" + remSoon,
      },
      type: "n8n-nodes-base.mailgun",
      typeVersion: 1,
      position: [960, 1700],
      id: "a7b8c9d0-e1f2-4a3b-4c5d-6e7f8a9b0c1d",
      name: "Reminder: Starting Soon",
      credentials: mailgunCred,
    },
    // --- Gate: post-interview (only if interview hasn't ended yet) ---
    {
      parameters: {
        conditions: {
          options: { caseSensitive: true, leftValue: "", typeValidation: "strict" },
          conditions: [
            {
              id: "gpi",
              leftValue: "={{ DateTime.fromISO($('Webhook').item.json.body.interview_date).plus({minutes: 90}).toMillis() }}",
              rightValue: "={{ DateTime.now().toMillis() }}",
              operator: { type: "number", operation: "gt" },
            },
          ],
          combinator: "and",
        },
        options: {},
      },
      id: "g0000000-0000-0000-0000-000000000004",
      name: "If Not Yet Ended",
      type: "n8n-nodes-base.if",
      typeVersion: 2,
      position: [480, 1940],
    },
    {
      parameters: {
        resume: "specificTime",
        dateTime:
          "={{ DateTime.fromISO($('Webhook').item.json.body.interview_date).plus({minutes: 90}).toISO() }}",
      },
      id: "b8c9d0e1-f2a3-4b4c-5d6e-7f8a9b0c1d2e",
      name: "Wait Post-Interview",
      type: "n8n-nodes-base.wait",
      typeVersion: 1.1,
      position: [720, 1900],
    },
    {
      parameters: {
        fromEmail: from,
        toEmail: "={{ $('Webhook').item.json.body.email }}",
        bccEmail: "wattstoworkers@thiswayglobal.com",
        subject: "=Thank You for Your Interview - Share Your Feedback",
        html: "=" + postInterview,
      },
      type: "n8n-nodes-base.mailgun",
      typeVersion: 1,
      position: [960, 1900],
      id: "c9d0e1f2-a3b4-4c5d-6e7f-8a9b0c1d2e3f",
      name: "Follow-up: Rate or Reschedule",
      credentials: mailgunCred,
    },
  ],
  connections: {
    Webhook: {
      main: [
        [{ node: "Route Action", type: "main", index: 0 }],
      ],
    },
    "Route Action": {
      main: [
        [{ node: "Count Registrations", type: "main", index: 0 }],
        [{ node: "Save Registration", type: "main", index: 0 }],
      ],
    },
    "Count Registrations": {
      main: [
        [{ node: "Respond Availability", type: "main", index: 0 }],
      ],
    },
    "Save Registration": {
      main: [
        [
          { node: "Respond Success", type: "main", index: 0 },
          { node: "Notify Team", type: "main", index: 0 },
          { node: "Confirm Registration", type: "main", index: 0 },
          { node: "If >3 Days Away", type: "main", index: 0 },
          { node: "If >1 Day Away", type: "main", index: 0 },
          { node: "If >2 Hours Away", type: "main", index: 0 },
          { node: "If Not Yet Ended", type: "main", index: 0 },
        ],
      ],
    },
    // IF true → Wait → Send; IF false → skip (no connection needed)
    "If >3 Days Away": {
      main: [
        [{ node: "Wait 3 Days Before", type: "main", index: 0 }],
        [], // false branch — do nothing
      ],
    },
    "Wait 3 Days Before": {
      main: [[{ node: "Reminder: 3 Days", type: "main", index: 0 }]],
    },
    "If >1 Day Away": {
      main: [
        [{ node: "Wait 1 Day Before", type: "main", index: 0 }],
        [],
      ],
    },
    "Wait 1 Day Before": {
      main: [[{ node: "Reminder: 1 Day", type: "main", index: 0 }]],
    },
    "If >2 Hours Away": {
      main: [
        [{ node: "Wait 2 Hours Before", type: "main", index: 0 }],
        [],
      ],
    },
    "Wait 2 Hours Before": {
      main: [
        [{ node: "Reminder: Starting Soon", type: "main", index: 0 }],
      ],
    },
    "If Not Yet Ended": {
      main: [
        [{ node: "Wait Post-Interview", type: "main", index: 0 }],
        [],
      ],
    },
    "Wait Post-Interview": {
      main: [
        [{ node: "Follow-up: Rate or Reschedule", type: "main", index: 0 }],
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

const out = path.join(__dirname, "n8n-workflow.json");
fs.writeFileSync(out, JSON.stringify(workflow, null, 2));
console.log(`Wrote ${out} (${(fs.statSync(out).size / 1024).toFixed(1)} KB)`);

// --- Test workflow: manual trigger, all emails to test recipient, no waits ---
const testTo = "courtney.gwynn@thiswayglobal.com";
const testBcc = "wattstoworkers@thiswayglobal.com";

// Build test confirmation with calendar URLs pointing to Set Test Data
const testConfirm = injectCalendar(
  htmlRaw("01-confirm-registration.html"),
  "Set Test Data"
);

// Helper: rewrite all n8n expressions referencing Webhook body to use Set Test Data node
const rewriteHtml = (h) =>
  h.replace(/\$\('Webhook'\)\.item\.json\.body\./g, "$('Set Test Data').item.json.");

const testWorkflow = {
  name: "TEST - Group Interview Emails",
  active: false,
  settings: { executionOrder: "v1" },
  tags: [],
  nodes: [
    {
      parameters: {},
      id: "t0000000-0000-0000-0000-000000000001",
      name: "Manual Trigger",
      type: "n8n-nodes-base.manualTrigger",
      typeVersion: 1,
      position: [-192, 1040],
    },
    {
      parameters: {
        mode: "manual",
        duplicateItem: false,
        assignments: {
          assignments: [
            { id: "a1", name: "first_name", value: "Daniel", type: "string" },
            { id: "a2", name: "last_name", value: "Snell", type: "string" },
            { id: "a3", name: "email", value: testTo, type: "string" },
            { id: "a4", name: "phone", value: "5125551234", type: "string" },
            {
              id: "a5",
              name: "interview_date",
              value: "2026-02-15T16:00:00.000Z",
              type: "string",
            },
            {
              id: "a6",
              name: "interview_label",
              value: "Friday, Feb 15 - 10:00\u201310:30 AM CT",
              type: "string",
            },
            {
              id: "a7",
              name: "role",
              value: "AI Software Installer",
              type: "string",
            },
          ],
        },
        options: {},
      },
      id: "t0000000-0000-0000-0000-000000000002",
      name: "Set Test Data",
      type: "n8n-nodes-base.set",
      typeVersion: 3.4,
      position: [32, 1040],
    },
    // Confirm Registration (uses testConfirm with calendar URLs for Set Test Data)
    {
      parameters: {
        fromEmail: from,
        toEmail: testTo,
        bccEmail: testBcc,
        subject:
          "=[TEST] Interview Registration Confirmed - {{ $('Set Test Data').item.json.interview_label }}",
        html: "=" + rewriteHtml(testConfirm),
      },
      type: "n8n-nodes-base.mailgun",
      typeVersion: 1,
      position: [280, 840],
      id: "t0000000-0000-0000-0000-000000000003",
      name: "Confirm Registration",
      credentials: mailgunCred,
    },
    // Notify Team
    {
      parameters: {
        fromEmail: from,
        toEmail: testTo,
        bccEmail: testBcc,
        subject:
          "=[TEST] New Group Interview Sign-up: {{ $('Set Test Data').item.json.first_name }} {{ $('Set Test Data').item.json.last_name }}",
        html: "=" + rewriteHtml(notify),
      },
      type: "n8n-nodes-base.mailgun",
      typeVersion: 1,
      position: [280, 940],
      id: "t0000000-0000-0000-0000-000000000004",
      name: "Notify Team",
      credentials: mailgunCred,
    },
    // Reminder: 3 Days
    {
      parameters: {
        fromEmail: from,
        toEmail: testTo,
        bccEmail: testBcc,
        subject: "=[TEST] Reminder: Your Interview with ThisWay Global",
        html: "=" + rewriteHtml(rem3d),
      },
      type: "n8n-nodes-base.mailgun",
      typeVersion: 1,
      position: [280, 1040],
      id: "t0000000-0000-0000-0000-000000000005",
      name: "Reminder: 3 Days",
      credentials: mailgunCred,
    },
    // Reminder: 1 Day
    {
      parameters: {
        fromEmail: from,
        toEmail: testTo,
        bccEmail: testBcc,
        subject: "=[TEST] Tomorrow: Your Group Interview with ThisWay Global",
        html: "=" + rewriteHtml(rem1d),
      },
      type: "n8n-nodes-base.mailgun",
      typeVersion: 1,
      position: [280, 1140],
      id: "t0000000-0000-0000-0000-000000000006",
      name: "Reminder: 1 Day",
      credentials: mailgunCred,
    },
    // Reminder: Starting Soon
    {
      parameters: {
        fromEmail: from,
        toEmail: testTo,
        bccEmail: testBcc,
        subject: "=[TEST] Starting Soon: Your Interview with ThisWay Global",
        html: "=" + rewriteHtml(remSoon),
      },
      type: "n8n-nodes-base.mailgun",
      typeVersion: 1,
      position: [280, 1240],
      id: "t0000000-0000-0000-0000-000000000007",
      name: "Reminder: Starting Soon",
      credentials: mailgunCred,
    },
    // Follow-up: Rate or Reschedule
    {
      parameters: {
        fromEmail: from,
        toEmail: testTo,
        bccEmail: testBcc,
        subject:
          "=[TEST] Thank You for Your Interview - Share Your Feedback",
        html: "=" + rewriteHtml(postInterview),
      },
      type: "n8n-nodes-base.mailgun",
      typeVersion: 1,
      position: [280, 1340],
      id: "t0000000-0000-0000-0000-000000000008",
      name: "Follow-up: Rate or Reschedule",
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
          { node: "Confirm Registration", type: "main", index: 0 },
          { node: "Notify Team", type: "main", index: 0 },
          { node: "Reminder: 3 Days", type: "main", index: 0 },
          { node: "Reminder: 1 Day", type: "main", index: 0 },
          { node: "Reminder: Starting Soon", type: "main", index: 0 },
          { node: "Follow-up: Rate or Reschedule", type: "main", index: 0 },
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

// --- Backfill workflow: enroll existing registrants into reminder sequence ---
const bfSrc = "Get Upcoming Registrants";
const rewriteHtmlBackfill = (h) =>
  h.replace(
    /\$\('Webhook'\)\.item\.json\.body\./g,
    `$('${bfSrc}').item.json.`
  );
const bfDateRef = `$('${bfSrc}').item.json.interview_date`;
const bfConfirm = injectCalendar(htmlRaw("01-confirm-registration.html"), bfSrc);

// Helper to build IF condition for backfill (compare reminder time > now)
const bfIfCond = (expr) => ({
  options: { caseSensitive: true, leftValue: "", typeValidation: "strict" },
  conditions: [
    {
      id: "bf",
      leftValue: `={{ ${expr}.toMillis() }}`,
      rightValue: "={{ DateTime.now().toMillis() }}",
      operator: { type: "number", operation: "gt" },
    },
  ],
  combinator: "and",
});

const backfillWorkflow = {
  name: "Backfill - Group Interview Reminders",
  active: false,
  settings: { executionOrder: "v1" },
  tags: [],
  nodes: [
    {
      parameters: {},
      id: "bf000000-0000-0000-0000-000000000001",
      name: "Manual Trigger",
      type: "n8n-nodes-base.manualTrigger",
      typeVersion: 1,
      position: [-192, 1040],
    },
    {
      parameters: {
        operation: "executeQuery",
        query:
          "SELECT first_name, last_name, email, phone, interview_date, interview_label, role FROM group_interview_registrations WHERE interview_date >= NOW() - interval '30 minutes' ORDER BY interview_date, email",
        options: {},
      },
      id: "bf000000-0000-0000-0000-000000000002",
      name: bfSrc,
      type: "n8n-nodes-base.postgres",
      typeVersion: 2.3,
      position: [32, 1040],
      credentials: pgCred,
    },
    // Gate + Wait + Send: 1 day before
    {
      parameters: {
        conditions: bfIfCond(
          `DateTime.fromISO($('${bfSrc}').item.json.interview_date).minus({days: 1})`
        ),
        options: {},
      },
      id: "bf000000-0000-0000-0000-000000000010",
      name: "If >1 Day Away",
      type: "n8n-nodes-base.if",
      typeVersion: 2,
      position: [280, 840],
    },
    {
      parameters: {
        resume: "specificTime",
        dateTime: `={{ DateTime.fromISO(${bfDateRef}).minus({days: 1}).toISO() }}`,
      },
      id: "bf000000-0000-0000-0000-000000000011",
      name: "Wait 1 Day Before",
      type: "n8n-nodes-base.wait",
      typeVersion: 1.1,
      position: [520, 800],
    },
    {
      parameters: {
        fromEmail: from,
        toEmail: `={{ $('${bfSrc}').item.json.email }}`,
        bccEmail: "wattstoworkers@thiswayglobal.com",
        subject: "=Tomorrow: Your Group Interview with ThisWay Global",
        html: "=" + rewriteHtmlBackfill(rem1d),
      },
      type: "n8n-nodes-base.mailgun",
      typeVersion: 1,
      position: [760, 800],
      id: "bf000000-0000-0000-0000-000000000012",
      name: "Reminder: 1 Day",
      credentials: mailgunCred,
    },
    // Gate + Wait + Send: 2 hours before
    {
      parameters: {
        conditions: bfIfCond(
          `DateTime.fromISO($('${bfSrc}').item.json.interview_date).minus({hours: 2})`
        ),
        options: {},
      },
      id: "bf000000-0000-0000-0000-000000000020",
      name: "If >2 Hours Away",
      type: "n8n-nodes-base.if",
      typeVersion: 2,
      position: [280, 1040],
    },
    {
      parameters: {
        resume: "specificTime",
        dateTime: `={{ DateTime.fromISO(${bfDateRef}).minus({hours: 2}).toISO() }}`,
      },
      id: "bf000000-0000-0000-0000-000000000021",
      name: "Wait 2 Hours Before",
      type: "n8n-nodes-base.wait",
      typeVersion: 1.1,
      position: [520, 1000],
    },
    {
      parameters: {
        fromEmail: from,
        toEmail: `={{ $('${bfSrc}').item.json.email }}`,
        bccEmail: "wattstoworkers@thiswayglobal.com",
        subject: "=Starting Soon: Your Interview with ThisWay Global",
        html: "=" + rewriteHtmlBackfill(remSoon),
      },
      type: "n8n-nodes-base.mailgun",
      typeVersion: 1,
      position: [760, 1000],
      id: "bf000000-0000-0000-0000-000000000022",
      name: "Reminder: Starting Soon",
      credentials: mailgunCred,
    },
    // Gate + Wait + Send: post-interview (90 min after)
    {
      parameters: {
        conditions: bfIfCond(
          `DateTime.fromISO($('${bfSrc}').item.json.interview_date).plus({minutes: 90})`
        ),
        options: {},
      },
      id: "bf000000-0000-0000-0000-000000000030",
      name: "If Not Yet Ended",
      type: "n8n-nodes-base.if",
      typeVersion: 2,
      position: [280, 1240],
    },
    {
      parameters: {
        resume: "specificTime",
        dateTime: `={{ DateTime.fromISO(${bfDateRef}).plus({minutes: 90}).toISO() }}`,
      },
      id: "bf000000-0000-0000-0000-000000000031",
      name: "Wait Post-Interview",
      type: "n8n-nodes-base.wait",
      typeVersion: 1.1,
      position: [520, 1200],
    },
    {
      parameters: {
        fromEmail: from,
        toEmail: `={{ $('${bfSrc}').item.json.email }}`,
        bccEmail: "wattstoworkers@thiswayglobal.com",
        subject: "=Thank You for Your Interview - Share Your Feedback",
        html: "=" + rewriteHtmlBackfill(postInterview),
      },
      type: "n8n-nodes-base.mailgun",
      typeVersion: 1,
      position: [760, 1200],
      id: "bf000000-0000-0000-0000-000000000032",
      name: "Follow-up: Rate or Reschedule",
      credentials: mailgunCred,
    },
    // Sticky note
    {
      parameters: {
        content:
          "## Backfill Workflow\n\nOne-time use: enrolls existing registrants into the reminder sequence.\n\n**Queries**: All registrants with interview_date >= NOW() - 30min\n\n**Logic per registrant**:\n- If interview is >1 day away → wait → send 1-day reminder\n- If interview is >2 hours away → wait → send 2-hour reminder\n- If interview hasn't ended (90min after start) → wait → send post-interview follow-up\n\nSkips 3-day reminder (none qualify). Each branch runs independently per registrant.\n\n**After running**: Deactivate or delete this workflow.",
      },
      id: "bf000000-0000-0000-0000-000000000099",
      name: "Notes",
      type: "n8n-nodes-base.stickyNote",
      typeVersion: 1,
      position: [-192, 640],
    },
  ],
  connections: {
    "Manual Trigger": {
      main: [[{ node: bfSrc, type: "main", index: 0 }]],
    },
    [bfSrc]: {
      main: [
        [
          { node: "If >1 Day Away", type: "main", index: 0 },
          { node: "If >2 Hours Away", type: "main", index: 0 },
          { node: "If Not Yet Ended", type: "main", index: 0 },
        ],
      ],
    },
    "If >1 Day Away": {
      main: [
        [{ node: "Wait 1 Day Before", type: "main", index: 0 }],
        [],
      ],
    },
    "Wait 1 Day Before": {
      main: [[{ node: "Reminder: 1 Day", type: "main", index: 0 }]],
    },
    "If >2 Hours Away": {
      main: [
        [{ node: "Wait 2 Hours Before", type: "main", index: 0 }],
        [],
      ],
    },
    "Wait 2 Hours Before": {
      main: [[{ node: "Reminder: Starting Soon", type: "main", index: 0 }]],
    },
    "If Not Yet Ended": {
      main: [
        [{ node: "Wait Post-Interview", type: "main", index: 0 }],
        [],
      ],
    },
    "Wait Post-Interview": {
      main: [[{ node: "Follow-up: Rate or Reschedule", type: "main", index: 0 }]],
    },
  },
  pinData: {},
  meta: {
    templateCredsSetupCompleted: true,
    instanceId:
      "6abfb47bea51a6f610a03c2f772741bc5d6bf3fa9900a4ec5d91227cefde6c68",
  },
};

const bfOut = path.join(__dirname, "n8n-workflow-backfill.json");
fs.writeFileSync(bfOut, JSON.stringify(backfillWorkflow, null, 2));
console.log(
  `Wrote ${bfOut} (${(fs.statSync(bfOut).size / 1024).toFixed(1)} KB)`
);
