import { Tabs, Tab } from 'react-bootstrap'
import dBank from '../abis/dBank.json'
import React, { Component } from 'react';
import Token from '../abis/Token.json'
import dbank from '../dbank.png';
import Web3 from 'web3';
import './App.css';

//h0m3w0rk - add new tab to check accrued interest

class App extends Component {

  async componentWillMount() {
    await this.loadBlockchainData(this.props.dispatch)
  }

  async loadBlockchainData(dispatch) {
    
    //check if MetaMask exists
    if(typeof(window.ethereum !== 'undefined')){
      const web3 = new Web3(window.ethereum);
      const netId = await web3.eth.net.getId();
      const accounts = await web3.eth.requestAccounts();
      
      if(typeof accounts[0] !== 'undefined'){
        const balance = await web3.eth.getBalance(accounts[0]);
        this.setState({account: accounts[0], balance: balance, web3: web3});

        try {          
          const tokenAddress = Token.networks[netId].address;
          const dBankAddress = dBank.networks[netId].address;          
          const token = new web3.eth.Contract(Token.abi, tokenAddress);
          const dbank = new web3.eth.Contract(dBank.abi, dBankAddress);
          const tokenBalance = await token.methods.balanceOf(this.state.account).call();
          const isDeposited = await dbank.methods.isDeposited(this.state.account).call();
          const etherBalanceOf = await dbank.methods.etherBalanceOf(this.state.account).call();
          const bankBalance = await web3.eth.getBalance(dBankAddress);

          this.setState({token: token, dbank: dbank, dBankAddress: dBankAddress, 
                         bankBalance: bankBalance,
                         tokenBalance: tokenBalance, isDeposited: isDeposited, 
                         etherBalanceOf : etherBalanceOf});
        } catch (e) {
          console.log('Error', e);
          alert(netId);
          alert('Contracts not deployed to the current network');
        }
        

      } else {
        alert('Please login with MetaMask');
      }
      
    } else {
      window.alert('Please install Metamask');
    }

      //in try block load contracts

    //if MetaMask not exists push alert
  }

  async deposit(amount) {
    if(this.state.dbank !== 'undefined'){
      try{
        await this.state.dbank.methods.deposit().send({value: amount.toString(), from: this.state.account});
        const balance = await this.state.web3.eth.getBalance(this.state.account);
        const bankBalance = await this.state.web3.eth.getBalance(this.state.dBankAddress);
        const isDeposited = await this.state.dbank.methods.isDeposited(this.state.account).call();
        const etherBalanceOf = await this.state.dbank.methods.etherBalanceOf(this.state.account).call();
        this.setState({balance: balance, bankBalance: bankBalance, isDeposited: isDeposited, etherBalanceOf: etherBalanceOf});
      } catch(e) {
        console.log('Error, deposit: ', e);
      }
    }
  }

  async withdraw(e) {
    e.preventDefault();
    if(this.state.dbank !== 'undefined'){
      try{
        await this.state.dbank.methods.withdraw().send({from: this.state.account});
        const balance = await this.state.web3.eth.getBalance(this.state.account);
        const bankBalance = await this.state.web3.eth.getBalance(this.state.dBankAddress);
        const tokenBalance = await this.state.token.methods.balanceOf(this.state.account).call();
        const isDeposited = await this.state.dbank.methods.isDeposited(this.state.account).call();
        const etherBalanceOf = await this.state.dbank.methods.etherBalanceOf(this.state.account).call();
        this.setState({balance: balance, bankBalance: bankBalance,  tokenBalance: tokenBalance, isDeposited: isDeposited, etherBalanceOf : etherBalanceOf});
      } catch(e) {
        console.log('Error, deposit: ', e);
      }
    }
    
  }

  constructor(props) {
    super(props)
    this.state = {
      web3: 'undefined',
      account: '',
      token: null,
      dbank: null,
      balance: 0,
      bankBalance: 0,
      dBankAddress: null,
      tokenBalance:0,
      isDeposited:false,
      etherBalanceOf: 0
    }
  }

  render() {
    return (
      <div className='text-monospace'>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href="http://www.dappuniversity.com/bootcamp"
            target="_blank"
            rel="noopener noreferrer"
          >
        <img src={dbank} className="App-logo" alt="logo" height="32"/>
          <b>dBank</b>
        </a>
        </nav>
        <div className="container-fluid mt-5 text-center">
        <br></br>
          <h1>Welcome to dBank</h1>
          <h2>{this.state.dBankAddress}({this.state.bankBalance/(10**18)})</h2>
          <h2>{this.state.account}</h2>
          <br></br>
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
              <Tabs defaultActiveKey="profile" id="uncontrolled-tab-example">
                <Tab eventKey="deposit" title="Deposit">
                  <div>
                    <br/>
                    How much do you want to deposit?
                    <br/>
                    (min. amount is 0.01 ETH)
                    <br/>
                    (1 deposit is possible at the time)
                    <br/>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      let amount = this.depositAmount.value;
                      amount = amount * 10**18;
                      this.deposit(amount);
                    }}>
                      <div className='form-group mr-sm-2'>
                        <br/>
                        <input id='depositAmount' step='0.01' type='number' 
                          className='form-control form-control-md' placeholder='amount...'
                          required
                          disabled={this.state.isDeposited}
                          ref={(input) => {this.depositAmount = input }}
                        ></input>
                      </div>
                      <button type='submit' className='btn btn-primary' disabled={this.state.isDeposited}>DEPOSIT</button>
                    </form>
                  </div>
                </Tab>
                <Tab eventKey="withdraw" title="Withdraw">
                  <div>
                    <br/>
                    Do you want to withdraw + take interest?
                    <br/>
                    <br/>
                    <div>
                      <button type='submit' onClick={(e) => this.withdraw(e)} disabled={!this.state.isDeposited}>Withdraw</button>
                    </div>
                  </div>
                </Tab>
                <Tab eventKey="balance" title="Balance">
                  <div>
                  <table>
                    <tr>
                      <td align="left">Ether:</td><td align="left">{this.state.balance/(10**18)}</td>
                    </tr>
                    <tr>
                  <td align="left">DBC:</td><td align="left">{this.state.tokenBalance/(10**18)}</td>
                    </tr>
                    <tr>
                  <td align="left">Ether Deposited:</td><td align="left">{this.state.etherBalanceOf/(10**18)}</td>
                    </tr>
                  </table>
                  </div>                  
                </Tab>
              </Tabs>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;