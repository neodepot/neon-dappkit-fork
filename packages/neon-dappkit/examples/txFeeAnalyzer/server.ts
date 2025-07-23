import http from 'http'
import { URL } from 'url'
import fs from 'fs'
import path from 'path'
import { rpc, sc, u } from '@cityofzion/neon-js'
const rpcAddress = 'https://node.neodepot.org'
const client = new rpc.RPCClient(rpcAddress)

const index = fs.readFileSync(path.join(__dirname, 'index.html'))

function opcodeFrequency(scriptHex: string): Record<string, number> {
  const bytes = u.HexString.fromHex(scriptHex).toArray()
  const freq: Record<string, number> = {}
  for (const b of bytes) {
    const name = sc.OpCode[b] || `0x${b.toString(16)}`
    freq[name] = (freq[name] || 0) + 1
  }
  return freq
}

http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host}`)
  if (url.pathname === '/analyze') {
    const txid = url.searchParams.get('txid')
    if (!txid) {
      res.writeHead(400)
      res.end('missing txid')
      return
    }
    try {
      const raw = await client.getRawTransaction(txid, true)
      const log = await client.getApplicationLog(txid)
      const freq = opcodeFrequency(raw.script)
      const totalGas = parseFloat(log.executions[0].gasconsumed)
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ txid, totalGas, opcodeFrequency: freq }, null, 2))
    } catch (e: any) {
      res.writeHead(500)
      res.end(JSON.stringify({ error: e.message }))
    }
    return
  }

  res.setHeader('Content-Type', 'text/html')
  res.end(index)
}).listen(8080, () => {
  console.log('Open http://localhost:8080 in your browser')
})
