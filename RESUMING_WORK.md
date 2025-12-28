# How to Help Me Pick Up Work - Instructions

**For Future Sessions:** Use this guide to provide me with the right context when resuming work.

---

## 📋 Quick Reference Cards

### Scenario 1: Immediate Continuation (Same Day)

**What to do:**
\`\`\`
1. Ask directly: "Continue testing the QRT ID generation fix"
2. Provide any test results: "I tested it and got error X"
3. That's it - system usually provides auto-summary
\`\`\`

**Example message:**
\`\`\`
"Continue work on QRT ID generation.
I tested the system and the images are now generating successfully!"
\`\`\`

---

### Scenario 2: Fresh Start After Restart

**What to do:**
\`\`\`
1. Provide the context file reference
2. Give brief status update
3. Describe what you want help with
\`\`\`

**Example message:**
\`\`\`
"I restarted Claude. Please check /home/user/barangayformdemo/CONTINUATION_GUIDE.md
for full context about the QRT ID payment system project.

I tested the image generation and it's still not working.
Here's the error I got in console: [paste error message]

Can you help me debug this?"
\`\`\`

---

### Scenario 3: Specific Bug or Feature Request

**What to do:**
\`\`\`
1. State the problem clearly
2. Provide error messages or logs
3. Describe what you've already tried
4. Ask specific question
\`\`\`

**Example message:**
\`\`\`
"Working on QRT ID payment system. When I submit the payment form,
I get this error in console:
[paste full error message]

I already tried:
- Clearing browser cache
- Restarting dev server

What's the issue and how do I fix it?"
\`\`\`

---

## 🎯 Most Effective Format

Copy and fill in this template:

\`\`\`
PROJECT: [Project Name]
CONTEXT FILE: /home/user/barangayformdemo/CONTINUATION_GUIDE.md
LAST WORK: [Brief description of what was done]
CURRENT STATUS: [What's working, what's not]

PROBLEM/TASK:
[Describe what you need help with]

WHAT I'VE TRIED:
- [Thing 1]
- [Thing 2]

ERROR/LOGS:
[Paste any console errors or relevant logs]

WHAT I NEED:
[Help debugging, implement feature, etc.]
\`\`\`

---

## 🔍 Information to Include for Best Help

### If Testing Something
\`\`\`
✅ Include:
- Steps you took
- What you expected to happen
- What actually happened
- Browser console errors (if any)
- Screenshots (if visual)

❌ Don't include:
- Vague descriptions ("it doesn't work")
- Partial error messages
\`\`\`

### If Reporting a Bug
\`\`\`
✅ Include:
- Exact error message (copy/paste from console)
- Steps to reproduce the bug
- What browser/OS you're using
- Recent file changes (if any)

❌ Don't include:
- "Something is broken"
- Made up error messages
\`\`\`

### If Requesting a Feature
\`\`\`
✅ Include:
- Clear description of desired behavior
- Where this feature should appear
- How user would interact with it
- Any mockups or examples

❌ Don't include:
- "Make it better"
- Unclear requirements
\`\`\`

---

## 📁 File References

When asking for help, I may reference files by location and line number:

\`\`\`
"The issue is in app/payment/page.tsx around line 502"
\`\`\`

**To find it quickly:**
1. Open the file in VS Code
2. Press Ctrl+G (or Cmd+G on Mac)
3. Type the line number
4. Press Enter

---

## 🔗 Git Information I Need

If I ask for git info, provide:
\`\`\`bash
# Check current status
git status

# See recent changes
git diff

# View recent commits
git log --oneline -10
\`\`\`

Or just say: "Check my git status - I've made some changes to [file names]"

---

## 🚀 Starting a New Task

**Best format:**
\`\`\`
"I want to [action] on the QRT ID project.
Here's what I need:
1. [Requirement 1]
2. [Requirement 2]

Current files involved:
- app/payment/page.tsx
- components/qrt-id-front-template.tsx

Can you help me implement this?"
\`\`\`

---

## 💡 Pro Tips for Quick Answers

### Tip 1: Reference Documentation File
\`\`\`
"According to /home/user/barangayformdemo/CONTINUATION_GUIDE.md,
the QRT ID generation needs image loading verification.
Can you check if that's implemented correctly?"
\`\`\`
This tells me exactly what context to use.

### Tip 2: Provide Specific Code Location
\`\`\`
"The issue is in app/payment/page.tsx where we call generateQRTIDImages().
When I add logging there, I see [specific output].
What does that mean?"
\`\`\`
This helps me jump to the exact problem area.

### Tip 3: Share Console Logs
\`\`\`
"Here's what I see in browser console:
[paste the full console output starting with [QRT ID Generation]]

Is this working as expected?"
\`\`\`
Console logs tell me exactly what's happening.

### Tip 4: Reference the Plan File
\`\`\`
"I'm working on Step 4 of the implementation plan
(/home/user/.claude/plans/glimmering-exploring-metcalfe.md).
I got stuck on this part: [describe the issue]"
\`\`\`
This shows you've reviewed the plan.

---

## ❌ What NOT to Do

\`\`\`
DON'T: "Fix the code" (too vague, I don't know what's broken)
DO:    "The QRT images aren't generating. Console shows [error]"

DON'T: "It doesn't work" (not helpful)
DO:    "When I complete payment, I get this error: [paste error]"

DON'T: "Make it better" (unclear what needs improvement)
DO:    "The payment form should be simpler - remove these fields: [list]"

DON'T: "Check my code for issues" (too broad)
DO:    "I think the issue is in how we're calling html2canvas. Can you review that?"
\`\`\`

---

## 🎓 Understanding the Project Structure

\`\`\`
barangayformdemo/
├── app/
│   ├── payment/page.tsx ⚠️ CRITICAL - payment & image generation
│   ├── qrt-id/
│   │   ├── [id]/page.tsx - view QRT ID card
│   │   └── request/page.tsx - request form
│   └── request/page.tsx - certificate request
├── components/
│   ├── qrt-id-front-template.tsx ⚠️ CRITICAL - card front design
│   ├── qrt-id-back-template.tsx ⚠️ CRITICAL - card back design
│   └── payment-methods.tsx - payment form UI
├── lib/
│   ├── qrt-id-generator.ts ⚠️ CRITICAL - image generation logic
│   └── payment-utils.ts - validation
└── CONTINUATION_GUIDE.md ← Reference this file
\`\`\`

**⚠️ = Most likely to need changes**

---

## 🔧 Common Issues & How to Ask About Them

### Image Generation Not Working
\`\`\`
"The QRT ID images aren't generating. I see these logs in console:
[paste full console output]

Is it the ref attachment, image loading, or canvas capture that's failing?"
\`\`\`

### Payment Flow Broken
\`\`\`
"After I complete payment, I'm getting redirected to the wrong page.
I'm on the [page name] and expect to go to [page name],
but it goes to [actual page] instead.

Here's the URL: [current URL]"
\`\`\`

### Button Not Functional
\`\`\`
"The [button name] button isn't working. When I click it:
- Expected: [what should happen]
- Actual: [what happens instead]
- Error shown: [any error messages]"
\`\`\`

---

## 📞 When to Tag Me In vs. Handle Yourself

### Ask Me to Help With:
- Bugs or errors you don't understand
- New features or changes to logic
- TypeScript/React pattern questions
- Understanding why something works a certain way
- Debugging console errors or logs

### You Can Handle:
- Running `npm run build` or `npm run dev`
- Checking git status or viewing files
- Copy/pasting console logs to share with me
- Making small text/styling changes
- Running tests or verifying behavior

---

## ✅ Ideal Help Request Template

Here's the exact format that works best:

\`\`\`
I'm working on the QRT ID payment system.

STATUS:
[What's working, what's not]

PROBLEM:
[Clear description of the issue]

REPRODUCTION:
1. [Step 1]
2. [Step 2]
3. [Step 3]
Expected: [X]
Actual: [Y]

LOGS:
[Paste console output with [QRT ID Generation] or [html2canvas] prefixes]

FILES INVOLVED:
- app/payment/page.tsx (lines 502-541)
- components/qrt-id-front-template.tsx (lines 54-60)

WHAT I NEED:
[Help debugging, implement a fix, review code, etc.]
\`\`\`

This gives me:
- ✅ Full context without reading 50 messages
- ✅ Exact reproduction steps
- ✅ Relevant code locations
- ✅ Clear error information
- ✅ Specific help needed

---

## 🚨 Emergency / Critical Issues

If something is completely broken:

\`\`\`
URGENT: [Brief description]

What's broken:
[What doesn't work at all]

How to reproduce:
[Steps that break it]

Attempted fixes:
[What you already tried]

Impact:
[Who/what is affected]

PLEASE PRIORITIZE THIS.
\`\`\`

---

## 📝 Final Checklist Before Asking for Help

Before sending a question, verify:

- [ ] I've checked the CONTINUATION_GUIDE.md
- [ ] I've provided specific error messages (copy/paste, not paraphrased)
- [ ] I've listed steps to reproduce the problem
- [ ] I've mentioned what I've already tried
- [ ] I've included relevant file names and line numbers
- [ ] I've been clear about what I need (debug, implement, review, etc.)
- [ ] I haven't used vague terms like "broken", "doesn't work", "fix it"

---

## 📚 Reference Files Always Available

These files document the project and are always helpful context:

1. **CONTINUATION_GUIDE.md** (this file)
   - Full project status and implementation details
   - Testing instructions
   - File-by-file changes
   - Known limitations

2. **Plan File**
   - `/home/user/.claude/plans/glimmering-exploring-metcalfe.md`
   - Detailed 6-step implementation strategy
   - Why each change was made

3. **Git Status**
   - Run `git status` to see modified files
   - Run `git log` to see recent commits

---

## 🎯 TL;DR - The Shortest Version

**To get the best help from me:**

1. **Reference the documentation:** "Check CONTINUATION_GUIDE.md"
2. **Be specific:** Show code, errors, and exact steps
3. **Ask clearly:** "Debug this", "implement feature X", "review this code"
4. **Share logs:** Copy/paste console output, not descriptions

**Example:**
\`\`\`
"I'm testing QRT ID image generation.
Check CONTINUATION_GUIDE.md for context.
Images aren't appearing - console shows: [paste error]
What's wrong?"
\`\`\`

---

**Happy coding! 🚀**

---

*Document created: 2025-12-28*
*For use when resuming work on QRT ID payment system*
*Maintain this file with project status updates*
