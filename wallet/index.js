import { INITIAL_BALANCE } from "../config.js";
import ChainUtil from "../chain-utilities.js";
//used to generate KP in constructor along with getPublic() for the public Key
import Ts from "./ts.js";

class Wallet {
    constructor() {
        this.balance = INITIAL_BALANCE;
        this.keyPair = ChainUtil.genKeyPair(); // take pK return KeyPair()
        this.publicKey = this.keyPair.getPublic().encode("hex");
    }

    toString() {
        return `Wallet - 
        Public Key: ${this.publicKey.toString()}
        Balance : ${this.balance}`;
    }

    sign(dataHash) {
        return this.keyPair.sign(dataHash); //private Key to gen/instantiate the keyPair
    }

    createTs(recepient, amount, blockchain, tsPool) {
        //new arg of bc for the calcBalance()
        this.balance = this.calcBalance(blockchain);
        if (amount > this.balance) {
            console.log(
                `This ${amount} amount exceeds current balance of: ${this.balance}`
            );
            return;
        }

        let ts = tsPool.existingTs(this.publicKey);
        //then...
        if (ts) {
            ts.update(this, recepient, amount);
        } else {
            ts = Ts.newTs(this, recepient, amount);
            tsPool.updateOrAddTs(ts);
        }

        return ts;
    }

    calcBalance(blockchain) {
        let balance = this.balance;
        //each ts object contained in each block ... array with history of all ts
        let tsns = [];
        //for each on: -> block -> tsns
        blockchain.chain.forEach((block) =>
            block.data.forEach((ts) => {
                tsns.push(ts);
            })
        );

        //find all tsns matching this wallet's address
        const walletInputTsns = tsns.filter(
            (ts) => ts.input.address === this.publicKey
        );

        let startTime = 0;
        if (walletInputTsns.length > 0) {
            //recent tsns this wallet created i.e  (timestamp is higher)
            const recentInputTs = walletInputTsns.reduce((prev, current) => {
                prev.input.timestamp > current.input.timestamp ? prev : current;
            });

            //set baln to this current ts output amount
            balance = recentInputTs.outputs.find(
                (output) => output.address === this.publicKey
            ).amount;

            //this baln will increase with other feature tsns hence the startTime = 0 to indicate this baln at initial calc
            startTime = recentInputTs.input.timestamp;
        }

        tsns.forEach((ts) => {
            if (ts.input.timestamp > startTime) {
                ts.outputs.find((output) => {
                    if (output.address === this.publicKey) {
                        balance += output.amount;
                    }
                });
            }
        });

        return balance;
    }

    static bcWallet() {
        const bcWallet = new this();
        bcWallet.address = "blockchain-wallet";
        return bcWallet;
    }
}

export default Wallet;
