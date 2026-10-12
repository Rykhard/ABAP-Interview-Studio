# Interview answers and project discussion

Use these structures with your real experience. Keep the first answer to about one minute, then expand when asked. Be explicit about the part you owned, the constraints and the evidence for the outcome.

[Return to the study guide](../README.md) | [Study plan](../study/Study_Plan.md)

## STORY-01 How would you introduce yourself for an ABAP role?

**Level:** Core

**Short answer:** I would give a short, truthful summary of my ABAP work and connect it to this role. I would name my main responsibilities, two relevant strengths and one real example. I would clearly separate production work from courses or personal projects. The aim is to give the interviewer useful starting points, rather than list every technology I have heard of.

**Reasoning and example:** Use this outline with your own facts: My current focus is [real area]. I mainly work on [actual responsibilities]. My strongest relevant skills are [skill one] and [skill two]. In [real project or clearly labeled lab], I handled [your contribution], and the result was [supported outcome]. This role interests me because [honest reason].

Keep the first version short enough to say naturally. Prepare a deeper explanation for each claim, including the system context and what you personally did. If RAP experience comes from a lab, say so and explain what you built and tested there. Do not fill missing experience with invented clients, years or metrics.

**Avoid this mistake:** Do not invent years, clients, performance metrics or RAP production experience.

<details>
<summary>Visual: Explain decisions with evidence</summary>

![Explain decisions with evidence](../visuals/interview-evidence-story.svg)

Practice a 60-second version first, then expand the mechanism and evidence when prompted.

**Explain it:** Can you name the decision, trade-off and evidence without inventing metrics?

**Limit:** A rehearsal structure, not a scripted personal history or a substitute for technical depth.

</details>

## STORY-02 How do you explain a project you owned?

**Level:** Core

**Short answer:** I start with the problem and who needed it solved. Then I explain my own responsibility, the important constraint and the design I chose. I describe how I tested the work and what actually happened after delivery. Finally, I mention one thing I would improve. I keep the background short so there is time for technical follow-up questions.

**Reasoning and example:** Prepare a real example using these prompts: [users] needed [business outcome]. I owned [specific part], while [other team] owned [their part]. The main constraint was [actual constraint]. I chose [design] because [reason], and checked it with [tests actually run]. The observed result was [truthful outcome].

Be ready to draw the request and save flow, explain one rejected option and discuss a failure case. If you have a classic ABAP example and a modern service example, prepare both. A learning project is still useful when labeled accurately. Listing transaction codes alone does not explain ownership; your decisions and evidence show what you contributed.

**Avoid this mistake:** Listing transactions and technologies without explaining the result does not show ownership.

<details>
<summary>Visual: Explain decisions with evidence</summary>

![Explain decisions with evidence](../visuals/interview-evidence-story.svg)

Practice a 60-second version first, then expand the mechanism and evidence when prompted.

**Explain it:** Can you name the decision, trade-off and evidence without inventing metrics?

**Limit:** A rehearsal structure, not a scripted personal history or a substitute for technical depth.

</details>

## STORY-03 How do you answer a question when the SAP release is unknown?

**Level:** Advanced

**Short answer:** I explain the part of the answer that is generally true, then identify what depends on the SAP edition or release. I ask for that missing context and say how I would verify support. I can also describe a supported alternative if the feature is unavailable. This is more useful than guessing syntax or just saying it depends.

**Reasoning and example:** For a RAP question, I can first explain the business need: for example, reject an invalid change before saving. Then I identify the exact feature or BDL syntax whose availability needs checking in the target release. For an API, I check whether the required operation is released for the intended use, not just whether an object with that name exists.

A spoken answer can use placeholders honestly: On [known environment] I used [actual feature]. For your release, I would check [specific documentation or repository release information] before choosing it. If unavailable, I would evaluate [real alternative]. This shows a verification method without pretending all SAP systems support the same implementation.

**Avoid this mistake:** Saying it depends without explaining what it depends on is not a useful answer.

<details>
<summary>Visual: Explain decisions with evidence</summary>

![Explain decisions with evidence](../visuals/interview-evidence-story.svg)

Practice a 60-second version first, then expand the mechanism and evidence when prompted.

**Explain it:** Can you name the decision, trade-off and evidence without inventing metrics?

