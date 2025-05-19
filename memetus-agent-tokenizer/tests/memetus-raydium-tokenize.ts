import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { MemetusRaydiumTokenize } from "../target/types/memetus_raydium_tokenize";

describe("memetus-raydium-tokenize", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.MemetusRaydiumTokenize as Program<MemetusRaydiumTokenize>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
});
