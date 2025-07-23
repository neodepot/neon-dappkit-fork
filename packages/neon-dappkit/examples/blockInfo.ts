import { NeonInvoker } from '@cityofzion/neon-dappkit'
import { rpc } from '@cityofzion/neon-js'

async function main() {
  const rpcAddress = 'https://node.neodepot.org'
  const invoker = await NeonInvoker.init({ rpcAddress })
  console.log(`Connected using network magic: ${invoker['options'].networkMagic}`)

  const client = new rpc.RPCClient(rpcAddress)
  const blockCount = await client.getBlockCount()
  console.log(`Current block count: ${blockCount}`)

  const latestBlock = await client.getBlock(blockCount - 1, true)
  console.log(`Latest block index: ${latestBlock.index}`)
  console.log(`Transaction count in latest block: ${latestBlock.tx.length}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
