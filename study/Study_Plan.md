# Choose a learning route

The studio contains 353 questions across 10 topics, 123 authored multiple-choice
challenges and 28 guided lessons. It is a library you can explore freely, with
short recommended paths when you want a starting point. A path introduces a
topic; it does not cover every question or establish production readiness.

## Start with your goal

- **Learn the basics** opens the ABAP topic and its suggested path with the Core filter. Use it
  when you want to build an explanation from smaller concepts and examples.
- **Prepare for an interview** opens Practice with all levels. Explain a familiar
  topic without notes, then use the answer and feedback to find your gaps.

You can change direction at any time. Optional prerequisite links help you find
background material; they never lock questions or require a passing score.

## Choose the right level

| Learning level | What to aim for |
| --- | --- |
| **Core: basics** | Explain one concept and predict a small example. |
| **Applied: application** | Choose an approach, read its code and find a typical mistake. |
| **Advanced: complex scenarios** | Reason about interacting mechanisms, failure boundaries and trade-offs. |

These describe the learning task, not your job title. A Core question can still
have demanding interview follow-ups. The original Senior interview criteria
remain useful for deeper discussion; they are separate from the learning level.

Use the level filter in Learn or Practice to narrow the library. Choose
**Recommended order** for a concept-building sequence, or **Question ID** to find
a known item. The global search remains a way to find material across the full
library, including questions outside the current filters.

## Follow a short path

Each topic has an optional path of six to eight questions, with a stated goal.
Read the named next question to continue the path, or follow a prerequisite when
the explanation assumes something unfamiliar. Visited questions indicate where
you have been, **not what you have mastered**.

Use the ABAP path for language and object-oriented foundations. For RAP, establish
what a business object contains and how its buffer works before reasoning about
save processing. CDS, integration, Clean Core, performance and testing paths
offer their own starting points; you do not need to finish the whole library
before studying a topic relevant to your work.

The app reads the maintained sequences and goals from
[`curriculum/learning.json`](https://github.com/Rykhard/ABAP-Interview-Studio/blob/main/curriculum/learning.json). Use the app to follow
the current question links rather than treating a module number or alphabetical
ID order as a learning dependency.

## Study one example actively

1. Read the question and try a short answer before revealing the explanation.
2. Read the short answer. Identify the one idea the example should demonstrate.
3. Before advancing a code or process step, predict the value, saved state or
   error you expect. Keep the same example in mind as you move between views.
4. Compare the prediction with the actual example and its explanation. If it
   differs, identify the exact rule or assumption you missed.
5. Read the important mistake and open deeper details when the question needs
   them. Explain the concept again in your own words, using a different value or
   failure condition.

Use Explanation for the concept, Code for an implementation example and Step by
step where a guided lesson is available. Not every question needs all three.
An excerpt explains a particular mechanism; read its stated context before
assuming it is a complete program or valid for your SAP release.

## Check understanding, then revisit gaps

Interview practice lets you answer aloud, reveal the model answer and self-rate
your explanation. It does not record a microphone or grade speech. Multiple-choice
practice is available for the 123 questions with authored choices; it gives
feedback after submission. The two formats measure different things: recognizing
an option does not prove you can explain the decision without prompts.

At the end of a learning path, review its questions in Practice. Use an available
quiz or guided example as an additional check. Explain why an alternative fails,
not only why your chosen answer works. Review a weak answer again on a later day
and change the example to check whether you understood the rule.

Choose a session you can finish attentively rather than a fixed daily duration.
Retry mistakes, return to missing prerequisites and save questions you want to
revisit. The app keeps local study progress where browser storage is available;
it does not provide scheduled spaced repetition or cross-device account sync.
Opening a question, a correct quiz answer and a strong spoken explanation are
different kinds of evidence.

## Prepare a stronger interview answer

After the basic explanation, add the constraint that changes your decision, an
alternative you rejected and a meaningful way to verify the result. Use Advanced
questions and optional Senior probes for that discussion. If a scenario exposes
a foundation gap, follow its prerequisite instead of memorizing a longer answer.

For project stories, distinguish a learning exercise from production experience.
State the business context, your own role, decision, verification and actual
outcome. Do not invent measurements or claim work you did not perform.

Before discussing a concrete SAP implementation, establish the edition, release,
ABAP language version, API release status and relevant consumer version. The
teaching example and the date of this guide do not establish feature availability
on every system.

## Optional study formats

The repository also contains printable guides, the
[visual gallery](../visuals/README.md) and Anki decks under `flashcards/`.
These are optional companions to the web app. See
[the editorial guide](../docs/Learning.md) for how the learning levels, paths and
examples are maintained.
