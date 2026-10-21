# Study protocol — SiagaNusa dashboard usability

**Status:** protocol and prototype only. No real participants have been recruited
or observed. All analysis output in the app is generated from synthetic sessions.

## 1. Purpose

Evaluate the usability of a prototype disaster situation dashboard for
prioritising alerts, locating shelters, filtering hazard information, and
acknowledging an alert. The study is **formative**: its purpose is to find design
problems and inform iteration, not to estimate population-level effects or prove
operational impact.

## 2. Research questions

- **RQ1.** What is the task completion rate for four core dashboard tasks?
- **RQ2.** Which tasks require the most time and repeated attempts, and what
  observed behaviours explain this?
- **RQ3.** What are participants' SUS, UMUX-Lite, and SEQ ratings, and how do
  they relate to qualitative comments?
- **RQ4.** Which interface elements should be changed before a summative study?

These are descriptive and exploratory questions. The study is not powered for
confirmatory hypothesis tests.

## 3. Design

- Formative mixed-methods usability study.
- Single prototype condition; all participants complete the same tasks in the
  same order.
- Within-subject task metrics plus post-test questionnaires and think-aloud.
- No control interface, no randomised order, no blinding. Causal comparison with
  another dashboard is outside scope.

### Task order and rationale

| # | Task | Target condition | Rationale |
|---|---|---|---|
| 1 | Prioritise the highest alert | Open `alert-01`, the only Awas alert in Kota Bengkulu | Tests severity discrimination and detail access |
| 2 | Find the nearest open shelter | Open `shelter-04` at 1.8 km | Tests table scanning, status reading, distance comparison |
| 3 | Filter flood alerts | Activate the `Banjir` filter | Tests filtering and feedback |
| 4 | Acknowledge a landslide alert | Mark `alert-02` as handled | Tests action affordance and state change |

Success is determined by the target condition in the prototype, not by the
participant saying they succeeded.

## 4. Participants

- Target: **12–20 adults** for formative iteration. This is a practical target
  for finding repeated usability problems, not a power calculation.
- Inclusion: age 18+, involved or interested in disaster response (BPBD
  operator, volunteer, GIS analyst, field coordinator), able to use a desktop
  browser.
- Exclusion: prior involvement in designing this specific prototype (to reduce
  familiarity bias).
- Recruitment: purposive and snowball sampling. Report how participants were
  recruited and any relationship to the research team.
- No names, phone numbers, emails, or workplace identifiers are stored in the
  prototype. Participant codes are arbitrary and are not linked to identity in
  this repository.

The final sample size and any deviations must be reported exactly, including
dropouts.

## 5. Materials

- React prototype in this repository (`npm run dev`).
- Dashboard data: entirely fictitious alerts, shelters, districts, and trend
  values. It must not be described as real Bengkulu data.
- Tasks delivered by the moderator and shown in the "Studi tugas" panel.
- Post-task Single Ease Question (SEQ, 1–7).
- Post-test System Usability Scale (SUS, 10 items, 1–5).
- Post-test UMUX-Lite (2 items, 1–7).
- Open comment field.
- Timer and attempt counter built into the prototype.
- Session export as JSON/CSV.

## 6. Procedure (approximately 25–35 minutes)

1. Welcome, purpose, and consent. Confirm that the dashboard is a simulation.
2. Explain think-aloud. Clarify that the participant is evaluating the design,
   not being tested.
3. Optional demographic/role form (role only; no identifying data).
4. Moderator opens the study session and enters a participant code.
5. For each task:
   - Read the task aloud.
   - Start the task timer.
   - Observe and prompt neutrally if the participant is silent.
   - Record success, failures, and attempts automatically.
   - Ask the SEQ immediately after the task.
6. After all tasks, ask the overall SEQ.
7. Administer SUS and UMUX-Lite.
8. Ask the open comment question.
9. Thank the participant and explain how to withdraw data.
10. Export the session and store it in an access-controlled location outside
    this repository.

### Moderator prompts

Use neutral prompts only:

- "Apa yang Anda pikirkan saat ini?"
- "Silakan lanjutkan."
- "Apa yang Anda harapkan terjadi setelah menekan tombol itu?"
- "Tidak apa-apa jika tidak menemukannya; itu informasi berguna."

