// MCP protocol test for the cross-IDE server.
// Spawns mcp/server.mjs over stdio via the official MCP SDK client and exercises
// initialize -> tools/list -> tools/call. Run: npm run test:mcp
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import { fileURLToPath } from 'url'

const serverPath = fileURLToPath(new URL('../mcp/server.mjs', import.meta.url))
const EXPECTED_TOOLS = ['software_engineer_health', 'software_engineer_classify', 'software_engineer_orchestrate']

let failures = 0
const check = (name, cond, detail = '') => {
  console.log(`${cond ? 'ok  ' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`)
  if (!cond) failures++
}

const transport = new StdioClientTransport({ command: 'node', args: [serverPath] })
const client = new Client({ name: 'protocol-test', version: '1.0.0' }, { capabilities: {} })

try {
  await client.connect(transport)
  check('initialize handshake', true)

  const { tools } = await client.listTools()
  const names = tools.map((t) => t.name)
  check('tools/list returns all tools', EXPECTED_TOOLS.every((t) => names.includes(t)), names.join(', '))

  const h = await client.callTool({ name: 'software_engineer_health', arguments: {} })
  const health = JSON.parse(h.content[0].text)
  check('health is healthy', health.healthy === true, `failed=${JSON.stringify(health.failed)}`)
  check('health reports model availability', health.model && typeof health.model.sampling === 'boolean')

  // No sampling capability and no API keys here -> classify must error gracefully (not crash).
  const c = await client.callTool({ name: 'software_engineer_classify', arguments: { task: 'add login' } })
  check('classify degrades gracefully without a model', c.isError === true && /No model backend/.test(c.content[0].text))

  const bad = await client.callTool({ name: 'does_not_exist', arguments: {} })
  check('unknown tool errors gracefully', bad.isError === true && /Unknown tool/.test(bad.content[0].text))
} catch (e) {
  check('protocol run completed without throwing', false, e.message)
} finally {
  await client.close()
}

console.log(failures === 0 ? '\nAll MCP protocol checks passed.' : `\n${failures} check(s) failed.`)
process.exit(failures === 0 ? 0 : 1)
