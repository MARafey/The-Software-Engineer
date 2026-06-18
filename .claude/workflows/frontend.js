export const meta = {
  name: 'frontend',
  description: 'Frontend domain agent — UI design, components, API wiring, security checks',
  phases: [
    { title: 'Load Context', detail: 'Read storage rules, security rules, prior decisions' },
    { title: 'UI Design', detail: 'ui-designer defines layout and design system usage' },
    { title: 'Components', detail: 'component-creator builds component files' },
    { title: 'API Wiring', detail: 'api-request-handler wires components to backend contracts' },
    { title: 'Security Check', detail: 'security-checker audits token placement, CSP, storage' },
  ],
}

const AGENTS_DIR    = 'C:/Users/Hp/Desktop/Agents'
const sessionId     = (args && args.sessionId)    || 'no-session'
const taskText      = (args && args.taskText)     || ''
const projectPath   = (args && args.projectPath)  || ''
const backendOutput = (args && args.backendOutput) || null

const contractExports = (backendOutput && backendOutput.contractExports) || []

// ─── Phase: Load Context ─────────────────────────────────────────────────────
phase('Load Context')

const context = await agent(
  `Load context for the Frontend Agent (session: ${sessionId}).\n\n` +
  `Run: cd "${AGENTS_DIR}" && node shared/lib/db-cli.js get-decisions frontend storage-rules 10\n\n` +
  `Also read these files:\n` +
  `- ${AGENTS_DIR}/agents/frontend/vault/state-management/storage-rules.md\n` +
  `- ${AGENTS_DIR}/agents/frontend/vault/security/bearer-token-rules.md\n` +
  `- ${AGENTS_DIR}/agents/frontend/vault/design-system/tokens.md\n\n` +
  `Return JSON: { decisions: <array from command>, storageRules: "<text>", bearerRules: "<text>", tokens: "<text>" }`,
  {
    label: 'load-context',
    schema: {
      type: 'object',
      required: ['decisions'],
      properties: {
        decisions:    { type: 'array' },
        storageRules: { type: 'string' },
        bearerRules:  { type: 'string' },
        tokens:       { type: 'string' },
      },
    },
  }
)

log(`Loaded ${context.decisions.length} decisions. API contracts available: ${contractExports.length}`)

// ─── Phase: UI Design ─────────────────────────────────────────────────────────
phase('UI Design')

const uiDesign = await agent(
  `You are the ui-designer sub-agent of the Frontend Agent.\n\n` +
  `Task: "${taskText}"\n` +
  `Project: ${projectPath}\n` +
  `Design tokens: ${context.tokens || 'Use CSS custom properties from :root'}\n\n` +
  `Examine the existing frontend at ${projectPath} to understand the current design system.\n\n` +
  `Design the UI for this feature:\n` +
  `1. What pages/views are needed?\n` +
  `2. What layout pattern fits (full-page, modal, sidebar, card)?\n` +
  `3. Which design tokens apply?\n` +
  `4. What's the responsive behavior (mobile-first breakpoints)?\n` +
  `5. What loading, empty, and error states are needed?\n\n` +
  `Return JSON: { pages: [{name,type:"page"|"layout"|"widget"|"form",description,responsive:true}], designDecisions: [string] }`,
  {
    label: 'ui-designer',
    phase: 'UI Design',
    schema: {
      type: 'object',
      required: ['pages', 'designDecisions'],
      properties: {
        pages:           { type: 'array' },
        designDecisions: { type: 'array', items: { type: 'string' } },
      },
    },
  }
)

log(`Designed ${uiDesign.pages.length} page/component(s)`)

// ─── Phase: Components ────────────────────────────────────────────────────────
phase('Components')

const components = await agent(
  `You are the component-creator sub-agent of the Frontend Agent.\n\n` +
  `Task: "${taskText}"\n` +
  `Project: ${projectPath}\n` +
  `Pages/components to build: ${JSON.stringify(uiDesign.pages)}\n\n` +
  `Examine the existing frontend code to match conventions.\n\n` +
  `Build the component files. Rules:\n` +
  `- All API calls go in src/api/<feature>.api.js — never inline in JSX\n` +
  `- Components import from the api file, never use fetch/axios directly\n` +
  `- Use design tokens (CSS custom properties) — no hardcoded colors\n` +
  `- Include loading, empty, and error states in every data-fetching component\n\n` +
  `Return JSON: { components: [{name,filePath,type,usesAPI:[routePath]}], apiFiles: [string], filesCreated: [string] }`,
  {
    label: 'component-creator',
    phase: 'Components',
    schema: {
      type: 'object',
      required: ['components', 'apiFiles', 'filesCreated'],
      properties: {
        components: { type: 'array' },
        apiFiles:   { type: 'array', items: { type: 'string' } },
        filesCreated: { type: 'array', items: { type: 'string' } },
      },
    },
  }
)

