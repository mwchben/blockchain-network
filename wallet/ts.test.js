import Ts from "./ts.js";
import Wallet from "./index.js";

describe('The Transaction Test', ()=>{

    let ts,wallet,recepient,amount;

    beforeEach(()=> {
        wallet = new Wallet();
        amount = 50;
        recepient = 'r3c31p13nt';
        ts = new Ts.newTs(wallet,recepient,amount); 
    })

    it("outputs `amount` subtracted from tha wallet baln", ()=> {
        expect(ts.outputs.find( output => output.address === wallet.publicKey ).amount)
        //read as .find (this output {{ whose i.e., => }} address in outputs property equals this publicKey )
        .toEqual(wallet.balance - amount)
    })
    
    it("outputs `amount` added to the receipient", ()=> {
        expect(ts.outputs.find( output => output.address === recepient ).amount)
        .toEqual(amount)
    })

    //test to prove input Ts is there by checking on balance in wallet
    it("inputs the baln of the wallet", ()=> {
        expect(ts.input.amount).toEqual(wallet.balance)
    })

    describe("Ts amount exceeds the balance", ()=> {
        beforeEach(()=>{
            amount = 50000;
            ts = Ts.newTs(wallet,recepient,amount);
        })
    
        it("does not create the Ts ", ()=> {
            expect(ts).toEqual(undefined)
        })
    })
})

