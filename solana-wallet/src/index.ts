// src/index.ts
import { Keypair, Connection, clusterApiUrl, LAMPORTS_PER_SOL, SystemProgram, Transaction, sendAndConfirmTransaction, PublicKey } from '@solana/web3.js';

// Create a new random keypair (wallet)
const createWallet = (): Keypair => {
  const keypair = Keypair.generate();
  console.log("Public Key:", keypair.publicKey.toString());
  console.log("Secret Key:", Buffer.from(keypair.secretKey).toString('hex'));
  return keypair;
};

// Airdrop SOL to a wallet
const airdropSol = async (connection: Connection, publicKey: string, lamports: number) => {
  const airdropSignature = await connection.requestAirdrop(
    new PublicKey(publicKey),
    lamports
  );
  await connection.confirmTransaction(airdropSignature);
  console.log(`Airdropped ${lamports / LAMPORTS_PER_SOL} SOL to ${publicKey}`);
};

// Check wallet balance
const getBalance = async (connection: Connection, publicKey: string) => {
  const balance = await connection.getBalance(new PublicKey(publicKey));
  console.log(`Wallet balance: ${balance / LAMPORTS_PER_SOL} SOL`);
};

// Send SOL from one wallet to another
const sendSol = async (connection: Connection, from: Keypair, toPublicKey: string, lamports: number) => {
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: from.publicKey,
      toPubkey: new PublicKey(toPublicKey),
      lamports: lamports,
    })
  );

  const signature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [from]
  );

  console.log("Transaction complete with signature:", signature);
};

// Main function to demonstrate the wallet functionalities
const main = async () => {
  // Connect to the Devnet cluster
  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

  // Create wallets
  const senderWallet = createWallet();
  const recipientWallet = createWallet();

  // Airdrop SOL to the sender's wallet
  await airdropSol(connection, senderWallet.publicKey.toString(), LAMPORTS_PER_SOL);

  // Check balances
  await getBalance(connection, senderWallet.publicKey.toString());
  await getBalance(connection, recipientWallet.publicKey.toString());

  // Send SOL from sender to recipient
  await sendSol(connection, senderWallet, recipientWallet.publicKey.toString(), LAMPORTS_PER_SOL / 100); // Sending 0.01 SOL

  // Check balances after transaction
  await getBalance(connection, senderWallet.publicKey.toString());
  await getBalance(connection, recipientWallet.publicKey.toString());
};

main().catch(err => {
  console.error(err);
});