**Limit:** A rehearsal structure, not a scripted personal history or a substitute for technical depth.

</details>

## STORY-04 How do you discuss a performance improvement?

**Level:** Core

**Short answer:** I explain what was slow, how I measured it and what data volume the measurement used. Then I describe the bottleneck, the change and the measured result. I also explain how I checked that the result stayed correct. I use only figures from my actual work. If no reliable numbers were recorded, I say that instead of inventing a speedup.

**Reasoning and example:** Prepare a real sequence: [operation] was slow with [representative workload]. I used [tool actually used] and found [observed cause]. I changed [specific access or processing step]. Under [comparable test conditions], the result changed from [measured baseline] to [measured outcome]. I checked correctness using [actual comparison or tests].

Be ready to explain why the change helped. Fewer database round trips, fewer transferred rows or an appropriate internal-table key are clearer than saying the code was optimized. Include a limitation, such as a workload not yet measured, if it is real. If your example is a lab benchmark, identify it as one and do not present its results as production evidence.

**Avoid this mistake:** Do not claim a speedup from code appearance alone or memorize an invented percentage.

<details>
<summary>Visual: Explain decisions with evidence</summary>

![Explain decisions with evidence](../visuals/interview-evidence-story.svg)

Practice a 60-second version first, then expand the mechanism and evidence when prompted.

**Explain it:** Can you name the decision, trade-off and evidence without inventing metrics?

**Limit:** A rehearsal structure, not a scripted personal history or a substitute for technical depth.

</details>

## STORY-05 How would you defend an architecture trade-off?

**Level:** Advanced

**Short answer:** I compare options using the actual requirement: what must save together, which APIs exist, who uses the result and how failures are handled. I state my choice and its main cost. I also explain what would make me choose differently. A good answer shows why the decision fits this situation, not loyalty to a particular SAP product.

**Reasoning and example:** For a real extension decision, describe [business need] and the change that must happen reliably. If validation must reject a local save, explain which supported extension point can run at the right time. If a separate portal is involved, explain its remote calls, login needs and recovery when one system is unavailable.

Then state the evidence you would check: API availability in [target product], transaction behavior and a realistic failure test. Use your actual experience or label the example as a proposed design. Saying always use BTP or always use RAP skips the reason for the choice. A convincing answer includes the downside of the selected option and when it stops being suitable.

**Avoid this mistake:** Always use RAP or always use BTP is not an architecture argument.

<details>
<summary>Visual: Explain decisions with evidence</summary>

![Explain decisions with evidence](../visuals/interview-evidence-story.svg)

Practice a 60-second version first, then expand the mechanism and evidence when prompted.

**Explain it:** Can you name the decision, trade-off and evidence without inventing metrics?

**Limit:** A rehearsal structure, not a scripted personal history or a substitute for technical depth.

</details>

## STORY-06 What should you ask the interviewer?

**Level:** Core

**Short answer:** I would ask about the SAP systems, the work I would own and how the team delivers changes. I want to know the mix of classic ABAP and RAP, the Clean Core rules, and the testing and release process. I would also ask who handles UI, integration and production incidents. Three focused questions are usually better than a long technology checklist.

**Reasoning and example:** Choose questions that affect your daily work: Which editions and releases do you support? What would I build or maintain in the first few months? How does a change move from development to production? These invite concrete answers about the role, rather than only a list of products.

Then follow one answer with a practical example: Can you describe a recent Clean Core decision or a difficult production issue and how the team handled it? Listen for ownership, review and testing responsibilities. The title ABAP Developer can cover maintenance, new services or migration work. Use the discussion to understand the actual job and compare it with your real experience and learning goals.

**Avoid this mistake:** Do not assume the role title tells you whether the work is maintenance, migration or new development.

<details>
<summary>Visual: Explain decisions with evidence</summary>

![Explain decisions with evidence](../visuals/interview-evidence-story.svg)

Practice a 60-second version first, then expand the mechanism and evidence when prompted.

**Explain it:** Can you name the decision, trade-off and evidence without inventing metrics?

**Limit:** A rehearsal structure, not a scripted personal history or a substitute for technical depth.

</details>

## Official references

These are rehearsal structures. Populate them with your own truthful experience.
