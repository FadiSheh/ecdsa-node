const express = require('express')
const app = express()
const cors = require('cors')
const port = 3042

const { secp256k1 } = require('@noble/curves/secp256k1')
const { bytesToHex, utf8ToBytes } = require('@noble/curves/abstract/utils')
const { keccak256 } = require('ethereum-cryptography/keccak')

app.use(cors())
app.use(express.json())

const balances = {
  '0x51a5d7e1e13a1ab4a325017d6730f506d554af48': 100,
  //Private Key:  2195b94700fa79f370bdffacc138903c1f242d4723cc816ca90d28154ad9c078
  '0x9e10f7d8be7bdebad52d22154dcdb3b929a6fa86': 50,
  //Private Key:  46e77c501aab863c1186c94a71cd2e50497c204af611f64bd56abe6767332788
  '0x1faf77e2d23acfb588ab07c2c5370896312ef999': 75
  //Private Key:  ff33c78c7dd48318b1234bd4e6229533e6c499ed52b4e2d07c262bca950999ec
}

app.get('/balance/:ethAddress', (req, res) => {
  const { ethAddress } = req.params
  const balance = balances[ethAddress] || 0
  res.send({ balance, message: 'Transaction completed' })
})

app.post('/send', (req, res) => {
  const { data, signature } = req.body
  const sender = data.sender
  const amount = data.amount
  const recipient = data.recipient

  setInitialBalance(sender)
  setInitialBalance(recipient)

  if (isValid(signature, data)) {
    if (!balances.hasOwnProperty(recipient)) {
      return res.status(404).send({ message: 'Recipient not found!' })
    }

    if (balances[sender] < amount) {
      res.status(400).send({ message: 'Not enough funds!' })
    } else {
      balances[sender] -= amount
      balances[recipient] += amount
      res.send({ balance: balances[sender] })
    }
  } else {
    return res.status(401).send({ message: 'Transaction unauthorized' })
  }
})

app.listen(port, () => {
  console.log(`Listening on port ${port}!`)
})

function setInitialBalance (ethAddress) {
  if (!balances[ethAddress]) {
    balances[ethAddress] = 0
  }
}

function getEthAddress (publicKey) {
  return '0x' + bytesToHex(keccak256(publicKey.slice(1)).slice(-20))
}

function isValid (signature, data) {
  const sig = signature.signatureHex
  const recovery = signature.recovery

  let sigObj = secp256k1.Signature.fromCompact(sig)
  sigObj = sigObj.addRecoveryBit(recovery)

  const messageHash = keccak256(utf8ToBytes(JSON.stringify(data)))
  const recoveredKey = sigObj.recoverPublicKey(messageHash).toRawBytes()

  const validSignature = secp256k1.verify(sigObj, messageHash, recoveredKey)
  const validSender = getEthAddress(recoveredKey) == data.sender

  return validSignature && validSender
}
