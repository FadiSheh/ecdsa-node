import Wallet from './Wallet'
import Transfer from './Transfer'
import './App.scss'
import { useState } from 'react'

function App () {
  const [balance, setBalance] = useState(0)
  const [ethAddress, setEthAddress] = useState('')
  const [privateKey, setPrivatekey] = useState('')

  return (
    <div className='app'>
      <Wallet
        balance={balance}
        setBalance={setBalance}
        ethAddress={ethAddress}
        setEthAddress={setEthAddress}
      />
      <Transfer
        setBalance={setBalance}
        ethAddress={ethAddress}
        privateKey={privateKey}
        setPrivateKey={setPrivatekey}
      />
    </div>
  )
}

export default App