Do **not** point to controls, explain the interface, or say whether an answer is
correct before the task ends.

## 7. Measures and scoring

### Task metrics

- Completion: target condition met before the participant gives up or the
  moderator ends the task.
- Time on task: milliseconds from "Mulai tugas" to successful check.
- Attempts: number of "Periksa & selesaikan" checks, including failures.
- Error rate: mean number of excess attempts per task
  (`max(0, attempts − 1)` averaged over tasks).

### SUS

For each odd-numbered item subtract 1; for each even-numbered item subtract the
response from 5. Sum the ten values and multiply by 2.5. Range 0–100.

### UMUX-Lite

`((item1 − 1) + (item2 − 1)) / 12 × 100`. Range 0–100.

### SEQ

Single item, 1 (very difficult) to 7 (very easy). Report per task and overall.

### Qualitative data

Think-aloud transcript excerpts and open comments are coded inductively. Two
coders independently code a subset, compare codes, resolve disagreements by
discussion, and document the codebook. Report illustrative quotes without
identifying information.

## 8. Analysis plan

- Report n, task success counts, completion rates, and Wilson 95% intervals.
- Report median and interquartile range for time on task; mean attempts.
- Report mean, median, SD, and normal-approximation 95% CI for SUS and UMUX-Lite.
- Report SEQ per task and overall.
- Compare tasks descriptively; do not run uncorrected exploratory significance
  tests and present them as confirmatory.
- If inferential tests are added later, pre-specify them, check assumptions, and
  correct for multiple comparisons.
- Integrate quantitative and qualitative findings in a matrix by task.
- Report negative cases and design problems, not only positive quotes.

The included analysis page implements only the descriptive parts. It does not
perform significance testing or qualitative coding.

## 9. Data management and privacy

- The prototype stores sessions in the browser's `localStorage`; no server
  receives them.
- Exported files contain participant code, role, task metrics, questionnaire
  responses, and comments.
- Participants must be instructed not to type personal or sensitive information
  into the comment field.
- Store exports on an encrypted, access-controlled device. Do not commit them.
- Retain only as long as needed for the study and institutional policy.
- Withdrawal: if a participant withdraws before analysis, delete their session
  file. After anonymised aggregation, withdrawal may no longer be feasible;
  state this in the consent form.

## 10. Ethics

- Obtain ethics approval from the relevant institution before recruiting human
  participants.
- Obtain informed consent and explain voluntary participation, the right to
  stop, and data handling.
- Avoid deception.
- Do not simulate an emergency in a way that could be mistaken for a real
  warning. The interface must remain clearly labelled as a simulation during
  the study.
- Provide a debrief and a contact for questions or withdrawal.

## 11. Limitations to report

- Synthetic dashboard content and a non-operational prototype limit ecological
  validity.
- Single-condition, fixed-order design cannot separate task difficulty from
  order or learning effects.
- Small formative samples give imprecise estimates; CIs will be wide.
- The Indonesian SUS and UMUX-Lite translations have not been psychometrically
  validated in this project.
- Moderator presence and think-aloud can alter behaviour.
- Task success in a desktop prototype does not establish safety, speed, or
  fitness for real emergency operations.
- No comparison with an existing system is made.

## 12. Deviations log

Record date, protocol section, deviation, reason, and impact. Example fields:

| Date | Section | Deviation | Reason | Impact |
|---|---|---|---|---|
| — | — | — | — | — |

## 13. References for instruments

- Brooke, J. (1996). SUS: A "quick and dirty" usability scale. In P. W. Jordan,
  B. Thomas, B. A. Weerdmeester, & I. L. McClelland (Eds.), *Usability
  Evaluation in Industry* (pp. 189–194). Taylor & Francis.
- Lewis, J. R., Utesch, B. S., & Maher, D. E. (2013). UMUX-Lite: When there's no
  time for the full UX questionnaire. *CHI '13 Extended Abstracts on Human
  Factors in Computing Systems*, 2099–2102. ACM.

These instruments are used as published; the Indonesian wording in this
prototype is a project translation and has not been independently validated.
