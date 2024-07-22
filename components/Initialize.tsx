import {
  useConnection,
  useWallet,
  useAnchorWallet,
} from "@solana/wallet-adapter-react";
import * as anchor from "@project-serum/anchor";
import { FC, useEffect, useState } from "react";
import idl from "../idl.json";
import { Button } from "@chakra-ui/react";
import { PublicKey } from "@solana/web3.js";

const program_ID = new anchor.web3.PublicKey(idl.address)
const PROGRAM_ID = new anchor.web3.PublicKey(
  `8FP7gNSwhgBtCXicESpq4J2uLnCsBYiEkfLN1f6qLrc1`
);

export interface Props {
  setScounter: any;
  setTransactionUrl: any;
}

export const Initialize: FC<Props> = ({ setScounter, setTransactionUrl }) => {
  const [program, setProgram] = useState<anchor.Program>();
  //console.log(program_ID)
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  useEffect(() => {
    let provider: anchor.Provider;

    try {
      provider = anchor.getProvider();
    } catch {
      provider = new anchor.AnchorProvider(connection, wallet, {
        preflightCommitment: "confirmed",
      });
      anchor.setProvider(provider);
    }
    if (!idl) {
      console.error("IDL is undefined");
      return;
    }
    if (!PROGRAM_ID) {
      console.error("PROGRAM_ID is undefined");
      return;
    }

    try {
      const program = new anchor.Program(
        idl as anchor.Idl,
        PROGRAM_ID,
        provider
      );
      setProgram(program);
    } catch (e) {
      console.error("Error creating Anchor program", e);
    }
  }, [connection, wallet]);

  const onClick = async () => {
    // const m = new Uint8Array([
    //   124, 196, 40, 14, 228, 210, 145, 232, 116, 96, 45, 15, 3, 36, 145, 53, 36,
    //   55, 86, 210, 207, 55, 17, 151, 233, 75, 64, 25, 75, 113, 231, 133, 157,
    //   160, 117, 198, 4, 160, 6, 128, 59, 139, 97, 4, 175, 224, 90, 191, 60, 173,
    //   236, 60, 144, 223, 99, 9, 193, 253, 203, 4, 178, 196, 185, 18,
    // ]);
    const newAccount = anchor.web3.Keypair.generate()
    console.log(newAccount.publicKey);
    const sig = await program.methods
      .initialize()
      .accounts({
        scounter: newAccount.publicKey,
        user: wallet.publicKey,
        system_program: anchor.web3.SystemProgram.programId,
      })
      .signers([newAccount])
      .rpc();

    console.log("sig", sig);
    //setTransactionUrl(`https://explorer.solana.com/tx/${sig}?cluster=devnet`)
    //setScounter(newAccount.publicKey)
  };

  return <Button onClick={onClick}>Initialize Counter</Button>;
};
