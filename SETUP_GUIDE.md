# TREISHVAAM — CLAUDE AGENT SETUP GUIDE
# Follow every step in order. Do not skip any step.
# Written for: non-developer setup of Roo Code + Claude Agent in VS Code

---

## WHAT YOU ARE SETTING UP

You are setting up Claude as an AI engineer inside VS Code (via Roo Code extension)
connected to Amazon Bedrock. Claude will automatically read your project rules,
understand your entire system, and fix bugs + security issues — then ask YOU
before pushing anything to GitHub.

---

## STEP 1 — FOLDER STRUCTURE TO CREATE

Inside your Finance Frontend project folder:
`C:\Users\7303150607\OneDrive\Desktop\PrOJEct\treishvaam-finance-frontend\`

Create this exact structure (you can do this in File Explorer or VS Code):

```
treishvaam-finance-frontend/
├── CLAUDE.md                          ← Copy from files Claude gave you
├── CLAUDE_SESSION_START.md            ← Copy from files Claude gave you
├── TODO.md                            ← Copy from files Claude gave you
├── ARCHITECTURE_QUICKREF.md           ← Copy from files Claude gave you
├── FINANCE_BUG_ANALYSIS.md            ← Copy from files Claude gave you
├── HANDOVER_DOCUMENT_TEMPLATE.md      ← Copy from files Claude gave you
├── .roo/
│   └── rules.md                       ← Copy from files Claude gave you
│
├── RULES OF ENGAGEMENT & AI INSTRUCTIONS & EDITS/   ← Create this folder
│   ├── Rules_of_Engagement.md         ← (see Step 2 below)
│   ├── Treishvaam_Enterprise_Audit_Report.md  ← (see Step 2)
│   └── Treishvaam_AI_Operations_Guide.md      ← (see Step 2)
│
├── BACKEND CODE FILES/                ← Create this folder
│   └── [paste your backend code here] ← (see Step 3 below)
│
└── [your existing frontend files]     ← src/, public/, package.json etc
```

---

## STEP 2 — CONVERT PDF FILES TO MARKDOWN

The 3 PDF files need to be readable by Claude as text files.
The easiest way for you:

**Option A (Easiest — Copy-Paste)**
1. Open each PDF in your browser or PDF reader
2. Select All (Ctrl+A) → Copy (Ctrl+C)
3. Open Notepad, paste, save as `.md` file in the folder above

**Option B (Better quality)**
1. Go to https://pdf2md.morethan.io/
2. Upload each PDF
3. Download the `.md` file
4. Save in `RULES OF ENGAGEMENT & AI INSTRUCTIONS & EDITS/` folder

Files to convert:
- `Rules_of_Engagement.pdf` → `Rules_of_Engagement.md`
- `Treishvaam_Enterprise_Audit_Report.pdf` → `Treishvaam_Enterprise_Audit_Report.md`
- `TREISHVAAM_GROUP___AI_IMPLEMENTATION_SESSION_START.pdf` → `Treishvaam_AI_Operations_Guide.md`

---

## STEP 3 — COPY BACKEND CODE

1. Go to: `F:\BACKEND PROJECG\finance-api\finance-api`
2. Copy the ENTIRE folder
3. Paste it inside:
   `C:\Users\7303150607\OneDrive\Desktop\PrOJEct\treishvaam-finance-frontend\BACKEND CODE FILES\`

This gives Claude access to the backend code so it can understand how APIs work
and fix any mismatches between frontend and backend.

---

## STEP 4 — UPDATE .GITIGNORE

Open the file `.gitignore` in your Finance frontend project.
Add these lines at the bottom (if not already there):

```
# AI instruction folders — NEVER push to git
RULES OF ENGAGEMENT & AI INSTRUCTIONS & EDITS/
BACKEND CODE FILES/
HANDOVER_DOCUMENT.md
HANDOVER_DOCUMENT_TEMPLATE.md
FINANCE_BUG_ANALYSIS.md
ARCHITECTURE_QUICKREF.md
```

Save the file. This ensures your sensitive docs never go to GitHub.

---

## STEP 5 — INSTALL ROO CODE IN VS CODE

1. Open VS Code
2. Click Extensions icon (left sidebar, looks like 4 squares)
3. Search: `Roo Code`
4. Click Install
5. Restart VS Code

---

## STEP 6 — CONFIGURE ROO CODE WITH AMAZON BEDROCK

1. In VS Code, click the Roo Code icon (appears in left sidebar after install)
2. Click the Settings gear icon in Roo Code panel
3. Select **Provider: Amazon Bedrock**
4. Enter your AWS credentials:
   - AWS Access Key ID: [your key]
   - AWS Secret Access Key: [your secret]
   - AWS Region: [your region, e.g. us-east-1]
5. Select Model: **Claude Sonnet 4.6** (model ID: `claude-sonnet-4-6`)
6. Save settings

---

## STEP 7 — CONFIGURE ROO CODE SETTINGS

In Roo Code settings, enable:
- ✅ **Enable TODO list tool** (you mentioned this is already checked)
- ✅ **Auto-approve file reads** (no confirmation needed for reading)
- ✅ **Auto-approve file creation** (Claude can create files without asking)
- ✅ **Auto-approve edits on claude/* branches**
- ❌ **Auto-approve git push** — KEEP THIS OFF (always ask before pushing)

---

## STEP 8 — OPEN THE PROJECT IN VS CODE

1. Open VS Code
2. File → Open Folder
3. Navigate to: `C:\Users\7303150607\OneDrive\Desktop\PrOJEct\treishvaam-finance-frontend`
4. Click "Open"

VS Code and Roo Code will now see your entire project including all the Claude instruction files.

---

## STEP 9 — FIRST SESSION WITH CLAUDE

Open Roo Code panel. Type this EXACTLY as your first message:

```
SESSION START.

