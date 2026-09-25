# Beginner coach section

This component updates only `/21days/#ai-coach`. The root homepage, domain configuration, other routes, original media, and shared assets are unchanged.

The repository contains an exported React app rather than its original build sources. Its entry bundle now renders the stable `DreamsBeginnerCoachV2` component in the old AI coach section's position. That wrapper passes the existing React runtime and current agent ID to `render.js`. The First 24 Hours coach description also reflects the new optional-file, typing-first flow.

- `content.html` is the editable section content, including exact starter and project instructions. It is trusted static content; never interpolate prospect data into it.
- `content.js` is generated from `content.html` by `python build-content.py`.
- `render.js` keeps the React component, DOM reference, and HTML object stable through parent scroll and agent-ID state changes. It updates only the referral link when the agent ID changes.
- `behavior.js` mounts the interaction handlers and removes them on unmount. Its browser-storage key is `dreams-beginner-next-action-v2`; it does not alter existing agent-ID or progress keys.
- `styles.css` styles the section using unique `bc-` classes and scoped overrides.
- `/21days/downloads/` holds individual version 2 coaching files and the readable setup guide. Both the new download link and the existing `/21days/assets/Dreams-AI-Executive-Partner-Starter-Pack.zip` serve the same new ZIP.

The original `index-BtMECNlc.js` remains for recoverability. Both `21days/index.html` and `21days/404.html` load the new bundle and this component's stylesheet. The original bundle's code outside the AI coach expression and First 24 Hours coach description is preserved in the new bundle.

Before future releases, review the diff and require every changed path to remain under `21days/` for changes scoped to this page. Check the existing seven milestones, week navigation, personalized referral links, copy fallback, save/reload, and unsaved action retention while scrolling or changing agent ID. Root `CNAME` and deployment settings are outside this change's scope.

The site stores the action card only in the current browser. It does not update ChatGPT, uploaded documents, or any CRM. Specialists' live booking routes still require sponsor confirmation. The three-rep usability pilot in the coaching pack remains a recommended rollout check.
