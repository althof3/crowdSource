import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { AnchorProvider, Program, Idl } from '@coral-xyz/anchor';

export const CROWDRADAR_PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_CROWDRADAR_PROGRAM_ID || '11111111111111111111111111111111'
);

export const connection = new Connection(
  clusterApiUrl((process.env.NEXT_PUBLIC_SOLANA_NETWORK as any) || 'devnet'),
  'confirmed'
);

export function getProgram(provider: AnchorProvider) {
  // IDL will be generated after anchor build
  const idl: Idl = {
    version: '0.1.0',
    name: 'crowdradar',
    instructions: [],
    accounts: [],
    errors: [],
    metadata: {
      address: CROWDRADAR_PROGRAM_ID.toString(),
    },
  };
  return new Program(idl, CROWDRADAR_PROGRAM_ID, provider);
}

export async function findEscrowPDA(author: PublicKey, sayembaraId: string) {
  return await PublicKey.findProgramAddress(
    [
      Buffer.from('escrow'),
      author.toBuffer(),
      Buffer.from(sayembaraId)
    ],
    CROWDRADAR_PROGRAM_ID
  );
}
