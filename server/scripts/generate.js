const { secp256k1 } = require('@noble/curves/secp256k1')
const { bytesToHex } = require('@noble/curves/abstract/utils')
const { keccak256 } = require('ethereum-cryptography/keccak')

const priv = secp256k1.utils.randomPrivateKey()
const pub = secp256k1.getPublicKey(priv)
console.log(typeof priv)
console.log('Private Key HEX: ', bytesToHex(priv))
console.log('Public Key HEX: ', bytesToHex(pub))

function getEthAddress (publicKey) {
  return '0x' + bytesToHex(keccak256(publicKey.slice(1)).slice(-20))
}

console.log('Eth Address: ', getEthAddress(pub))

const message = 'Hello'
const hashMessage = keccak256(Buffer.from(message))
const signature = secp256k1.sign(hashMessage, priv)

const recoveredKey = signature.recoverPublicKey(hashMessage).toRawBytes()

console.log(bytesToHex(recoveredKey) === bytesToHex(pub))
console.log(bytesToHex(recoveredKey))
console.log(bytesToHex(pub))
