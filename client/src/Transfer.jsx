import { useState } from 'react'
import server from './server'
import { secp256k1 } from '@noble/curves/secp256k1'
import { keccak256 } from 'ethereum-cryptography/keccak'
import { utf8ToBytes } from 'ethereum-cryptography/utils'

function Transfer ({ ethAddress, setBalance, privateKey, setPrivateKey }) {
  const [sendAmount, setSendAmount] = useState('')
  const [recipient, setRecipient] = useState('')

  const setValue = setter => evt => setter(evt.target.value)

  async function transfer (evt) {
    evt.preventDefault()

    const data = { sender: ethAddress, amount: parseInt(sendAmount), recipient }
    const messageHash = keccak256(utf8ToBytes(JSON.stringify(data)))
    const { r, s, recovery } = secp256k1.sign(messageHash, privateKey)

    const rHex = r.toString(16).padStart(64, '0')
    const sHex = s.toString(16).padStart(64, '0')

    const signatureHex = rHex + sHex

    const signature = {
      signatureHex,
      recovery
    }

    try {
      const {
        data: { balance }
      } = await server.post(`send`, {
        data,
        signature
      })

      setBalance(balance)
    } catch (ex) {
      if (ex.response) {
        console.error('Error data:', ex.response.data)
        console.error('Status code:', ex.response.status)
        alert(`Error ${ex.response.status} : ${ex.response.data.message}`)
      } else if (ex.request) {
        console.error('No response received:', ex.request)
        alert('No response received from server')
      } else {
        console.error('Error message:', ex.message)
        alert(`Error message: ${ex.message}`)
      }
    }
  }

  return (
    <form className='container transfer' onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder='1, 2, 3...'
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder='Type an ETH address'
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <label>
        Private Key
        <input
          placeholder='Type Private Key'
          type='password'
          value={privateKey}
          onChange={setValue(setPrivateKey)}
        ></input>
      </label>

      <input type='submit' className='button' value='Transfer' />
    </form>
  )
}

export default Transfer