I am the founder of Treishvaam Group. You are my AI engineer.

Read CLAUDE.md first, then CLAUDE_SESSION_START.md, then execute the full
verification scan as defined in CLAUDE_SESSION_START.md.

After the scan, show me the verification table and wait for my approval
before fixing anything.

Priority bugs to fix first:
1. BUG-FINANCE-01: Article not found on blog post pages
2. BUG-FINANCE-02: Blog editor cannot save posts
3. CVE-001, CVE-002, CVE-003 security fixes
```

---

## STEP 10 — HOW TO RESPOND TO CLAUDE

After Claude shows you the verification scan results:

- **To fix everything in priority order**: Type `APPROVED`
- **To fix one specific thing**: Type `FIX BUG-FINANCE-01`
- **To see the plan before fixing**: Type `SHOW P0 PLAN`
- **To stop and save progress**: Type `SUMMARIZE AND STOP`
- **To push code to GitHub**: Type `PUSH APPROVED` (only after reviewing what Claude changed)

---

## WHAT NEVER TO DO

❌ Never type `APPROVED` without reading what Claude plans to change first
❌ Never let Claude push to the `main` branch (it won't — but double check)
❌ Never copy-paste backend file changes into Eclipse without reading the "ACTION REQUIRED" header
❌ Never delete the `RULES OF ENGAGEMENT` folder or `BACKEND CODE FILES` folder

---

## IF SOMETHING GOES WRONG

If Claude seems confused or gives wrong answers:
1. Type: `STOP — POSSIBLE HALLUCINATION`
2. Claude will re-read the relevant file and verify its claim
3. If still wrong: close the session, re-open, type `SESSION START` again

If the site goes down after a change:
1. Do NOT type APPROVED for any more changes
2. Type: `SUMMARIZE AND STOP`
3. Use the backup commands in CLAUDE.md Section 8 to restore

---

## FILES THAT SHOULD NEVER BE IN GIT

Check with your developer or just verify these are in `.gitignore`:
- `RULES OF ENGAGEMENT & AI INSTRUCTIONS & EDITS/` ← architecture secrets
- `BACKEND CODE FILES/` ← full backend source
- `.env*` (except `.env.dev.example`) ← real credentials
- `HANDOVER_DOCUMENT.md` ← session state
