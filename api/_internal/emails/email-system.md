# TWG API Email System

## Overview

All emails are sent via **Mailgun** (`m.thiswayglobal.com`), queued on the `emails` database queue, and logged in the `email_logs` table. Templates are stored as MJML in the database (`email_templates` table) and editable through the Filament admin panel.

**From**: `notifications@m.thiswayglobal.com` ("ThisWay Global")
**Admin To**: `daniel.snell@thiswayglobal.com`
**Admin CC**: `courtney.gwynn@thiswayglobal.com`

---

## Interview Funnel (Watts to Workers)

### Completion Emails

Triggered immediately when an applicant completes the interview funnel (`form_completed` event).

| Template Slug | Recipient | Cadence |
|---|---|---|
| `watts-for-workers-interview-confirm` | Applicant | Immediate on completion |
| `watts-for-workers-interview-admin` | Admin | Immediate on completion |

**Variables (confirm):**

| Variable | Description |
|---|---|
| `{{ first_name }}` | Applicant first name |
| `{{ last_name }}` | Applicant last name |
| `{{ email }}` | Applicant email |
| `{{ phone }}` | Applicant phone |
| All interview answers | Passed through from form data |

**Variables (admin):**

| Variable | Description |
|---|---|
| `{{ first_name }}` | Applicant first name |
| `{{ last_name }}` | Applicant last name |
| `{{ email }}` | Applicant email |
| `{{ phone }}` | Applicant phone |
| `{{ stillInterested }}` | Confirmation of interest |
| `{{ textMessageConsent }}` | SMS consent |
| `{{ availableSessions }}` | Selected session availability |
| `{{ currentLocation }}` | Applicant location |
| `{{ willingToRelocate }}` | Relocation willingness |
| `{{ referral }}` | Referral source |

---

### Abandon Nudge Emails

Detected by the `applicants:detect-abandoned` console command. Finds `in_progress` applicants whose last event is **30+ minutes** old.

| Template Slug | Recipient | Cadence |
|---|---|---|
| `watts-for-workers-abandon-video` | Applicant | 30 min after last activity (stopped at video step) |
| `watts-for-workers-abandon-form` | Applicant | 30 min after last activity (stopped at form step) |
| `watts-for-workers-abandon-final` | Applicant | 24+ hours after first nudge |

**Variables (all abandon templates):**

| Variable | Description |
|---|---|
| `{{ first_name }}` | Applicant first name (optional, may be empty) |
| `{{ cta_url }}` | Link back to the interview funnel |

---

### Interest Form Emails

Triggered when the initial interest/registration form is submitted (before the interview funnel).

| Template Slug | Recipient | Cadence |
|---|---|---|
| `watts-for-workers-confirm` | Applicant | Immediate on registration |
| `watts-for-workers-admin` | Admin | Immediate on registration |

**Variables (confirm):**

| Variable | Description |
|---|---|
| `{{ first_name }}` | Applicant first name |
| `{{ last_name }}` | Applicant last name |
| `{{ email }}` | Applicant email |

**Variables (admin):** None (static notification)

---

## Texas Tech Compute Inquiry

Triggered when the Texas Tech compute form is submitted via `POST /api/webhook/forms` with `form_type: "texas-tech-compute"`.

| Template Slug | Recipient | Cadence |
|---|---|---|
| `texas-tech-compute-confirm` | Inquirer | Immediate on submission |
| `texas-tech-compute-admin` | Admin | Immediate on submission |

**Variables (confirm):**

| Variable | Description |
|---|---|
| `{{ first_name }}` | Submitter first name |
| `{{ last_name }}` | Submitter last name |
| `{{ email }}` | Submitter email |
| `{{ company }}` | Company name |
| `{{ urgency }}` | Urgency level (e.g. "Within 30 days") |

**Variables (admin):** None (static notification, form data displayed via content fields)

---

## Press Inquiry

Triggered when the press inquiry form is submitted via `POST /api/webhook/forms` with `form_type: "press-inquiry"`.

| Template Slug | Recipient | Cadence |
|---|---|---|
| `press-inquiry-confirm` | Inquirer | Immediate on submission |
| `press-inquiry-admin` | Admin | Immediate on submission |

**Variables (confirm):**

| Variable | Description |
|---|---|
| `{{ first_name }}` | Submitter first name |
| `{{ last_name }}` | Submitter last name |
| `{{ email }}` | Submitter email |

**Variables (admin):** None (static notification)

---

## Daily Digest

Summary email sent to admin with applicant activity stats. Uses the `simple.blade.php` fallback template.

| Template Slug | Recipient | Cadence |
|---|---|---|
| `daily-digest` | Admin | Manual via `applicants:daily-digest` command (not scheduled) |

**Variables:**

| Variable | Description |
|---|---|
| `{{ heading }}` | Email heading |
| `{{ body }}` | HTML body with stats |
| `{{ cta_url }}` | Link to admin panel (optional) |
| `{{ cta_text }}` | Button text (optional) |

---

## Template Content Fields

Each `EmailTemplate` record has a `content` JSON array of label/value pairs that map to Blade variables `field_1` through `field_6`:

| Field | Typical Use |
|---|---|
| `field_1` | Heading |
| `field_2` | Subheading or Intro Text |
| `field_3` | Greeting or Body |
| `field_4` | Body or Next Steps |
| `field_5` | Closing or Sign Off |
| `field_6` | Additional content |

These are editable in Filament and rendered as raw HTML (`{!! !!}`).

---

## Key Files

| File | Purpose |
|---|---|
| `app/Models/EmailTemplate.php` | Template model with MJML compilation and rendering |
| `app/Models/EmailLog.php` | Email send log with status tracking |
| `app/Jobs/SendApplicantEmails.php` | Handles interview completion, exit, and abandon emails |
| `app/Jobs/SendFormNotifications.php` | Handles form submission emails (Texas Tech, Press) |
| `app/Console/Commands/DetectAbandonedApplicants.php` | Abandon detection and first/final nudge dispatch |
| `app/Console/Commands/SendDailyDigest.php` | Daily summary email |
| `database/seeders/EmailTemplateSeeder.php` | Seeds all template records with MJML content |
