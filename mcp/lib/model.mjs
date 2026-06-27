// Model abstraction for the cross-IDE MCP server.
//
// Resolution order (first available wins):
//   1. MCP sampling  — the host IDE's own model (Claude Code, etc.). No API keys.
//   2. ANTHROPIC_API_KEY — direct Anthropic Messages API.
//   3. OPENAI_API_KEY    — direct OpenAI Chat Completions API.
//   4. otherwise a clear, actionable error.
//
// "main" tier = orchestrator/reasoning; "sub" tier = cheaper sub-agent work.
import Ajv from 'ajv'

const ajv = new Ajv({ allErrors: true, strict: false })

const MODELS = {
  anthropic: {
    main: process.env.SE_MAIN_MODEL || 'claude-sonnet-4-6',
    sub:  process.env.SE_SUB_MODEL  || 'claude-haiku-4-5-20251001',
  },
  openai: {
    main: process.env.SE_OPENAI_MAIN_MODEL || 'gpt-4o',
    sub:  process.env.SE_OPENAI_SUB_MODEL  || 'gpt-4o-mini',
  },
}

const stripFences = (t) =>
  String(t).replace(/^\s*```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim()

export function createModel({ server } = {}) {
  const clientCaps = () => {
    try { return server?.getClientCapabilities?.() || null } catch { return null }
  }

  async function viaSampling({ system, prompt, tier }) {
    if (!server || !clientCaps()?.sampling) return null
    const res = await server.createMessage({
      messages: [{ role: 'user', content: { type: 'text', text: prompt } }],
      systemPrompt: system,
      maxTokens: 4096,
      modelPreferences: tier === 'sub'
        ? { intelligencePriority: 0.2, speedPriority: 0.8, costPriority: 0.9 }
        : { intelligencePriority: 0.9, speedPriority: 0.3, costPriority: 0.2 },
    })
    return res?.content?.text ?? null
  }

  async function viaAnthropic({ system, prompt, tier }) {
    const key = process.env.ANTHROPIC_API_KEY
    if (!key) return null
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: MODELS.anthropic[tier] || MODELS.anthropic.main,
        max_tokens: 4096,
        system: system || undefined,
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    if (!r.ok) throw new Error(`Anthropic API ${r.status}: ${await r.text()}`)
    const j = await r.json()
    return (j.content || []).map((c) => c.text || '').join('')
  }

  async function viaOpenAI({ system, prompt, tier }) {
    const key = process.env.OPENAI_API_KEY
    if (!key) return null
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: MODELS.openai[tier] || MODELS.openai.main,
        messages: [
          ...(system ? [{ role: 'system', content: system }] : []),
          { role: 'user', content: prompt },
        ],
      }),
    })
    if (!r.ok) throw new Error(`OpenAI API ${r.status}: ${await r.text()}`)
    const j = await r.json()
    return j.choices?.[0]?.message?.content ?? ''
  }

  async function raw({ system, prompt, tier = 'main' }) {
    const text =
      (await viaSampling({ system, prompt, tier })) ??
      (await viaAnthropic({ system, prompt, tier })) ??
      (await viaOpenAI({ system, prompt, tier }))
    if (text == null) {
      throw new Error(
        'No model backend available. Either run this server inside an MCP host that supports ' +
        'sampling (e.g. Claude Code), or set ANTHROPIC_API_KEY or OPENAI_API_KEY in the server environment.'
      )
    }
    return text
  }

  async function generate({ system, prompt, schema, tier = 'main' }) {
    if (!schema) return raw({ system, prompt, tier })
    const instr =
      `\n\nRespond with ONLY a JSON object that validates against this JSON Schema ` +
      `(no prose, no code fences):\n${JSON.stringify(schema)}`
    const validate = ajv.compile(schema)
    let last = null
    for (let attempt = 0; attempt < 2; attempt++) {
      const fix = last ? `\n\nYour previous reply was invalid: ${last}. Return corrected JSON only.` : ''
      const text = await raw({ system, prompt: prompt + instr + fix, tier })
      try {
        const obj = JSON.parse(stripFences(text))
        if (validate(obj)) return obj
        last = ajv.errorsText(validate.errors)
      } catch (e) {
        last = e.message
      }
    }
    throw new Error(`Model did not return schema-valid JSON after 2 attempts: ${last}`)
  }

  function availability() {
    return {
      sampling: !!clientCaps()?.sampling,
      anthropicKey: !!process.env.ANTHROPIC_API_KEY,
      openaiKey: !!process.env.OPENAI_API_KEY,
    }
  }

  return { generate, raw, availability }
}
