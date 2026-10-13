# Learning content and curriculum maintenance

The studio supports two related tasks: building understanding and rehearsing an
interview answer. Its learning levels and recommended paths describe the first.
Interview follow-ups, strong-answer signals and evidence prompts support the
second. Do not collapse both into a single label such as Senior.

## Sources of truth

- `content/*.json`: English questions, short answers, details, pitfalls and sources.
- `locales/ru/`: intentional Russian localization; preserve ABAP/SAP identifiers.
- `curriculum/learning.json`: learning levels, optional prerequisite links and
  the recommended paths for the ten user-facing topics.
- `scripts/study_topics.py`: topic and subtopic membership.
- `examples/`, `lessons/`, `quiz/` and `visuals/`: the authored supporting material.

Keep stable question IDs and existing interview metadata. A learning-level change
must not silently rewrite the original interview level or progress identity.
Do not copy path sequences into several manually maintained files. The study plan
explains how to use them; the curriculum file owns their membership and order.

## Assign a learning level by the task

| Level | Editorial test | Example task |
| --- | --- | --- |
| Core | Can the learner explain one mechanism using a small, bounded example? | Explain the difference between a transactional buffer and saved data. |
| Applied | Must the learner choose, implement or diagnose a mechanism under stated conditions? | Choose a table type for a specified lookup and explain the code. |
| Advanced | Must the learner reconcile several mechanisms, contracts or failure boundaries? | Design recovery when a remote commit cannot be undone by a local rollback. |

Classify the question and its main answer, not its hardest optional follow-up.
An introductory architecture question can be Core even if it originated in a
Senior module. An unfamiliar term, a long answer or a large code block does not
by itself justify Advanced. Do not classify an entire topic at one level merely
because its source module was written for experienced interview candidates.

Review levels using representative questions from adjacent levels in the same
topic. Keep EN/RU learning labels and explanations equivalent.

## Design a useful path

1. State one observable goal: what the learner should be able to explain or
   predict at the end. Avoid promises of mastery or universal time estimates.
2. Choose six to eight existing questions. Teach required concepts before the
   decisions that depend on them; do not use numeric ID or level alone as order.
3. Add only useful prerequisite links to earlier route questions. Prefer one or
   two direct dependencies over a long reading list. Avoid cycles and self-links.
   Every referenced ID must exist.
4. Keep the path within its topic. End at a useful checkpoint rather than trying
   to cover the entire topic. State the assumed background when a topic depends
   on concepts outside this introductory path.
5. Reuse an authored quiz, lesson or spoken practice question to check the goal.
   Never generate a misleading multiple-choice exercise from a definition alone.
6. Ensure the named next question follows the path and the final item has a clear
   completion/review action. Revisiting an item must remain possible.

Paths are optional suggestions. Filters and alternate navigation should not lock
content or force learners to pass a quiz. A visited flag reports navigation only;
it must never be presented as comprehension, readiness or mastery.

## Keep the explanation and example consistent

Use the sequence **short answer -> concrete example -> important mistake ->
optional detail**. Put one essential idea in the short answer and explain terms
before relying on them. Move release-specific complications and interview probes
into the deeper explanation unless they change the main answer.

For each question with supporting material, check the following:

- The answer, code, diagram and guided steps demonstrate the same mechanism.
- They use the same actors, records, field names and values, or explicitly explain
  why a second example changes them.
- The example states its initial condition, the operation and the expected result.
- Highlighted code lines correspond to the current step and its claimed effect.
- Failure paths distinguish temporary state, committed state and cleanup.
- A comparison changes a meaningful condition; decorative motion is not evidence.
- The code identifies its context, omitted dependencies and compatibility limits.
- The takeaway explains the observed result rather than repeating the title.

Offer alternate code examples when they answer a real choice: standard/sorted/
hashed tables, for example. Give each a concise purpose and result; do not add
variants merely to increase the count. A conceptual question can have a clear
text or diagram explanation without code.

## Make checkpoints reveal understanding

Ask learners to predict a value or outcome before showing the next step. Then
explain what happened and the rule responsible. Useful prompts include:

- Which row does this lookup return, and which key supports it?
- What remains saved if this operation fails?
- At which step do the successful and rejected scenarios diverge?
- Which changed requirement would make the alternative approach preferable?

Use authored feedback to explain both the answer and plausible mistakes. Do not
equate recognition in a quiz with an unprompted explanation. Recommend revisiting
weak material, but do not describe scheduled repetition, speech grading or remote
progress sync as existing app features.

## Review and publish

Check question IDs, topic membership, unique route steps, prerequisite links,
learning-level coverage and EN/RU parity. Preview the actual filtered library,
path navigation and final review action in both languages. Confirm that opening
a prerequisite or a question outside the selected level remains understandable.

Rebuild generated assets and run the project checks in
[Development.md](Development.md). When inventory changes, update counts in
[Study_Plan.md](../study/Study_Plan.md) from the source data, not from screenshots.
Assess technical content against primary SAP documentation and the stated target
release. Browser behavior and teaching excerpts do not establish SAP syntax,
activation, ATC or runtime correctness.