log(`Built ${components.components.length} component(s), ${components.apiFiles.length} api file(s)`)

// ─── Phase: API Wiring ────────────────────────────────────────────────────────
phase('API Wiring')

const wiring = await agent(
  `You are the api-request-handler sub-agent of the Frontend Agent.\n\n` +
  `Task: "${taskText}"\n` +
  `Project: ${projectPath}\n` +
  `Components built: ${JSON.stringify(components.components)}\n` +
  `Backend contract exports: ${JSON.stringify(contractExports)}\n` +
  `Storage rules (authoritative):\n${context.storageRules || 'Tokens in memory only; session data in sessionStorage; preferences in localStorage; app state in Redux/Zustand/context'}\n\n` +
  `Wire each component to its backend route. For each API binding:\n` +
  `1. Confirm the route exists in backendContractExports — only call declared routes\n` +
  `2. Decide where the response data goes (storageLayer from the rules above)\n` +
  `3. Create or update Redux slices / Zustand stores / context as needed\n` +
  `4. Ensure auth token is sent via Authorization header from in-memory store — NEVER from localStorage\n\n` +
  `Return JSON: { apiBindings: [{component,routePath,method,storageTarget}], stateSlices: [{name,storageLayer,sensitivity,fields:[string]}], filesUpdated: [string] }`,
  {
    label: 'api-request-handler',
    phase: 'API Wiring',
    schema: {
      type: 'object',
      required: ['apiBindings', 'stateSlices', 'filesUpdated'],
      properties: {
        apiBindings:  { type: 'array' },
        stateSlices:  { type: 'array' },
        filesUpdated: { type: 'array', items: { type: 'string' } },
      },
    },
  }
)

log(`Wired ${wiring.apiBindings.length} API binding(s), ${wiring.stateSlices.length} state slice(s)`)

// ─── Phase: Security Check ────────────────────────────────────────────────────
phase('Security Check')

const security = await agent(
  `You are the security-checker sub-agent of the Frontend Agent.\n\n` +
  `Audit all frontend files changed in this session at ${projectPath}.\n` +
  `Files to audit: ${JSON.stringify([...components.filesCreated, ...wiring.filesUpdated])}\n\n` +
  `Security rules (from vault):\n${context.bearerRules || 'Bearer token must be in Authorization header from in-memory store. NEVER in localStorage, sessionStorage, URL, or request body.'}\n\n` +
  `Check:\n` +
  `1. [error] Bearer token accessed from localStorage anywhere\n` +
  `2. [error] Token included in request body or URL query params\n` +
  `3. [error] Auth tokens stored in sessionStorage or localStorage\n` +
  `4. [warning] No CSRF token on state-changing requests to same-origin APIs\n` +
  `5. [warning] innerHTML set with user-controlled data (XSS risk)\n` +
  `6. [info] All API calls go through src/api/*.api.js files\n\n` +
  `Return JSON: { securityFlags: [{severity:"error"|"warning"|"info",rule:string,location:string,message:string}], passed: boolean }`,
  {
    label: 'security-checker',
    phase: 'Security Check',
    schema: {
      type: 'object',
      required: ['securityFlags', 'passed'],
      properties: {
        securityFlags: { type: 'array' },
        passed:        { type: 'boolean' },
      },
    },
  }
)

const errorFlags = security.securityFlags.filter(f => f.severity === 'error')
log(`Security: ${security.securityFlags.length} flag(s), ${errorFlags.length} error(s), passed=${security.passed}`)

// Persist
await agent(
  `Save frontend decision. Run:\n` +
  `cd "${AGENTS_DIR}" && node shared/lib/db-cli.js save-decision frontend "${sessionId}" "storage-rules" ` +
  `"Wired ${wiring.apiBindings.length} API bindings for: ${taskText.slice(0,60).replace(/"/g,'')}" "Security passed: ${security.passed}"\n\n` +
  `Return "done".`,
  { label: 'persist-state' }
)

const allFiles = [
  ...components.filesCreated,
  ...wiring.filesUpdated,
]

return {
  sessionId,
  agentName:    'frontend',
  status:       security.passed ? 'completed' : 'failed',
  components:   components.components,
  stateSlices:  wiring.stateSlices,
  apiBindings:  wiring.apiBindings,
  securityFlags: security.securityFlags,
  filesChanged: allFiles,
  errors:       errorFlags.map(f => `${f.location}: ${f.message}`),
}
