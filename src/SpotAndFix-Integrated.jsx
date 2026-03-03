import { useState, useEffect, useRef, useCallback } from "react";

/*
 ╔═══════════════════════════════════════════════════════════════╗
 ║  SPOT & FIX — Grammar practice with consequences             ║
 ║  Integrated app: Modules 1–4, Facilitator Dashboard          ║
 ║  v4 spec: No cost counter. Stakes on Pattern C meaning.      ║
 ╚═══════════════════════════════════════════════════════════════╝
*/

// ─── DESIGN TOKENS ───────────────────────────────────────────────
const T = {
  bg: "#0f172a", bgCard: "#1e293b", bgHover: "#283548",
  border: "rgba(100,116,139,0.3)",
  text: "#f1f5f9", text2: "#94a3b8", text3: "#8494a7",
  ok: "#34d399", okBg: "rgba(52,211,153,0.1)",
  err: "#f65f78", errBg: "rgba(246,95,120,0.08)",
  m1: "#539bf5", m2: "#f59e0b", m3: "#22c55e", m4: "#f65f78",
  purple: "#a78bfa",
};
const ACCENT = { 1: T.m1, 2: T.m2, 3: T.m3, 4: T.m4 };
const GLOW = k => `${ACCENT[k]}18`;

// ─── FONTS & GLOBAL CSS ──────────────────────────────────────────
const FONT_URL = "https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@300;400;600;700&family=Source+Serif+4:ital,wght@0,400;0,600;1,400&display=swap";
const CSS = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{font-size:16px;-webkit-text-size-adjust:100%}
body{background:${T.bg};margin:0;padding:0;line-height:1.5}
h1,h2,h3,h4,h5,h6{margin:0;padding:0;font-size:inherit;font-weight:inherit}
p{margin:0;padding:0}
button{font-family:inherit;font-size:inherit;color:inherit;line-height:inherit;margin:0;padding:0;background:none;border:none;cursor:pointer;text-align:left}
textarea{font-family:inherit;font-size:inherit;color:inherit}
*:focus-visible{outline:2px solid #fbbf24!important;outline-offset:3px!important;border-radius:4px}
::selection{background:rgba(244,63,94,0.3);color:#fff}
.skip{position:absolute;left:-9999px;top:auto;z-index:1000;padding:8px 16px;background:#fbbf24;color:#0f172a;font-family:'Josefin Sans',sans-serif;font-weight:700;text-decoration:none;border-radius:0 0 8px 0}
.skip:focus{left:0;top:0}
.fac-btn{position:absolute;left:-9999px;top:auto;z-index:1000;padding:8px 16px;background:#539bf5;color:#fff;font-family:'Josefin Sans',sans-serif;font-weight:700;border:none;border-radius:0 0 8px 0;cursor:pointer;font-size:13px}
.fac-btn:focus{left:0;top:36px}
@keyframes fu{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes fi{from{opacity:0}to{opacity:1}}
@keyframes rs{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
@media(max-width:640px){[data-grid]{grid-template-columns:1fr!important}}
`;

const sf = { fontFamily: "'Source Serif 4',Georgia,serif" };
const jf = { fontFamily: "'Josefin Sans',sans-serif" };
const btn = (x={}) => ({ ...jf, fontSize:15, fontWeight:600, border:"2px solid transparent", borderRadius:12, padding:"14px 28px", cursor:"pointer", transition:"all 0.2s", outline:"none", background:"rgba(30,41,59,0.6)", color:T.text, textAlign:"center", ...x });
const pbtn = (bg,fg="#fff") => btn({ background:bg, color:fg, border:"none", fontWeight:700 });
const tag = (c,bg) => ({ ...jf, fontSize:13, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:c, background:bg||"transparent" });

// ─── MODULE METADATA ─────────────────────────────────────────────
const MODS = [
  { id:1, title:"One or Many?", focus:"Subject-Verb Agreement", sub:"Find the Subject", desc:"One person responsible, or twelve? When extra words pile up between the subject and verb, the answer gets buried. Find it.", desk:"“When words come between the subject and verb, stop and find the real subject. Cross out the noise—the noun that’s left tells you the verb.”", n:8, pat:"Pattern A + Slow Down Round", status:"play" },
  { id:2, title:"The Reviewer’s Red Pen", focus:"Pronouns", sub:"Accept or Defend", desc:"A reviewer flagged nine sentences. Some flags are wrong. Decide which ones you’d push back on—and how sure you are.", desk:"“When several words come between the verb and its subject, check the pronoun carefully. Do the true subject and verb work together properly? Edit to ensure subject-verb agreement.”", n:9, pat:"Pattern A + Pattern C + Slow Down Round", status:"play" },
  { id:3, title:"Not What You Meant", focus:"Modifiers", sub:"What Landed on Your Desk", desc:"These sentences say things nobody intended. One of them made the news. Figure out what went wrong.", desk:"“When you start with an -ing phrase, check that the next noun is the one doing that action.”", n:5, pat:"Pattern A + Pattern D + Slow Down Round", status:"play" },
  { id:4, title:"Same Words, Different Comma", focus:"Commas", sub:"Same Words, Different Comma", desc:"Same words. One comma. Two completely different policies. Pick which version your agency actually meant to send.", desk:"“Read every ‘who’ and ‘which’ clause both ways. If the meaning changes, choose deliberately.”", n:8, pat:"Patterns A, C, and D rotate", status:"play" },
];

// ═════════════════════════════════════════════════════════════════
// SENTENCE DATA
// ═════════════════════════════════════════════════════════════════

// ─── MODULE 1: SVA ───────────────────────────────────────────────
const SVA_CX = [
  { id:1, parts:[{t:"Each",cx:false},{t:" of the managers ",cx:true},{t:"_V_"},{t:" with the decision.",cx:false}], opts:["agrees","agree"], ans:"agrees", sub:"Each", rFb:"“Of the managers” is a prepositional phrase. Cross it out: the real subject is “Each.” Always singular. Verb: “agrees.”", wFb:"The word “managers” pulled you toward plural. But “of the managers” is a prepositional phrase. Cross it out: “Each ___ with the decision.” Subject is “each”—always singular. Verb: “agrees.”" },
  { id:2, parts:[{t:"Employees",cx:false},{t:" from each organization ",cx:true},{t:"_V_"},{t:" the conference.",cx:false}], opts:["attend","attends"], ans:"attend", sub:"Employees", rFb:"“From each organization” is a prepositional phrase. Cross it out: “Employees ___ the conference.” Plural subject, plural verb: “attend.”", wFb:"The singular “organization” may have pulled you toward “attends.” But it’s inside a prepositional phrase. Cross it out: “Employees ___ the conference.” Plural verb: “attend.”" },
  { id:3, parts:[{t:"The reports",cx:false},{t:" containing the missing information ",cx:true},{t:"_V_"},{t:" today.",cx:false}], opts:["arrive","arrives"], ans:"arrive", sub:"The reports", rFb:"“Containing the missing information” is a participial phrase. Cross it out: “The reports ___ today.” Plural verb: “arrive.”", wFb:"“Containing the missing information” is a participial phrase—noise between subject and verb. Cross it out: “The reports ___ today.” Plural verb: “arrive.”" },
  { id:4, parts:[{t:"Outgoing letters and packages",cx:false},{t:" "},{t:"_V_"},{t:" our office every Tuesday.",cx:false}], opts:["leave","leaves"], ans:"leave", sub:"Letters and packages", rFb:"Nothing to cross out—and that’s the point. “Outgoing letters and packages” sits right next to the verb. Two nouns joined by “and” = plural. Verb: “leave.”", wFb:"No noise to cross out. “Outgoing letters and packages”—two nouns joined by “and” = plural. Verb: “leave.”" },
];
const SVA_FS = [
  { id:5, display:["Complaints ","about the new policy ","_V_"," a written response."], choices:[{t:"Complaints",ok:true},{t:"the new policy",ok:false,fb:"“About the new policy” is a prepositional phrase. The subject is “Complaints”—plural verb: “require.”"},{t:"a written response",ok:false,fb:"That’s the object. The subject is “Complaints”—plural verb: “require.”"}], opts:["require","requires"], ans:"require", sub:"Complaints", okBoth:"“Complaints” is the subject. “About the new policy” is a prepositional phrase—the singular “policy” can pull you toward “requires,” but the subject is plural. Verb: “require.”", okSWV:"Right subject but wrong verb. “Complaints” is plural: “require.”" },
  { id:6, display:["The status ","of the pending applications ","_V_"," unclear."], choices:[{t:"The status",ok:true},{t:"the pending applications",ok:false,fb:"“Of the pending applications” is a prepositional phrase. The subject is “the status”—singular verb: “remains.”"},{t:"applications",ok:false,fb:"“Applications” is inside the prepositional phrase. The subject is “the status”—singular verb: “remains.”"}], opts:["remains","remain"], ans:"remains", sub:"The status", okBoth:"“The status” is the subject. “Of the pending applications” is noise. Singular verb: “remains.”", okSWV:"Right subject but wrong verb. “Status” is singular: “remains.”" },
  { id:7, display:["The recommendations ","in the final report ","_V_"," immediate action."], choices:[{t:"The recommendations",ok:true},{t:"the final report",ok:false,fb:"“In the final report” is a prepositional phrase. The subject is “the recommendations”—plural verb: “require.”"},{t:"immediate action",ok:false,fb:"That’s the object. The subject is “the recommendations”—plural verb: “require.”"}], opts:["require","requires"], ans:"require", sub:"The recommendations", okBoth:"“The recommendations” is the subject. “In the final report” is a prepositional phrase—cross it out and the plural subject is clear. Verb: “require.”", okSWV:"Right subject but wrong verb. “Recommendations” is plural: “require.”" },
  { id:8, display:["Every inspection report and compliance filing ","_V_"," the director’s signature."], choices:[{t:"Every inspection report and compliance filing",ok:true},{t:"inspection report and compliance filing",ok:false,fb:"Almost—don’t drop “every.” When “every” precedes compound nouns, it makes the subject singular. Verb: “requires.”"},{t:"the director’s signature",ok:false,fb:"That’s the object. The subject is “every inspection report and compliance filing.” “Every” makes it singular. Verb: “requires.”"}], opts:["requires","require"], ans:"requires", sub:"Every...filing", okBoth:"“Every” makes this singular even with two nouns. Verb: “requires.”", okSWV:"Right subject. But “every” makes it singular—verb is “requires.”" },
];

// ─── MODULE 2: PRONOUNS ──────────────────────────────────────────
const PRO = [
  { id:1, text:"The system directs incoming calls to Hakeem and me.", ok:true, pr:"Objective case after preposition", fb:{ ds:"You got it. “To” is a preposition—pronouns inside prepositional phrases are always objects. “To Hakeem and me” is correct the same way “to me” is correct.", du:"You’re right. “To” is a preposition. Try removing “Hakeem and”—you’d never write “directs calls to I.” Adding another person doesn’t change the rule.", as:"This is one of the most common overcorrections. “To” is a preposition. Remove “Hakeem and” and test: “directs calls to me” works. “Directs calls to I” doesn’t.", au:"“Hakeem and me” sounds informal, but it’s correct. “To” is a preposition. Test: “directs calls to me” works. “Directs calls to I” doesn’t." } },
  { id:2, text:"A workshare agreement between her and me outlines our duties.", ok:true, pr:"Objective case after preposition", fb:{ ds:"Correct. “Between” is a preposition. “Her” and “me” are both objects of it. You didn’t let the formal tone push you toward “she and I.”", du:"You’re right to defend it. “Between” is a preposition. “Between her and me” follows the same rule as “between us.”", as:"This is the “between you and I” trap. “Between” is a preposition. Test: you’d say “between us,” not “between we.” Same rule.", au:"The formal tone makes “her and me” feel wrong. But “between” is a preposition. Test: “between us” works. “Between we” doesn’t." } },
  { id:3, text:"You must inform each employee of his, her, or their current, unused paid sick leave balance.", ok:true, pr:"Inclusive pronoun agreement", fb:{ ds:"Right. “Each employee” is singular, and “his, her, or their” matches it while covering everyone.", du:"This is correct. Singular “their” is accepted in Washington state government writing for gender-neutral use.", as:"You may have paused because “their” can feel plural. But singular “their” is standard in state government writing. “His, her, or their” covers everyone.", au:"It’s fair to pause here. But singular “their” is accepted in state government style. “His, her, or their” covers all employees." } },
  { id:4, text:"Whom will we include in the stakeholder communication plan?", ok:true, pr:"Who/whom — pronoun receives action", fb:{ ds:"Correct. “Whom” is object case. We are including whom—the pronoun receives the action. Swap test: “We will include him” works.", du:"You’re right. “Who” does the action; “whom” receives it. We are including this person. Object case. “Whom” is correct.", as:"“Whom” is correct. The pronoun receives the action of “include.” Swap test: “We will include him” works. “Him” means “whom.”", au:"“Whom” at the start can feel odd. But the pronoun receives the action of “include.” Swap: “We will include him” works." } },
  { id:5, text:"Who do you want to edit the draft policy?", ok:false, fix:"Whom do you want to edit the draft policy?", pr:"Who/whom — pronoun receives action", fb:{ ds:"This one tricks most people. Flip it: “You want [someone] to edit.” The pronoun receives the action of “want.” Object case. Should be “Whom.”", du:"Your doubt was right. Flip it: “You want [someone] to edit.” The pronoun receives the action. Should be “Whom do you want to edit the draft policy?”", as:"Good catch. “Who” sounds right, which is why this gets past experienced editors. Flip it: “You want [someone] to edit.” Object case. Should be “Whom.”", au:"Something felt off, and you were right. Flip: “You want [someone] to edit.” The pronoun receives the action. Should be “Whom.”" } },
  { id:6, text:"The managing director will approve whomever you choose.", ok:true, pr:"Who/whom inside a clause", fb:{ ds:"Correct. Inside the clause: “you choose whomever.” The pronoun receives the action of “choose.” Object case.", du:"You’re right. Inside the clause: “you choose whomever.” The pronoun’s case is decided by its role inside its own clause.", as:"Look inside the clause: “you choose whomever.” Being chosen = object case. The pronoun’s job is decided inside its own clause.", au:"The whole clause is the object of “approve,” but inside the clause: “you choose whomever.” Object case." } },
  { id:7, text:"We removed the only table we had, which was damaged, from the office.", ok:true, pr:"Nonrestrictive “which” with commas", fb:{ ds:"Right. “The only table we had” already identifies it. “Which was damaged” adds extra info. Extra info = “which” with commas.", du:"This is correct. There’s only one table. The clause adds a detail, not an identification. Extra info uses “which” with commas.", as:"The table is already identified: “the only table we had.” “Which was damaged” can’t narrow it further. Extra info = “which” with commas.", au:"Ask: does the reader need “which was damaged” to know which table? No. It’s extra info. Use “which” with commas." } },
  { id:8, text:"Use the email address that you registered with our agency as your Secure Access username.", ok:true, pr:"Restrictive “that” clause, no commas", fb:{ ds:"Correct. Without “that you registered,” the sentence just says “use the email address.” Which one? The clause is essential. Essential = “that”, no commas.", du:"You’re right. Take the clause out: “Use the email address as your username.” Which one? The reader needs the clause. Essential = “that”, no commas.", as:"This clause does essential work. Without it: “Use the email address as your username.” The reader doesn’t know which one. Essential = “that,” no commas.", au:"Try removing the clause: “Use the email address as your username.” Doesn’t work—the reader needs to know which one. Essential = “that,” no commas." } },
  { id:9, text:"She used her right hand, which was shaking, to cut the wire.", ok:true, pr:"Nonrestrictive “which” with commas", fb:{ ds:"Right. “Her right hand” already tells the reader which hand. “Which was shaking” adds a detail. Extra info = “which” with commas.", du:"This is correct. She only has one right hand. The clause adds extra detail. When you can remove the clause without losing the main idea, use “which” with commas.", as:"“Her right hand” already identifies which hand. “Which was shaking” adds a detail that doesn’t help identify it. Extra info = “which” with commas.", au:"Ask: does the reader need the clause to know which hand? “Her right hand” already tells them. Extra detail = “which” with commas." } },
];

// ─── MODULE 4: COMMAS (v4 spec — no cost counter, all 8 sentences) ─
const CM = [
  // Sentence 1 — Pattern C
  { id:"cm1", pat:"C", ctx:"Your agency means to say: only employees who completed the training are eligible. Not everyone.", vA:"The employees who completed the safety training are eligible for the hazard pay differential.", vB:"The employees, who completed the safety training, are eligible for the hazard pay differential.", ans:"A", revR:"Without commas, the clause identifies which employees. Only those who completed training qualify. That’s a restrictive clause—it restricts who’s eligible.", revW:"Version B—with commas—means all employees are eligible. The training clause becomes extra context, not a requirement. Payroll processed hazard pay for the full workforce.", csq:"Payroll processed hazard pay for the full workforce. The agency overpaid 340 employees before the error was caught." },
  // Sentence 2 — Pattern C
  { id:"cm2", pat:"C", ctx:"Your agency means to say: all field inspectors have credentials that expired in December, and all must recertify. The expiration clause describes the whole group, not a subset.", vA:"Field inspectors whose credentials expired in December must complete recertification by March 31.", vB:"Field inspectors, whose credentials expired in December, must complete recertification by March 31.", ans:"B", revR:"With commas, the clause describes all field inspectors—their credentials all expired in December, and they all must recertify. The expiration date is context, not a filter.", revW:"Version A—without commas—restricts the requirement to only those inspectors whose credentials expired specifically in December. Inspectors with January or November expirations argued they weren’t included. The agency had to send individual notices to 60 inspectors who assumed they had more time." },
  // Sentence 3 — Pattern C
  { id:"cm3", pat:"C", ctx:"Your agency means to say: there is only one program, and it was launched in 2019.", vA:"The program which was launched in 2019 has served over 10,000 residents.", vB:"The program, which was launched in 2019, has served over 10,000 residents.", ans:"B", revR:"With commas, “which was launched in 2019” is extra context about the one program that exists. The sentence describes a single program and adds when it started.", revW:"Version A—without commas—implies multiple programs exist and this clause identifies which one. A legislator asked staff which other programs exist and why they weren’t in the briefing.", csq:"Staff spent a full day pulling data on programs that didn’t exist—because the sentence implied there were several and this clause was picking one out." },
  // Sentence 4 — Pattern D (What Landed on Your Desk)
  { id:"cm4", pat:"D", deskLabel:"Applicant phone call", deskDoc:"An applicant called your intake line:", deskQuote:"“I submitted everything you asked for—background check, disclosure form, insurance—all verified by an independent auditor. Now you’re telling me my background check is ‘unverified’? Your instructions said only the insurance needed verification.”", deskAction:"Your supervisor asks you to pull the original requirements page. Here is the sentence:", ctx:"From the requirements page for new applicants", sent:"Applicants must submit a background check, a signed disclosure form, and proof of insurance that has been verified by an independent auditor.", fix:"Applicants must submit a background check, a signed disclosure form, and proof of insurance—all of which must be verified by an independent auditor.", connection:"The restrictive clause “that has been verified” attached only to “proof of insurance”—the last item in the series. The applicant read the sentence exactly as written: only the insurance needed verification.", csq:"Half the applicants submitted unverified background checks, creating a processing bottleneck when intake staff sent them back." },
  // Sentence 5 — Pattern A
  { id:"cm5", pat:"A", ctx:"From a communications plan shared with leadership", sent:"The agency will notify stakeholders who are affected by the policy change, before the end of the fiscal year.", fix:"The agency will notify stakeholders who are affected by the policy change before the end of the fiscal year.", errT:"Unnecessary comma splits the sentence", csq:"The comma before “before” split the sentence into two thoughts. Leadership didn’t realize only affected stakeholders would be notified. The communications plan launched with the wrong distribution list.", fixT:"Without that comma, the deadline attaches directly to the notification—one clear action with a clear timeline." },
  // Sentence 6 — Pattern C
  { id:"cm6", pat:"C", ctx:"Your agency means to say: only contractors who were flagged during the review need to submit additional documentation.", vA:"Contractors who were flagged during the review must submit additional documentation within 30 days.", vB:"Contractors, who were flagged during the review, must submit additional documentation within 30 days.", ans:"A", revR:"Without commas, the clause restricts which contractors must act. Only those flagged during the review are required to submit documentation.", revW:"Version B—with commas—means all contractors were flagged and all must submit documentation. Every contractor in the program received the demand letter.", csq:"The agency received 800 unnecessary document submissions and had to issue a retraction—because the commas turned a targeted requirement into a universal one." },
  // Sentence 7 — Pattern D (What Landed on Your Desk)
  { id:"cm7", pat:"D", deskLabel:"Union grievance filing", deskDoc:"A union representative is in your director’s office with a grievance filing:", deskQuote:"“The relocation policy clearly states that all staff in the affected divisions are entitled to assistance. Your managers are selectively denying benefits to employees in Division C who didn’t relocate. The language doesn’t say they had to move.”", deskAction:"Your director asks you to pull the policy. Here is the sentence:", ctx:"From the agency’s relocation policy", sent:"Staff in the affected divisions, who relocated during the consolidation, are entitled to relocation assistance.", fix:"Staff in the affected divisions who relocated during the consolidation are entitled to relocation assistance.", connection:"The commas made “who relocated” nonessential—meaning all staff in affected divisions are entitled, regardless of whether they relocated. The union’s reading was grammatically correct. Management intended the benefit only for those who actually moved.", csq:"The union filed a formal grievance. Management intended the benefit only for staff who relocated, but the commas made “who relocated” a parenthetical aside—extra context, not a requirement." },
  // Sentence 8 — Pattern A (Final Sentence)
  { id:"cm8", pat:"A", ctx:"From a grant agreement between a state agency and a nonprofit", sent:"The grantee shall return unused funds, and submit a final expenditure report, within 90 days of the grant period ending.", fix:"The grantee shall return unused funds and submit a final expenditure report within 90 days of the grant period ending.", errT:"Commas in compound predicate split the requirements", csq:"The comma after “funds” and before “and” separated the two requirements. The grantee’s attorney argued that “within 90 days” applied only to the expenditure report, not to returning funds. The grantee returned funds 11 months late and cited the agreement’s punctuation as justification.", fixT:"Without those commas, both requirements—returning funds and submitting the report—fall under the same 90-day deadline. One subject, two verbs, no comma before “and.”" },
];

// ─── TRAP CATEGORIES (for results screens) ──────────────────────
const M1_TRAPS={1:"noise",2:"noise",3:"noise",4:"compound",5:"noise",6:"noise",7:"noise",8:"every"};
const M1_TRAP_INFO={
  noise:{name:"Noise between subject and verb",tip:"Prepositional and participial phrases sit between the subject and verb. Cross them out—the noun that’s left tells you the verb."},
  compound:{name:"Compound subjects",tip:"Two nouns joined by “and” make a plural subject, plural verb."},
  every:{name:"“Every” with compound nouns",tip:"“Every” overrides compound nouns joined by “and.” The subject acts as singular even though two nouns are present."}
};
const M2_TRAPS={1:"case",2:"case",3:"inclusive",4:"whom",5:"whom",6:"whom",7:"clause",8:"clause",9:"clause"};
const M2_TRAP_INFO={
  case:{name:"Pronoun case after prepositions",tip:"After prepositions like “to” and “between,” pronouns take objective case: me, her, him—not I, she, he."},
  inclusive:{name:"Inclusive pronouns",tip:"Singular “their” is accepted in state government writing. “His, her, or their” covers everyone."},
  whom:{name:"Who vs. whom",tip:"Substitute “him” or “he.” If “him” works, use “whom.” If “he” works, use “who.”"},
  clause:{name:"Restrictive vs. nonrestrictive clauses",tip:"If the clause identifies which one, use “that” with no commas. If it adds extra detail about something already identified, use “which” with commas."}
};
const M4_TRAPS={cm1:"rv",cm2:"rv",cm3:"rv",cm4:"scope",cm5:"extra",cm6:"rv",cm7:"rv",cm8:"extra"};
const M4_TRAP_INFO={
  rv:{name:"Restrictive vs. nonrestrictive clauses",tip:"Commas around a “who” or “which” clause change whether it restricts or describes. Read it both ways."},
  scope:{name:"Clause scope in a series",tip:"A modifier at the end of a list may attach only to the last item. Make sure every item that needs it is clearly covered."},
  extra:{name:"Unnecessary commas",tip:"A comma in the wrong place can split one requirement into two separate thoughts—or let someone argue they’re separate."}
};

// ─── MODULE 3: MODIFIERS ────────────────────────────────────────
const MOD3 = [
  // Sentence 1 — Pattern A
  { id:"md1", pat:"A", ctx:"From a permitting decision letter to an applicant", sent:"After reviewing the application materials, the permit was approved by the department.", fix:"After reviewing the application materials, the department approved the permit.", explain:"The opening phrase says someone reviewed the materials. The next noun should be who did the reviewing—but it’s “the permit.” The sentence says the permit reviewed its own application. Moving “the department” to follow the opening phrase connects the action to the right actor.", csq:"The applicant’s attorney argued in an appeal that the sentence structure implied no human review occurred. The agency had to produce internal review documentation to prove otherwise, delaying the appeal by two months." },
  // Sentence 2 — Pattern A (the funny one)
  { id:"md2", pat:"A", ctx:"From an internal safety memo to facility managers", sent:"Here are some guidelines for handling hazardous materials from the safety office.", fix:"The safety office has issued these guidelines for handling hazardous materials.", explain:"“From the safety office” is meant to identify who wrote the guidelines. But sitting at the end, it modifies “hazardous materials.” The sentence says the hazardous materials come from the safety office. Restructuring puts the safety office at the front as the author, not the source of hazardous materials.", csq:"Two facility managers submitted incident reports asking why the safety office was distributing hazardous materials. The actual guidelines were ignored while staff sought clarification." },
  // Sentence 3 — Pattern A
  { id:"md3", pat:"A", ctx:"From an enforcement status update", sent:"Having failed to respond within 30 days, the agency closed the investigation into the firm.", fix:"Because the firm failed to respond within 30 days, the agency closed the investigation.", explain:"The opening phrase says someone failed to respond. The next noun is “the agency”—so the sentence says the agency failed to respond to itself. The firm is the one that didn’t respond. Restructuring makes the firm the subject of the failure and the agency the subject of the closing.", csq:"The firm’s counsel cited this language to argue the agency admitted to its own procedural failure, and that closing the investigation was improper." },
  // Sentence 4 — Pattern D (What Landed on Your Desk)
  { id:"md4", pat:"D", deskLabel:"News alert", deskDoc:"You open the morning news alerts and see this headline from a reporter who obtained the inspection summary via public records request:", deskQuote:"“State Inspector Exposed to Extreme Temperatures During Vaccine Facility Audit.” Your communications director is already calling.", deskAction:"Here is the sentence from the inspection summary that the reporter quoted:", ctx:"From a facility inspection summary", sent:"Exposed to extreme temperatures, the inspector noted that several vaccine storage units had malfunctioned.", fix:"The inspector noted that several vaccine storage units had malfunctioned after being exposed to extreme temperatures.", connection:"The opening phrase “Exposed to extreme temperatures” modifies the next noun—“the inspector.” The reporter read it exactly as written: the inspector was the one exposed to extreme temperatures. The story ran before the agency could correct the record. Moving the modifier to follow the vaccine storage units connects it to the right subject." },
  // Sentence 5 — Pattern B (Slow Down Round)
  { id:"md5", pat:"B", ctx:"From an audit findings report", sent:"The auditor found discrepancies in the financial statements using the new methodology.", fix:"Using the new methodology, the auditor found discrepancies in the financial statements.", consequence:"The auditee challenged the findings, arguing the sentence showed the financial statements used the new methodology—and the discrepancies were caused by the methodology change, not actual errors. The auditor had to issue a clarification memo.", explain:"The modifier “using the new methodology” sits at the end, next to “financial statements.” It could attach to either the auditor or the statements. The auditee chose the reading that suited their argument. Moving the modifier to the front, directly before “the auditor,” eliminates the ambiguity.", slowDown:"This sentence reads smoothly. It passed three rounds of editing and still caused trouble. When a modifier could attach to more than one noun—even faintly—that’s the moment to slow down." },
];
const M3_TRAPS={md1:"dangling",md2:"misplaced",md3:"dangling",md4:"dangling",md5:"misplaced"};
const M3_TRAP_INFO={
  dangling:{name:"Dangling participial phrases",tip:"When a sentence opens with a phrase like “After reviewing” or “Having failed,” the very next noun must be the one doing that action. If it’s not, the sentence says something unintended."},
  misplaced:{name:"Misplaced modifiers",tip:"A modifier attaches to whatever it’s closest to. If it’s sitting next to the wrong noun, the sentence says something you didn’t mean—and someone will read it that way."}
};

// ═════════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ═════════════════════════════════════════════════════════════════

function Shell({children,onDash}){
  return(
    <div style={{...jf,background:`linear-gradient(135deg,${T.bg} 0%,${T.bgCard} 50%,${T.bg} 100%)`,minHeight:"100vh",color:T.text,position:"relative",overflow:"hidden"}}>
      <style>{CSS}</style>
      <a href="#main" className="skip">Skip to content</a>
      {onDash&&<button className="fac-btn" onClick={onDash}>Open Facilitator Dashboard</button>}
      <div style={{position:"fixed",top:"-20%",right:"-10%",width:600,height:600,borderRadius:"50%",background:"radial-gradient(circle,rgba(251,146,60,0.05) 0%,transparent 70%)",pointerEvents:"none"}} aria-hidden="true"/>
      <div style={{position:"fixed",bottom:"-15%",left:"-10%",width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle,rgba(59,130,246,0.04) 0%,transparent 70%)",pointerEvents:"none"}} aria-hidden="true"/>
      <div style={{maxWidth:840,margin:"0 auto",padding:"56px 24px 48px",position:"relative",zIndex:1}} id="main" role="main">{children}</div>
    </div>
  );
}

function Header({num,title,focus,onBack}){
  const c=ACCENT[num];
  return(
    <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:28,animation:"fi 0.4s"}}>
      <button onClick={onBack} aria-label="Back to modules" style={btn({padding:"8px 14px",fontSize:13,borderRadius:8,borderColor:T.border})}
        onMouseEnter={e=>e.currentTarget.style.borderColor=c} onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}
      >{"←"} Back</button>
      <div>
        <div style={{display:"flex",alignItems:"baseline",gap:10}}>
          <span style={tag(c)}>{`Module ${num}`}</span>
          {focus&&<span style={{fontSize:13,color:T.text3,fontWeight:600}}>{focus}</span>}
        </div>
        <div style={{fontSize:22,fontWeight:700}}>{title}</div>
      </div>
    </div>
  );
}

function Progress({cur,tot,c}){
  const pct=Math.round((cur/tot)*100);
  return(
    <div style={{marginBottom:24}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
        <span style={{fontSize:13,fontWeight:600,color:T.text3}}>{cur} of {tot}</span>
        <span style={{fontSize:13,fontWeight:600,color:c}}>{pct}%</span>
      </div>
      <div style={{width:"100%",height:4,background:"rgba(148,163,184,0.1)",borderRadius:2}} role="progressbar" aria-valuenow={cur} aria-valuemin={0} aria-valuemax={tot}>
        <div style={{width:`${pct}%`,height:"100%",borderRadius:2,background:c,transition:"width 0.5s"}}/>
      </div>
    </div>
  );
}

function Fb({ok,text,children}){
  return(
    <div style={{background:ok?T.okBg:T.errBg,border:`1px solid ${ok?"rgba(52,211,153,0.3)":"rgba(244,63,94,0.3)"}`,borderRadius:12,padding:"20px 24px",marginTop:20,animation:"fu 0.4s"}} role="alert">
      <div style={{fontSize:14,fontWeight:700,color:ok?T.ok:T.err,marginBottom:8}}>{ok?"✓ Correct":"✗ Not quite"}</div>
      <div style={{...sf,fontSize:16,lineHeight:1.7,color:T.text}}>{text}</div>
      {children}
    </div>
  );
}

function TrapSummary({groups}){
  const caught=Object.values(groups).filter(g=>g.missed===0);
  const watch=Object.values(groups).filter(g=>g.missed>0);
  return(
    <div style={{marginBottom:24}}>
      {caught.length>0&&<div style={{marginBottom:watch.length>0?20:0}}>
        <div style={{...tag(T.ok),marginBottom:12}}>YOU CAUGHT IT</div>
        {caught.map((g,i)=>(
          <div key={i} style={{background:T.okBg,border:"1px solid rgba(52,211,153,0.15)",borderRadius:10,padding:"14px 18px",marginBottom:8,display:"flex",alignItems:"center",gap:10}}>
            <span style={{color:T.ok,fontSize:16,flexShrink:0}}>{"✓"}</span>
            <p style={{...sf,fontSize:15,fontWeight:600,color:T.ok,margin:0}}>{g.name}</p>
          </div>
        ))}
      </div>}
      {watch.length>0&&<div>
        <div style={{...tag(T.m2),marginBottom:12}}>WATCH FOR THIS</div>
        {watch.map((g,i)=>(
          <div key={i} style={{background:"rgba(251,191,36,0.06)",border:"1px solid rgba(251,191,36,0.15)",borderRadius:10,padding:"14px 18px",marginBottom:8}}>
            <p style={{...jf,fontSize:15,fontWeight:600,color:T.m2,margin:0,marginBottom:6}}>{g.name}</p>
            <p style={{...sf,fontSize:14,lineHeight:1.6,color:T.text2,margin:0}}>{g.tip}</p>
          </div>
        ))}
      </div>}
    </div>
  );
}

const card = { background:"rgba(30,41,59,0.8)", borderRadius:16, border:`1px solid rgba(148,163,184,0.1)`, padding:"28px 32px", backdropFilter:"blur(12px)" };

// ═════════════════════════════════════════════════════════════════
// MODULE 1: SUBJECT-VERB AGREEMENT
// ═════════════════════════════════════════════════════════════════

function Mod1({onBack,dash}){
  const c=T.m1;
  const [ph,setPh]=useState("intro"); // intro | cx | tr | fs | done
  const [i,setI]=useState(0);
  const [xd,setXd]=useState(new Set());
  const [vb,setVb]=useState(null);
  const [si,setSi]=useState(null);
  const [sh,setSh]=useState(false);
  const [res,setRes]=useState([]);
  const nR=useRef(null);

  const tot=SVA_CX.length+SVA_FS.length;
  const gi=ph==="cx"?i:ph==="fs"?4+i:0;
  useEffect(()=>{if(sh&&nR.current)nR.current.focus()},[sh]);
  const reset=()=>{setXd(new Set());setVb(null);setSi(null);setSh(false)};

  const advance=()=>{
    const isC=ph==="cx";
    const s=isC?SVA_CX[i]:SVA_FS[i];
    const vOk=vb===s.ans;
    let sOk=true;
    if(!isC){const ch=si!==null?s.choices[si]:null;sOk=ch?ch.ok:false}
    const r={id:s.id,vOk,sOk,ok:vOk&&sOk};
    setRes(p=>[...p,r]);
    dash.current.m1.push(r);
    reset();
    if(isC){i<SVA_CX.length-1?setI(j=>j+1):(setPh("tr"),setI(0))}
    else{i<SVA_FS.length-1?setI(j=>j+1):setPh("done")}
  };

  const getFb=()=>{
    const isC=ph==="cx";
    const s=isC?SVA_CX[i]:SVA_FS[i];
    if(isC)return vb===s.ans?s.rFb:s.wFb;
    const ch=si!==null?s.choices[si]:null;
    const sOk=ch?ch.ok:false;
    const vOk=vb===s.ans;
    if(sOk&&vOk)return s.okBoth;
    if(sOk&&!vOk)return s.okSWV;
    if(ch&&!sOk)return ch.fb;
    return `The subject is “${s.sub}”. Verb: “${s.ans}.”`;
  };

  if(ph==="intro")return(
    <div style={{textAlign:"center",animation:"fu 0.8s",padding:"60px 0"}}>
      <div style={{fontSize:64,marginBottom:16}} aria-hidden="true">{"🔍"}</div>
      <div style={{marginBottom:4}}><span style={tag(c)}>Module 1</span>{" "}<span style={{fontSize:13,color:T.text3,fontWeight:600}}>Subject-Verb Agreement</span></div>
      <h1 style={{fontSize:36,fontWeight:700,marginBottom:12}}>One or Many?</h1>
      <p style={{...sf,fontSize:17,fontStyle:"italic",color:T.text2,maxWidth:460,margin:"0 auto 32px",lineHeight:1.7}}>Extra words pile up between the subject and verb. Your job: find the real subject and pick the verb that matches. In Part 1, you&rsquo;ll cross out the noise first. In Part 2, you&rsquo;re on your own.</p>
      <button onClick={()=>setPh("cx")} style={pbtn(`linear-gradient(135deg,${c},#2563eb)`)}>Begin {"→"}</button>
    </div>
  );

  if(ph==="tr")return(
    <div><Header num={1} title="One or Many?" focus="Subject-Verb Agreement" onBack={onBack}/>
      <div style={{...card,textAlign:"center",animation:"fu 0.6s"}}>
        <div style={tag(T.m2)}>Part 2</div>
        <h2 style={{fontSize:26,fontWeight:700,margin:"12px 0 16px"}}>Now find the subject on your own</h2>
        <p style={{...sf,fontSize:17,color:T.text2,lineHeight:1.7,maxWidth:520,margin:"0 auto 28px"}}>No more crossing out. Read each sentence, pick the subject, then choose the verb.</p>
        <button onClick={()=>setPh("fs")} style={pbtn(`linear-gradient(135deg,${T.m2},#f97316)`,"#0f172a")}>Continue {"→"}</button>
      </div>
    </div>
  );

  if(ph==="done"){
    const groups={};
    res.forEach(r=>{const k=M1_TRAPS[r.id];if(!k)return;const info=M1_TRAP_INFO[k];if(!groups[k])groups[k]={...info,caught:0,missed:0};if(r.vOk)groups[k].caught++;else groups[k].missed++});
    return(
      <div><Header num={1} title="One or Many?" focus="Subject-Verb Agreement" onBack={onBack}/>
        <div style={{...card,animation:"fu 0.6s"}}>
          <h2 style={{fontSize:24,fontWeight:700,marginBottom:20}}>Here&rsquo;s what you&rsquo;d catch at your desk</h2>
          <TrapSummary groups={groups}/>
          <div style={{background:GLOW(1),border:"1px solid rgba(59,130,246,0.2)",borderRadius:12,padding:"20px 24px",marginBottom:24}}>
            <div style={{...tag(c),marginBottom:8}}>IN YOUR REAL WORK</div>
            <p style={{...sf,fontSize:16,lineHeight:1.7,color:"#cbd5e1"}}>When words come between the subject and verb, stop and find the real subject. Cross out prepositional phrases and other noise. The noun that’s left tells you whether the verb is singular or plural.</p>
          </div>
          <button onClick={onBack} style={pbtn(`linear-gradient(135deg,${c},#2563eb)`)}>Back to Modules</button>
        </div>
      </div>
    );
  }

  const isC=ph==="cx";
  const s=isC?SVA_CX[i]:SVA_FS[i];
  const canS=isC?vb!==null:(vb!==null&&si!==null);
  const isOk=isC?vb===s.ans:(vb===s.ans&&s.choices[si]?.ok);

  return(
    <div><Header num={1} title="One or Many?" focus="Subject-Verb Agreement" onBack={onBack}/>
      <Progress cur={gi+1} tot={tot} c={c}/>
      <div style={{...tag(isC?T.m3:T.m2),marginBottom:16}}>{isC?"Part 1: Cross out the noise":"Part 2: Find the subject"}</div>
      <p style={{...sf,fontSize:15,color:T.text2,marginBottom:16,lineHeight:1.6}}>{isC?"Tap the words between the subject and verb to cross them out. Then choose the verb that fits.":"Pick the real subject from the choices below, then choose the verb that matches."}</p>
      <div style={{...card,padding:"24px 28px",marginBottom:24,animation:"fu 0.5s"}}>
        <p style={{...sf,fontSize:19,lineHeight:1.8}}>
          {isC?s.parts.map((p,pi)=>{
            if(p.t==="_V_")return <span key={pi} style={{display:"inline-block",borderBottom:`2px dashed ${c}`,minWidth:80,textAlign:"center",padding:"2px 8px",color:c,fontWeight:600}}>{vb||"___"}</span>;
            if(p.cx){const cr=xd.has(pi);return <button key={pi} onClick={()=>{if(sh)return;setXd(p=>{const n=new Set(p);n.has(pi)?n.delete(pi):n.add(pi);return n})}} disabled={sh} style={{...sf,fontSize:19,lineHeight:1.8,whiteSpace:"pre-wrap",background:cr?"rgba(244,63,94,0.08)":"transparent",border:"none",cursor:sh?"default":"pointer",color:cr?T.text3:T.text,textDecoration:cr?"line-through":"none",textDecorationColor:T.err,padding:"2px 0",transition:"all 0.2s"}} aria-pressed={cr} aria-label={`${cr?"Restore":"Cross out"}: ${p.t.trim()}`}>{p.t}</button>}
            return <span key={pi}>{p.t}</span>;
          }):s.display.map((p,pi)=>{
            if(p==="_V_")return <span key={pi} style={{display:"inline-block",borderBottom:`2px dashed ${c}`,minWidth:80,textAlign:"center",padding:"2px 8px",color:c,fontWeight:600}}>{vb||"___"}</span>;
            return <span key={pi}>{p}</span>;
          })}
        </p>
      </div>

      {!isC&&<div style={{marginBottom:20}}>
        <div style={{...tag(T.m2),marginBottom:10}}>Select the subject:</div>
        <div role="group" aria-label="Subject choices" style={{display:"flex",flexDirection:"column",gap:8}}>
          {s.choices.map((ch,ci)=>{const sel=si===ci;const lk=sh;const rt=lk&&ch.ok;const wr=lk&&sel&&!ch.ok;return(
            <button key={ci} onClick={()=>!lk&&setSi(ci)} disabled={lk}
              style={{...btn({padding:"12px 18px",fontSize:14,textAlign:"left"}),borderColor:rt?T.ok:wr?T.err:sel?T.m2:T.border,background:rt?T.okBg:wr?T.errBg:sel?GLOW(2):"rgba(30,41,59,0.6)",color:rt?T.ok:wr?T.err:T.text,opacity:lk&&!sel&&!rt?0.4:1}} aria-pressed={sel}>
              {ch.t}{rt&&" ✓"}{wr&&" ✗"}
            </button>
          )})}
        </div>
      </div>}

      <div style={{marginBottom:20}}>
        <div style={{...tag(c),marginBottom:10}}>Choose the verb:</div>
        <div role="group" aria-label="Verb choices" style={{display:"flex",gap:12}}>
          {s.opts.map(o=>{const sel=vb===o;const lk=sh;const rt=lk&&o===s.ans;const wr=lk&&sel&&o!==s.ans;return(
            <button key={o} onClick={()=>!lk&&setVb(o)} disabled={lk}
              style={{...btn({flex:1,fontSize:16}),borderColor:rt?T.ok:wr?T.err:sel?c:T.border,background:rt?T.okBg:wr?T.errBg:sel?GLOW(1):"rgba(30,41,59,0.6)",color:rt?T.ok:wr?T.err:T.text,opacity:lk&&!sel&&!rt?0.4:1}} aria-pressed={sel}>
              {o}{rt&&" ✓"}{wr&&" ✗"}
            </button>
          )})}
        </div>
      </div>

      {!sh&&canS&&<div style={{textAlign:"center",marginTop:20}}><button onClick={()=>setSh(true)} style={pbtn(`linear-gradient(135deg,${c},#2563eb)`)}>Check</button></div>}
      {sh&&<><Fb ok={isOk} text={getFb()}/><div style={{textAlign:"center",marginTop:20}}><button ref={nR} onClick={advance} style={pbtn(`linear-gradient(135deg,${c},#2563eb)`)}>{gi<tot-1?"Next →":"See Results"}</button></div></>}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════
// MODULE 2: PRONOUNS — Accept or Defend
// ═════════════════════════════════════════════════════════════════

function Mod2({onBack,dash}){
  const c=T.m2;
  const [ph,setPh]=useState("intro"); // intro | ex | done
  const [i,setI]=useState(0);
  const [ch,setCh]=useState(null);
  const [cf,setCf]=useState(null);
  const [rv,setRv]=useState(0);
  const [res,setRes]=useState([]);
  const nR=useRef(null);

  const s=PRO[i];
  useEffect(()=>{if(rv===2&&nR.current)nR.current.focus()},[rv]);

  const submit=()=>{if(!ch||!cf)return;setRv(1);setTimeout(()=>setRv(2),500)};
  const isOk=()=>(s.ok&&ch==="defend")||(!s.ok&&ch==="accept");
  const fbKey=()=>{if(ch==="defend"&&cf==="sure")return"ds";if(ch==="defend")return"du";if(cf==="sure")return"as";return"au"};

  const next=()=>{
    const r={id:s.id,ok:isOk(),ch,cf};
    setRes(p=>[...p,r]);
    dash.current.m2.push(r);
    setCh(null);setCf(null);setRv(0);
    i<PRO.length-1?setI(j=>j+1):setPh("done");
  };

  if(ph==="intro")return(
    <div style={{textAlign:"center",animation:"fu 0.8s",padding:"60px 0"}}>
      <div style={{fontSize:64,marginBottom:16}} aria-hidden="true">{"✎"}</div>
      <div style={{marginBottom:4}}><span style={tag(c)}>Module 2</span>{" "}<span style={{fontSize:13,color:T.text3,fontWeight:600}}>Pronouns</span></div>
      <h1 style={{fontSize:36,fontWeight:700,marginBottom:12}}>The Reviewer&rsquo;s Red Pen</h1>
      <p style={{...sf,fontSize:17,fontStyle:"italic",color:T.text2,maxWidth:460,margin:"0 auto 32px",lineHeight:1.7}}>A reviewer flagged nine sentences. Some flags are right. Some are wrong. For each one, decide: defend the original or accept the change. Then say how confident you are.</p>
      <button onClick={()=>setPh("ex")} style={pbtn(`linear-gradient(135deg,${c},#f97316)`,"#0f172a")}>Begin {"→"}</button>
    </div>
  );

  if(ph==="done"){
    const groups={};
    res.forEach(r=>{const k=M2_TRAPS[r.id];if(!k)return;const info=M2_TRAP_INFO[k];if(!groups[k])groups[k]={...info,caught:0,missed:0};if(r.ok)groups[k].caught++;else groups[k].missed++});
    return(
      <div><Header num={2} title="The Reviewer&#8217;s Red Pen" focus="Pronouns" onBack={onBack}/>
        <div style={{...card,animation:"fu 0.6s"}}>
          <h2 style={{fontSize:24,fontWeight:700,marginBottom:20}}>Here&rsquo;s what you&rsquo;d catch at your desk</h2>
          <TrapSummary groups={groups}/>
          <div style={{background:GLOW(2),border:`1px solid ${c}33`,borderRadius:12,padding:"20px 24px",marginBottom:24}}>
            <div style={{...tag(c),marginBottom:8}}>IN YOUR REAL WORK</div>
            <p style={{...sf,fontSize:16,lineHeight:1.7,color:"#cbd5e1"}}>When several words come between the verb and its subject, check the pronoun carefully. Do the true subject and verb work together properly? Edit to ensure subject-verb agreement.</p>
          </div>
          <button onClick={onBack} style={pbtn(`linear-gradient(135deg,${c},#f97316)`,"#0f172a")}>Back to Modules</button>
        </div>
      </div>
    );
  }

  const cbtn=(label,val,sel)=>({
    ...btn({flex:1,padding:"16px 20px",fontSize:15}),
    borderColor:sel?c:T.border,
    background:sel?GLOW(2):"rgba(30,41,59,0.6)",
    color:sel?c:T.text,
    boxShadow:sel?`0 0 20px ${GLOW(2)}`:"none",
  });

  return(
    <div><Header num={2} title="The Reviewer&#8217;s Red Pen" focus="Pronouns" onBack={onBack}/>
      <Progress cur={i+1} tot={PRO.length} c={c}/>

      <div style={{...tag(c,"rgba(245,158,11,0.08)"),display:"inline-flex",alignItems:"center",gap:8,padding:"6px 16px",borderRadius:999,border:`1px solid ${c}33`,marginBottom:16}}>
        <span style={{width:6,height:6,borderRadius:"50%",background:c}}/>
        <span>A reviewer flagged this sentence</span>
      </div>
      <p style={{...sf,fontSize:15,color:T.text2,marginBottom:16,lineHeight:1.6}}>Read the sentence. Is the reviewer right, or would you push back?</p>

      <div style={{...card,padding:"24px 28px",marginBottom:24,animation:"fu 0.5s"}}>
        <p style={{...sf,fontSize:19,lineHeight:1.8}}>{s.text}</p>
      </div>

      {rv<2&&<>
        <div style={{...tag(T.text3),marginBottom:10}}>Your call:</div>
        <div role="group" aria-label="Accept or defend" style={{display:"flex",gap:12,marginBottom:20}}>
          <button onClick={()=>rv===0&&setCh("defend")} disabled={rv>0} style={cbtn("Defend",ch==="defend",ch==="defend")} aria-pressed={ch==="defend"}>
            {"✔"} Defend the original
          </button>
          <button onClick={()=>rv===0&&setCh("accept")} disabled={rv>0} style={cbtn("Accept",ch==="accept",ch==="accept")} aria-pressed={ch==="accept"}>
            {"✎"} Accept the flag
          </button>
        </div>

        {ch&&<>
          <div style={{...tag(T.text3),marginBottom:10}}>How sure are you?</div>
          <div role="group" aria-label="Confidence level" style={{display:"flex",gap:12,marginBottom:24}}>
            <button onClick={()=>rv===0&&setCf("sure")} disabled={rv>0} style={{...btn({flex:1,fontSize:14,padding:"12px"}),borderColor:cf==="sure"?T.ok:T.border,background:cf==="sure"?T.okBg:"rgba(30,41,59,0.6)",color:cf==="sure"?T.ok:T.text}} aria-pressed={cf==="sure"}>Confident</button>
            <button onClick={()=>rv===0&&setCf("unsure")} disabled={rv>0} style={{...btn({flex:1,fontSize:14,padding:"12px"}),borderColor:cf==="unsure"?T.purple:T.border,background:cf==="unsure"?"rgba(167,139,250,0.08)":"rgba(30,41,59,0.6)",color:cf==="unsure"?T.purple:T.text}} aria-pressed={cf==="unsure"}>Not sure</button>
          </div>
        </>}

        {ch&&cf&&rv===0&&<div style={{textAlign:"center"}}><button onClick={submit} style={pbtn(`linear-gradient(135deg,${c},#f97316)`,"#0f172a")}>See verdict {"→"}</button></div>}
        {rv===1&&<div style={{textAlign:"center",padding:24,animation:"fi 0.3s"}}><div style={{fontSize:14,color:T.text3,animation:"pulse 1s infinite"}}>Revealing...</div></div>}
      </>}

      {rv===2&&<>
        <Fb ok={isOk()} text={s.fb[fbKey()]}>
          <div style={{marginTop:12,fontSize:13,color:T.text3}}>
            <span style={{fontWeight:600}}>{s.pr}</span>{!s.ok&&s.fix&&<> &mdash; Corrected: <em style={{color:T.ok}}>{s.fix}</em></>}
          </div>
        </Fb>
        <div style={{textAlign:"center",marginTop:20}}><button ref={nR} onClick={next} style={pbtn(`linear-gradient(135deg,${c},#f97316)`,"#0f172a")}>{i<PRO.length-1?"Next →":"See Results"}</button></div>
      </>}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════
// MODULE 4: COMMAS — Pattern C + Pattern A (no cost counter)
// ═════════════════════════════════════════════════════════════════

function Mod4PatC({d,onDone,si,tot}){
  const [ch,setCh]=useState(null);
  const [rv,setRv]=useState(false);
  const rR=useRef(null);
  const nR=useRef(null);
  const ok=ch===d.ans;

  const pick=v=>{setCh(v);setTimeout(()=>{setRv(true)},400)};
  useEffect(()=>{if(rv&&rR.current)rR.current.scrollIntoView({behavior:"smooth",block:"center"});if(rv&&nR.current)setTimeout(()=>nR.current.focus(),600)},[rv]);

  return(
    <div style={{animation:"fu 0.6s"}}>
      <Progress cur={si+1} tot={tot} c={T.m4}/>
      <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(167,139,250,0.08)",border:"1px solid rgba(167,139,250,0.2)",borderRadius:999,padding:"6px 16px",marginBottom:20}}>
        <span style={{width:6,height:6,borderRadius:"50%",background:T.purple}}/>
        <span style={tag(T.purple)}>Same Words, Different Comma</span>
      </div>
      <div style={{...card,padding:"24px 28px",marginBottom:24,borderColor:"rgba(167,139,250,0.2)"}}>
        <p style={{...tag(T.purple),marginBottom:10}}>Your agency means to say</p>
        <p style={{...sf,fontSize:18,lineHeight:1.6}}>{d.ctx}</p>
      </div>
      <p style={{fontSize:15,fontWeight:600,color:T.text2,marginBottom:16}}>Which version says that?</p>
      <div data-grid role="group" aria-label="Choose Version A or B" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:28}}>
        {["A","B"].map(v=>{const sel=ch===v;const rt=rv&&d.ans===v;const wr=rv&&sel&&d.ans!==v;return(
          <button key={v} onClick={()=>!ch&&pick(v)} disabled={!!ch} style={{...card,padding:"24px 20px",cursor:ch?"default":"pointer",textAlign:"left",background:rt?T.okBg:wr?T.errBg:"rgba(30,41,59,0.8)",borderColor:rt?T.ok:wr?T.err:T.border,transition:"all 0.3s",outline:"none"}}
            onMouseEnter={e=>{if(!ch)e.currentTarget.style.borderColor=T.purple}} onMouseLeave={e=>{if(!ch)e.currentTarget.style.borderColor=T.border}} aria-label={`Choose Version ${v}`}>
            <span style={{...tag(rt?T.ok:T.purple),display:"flex",alignItems:"center",gap:8,marginBottom:14}}>Version {v}{rt&&" ✓"}{wr&&" ✗"}</span>
            <p style={{...sf,fontSize:16,lineHeight:1.65,margin:0}}>&ldquo;{v==="A"?d.vA:d.vB}&rdquo;</p>
          </button>
        )})}
      </div>
      {rv&&<div ref={rR} style={{animation:"rs 0.7s both"}}>
        <div style={{...card,borderColor:ok?"rgba(52,211,153,0.3)":"rgba(244,63,94,0.3)",padding:0,marginBottom:16}}>
          <div style={{padding:"16px 24px",background:ok?T.okBg:T.errBg,borderBottom:`1px solid ${T.border}`}}>
            <p style={{fontSize:14,fontWeight:700,color:ok?T.ok:T.err,margin:0}}>{ok?"You read it right.":"Here’s what that comma changes."}</p>
          </div>
          <div style={{padding:"20px 24px"}}>
            <p style={{...sf,fontSize:16,lineHeight:1.7,margin:0}}>{ok?d.revR:d.revW}</p>
          </div>
        </div>
        <div style={{textAlign:"center"}}><button ref={nR} onClick={()=>onDone(ok)} style={pbtn(`linear-gradient(135deg,${T.m4},#fb923c)`)}>{si<tot-1?"Next →":"See Results"}</button></div>
      </div>}
    </div>
  );
}

function Mod4PatA({d,onDone,si,tot}){
  const [txt,setTxt]=useState(d.sent);
  const [sub,setSub]=useState(false);
  const rR=useRef(null);
  const nR=useRef(null);
  const changed=txt.trim()!==d.sent;
  const norm=s=>s.trim().replace(/\s+/g," ").replace(/[.]+$/,"").toLowerCase();
  const isMatch=sub&&norm(txt)===norm(d.fix);
  useEffect(()=>{if(sub&&rR.current)rR.current.scrollIntoView({behavior:"smooth",block:"center"});if(sub&&nR.current)setTimeout(()=>nR.current.focus(),600)},[sub]);

  return(
    <div style={{animation:"fu 0.6s"}}>
      <Progress cur={si+1} tot={tot} c={T.m4}/>
      <div style={{display:"inline-flex",alignItems:"center",gap:8,background:T.errBg,border:`1px solid ${T.m4}33`,borderRadius:999,padding:"6px 16px",marginBottom:20}}>
        <span style={{width:6,height:6,borderRadius:"50%",background:T.m4}}/>
        <span style={tag(T.m4)}>Fix the sentence</span>
      </div>
      <p style={{fontSize:14,fontStyle:"italic",color:T.text3,marginBottom:16}}>{d.ctx}</p>
      <p style={{...sf,fontSize:15,fontWeight:600,color:T.text2,marginBottom:10}}>Something in this sentence creates an unintended meaning. Edit it to fix the problem.</p>
      <div style={{...card,padding:0,marginBottom:24}}>
        <div style={{padding:"10px 20px",background:"rgba(100,116,139,0.08)",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:T.m4,opacity:0.6}}/>
          <span style={{...tag(T.text3)}}>Agency document</span>
        </div>
        <div style={{padding:"20px 24px"}}>
          <textarea value={txt} onChange={e=>setTxt(e.target.value)} disabled={sub} rows={3}
            style={{width:"100%",resize:"vertical",...sf,fontSize:17,lineHeight:1.7,color:T.text,background:"rgba(148,163,184,0.06)",border:`1px solid ${T.border}`,borderRadius:8,outline:"none",padding:"12px 16px",opacity:sub?0.6:1}}
            aria-label="Edit the sentence to fix the punctuation error"/>
        </div>
      </div>
      {!sub&&<div style={{textAlign:"center"}}>{changed
        ?<button onClick={()=>setSub(true)} style={{...pbtn(`linear-gradient(135deg,${T.m4},#fb923c)`),animation:"fu 0.4s"}}>See what happens {"→"}</button>
        :<p style={{...sf,fontSize:14,color:T.text3,margin:0}}>{"✏️"} Edit the sentence above, then you'll see what happens.</p>
      }</div>}
      {sub&&<div ref={rR} style={{animation:"rs 0.7s both"}}>
        <div style={{...card,borderColor:isMatch?"rgba(52,211,153,0.3)":"rgba(244,63,94,0.25)",padding:0,marginBottom:24}}>
          <div style={{padding:"16px 24px",background:isMatch?T.okBg:"rgba(244,63,94,0.06)",borderBottom:`1px solid ${T.border}`}}>
            <p style={{...jf,fontSize:14,fontWeight:700,color:isMatch?T.ok:T.m4,margin:0}}>{isMatch?"You nailed it.":"Here’s what that comma changes"}</p>
          </div>
          <div style={{padding:"20px 24px"}}>
            {!isMatch&&<div style={{marginBottom:20}}>
              <p style={{...tag(T.text3),marginBottom:8}}>Your version</p>
              <p style={{...sf,fontSize:15,lineHeight:1.6,color:T.text2,margin:0,padding:"12px 16px",background:"rgba(148,163,184,0.06)",borderRadius:8}}>&ldquo;{txt.trim()}&rdquo;</p>
            </div>}
            <div style={{marginBottom:20}}>
              <p style={{...tag(T.ok),marginBottom:8}}>{isMatch?"Your fix":"The fix"}</p>
              <p style={{...sf,fontSize:15,lineHeight:1.6,color:T.text,margin:0,padding:"12px 16px",background:T.okBg,borderRadius:8,border:"1px solid rgba(52,211,153,0.15)"}}>&ldquo;{d.fix}&rdquo;</p>
            </div>
            <p style={{...sf,fontSize:16,lineHeight:1.7,margin:0}}>{d.fixT}</p>
          </div>
        </div>
        <div style={{textAlign:"center"}}><button ref={nR} onClick={()=>onDone(isMatch)} style={pbtn(`linear-gradient(135deg,${T.m4},#fb923c)`)}>{si<tot-1?"Next →":"See Results"}</button></div>
      </div>}
    </div>
  );
}

function Mod4PatD({d,onDone,si,tot}){
  const [txt,setTxt]=useState(d.sent);
  const [sub,setSub]=useState(false);
  const rR=useRef(null);
  const nR=useRef(null);
  const changed=txt.trim()!==d.sent;

  // Normalize for comparison: trim, collapse whitespace, strip trailing period, lowercase
  const norm=s=>s.trim().replace(/\s+/g," ").replace(/[.]+$/,"").toLowerCase().replace(/[—–—–-]+/g,"-");
  const isMatch=sub&&norm(txt)===norm(d.fix);

  useEffect(()=>{if(sub&&rR.current)rR.current.scrollIntoView({behavior:"smooth",block:"center"});if(sub&&nR.current)setTimeout(()=>nR.current.focus(),600)},[sub]);

  return(
    <div style={{animation:"fu 0.6s"}}>
      <Progress cur={si+1} tot={tot} c={T.m4}/>

      {/* Pattern D badge */}
      <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(251,191,36,0.08)",border:"1px solid rgba(251,191,36,0.2)",borderRadius:999,padding:"6px 16px",marginBottom:20}}>
        <span style={{width:6,height:6,borderRadius:"50%",background:T.m2}}/>
        <span style={tag(T.m2)}>What Landed on Your Desk</span>
      </div>

      {/* The document that landed on your desk */}
      <div style={{...card,padding:0,marginBottom:20,borderColor:"rgba(251,191,36,0.2)",overflow:"hidden"}}>
        <div style={{padding:"14px 24px",background:"rgba(251,191,36,0.06)",borderBottom:"1px solid rgba(251,191,36,0.15)",display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:18}} aria-hidden="true">{"📨"}</span>
          <span style={{...jf,fontSize:13,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color:T.m2}}>{d.deskLabel}</span>
        </div>
        <div style={{padding:"20px 24px"}}>
          <p style={{...sf,fontSize:15,color:T.text2,marginBottom:12}}>{d.deskDoc}</p>
          <div style={{background:"rgba(241,245,249,0.04)",borderLeft:"3px solid rgba(251,191,36,0.4)",borderRadius:"0 8px 8px 0",padding:"16px 20px",marginBottom:12}}>
            <p style={{...sf,fontSize:16,lineHeight:1.7,color:T.text,fontStyle:"italic",margin:0}}>{d.deskQuote}</p>
          </div>
          <p style={{...sf,fontSize:15,color:T.text2,margin:0}}>{d.deskAction}</p>
        </div>
      </div>

      {/* The original sentence to fix */}
      <p style={{...sf,fontSize:15,fontWeight:600,color:T.text2,marginBottom:10}}>Find and fix the language that caused this.</p>
      <div style={{...card,padding:0,marginBottom:24}}>
        <div style={{padding:"10px 20px",background:"rgba(100,116,139,0.08)",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:T.m4,opacity:0.6}}/>
          <span style={{...tag(T.text3)}}>Agency document</span>
        </div>
        <div style={{padding:"20px 24px"}}>
          <textarea value={txt} onChange={e=>setTxt(e.target.value)} disabled={sub} rows={3}
            style={{width:"100%",resize:"vertical",...sf,fontSize:17,lineHeight:1.7,color:T.text,background:"rgba(148,163,184,0.06)",border:`1px solid ${T.border}`,borderRadius:8,outline:"none",padding:"12px 16px",opacity:sub?0.6:1}}
            aria-label="Edit the sentence to fix the error that caused the complaint"/>
        </div>
      </div>

      {!sub&&<div style={{textAlign:"center"}}>{changed
        ?<button onClick={()=>setSub(true)} style={{...pbtn(`linear-gradient(135deg,${T.m2},#f97316)`,"#0f172a"),animation:"fu 0.4s"}}>Check your fix {"→"}</button>
        :<p style={{...sf,fontSize:14,color:T.text3,margin:0}}>{"✏️"} Edit the sentence above, then you'll see what happened.</p>
      }</div>}

      {sub&&<div ref={rR} style={{animation:"rs 0.7s both"}}>
        {/* Result header */}
        <div style={{...card,borderColor:isMatch?"rgba(52,211,153,0.3)":"rgba(167,139,250,0.25)",padding:0,marginBottom:16,overflow:"hidden"}}>
          <div style={{padding:"16px 24px",background:isMatch?T.okBg:"rgba(167,139,250,0.06)",borderBottom:`1px solid ${T.border}`}}>
            <p style={{...jf,fontSize:14,fontWeight:700,color:isMatch?T.ok:T.purple,margin:0}}>{isMatch?"You traced it back.":"Here’s what the comma changed."}</p>
          </div>
          <div style={{padding:"20px 24px"}}>
            {/* Show their version if it didn't match */}
            {!isMatch&&<div style={{marginBottom:20}}>
              <p style={{...tag(T.text3),marginBottom:8}}>Your version</p>
              <p style={{...sf,fontSize:15,lineHeight:1.6,color:T.text2,margin:0,padding:"12px 16px",background:"rgba(148,163,184,0.06)",borderRadius:8}}>&ldquo;{txt.trim()}&rdquo;</p>
            </div>}

            {/* Show the recommended fix */}
            <div style={{marginBottom:20}}>
              <p style={{...tag(T.ok),marginBottom:8}}>{isMatch?"Your fix":"The fix that resolves the ambiguity"}</p>
              <p style={{...sf,fontSize:15,lineHeight:1.6,color:T.text,margin:0,padding:"12px 16px",background:T.okBg,borderRadius:8,border:"1px solid rgba(52,211,153,0.15)"}}>&ldquo;{d.fix}&rdquo;</p>
            </div>

            {/* Connection explanation — the learning moment */}
            <p style={{...sf,fontSize:16,lineHeight:1.7,margin:0}}>{d.connection}</p>
          </div>
        </div>

        {/* Traceback skill */}
        <div style={{background:"rgba(148,163,184,0.04)",borderRadius:12,padding:"16px 20px",marginBottom:20,border:"1px solid rgba(148,163,184,0.08)"}}>
          <p style={{...sf,fontSize:15,lineHeight:1.7,color:T.text2,margin:0}}>When something goes wrong downstream—a complaint, a grievance, a misunderstanding—the language is the first place to look.</p>
        </div>

        <div style={{textAlign:"center"}}><button ref={nR} onClick={()=>onDone(isMatch)} style={pbtn(`linear-gradient(135deg,${T.m4},#fb923c)`)}>{si<tot-1?"Next →":"See Results"}</button></div>
      </div>}
    </div>
  );
}

function Mod4({onBack,dash}){
  const c=T.m4;
  const [show,setShow]=useState(true);
  const [i,setI]=useState(0);
  const [done,setDone]=useState(false);
  const [res,setRes]=useState([]);

  const onDone=(ok)=>{
    const r={id:CM[i].id,ok,pat:CM[i].pat};
    setRes(p=>[...p,r]);
    dash.current.m4.push(r);
    if(i+1>=CM.length)setTimeout(()=>setDone(true),400);
    else setTimeout(()=>setI(j=>j+1),400);
  };

  // Opening animation
  if(show){
    return(
      <div style={{textAlign:"center",animation:"fu 0.8s",padding:"60px 0"}}>
        <div style={{...sf,fontSize:120,color:T.m4,lineHeight:1,textShadow:`0 0 80px ${T.m4}25`,marginBottom:8}}>,</div>
        <p style={{fontSize:28,fontWeight:300,color:T.text,letterSpacing:"0.05em",marginBottom:32}}>One mark. Two meanings.</p>
        <div style={{marginBottom:4}}><span style={tag(c)}>Module 4</span>{" "}<span style={{fontSize:13,color:T.text3,fontWeight:600}}>Commas</span></div>
        <h1 style={{fontSize:36,fontWeight:700,marginBottom:12}}>Commas Change <span style={{background:`linear-gradient(135deg,${c},#fb923c)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Everything</span></h1>
        <p style={{...sf,fontSize:17,fontStyle:"italic",color:T.text2,maxWidth:400,margin:"0 auto 32px"}}>Read every clause both ways. If the meaning changes, choose deliberately.</p>
        <button onClick={()=>setShow(false)} style={pbtn(`linear-gradient(135deg,${c},#fb923c)`)}>Begin {"→"}</button>
        <div style={{marginTop:16}}><button onClick={()=>{setShow(false)}} style={{background:"none",border:"none",color:T.text3,cursor:"pointer",...jf,fontSize:13}}>Skip</button></div>
      </div>
    );
  }

  if(done){
    const groups={};
    res.forEach(r=>{const k=M4_TRAPS[r.id];if(!k)return;const info=M4_TRAP_INFO[k];if(!groups[k])groups[k]={...info,caught:0,missed:0};if(r.ok)groups[k].caught++;else groups[k].missed++});
    return(
      <div><Header num={4} title="Same Words, Different Comma" focus="Commas" onBack={onBack}/>
        <div style={{animation:"fu 0.8s",padding:"20px 0"}}>
          <div style={{textAlign:"center",marginBottom:28}}>
            <div style={{...sf,fontSize:80,color:c,lineHeight:1,textShadow:`0 0 60px ${c}20`,marginBottom:16}}>,</div>
            <h2 style={{fontSize:32,fontWeight:700,marginBottom:12}}>What a Comma Changes</h2>
            <p style={{...sf,fontSize:17,lineHeight:1.6,color:T.text2,maxWidth:500,margin:"0 auto"}}>Across 8 sentences, a single comma changed who was covered by a policy, how broadly a requirement applied, whether a benefit reached the right people, and whether a legal challenge succeeded.</p>
          </div>
          <div style={{...card,marginBottom:24}}>
            <h3 style={{fontSize:20,fontWeight:700,marginBottom:16}}>Here&rsquo;s what you&rsquo;d catch at your desk</h3>
            <TrapSummary groups={groups}/>
          </div>
          <div style={{...card,borderColor:"rgba(52,211,153,0.25)",background:T.okBg,marginBottom:24}}>
            <p style={{...tag(T.ok),marginBottom:8}}>IN YOUR REAL WORK</p>
            <p style={{...sf,fontSize:17,lineHeight:1.7,margin:0}}>Read every &ldquo;who&rdquo; and &ldquo;which&rdquo; clause both ways: with commas and without. If the meaning changes, choose deliberately.</p>
          </div>
          <div style={{textAlign:"center"}}><button onClick={onBack} style={pbtn(`linear-gradient(135deg,${c},#fb923c)`)}>Back to Modules</button></div>
        </div>
      </div>
    );
  }

  const cur=CM[i];
  return(
    <div><Header num={4} title="Same Words, Different Comma" focus="Commas" onBack={onBack}/>
      {cur.pat==="C"?<Mod4PatC key={cur.id} d={cur} onDone={onDone} si={i} tot={CM.length}/>
        :cur.pat==="D"?<Mod4PatD key={cur.id} d={cur} onDone={onDone} si={i} tot={CM.length}/>
        :<Mod4PatA key={cur.id} d={cur} onDone={onDone} si={i} tot={CM.length}/>}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════
// MODULE 3: MODIFIERS
// ═════════════════════════════════════════════════════════════════

function Mod3PatA({d,onDone,si,tot}){
  const c=T.m3;
  const [txt,setTxt]=useState(d.sent);
  const [sub,setSub]=useState(false);
  const rR=useRef(null);
  const nR=useRef(null);
  const changed=txt.trim()!==d.sent;
  const norm=s=>s.trim().replace(/\s+/g," ").replace(/[.]+$/,"").toLowerCase();
  const isMatch=sub&&norm(txt)===norm(d.fix);
  useEffect(()=>{if(sub&&rR.current)rR.current.scrollIntoView({behavior:"smooth",block:"center"});if(sub&&nR.current)setTimeout(()=>nR.current.focus(),600)},[sub]);

  return(
    <div style={{animation:"fu 0.6s"}}>
      <Progress cur={si+1} tot={tot} c={c}/>
      <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(34,197,94,0.08)",border:`1px solid ${c}33`,borderRadius:999,padding:"6px 16px",marginBottom:20}}>
        <span style={{width:6,height:6,borderRadius:"50%",background:c}}/>
        <span style={tag(c)}>Fix the sentence</span>
      </div>
      <p style={{fontSize:14,fontStyle:"italic",color:T.text3,marginBottom:16}}>{d.ctx}</p>
      <p style={{...sf,fontSize:15,fontWeight:600,color:T.text2,marginBottom:10}}>Something in this sentence says what nobody intended. Edit it to fix the problem.</p>
      <div style={{...card,padding:0,marginBottom:24}}>
        <div style={{padding:"10px 20px",background:"rgba(100,116,139,0.08)",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:c,opacity:0.6}}/>
          <span style={{...tag(T.text3)}}>Agency document</span>
        </div>
        <div style={{padding:"20px 24px"}}>
          <textarea value={txt} onChange={e=>setTxt(e.target.value)} disabled={sub} rows={3}
            style={{width:"100%",resize:"vertical",...sf,fontSize:17,lineHeight:1.7,color:T.text,background:"rgba(148,163,184,0.06)",border:`1px solid ${T.border}`,borderRadius:8,outline:"none",padding:"12px 16px",opacity:sub?0.6:1}}
            aria-label="Edit the sentence to fix the modifier error"/>
        </div>
      </div>
      {!sub&&<div style={{textAlign:"center"}}>{changed
        ?<button onClick={()=>setSub(true)} style={{...pbtn(`linear-gradient(135deg,${c},#16a34a)`),animation:"fu 0.4s"}}>See what happens {"→"}</button>
        :<p style={{...sf,fontSize:14,color:T.text3,margin:0}}>{"✏️"} Edit the sentence above, then you'll see what happens.</p>
      }</div>}
      {sub&&<div ref={rR} style={{animation:"rs 0.7s both"}}>
        <div style={{...card,borderColor:isMatch?"rgba(52,211,153,0.3)":"rgba(34,197,94,0.25)",padding:0,marginBottom:16}}>
          <div style={{padding:"16px 24px",background:isMatch?T.okBg:"rgba(34,197,94,0.06)",borderBottom:`1px solid ${T.border}`}}>
            <p style={{...jf,fontSize:14,fontWeight:700,color:isMatch?T.ok:c,margin:0}}>{isMatch?"You nailed it.":"Here’s what the sentence actually said"}</p>
          </div>
          <div style={{padding:"20px 24px"}}>
            {!isMatch&&<div style={{marginBottom:20}}>
              <p style={{...tag(T.text3),marginBottom:8}}>Your version</p>
              <p style={{...sf,fontSize:15,lineHeight:1.6,color:T.text2,margin:0,padding:"12px 16px",background:"rgba(148,163,184,0.06)",borderRadius:8}}>&ldquo;{txt.trim()}&rdquo;</p>
            </div>}
            <div style={{marginBottom:20}}>
              <p style={{...tag(T.ok),marginBottom:8}}>{isMatch?"Your fix":"The fix"}</p>
              <p style={{...sf,fontSize:15,lineHeight:1.6,color:T.text,margin:0,padding:"12px 16px",background:T.okBg,borderRadius:8,border:"1px solid rgba(52,211,153,0.15)"}}>&ldquo;{d.fix}&rdquo;</p>
            </div>
            <p style={{...sf,fontSize:16,lineHeight:1.7,margin:0}}>{d.explain}</p>
          </div>
        </div>
        <div style={{textAlign:"center"}}><button ref={nR} onClick={()=>onDone(isMatch)} style={pbtn(`linear-gradient(135deg,${c},#16a34a)`)}>{si<tot-1?"Next →":"See Results"}</button></div>
      </div>}
    </div>
  );
}

function Mod3PatD({d,onDone,si,tot}){
  const c=T.m3;
  const [txt,setTxt]=useState(d.sent);
  const [sub,setSub]=useState(false);
  const rR=useRef(null);
  const nR=useRef(null);
  const changed=txt.trim()!==d.sent;
  const norm=s=>s.trim().replace(/\s+/g," ").replace(/[.]+$/,"").toLowerCase();
  const isMatch=sub&&norm(txt)===norm(d.fix);
  useEffect(()=>{if(sub&&rR.current)rR.current.scrollIntoView({behavior:"smooth",block:"center"});if(sub&&nR.current)setTimeout(()=>nR.current.focus(),600)},[sub]);

  return(
    <div style={{animation:"fu 0.6s"}}>
      <Progress cur={si+1} tot={tot} c={c}/>
      <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(251,191,36,0.08)",border:"1px solid rgba(251,191,36,0.2)",borderRadius:999,padding:"6px 16px",marginBottom:20}}>
        <span style={{width:6,height:6,borderRadius:"50%",background:T.m2}}/>
        <span style={tag(T.m2)}>What Landed on Your Desk</span>
      </div>
      <div style={{...card,padding:0,marginBottom:20,borderColor:"rgba(251,191,36,0.2)",overflow:"hidden"}}>
        <div style={{padding:"14px 24px",background:"rgba(251,191,36,0.06)",borderBottom:"1px solid rgba(251,191,36,0.15)",display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:18}} aria-hidden="true">{"📨"}</span>
          <span style={{...jf,fontSize:13,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color:T.m2}}>{d.deskLabel}</span>
        </div>
        <div style={{padding:"20px 24px"}}>
          <p style={{...sf,fontSize:15,color:T.text2,marginBottom:12}}>{d.deskDoc}</p>
          <div style={{background:"rgba(241,245,249,0.04)",borderLeft:"3px solid rgba(251,191,36,0.4)",borderRadius:"0 8px 8px 0",padding:"16px 20px",marginBottom:12}}>
            <p style={{...sf,fontSize:16,lineHeight:1.7,color:T.text,fontStyle:"italic",margin:0}}>{d.deskQuote}</p>
          </div>
          <p style={{...sf,fontSize:15,color:T.text2,margin:0}}>{d.deskAction}</p>
        </div>
      </div>
      <p style={{...sf,fontSize:15,fontWeight:600,color:T.text2,marginBottom:10}}>Find and fix the language that caused this.</p>
      <div style={{...card,padding:0,marginBottom:24}}>
        <div style={{padding:"10px 20px",background:"rgba(100,116,139,0.08)",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:c,opacity:0.6}}/>
          <span style={{...tag(T.text3)}}>Agency document</span>
        </div>
        <div style={{padding:"20px 24px"}}>
          <textarea value={txt} onChange={e=>setTxt(e.target.value)} disabled={sub} rows={3}
            style={{width:"100%",resize:"vertical",...sf,fontSize:17,lineHeight:1.7,color:T.text,background:"rgba(148,163,184,0.06)",border:`1px solid ${T.border}`,borderRadius:8,outline:"none",padding:"12px 16px",opacity:sub?0.6:1}}
            aria-label="Edit the sentence to fix the error that caused the headline"/>
        </div>
      </div>
      {!sub&&<div style={{textAlign:"center"}}>{changed
        ?<button onClick={()=>setSub(true)} style={{...pbtn(`linear-gradient(135deg,${T.m2},#f97316)`,"#0f172a"),animation:"fu 0.4s"}}>Check your fix {"→"}</button>
        :<p style={{...sf,fontSize:14,color:T.text3,margin:0}}>{"✏️"} Edit the sentence above, then you'll see what happened.</p>
      }</div>}
      {sub&&<div ref={rR} style={{animation:"rs 0.7s both"}}>
        <div style={{...card,borderColor:isMatch?"rgba(52,211,153,0.3)":"rgba(167,139,250,0.25)",padding:0,marginBottom:16,overflow:"hidden"}}>
          <div style={{padding:"16px 24px",background:isMatch?T.okBg:"rgba(167,139,250,0.06)",borderBottom:`1px solid ${T.border}`}}>
            <p style={{...jf,fontSize:14,fontWeight:700,color:isMatch?T.ok:T.purple,margin:0}}>{isMatch?"You traced it back.":"Here’s what happened."}</p>
          </div>
          <div style={{padding:"20px 24px"}}>
            {!isMatch&&<div style={{marginBottom:20}}>
              <p style={{...tag(T.text3),marginBottom:8}}>Your version</p>
              <p style={{...sf,fontSize:15,lineHeight:1.6,color:T.text2,margin:0,padding:"12px 16px",background:"rgba(148,163,184,0.06)",borderRadius:8}}>&ldquo;{txt.trim()}&rdquo;</p>
            </div>}
            <div style={{marginBottom:20}}>
              <p style={{...tag(T.ok),marginBottom:8}}>{isMatch?"Your fix":"The fix"}</p>
              <p style={{...sf,fontSize:15,lineHeight:1.6,color:T.text,margin:0,padding:"12px 16px",background:T.okBg,borderRadius:8,border:"1px solid rgba(52,211,153,0.15)"}}>&ldquo;{d.fix}&rdquo;</p>
            </div>
            <p style={{...sf,fontSize:16,lineHeight:1.7,margin:0}}>{d.connection}</p>
          </div>
        </div>
        <div style={{background:"rgba(148,163,184,0.04)",borderRadius:12,padding:"16px 20px",marginBottom:20,border:"1px solid rgba(148,163,184,0.08)"}}>
          <p style={{...sf,fontSize:15,lineHeight:1.7,color:T.text2,margin:0}}>When something goes wrong downstream—a headline, a complaint, a legal filing—the language is the first place to look.</p>
        </div>
        <div style={{textAlign:"center"}}><button ref={nR} onClick={()=>onDone(isMatch)} style={pbtn(`linear-gradient(135deg,${c},#16a34a)`)}>{si<tot-1?"Next →":"See Results"}</button></div>
      </div>}
    </div>
  );
}

function Mod3PatB({d,onDone,si,tot}){
  const c=T.m3;
  const [txt,setTxt]=useState(d.sent);
  const [sub,setSub]=useState(false);
  const rR=useRef(null);
  const nR=useRef(null);
  const changed=txt.trim()!==d.sent;
  const norm=s=>s.trim().replace(/\s+/g," ").replace(/[.]+$/,"").toLowerCase();
  const isMatch=sub&&norm(txt)===norm(d.fix);
  useEffect(()=>{if(sub&&rR.current)rR.current.scrollIntoView({behavior:"smooth",block:"center"});if(sub&&nR.current)setTimeout(()=>nR.current.focus(),600)},[sub]);

  return(
    <div style={{animation:"fu 0.6s"}}>
      <Progress cur={si+1} tot={tot} c={c}/>

      {/* Slow Down Round badge */}
      <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(251,191,36,0.08)",border:"1px solid rgba(251,191,36,0.25)",borderRadius:999,padding:"6px 16px",marginBottom:20}}>
        <span style={{width:6,height:6,borderRadius:"50%",background:T.m2}}/>
        <span style={tag(T.m2)}>Slow Down Round</span>
      </div>

      {/* The consequence appears first — something went wrong */}
      <div style={{...card,padding:0,marginBottom:20,borderColor:"rgba(251,191,36,0.2)",overflow:"hidden"}}>
        <div style={{padding:"14px 24px",background:"rgba(251,191,36,0.06)",borderBottom:"1px solid rgba(251,191,36,0.15)"}}>
          <p style={{...jf,fontSize:13,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color:T.m2,margin:0}}>Something went wrong</p>
        </div>
        <div style={{padding:"20px 24px"}}>
          <p style={{...sf,fontSize:16,lineHeight:1.7,color:T.text,margin:0}}>{d.consequence}</p>
        </div>
      </div>

      {/* The sentence — no error flagged */}
      <p style={{...sf,fontSize:15,fontWeight:600,color:T.text2,marginBottom:10}}>Here&rsquo;s the original sentence. Find and fix the problem.</p>
      <p style={{fontSize:14,fontStyle:"italic",color:T.text3,marginBottom:10}}>{d.ctx}</p>
      <div style={{...card,padding:0,marginBottom:24}}>
        <div style={{padding:"10px 20px",background:"rgba(100,116,139,0.08)",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:c,opacity:0.6}}/>
          <span style={{...tag(T.text3)}}>Agency document</span>
        </div>
        <div style={{padding:"20px 24px"}}>
          <textarea value={txt} onChange={e=>setTxt(e.target.value)} disabled={sub} rows={3}
            style={{width:"100%",resize:"vertical",...sf,fontSize:17,lineHeight:1.7,color:T.text,background:"rgba(148,163,184,0.06)",border:`1px solid ${T.border}`,borderRadius:8,outline:"none",padding:"12px 16px",opacity:sub?0.6:1}}
            aria-label="Find and fix the error in this sentence"/>
        </div>
      </div>

      {!sub&&<div style={{textAlign:"center"}}>{changed
        ?<button onClick={()=>setSub(true)} style={{...pbtn(`linear-gradient(135deg,${T.m2},#f97316)`,"#0f172a"),animation:"fu 0.4s"}}>Check your fix {"→"}</button>
        :<p style={{...sf,fontSize:14,color:T.text3,margin:0}}>{"✏️"} Edit the sentence above, then you'll see what went wrong.</p>
      }</div>}

      {sub&&<div ref={rR} style={{animation:"rs 0.7s both"}}>
        <div style={{...card,borderColor:isMatch?"rgba(52,211,153,0.3)":"rgba(34,197,94,0.25)",padding:0,marginBottom:16,overflow:"hidden"}}>
          <div style={{padding:"16px 24px",background:isMatch?T.okBg:"rgba(34,197,94,0.06)",borderBottom:`1px solid ${T.border}`}}>
            <p style={{...jf,fontSize:14,fontWeight:700,color:isMatch?T.ok:c,margin:0}}>{isMatch?"You found it.":"Here’s what was hiding in that sentence"}</p>
          </div>
          <div style={{padding:"20px 24px"}}>
            {!isMatch&&<div style={{marginBottom:20}}>
              <p style={{...tag(T.text3),marginBottom:8}}>Your version</p>
              <p style={{...sf,fontSize:15,lineHeight:1.6,color:T.text2,margin:0,padding:"12px 16px",background:"rgba(148,163,184,0.06)",borderRadius:8}}>&ldquo;{txt.trim()}&rdquo;</p>
            </div>}
            <div style={{marginBottom:20}}>
              <p style={{...tag(T.ok),marginBottom:8}}>{isMatch?"Your fix":"The fix"}</p>
              <p style={{...sf,fontSize:15,lineHeight:1.6,color:T.text,margin:0,padding:"12px 16px",background:T.okBg,borderRadius:8,border:"1px solid rgba(52,211,153,0.15)"}}>&ldquo;{d.fix}&rdquo;</p>
            </div>
            <p style={{...sf,fontSize:16,lineHeight:1.7,margin:"0 0 16px"}}>{d.explain}</p>
            <div style={{background:"rgba(251,191,36,0.06)",borderLeft:"3px solid rgba(251,191,36,0.4)",borderRadius:"0 8px 8px 0",padding:"14px 18px"}}>
              <p style={{...sf,fontSize:15,lineHeight:1.7,color:T.text2,fontStyle:"italic",margin:0}}>{d.slowDown}</p>
            </div>
          </div>
        </div>
        <div style={{textAlign:"center"}}><button ref={nR} onClick={()=>onDone(isMatch)} style={pbtn(`linear-gradient(135deg,${c},#16a34a)`)}>See Results</button></div>
      </div>}
    </div>
  );
}

function Mod3({onBack,dash}){
  const c=T.m3;
  const [show,setShow]=useState(true);
  const [i,setI]=useState(0);
  const [done,setDone]=useState(false);
  const [res,setRes]=useState([]);

  const onDone=(ok)=>{
    const r={id:MOD3[i].id,ok,pat:MOD3[i].pat};
    setRes(p=>[...p,r]);
    dash.current.m3.push(r);
    if(i+1>=MOD3.length)setTimeout(()=>setDone(true),400);
    else setTimeout(()=>setI(j=>j+1),400);
  };

  if(show){
    return(
      <div style={{textAlign:"center",animation:"fu 0.8s",padding:"60px 0"}}>
        <div style={{fontSize:64,marginBottom:16}} aria-hidden="true">{"🔍"}</div>
        <div style={{marginBottom:4}}><span style={tag(c)}>Module 3</span>{" "}<span style={{fontSize:13,color:T.text3,fontWeight:600}}>Modifiers</span></div>
        <h1 style={{fontSize:36,fontWeight:700,marginBottom:12}}>Not What You Meant</h1>
        <p style={{...sf,fontSize:17,fontStyle:"italic",color:T.text2,maxWidth:440,margin:"0 auto 32px",lineHeight:1.7}}>These sentences say things nobody intended. One of them made the news. Figure out what went wrong.</p>
        <button onClick={()=>setShow(false)} style={pbtn(`linear-gradient(135deg,${c},#16a34a)`)}>Begin {"→"}</button>
      </div>
    );
  }

  if(done){
    const groups={};
    res.forEach(r=>{const k=M3_TRAPS[r.id];if(!k)return;const info=M3_TRAP_INFO[k];if(!groups[k])groups[k]={...info,caught:0,missed:0};if(r.ok)groups[k].caught++;else groups[k].missed++});
    return(
      <div><Header num={3} title="Not What You Meant" focus="Modifiers" onBack={onBack}/>
        <div style={{...card,animation:"fu 0.6s"}}>
          <h2 style={{fontSize:24,fontWeight:700,marginBottom:20}}>Here&rsquo;s what you&rsquo;d catch at your desk</h2>
          <TrapSummary groups={groups}/>
          <div style={{background:GLOW(3),border:`1px solid ${c}33`,borderRadius:12,padding:"20px 24px",marginBottom:24}}>
            <div style={{...tag(c),marginBottom:8}}>IN YOUR REAL WORK</div>
            <p style={{...sf,fontSize:16,lineHeight:1.7,color:"#cbd5e1"}}>When you start a sentence with an -ing phrase or an “after/having/before” phrase, check that the very next noun is the one doing that action. If it’s not, the sentence says something you didn’t intend.</p>
          </div>
          <button onClick={onBack} style={pbtn(`linear-gradient(135deg,${c},#16a34a)`)}>Back to Modules</button>
        </div>
      </div>
    );
  }

  const cur=MOD3[i];
  return(
    <div><Header num={3} title="Not What You Meant" focus="Modifiers" onBack={onBack}/>
      {cur.pat==="A"?<Mod3PatA key={cur.id} d={cur} onDone={onDone} si={i} tot={MOD3.length}/>
        :cur.pat==="D"?<Mod3PatD key={cur.id} d={cur} onDone={onDone} si={i} tot={MOD3.length}/>
        :<Mod3PatB key={cur.id} d={cur} onDone={onDone} si={i} tot={MOD3.length}/>}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════
// FACILITATOR DASHBOARD
// ═════════════════════════════════════════════════════════════════

function Dashboard({onClose,dash}){
  const d=dash.current;

  // Build trap groups from results
  const buildTraps=(results,trapMap,trapInfo,okKey)=>{
    if(!results.length)return null;
    const groups={};
    results.forEach(r=>{
      const k=trapMap[r.id];if(!k)return;
      const info=trapInfo[k];
      if(!groups[k])groups[k]={...info,caught:0,missed:0};
      if(r[okKey||"ok"])groups[k].caught++;else groups[k].missed++;
    });
    return groups;
  };

  const m1t=buildTraps(d.m1,M1_TRAPS,M1_TRAP_INFO,"vOk");
  const m2t=buildTraps(d.m2,M2_TRAPS,M2_TRAP_INFO,"ok");
  const m3t=buildTraps(d.m3,M3_TRAPS,M3_TRAP_INFO,"ok");
  const m4t=buildTraps(d.m4,M4_TRAPS,M4_TRAP_INFO,"ok");
  const m4c=d.m4.filter(r=>r.pat==="C");

  const TrapDash=({groups,c})=>{
    if(!groups)return <p style={{...sf,fontSize:15,color:T.text3}}>No data yet.</p>;
    const caught=Object.values(groups).filter(g=>g.missed===0);
    const watch=Object.values(groups).filter(g=>g.missed>0);
    return(
      <div>
        {watch.length>0&&<div style={{marginBottom:caught.length?16:0}}>
          <div style={{...tag(T.m2),marginBottom:8}}>WHERE THE ROOM STRUGGLED</div>
          {watch.map((g,i)=><div key={i} style={{background:"rgba(251,191,36,0.06)",border:"1px solid rgba(251,191,36,0.15)",borderRadius:8,padding:"10px 14px",marginBottom:6}}>
            <span style={{...jf,fontSize:14,fontWeight:600,color:T.m2}}>{g.name}</span>
            <span style={{fontSize:13,color:T.text3,marginLeft:8}}>{g.missed} missed, {g.caught} caught</span>
          </div>)}
        </div>}
        {caught.length>0&&<div>
          <div style={{...tag(T.ok),marginBottom:8}}>ROOM CAUGHT IT</div>
          {caught.map((g,i)=><div key={i} style={{background:T.okBg,border:"1px solid rgba(52,211,153,0.15)",borderRadius:8,padding:"10px 14px",marginBottom:6}}>
            <span style={{...jf,fontSize:14,fontWeight:600,color:T.ok}}>{g.name}</span>
            <span style={{fontSize:13,color:T.text3,marginLeft:8}}>all {g.caught} caught</span>
          </div>)}
        </div>}
      </div>
    );
  };

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:28}}>
        <div><div style={tag(T.m2)}>Facilitator View</div><h1 style={{fontSize:24,fontWeight:700}}>Dashboard</h1></div>
        <button onClick={onClose} style={btn({padding:"8px 18px",fontSize:13,borderColor:T.border})} aria-label="Close dashboard">{"✗"} Close</button>
      </div>

      <div style={{...card,marginBottom:16,animation:"fu 0.3s"}}>
        <div style={{...tag(T.m2),marginBottom:12}}>How it works in the classroom</div>
        <p style={{...sf,fontSize:15,color:T.text2,lineHeight:1.7}}>In the deployed app, this dashboard aggregates anonymized data from all 25 learners. Here it shows your own session data as a preview. Traps where the room struggled surface first—those are your debrief starting points.</p>
      </div>

      <div style={{...card,marginBottom:16,animation:"fu 0.35s"}}>
        <div style={{...tag(T.m1),marginBottom:12}}>Module 1: One or Many? &mdash; Subject-Verb Agreement</div>
        <TrapDash groups={m1t} c={T.m1}/>
      </div>

      <div style={{...card,marginBottom:16,animation:"fu 0.4s"}}>
        <div style={{...tag(T.m2),marginBottom:12}}>Module 2: The Reviewer's Red Pen &mdash; Pronouns</div>
        <TrapDash groups={m2t} c={T.m2}/>
      </div>

      <div style={{...card,marginBottom:16,animation:"fu 0.45s"}}>
        <div style={{...tag(T.m3),marginBottom:12}}>Module 3: Not What You Meant &mdash; Modifiers</div>
        <TrapDash groups={m3t} c={T.m3}/>
      </div>

      <div style={{...card,marginBottom:16,animation:"fu 0.5s"}}>
        <div style={{...tag(T.m4),marginBottom:12}}>Module 4: Same Words, Different Comma &mdash; Commas</div>
        <TrapDash groups={m4t} c={T.m4}/>
      </div>

      <div style={{...card,marginBottom:16,animation:"fu 0.5s"}}>
        <div style={{...tag(T.purple),marginBottom:12}}>Same Words, Different Comma</div>
        {m4c.length?<div>
          <p style={{...sf,fontSize:15,color:T.text2,lineHeight:1.7,marginBottom:12}}>Choice distribution for meaning-comparison exercises:</p>
          {m4c.map((r,ri)=><div key={ri} style={{padding:"8px 12px",background:"rgba(167,139,250,0.06)",borderRadius:8,marginBottom:6,fontSize:14}}>
            <span style={{color:T.purple,fontWeight:600}}>{r.id}</span>: {r.ok?<span style={{color:T.ok}}>Read it correctly</span>:<span style={{color:T.err}}>Misread the comma</span>}
          </div>)}
          <p style={{...sf,fontSize:14,color:T.text3,marginTop:12}}>In the classroom, you&rsquo;ll see what percentage chose each version. When the room splits, that&rsquo;s your richest debrief moment.</p>
        </div>:<p style={{...sf,fontSize:15,color:T.text3}}>Awaiting data&hellip;</p>}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════
// HOME SCREEN
// ═════════════════════════════════════════════════════════════════

function Home({onSelect,tRef}){
  return(
    <div style={{animation:"fu 0.6s"}}>
      <div style={{textAlign:"center",marginBottom:40}}>
        <h1 ref={tRef} style={{fontSize:36,fontWeight:700,marginBottom:8,cursor:"default",userSelect:"none",color:T.text}} tabIndex={-1}>Spot &amp; Fix</h1>
        <p style={{...sf,fontSize:18,color:T.text2,lineHeight:1.7,maxWidth:560,margin:"0 auto"}}>You already know what happens when a sentence goes out wrong. Someone calls. Someone misreads a deadline. Someone&rsquo;s attorney finds the loophole in your clause. Let&rsquo;s jump into those moments where an edit makes all the difference.</p>
      </div>
      <div style={{display:"grid",gap:16}}>
        {MODS.map((m,mi)=>{const ac=ACCENT[m.id];return(
          <button key={m.id} onClick={()=>onSelect(m.id)} style={{...card,padding:"24px 28px",textAlign:"left",cursor:"pointer",color:T.text,border:`1px solid ${T.border}`,transition:"all 0.25s",display:"flex",gap:20,alignItems:"flex-start",animation:`fu 0.5s both`,animationDelay:`${mi*0.08}s`}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=ac;e.currentTarget.style.boxShadow=`0 0 30px ${GLOW(m.id)}`}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.boxShadow="none"}}
            aria-label={`Module ${m.id}: ${m.title} — ${m.focus}`}>
            <div style={{width:44,height:44,borderRadius:12,flexShrink:0,background:GLOW(m.id),border:`1.5px solid ${ac}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,color:ac}}>{m.id}</div>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"baseline",gap:10,marginBottom:4}}>
                <span style={tag(ac)}>Module {m.id}</span>
                <span style={{fontSize:13,color:T.text3,fontWeight:600}}>{m.focus}</span>
                {m.status==="soon"&&<span style={{fontSize:12,fontWeight:600,color:T.m2,background:"rgba(251,191,36,0.1)",padding:"2px 8px",borderRadius:4}}>In progress</span>}
              </div>
              <div style={{fontSize:20,fontWeight:700,marginBottom:6,color:T.text}}>{m.title}</div>
              <p style={{...sf,fontSize:16,color:T.text2,lineHeight:1.6,margin:0}}>{m.desc}</p>
              <div style={{display:"flex",gap:10,marginTop:10}}>
                <span style={{fontSize:13,color:T.text3}}>{m.n} sentences</span>
              </div>
            </div>
            <div style={{color:T.text3,fontSize:20,flexShrink:0,marginTop:8}}>{"→"}</div>
          </button>
        )})}
      </div>
      <div style={{height:32}}/>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════
// MAIN APP
// ═════════════════════════════════════════════════════════════════

export default function SpotAndFix(){
  useEffect(()=>{
    if(!document.querySelector(`link[href="${FONT_URL}"]`)){
      const l=document.createElement("link");l.href=FONT_URL;l.rel="stylesheet";document.head.appendChild(l);
    }
  },[]);

  const [v,setV]=useState("home");
  const [tc,setTc]=useState(0);
  const ct=useRef(null);
  const tRef=useRef(null);
  const dash=useRef({m1:[],m2:[],m3:[],m4:[]});

  const htc=useCallback(()=>{
    setTc(p=>{const n=p+1;if(n>=5){setV("dash");return 0}return n});
    clearTimeout(ct.current);
    ct.current=setTimeout(()=>setTc(0),1500);
  },[]);

  useEffect(()=>{
    const el=tRef.current;
    if(el&&v==="home"){el.addEventListener("click",htc);return()=>el.removeEventListener("click",htc)}
  },[v,htc]);

  useEffect(()=>{window.scrollTo({top:0,behavior:"smooth"})},[v]);

  const go=()=>setV("home");

  return(
    <Shell onDash={()=>setV("dash")}>
      {v==="home"&&<Home onSelect={id=>setV(`m${id}`)} tRef={tRef}/>}
      {v==="m1"&&<Mod1 onBack={go} dash={dash}/>}
      {v==="m2"&&<Mod2 onBack={go} dash={dash}/>}
      {v==="m3"&&<Mod3 onBack={go} dash={dash}/>}
      {v==="m4"&&<Mod4 onBack={go} dash={dash}/>}
      {v==="dash"&&<Dashboard onClose={go} dash={dash}/>}
    </Shell>
  );
}
