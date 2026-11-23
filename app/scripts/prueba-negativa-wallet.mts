import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import { address, createNoopSigner } from '@solana/kit';
import {
  getCambiarMontoInstruction,
  REGISTRO_PROGRAM_ADDRESS,
} from '../clients/js/src/generated/index.js';
import { aWeb3 } from '../src/solana/tx.ts';

const RPC = 'https://api.devnet.solana.com';
const TARGET = {
  registro: 'Cc2c6p4KEKF9ct15e9tNHzdiJ3xPLRjuYMSehSAHaWJ8',
  cliente: 'EXGr16T7cEZFSDuzvnDo1tqT5hdHmEAMFkkVnf43t7JQ',
  venta: 'z15RmUs7KKTDnwWNVpPZrEzhYfE6HubYSwk7Nw6Vopj',
  idCliente: 1,
  idVenta: 2,
};

const connection = new Connection(RPC, 'confirmed');
const keypairPath = process.env.NEGATIVE_TEST_KEYPAIR;
const atacante = keypairPath
  ? Keypair.fromSecretKey(
      Uint8Array.from(JSON.parse(await readFile(keypairPath, 'utf8'))),
    )
  : Keypair.generate();
const atacanteAddress = address(atacante.publicKey.toBase58());

if (!keypairPath) {
  const airdropSignature = await connection.requestAirdrop(
    atacante.publicKey,
    100_000_000,
  );
  await connection.confirmTransaction(airdropSignature, 'confirmed');
}

const instruction = getCambiarMontoInstruction({
  owner: createNoopSigner(atacanteAddress),
  registro: address(TARGET.registro),
  cliente: address(TARGET.cliente),
  venta: address(TARGET.venta),
  idCliente: TARGET.idCliente,
  idVenta: TARGET.idVenta,
  nuevoMonto: 99,
});

const { blockhash, lastValidBlockHeight } =
  await connection.getLatestBlockhash('confirmed');
const transaction = new Transaction({
  feePayer: atacante.publicKey,
  blockhash,
  lastValidBlockHeight,
}).add(aWeb3(instruction));
transaction.sign(atacante);

const simulation = await connection.simulateTransaction(transaction);
const logs = simulation.value.logs ?? [];
const result = {
  fecha: new Date().toISOString(),
  red: 'devnet',
  rpc: RPC,
  operacion: 'cambiar_monto',
  walletPrueba: atacante.publicKey.toBase58(),
  cuentasObjetivo: TARGET,
  montoSolicitado: 99,
  transaccionEnviada: false,
  resultado: simulation.value.err === null ? 'inesperado_exito' : 'rechazada',
  error: simulation.value.err,
  logs,
  cuentaPrograma: REGISTRO_PROGRAM_ADDRESS,
  verificacion: {
    ventaNoModificada: 'La simulacion no envia la transaccion; la Venta #2 permanece intacta.',
    clavePrivadaPublicada: false,
  },
};

const output = resolve(
  import.meta.dirname,
  '../docs/evidencias/caso-negativo-wallet-no-autorizada.json',
);
await mkdir(dirname(output), { recursive: true });
await writeFile(output, `${JSON.stringify(result, null, 2)}\n`, 'utf8');

console.log(JSON.stringify(result, null, 2));
