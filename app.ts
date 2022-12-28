import { getOrCreateAssociatedTokenAccount, createTransferInstruction } from "@solana/spl-token";
import { Connection, Keypair, ParsedAccountData, PublicKey, sendAndConfirmTransaction, Transaction } from "@solana/web3.js";



const SOLANA_CONNECTION = new Connection("https://api.devnet.solana.com");

const secret = // [secret key]

const FROM_KEYPAIR = Keypair.fromSecretKey(new Uint8Array(secret));
const DESTINATION_WALLET = 'FuEm7UMaCYHThzKaf9DcJ7MdM4t4SALfeNnYQq46foVv'; 
const MINT_ADDRESS = 'BtafGLv9PsmdFTqyzqWt5uWcFVYtKmc9ScCK3sMJtU6P'; //You must change this value!
const TRANSFER_AMOUNT = 1;

async function getNumberDecimals(mintAddress: string):Promise<number> {
    const info = await SOLANA_CONNECTION.getParsedAccountInfo(new PublicKey(MINT_ADDRESS));
    const result = (info.value?.data as ParsedAccountData).parsed.info.decimals as number;
    return result;
}

async function sendTokens() {
    console.log(`Sending ${TRANSFER_AMOUNT} ${(MINT_ADDRESS)} from ${(FROM_KEYPAIR.publicKey.toString())} to ${(DESTINATION_WALLET)}.`)
    //Step 1
    console.log(`1 - Getting Source Token Account`);
    let sourceAccount = await getOrCreateAssociatedTokenAccount(
        SOLANA_CONNECTION, 
        FROM_KEYPAIR,
        new PublicKey(MINT_ADDRESS),
        FROM_KEYPAIR.publicKey
    );
    console.log(`    Source Account: ${sourceAccount.address.toString()}`);

        //Step 2
        console.log(`2 - Getting Destination Token Account`);
        let destinationAccount = await getOrCreateAssociatedTokenAccount(
            SOLANA_CONNECTION, 
            FROM_KEYPAIR,
            new PublicKey(MINT_ADDRESS),
            new PublicKey(DESTINATION_WALLET)
        );
        console.log(`    Destination Account: ${destinationAccount.address.toString()}`);

            //Step 3
    console.log(`3 - Fetching Number of Decimals for Mint: ${MINT_ADDRESS}`);
    const numberDecimals = await getNumberDecimals(MINT_ADDRESS);
    console.log(`    Number of Decimals: ${numberDecimals}`);

        //Step 4
        console.log(`4 - Creating and Sending Transaction`);
        const tx = new Transaction();
        tx.add(createTransferInstruction(
            sourceAccount.address,
            destinationAccount.address,
            FROM_KEYPAIR.publicKey,
            TRANSFER_AMOUNT * Math.pow(10, numberDecimals)
        ))

        const latestBlockHash = await SOLANA_CONNECTION.getLatestBlockhash('confirmed');
        tx.recentBlockhash = await latestBlockHash.blockhash;    
        const signature = await sendAndConfirmTransaction(SOLANA_CONNECTION,tx,[FROM_KEYPAIR]);
        console.log(
            '\x1b[32m', 
            `   Transaction Success!🎉`,
            `\n    https://explorer.solana.com/tx/${signature}?cluster=devnet`
        );
}

sendTokens();
