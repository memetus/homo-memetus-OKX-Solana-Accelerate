import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SolanaAgentKit, KeypairWallet } from 'solana-agent-kit';
import TokenPlugin from '@solana-agent-kit/plugin-token';
import MiscPlugin from '@solana-agent-kit/plugin-misc';
import { Keypair, PublicKey, Connection } from '@solana/web3.js';
import { CreateSwapDto } from '../dto/req.dto';
import { OKXDexClient } from '@okx-dex/okx-dex-sdk';

export interface ParseAccountResponse {
  status: 'success' | 'error';
  message: string;
  programName: string;
  inputAmount: string;
  inputToken: string;
  outputAmount: string;
  outputToken: string;
}

type SolanaAgentMethods = {
  get_balance: () => Promise<number>;
  get_token_balance: (tokenMint: string) => Promise<number>;
  get_balance_other: (walletAddress: string) => Promise<number>;
  trade: (
    outputMint: PublicKey,
    amount: number,
    inputMint?: PublicKey,
    slippage?: number,
  ) => Promise<string>;
  parseTransaction: (signature: string) => Promise<any>;
  getAssetsByOwner: (contractAddress: string) => Promise<any>;
};

type ExtendedSolanaAgentKit = Omit<SolanaAgentKit, 'methods'> & {
  methods: SolanaAgentMethods;
};

export interface TokenBalance {
  tokenAddress: string;
  walletAddress: string;
  balance: string;
  decimals?: number;
}

export interface SolBalance {
  address: string;
  balance: number;
  rawBalance: number;
}

@Injectable()
export class SendaiService implements OnModuleInit {
  private agent: ExtendedSolanaAgentKit;
  private okxDexClient: OKXDexClient;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    this.initializeAgent();
    this.initializeOKXDexClient();
  }

  private async initializeAgent() {
    const rpcUrl = this.configService.get<string>('SOLANA_RPC_URL');
    const openAiApiKey = this.configService.get<string>('OPENAI_API_KEY');
    const secretKey = this.configService.get<string>('WALLET_KEY');
    const heliusApiKey = this.configService.get<string>('HELIUS_API_KEY');

    if (!rpcUrl || !openAiApiKey || !secretKey) {
      throw new Error('Required environment variables are missing');
    }

    const bs58 = await import('bs58');
    const keyPair = Keypair.fromSecretKey(bs58.default.decode(secretKey));
    const wallet = new KeypairWallet(keyPair, rpcUrl);

    this.agent = new SolanaAgentKit(wallet, rpcUrl, {
      OPENAI_API_KEY: openAiApiKey,
      HELIUS_API_KEY: heliusApiKey,
    })
      .use(TokenPlugin)
      .use(MiscPlugin as any) as unknown as ExtendedSolanaAgentKit;
  }

  private async initializeOKXDexClient() {
    const apiKey = this.configService.get<string>('OKX_API_KEY');
    const secretKey = this.configService.get<string>('OKX_SECRET_KEY');
    const apiPassphrase = this.configService.get<string>('OKX_API_PASSPHRASE');
    const projectId = this.configService.get<string>('OKX_PROJECT_ID');
    const rpcUrl = this.configService.get<string>('SOLANA_RPC_URL');
    const privateKey = this.configService.get<string>('WALLET_KEY');

    const bs58 = await import('bs58');
    const keyPair = Keypair.fromSecretKey(bs58.default.decode(privateKey));
    const connection = new Connection(rpcUrl);
    const wallet = new KeypairWallet(keyPair, rpcUrl);

    try {
      this.okxDexClient = new OKXDexClient({
        apiKey,
        secretKey,
        apiPassphrase,
        projectId,
        solana: {
          wallet: {
            ...wallet,
            connection,
            signTransaction: wallet.signTransaction.bind(wallet),
            signAllTransactions: wallet.signAllTransactions.bind(wallet),
            signAndSendTransaction: wallet.signAndSendTransaction.bind(wallet),
            signMessage: wallet.signMessage.bind(wallet),
          },
          computeUnits: 300000,
          maxRetries: 3,
        },
      });
      console.log('OKX DEX Client initialized successfully');
    } catch (error) {
      console.error('Failed to initialize OKX DEX Client:', error);
      throw error;
    }
  }

  async executeSwap(createSwapDto: CreateSwapDto) {
    try {
      const {
        amount,
        fromTokenAddress,
        toTokenAddress,
        slippage = 0.2,
      } = createSwapDto;

      // Get quote to fetch token information
      const quote = await this.okxDexClient.dex.getQuote({
        chainId: '501',
        fromTokenAddress,
        toTokenAddress,
        amount: '100000000', // Use a small amount for quote
        slippage: slippage.toString(),
      });

      const tokenInfo = {
        fromToken: {
          symbol: quote.data[0].fromToken.tokenSymbol,
          decimals: parseInt(quote.data[0].fromToken.decimal),
          price: quote.data[0].fromToken.tokenUnitPrice,
        },
        toToken: {
          symbol: quote.data[0].toToken.tokenSymbol,
          decimals: parseInt(quote.data[0].toToken.decimal),
          price: quote.data[0].toToken.tokenUnitPrice,
        },
      };

      // Convert amount to base units
      const rawAmount = (
        amount * Math.pow(10, tokenInfo.fromToken.decimals)
      ).toString();

      // Execute the swap
      const result = await this.okxDexClient.dex.executeSwap({
        chainId: '501',
        fromTokenAddress,
        toTokenAddress,
        amount: rawAmount,
        slippage: slippage.toString(),
        userWalletAddress: this.agent.wallet.publicKey.toString(),
      });

      return {
        status: 'success',
        transactionId: result.transactionId,
        explorerUrl: result.explorerUrl,
        details: result.details,
      };
    } catch (error) {
      throw new Error(
        `Failed to execute swap: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async getTokens() {
    try {
      const tokens = await this.okxDexClient.dex.getTokens('501');
      console.log('Supported tokens:', JSON.stringify(tokens, null, 2));
      return tokens;
    } catch (error) {
      console.error('Error getting chain data:', {
        error: error.message,
        status: error.status,
        response: error.response?.data,
      });
      throw error;
    }
  }

  async getBalance() {
    try {
      const balance = await this.agent.methods.get_balance();
      return {
        status: 'success',
        address: this.agent.wallet.publicKey.toBase58(),
        balance,
      };
    } catch (error) {
      throw new Error(
        `Failed to get balance: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async parseTransaction(signature: string): Promise<ParseAccountResponse> {
    return this.parseSignature(signature);
  }

  async parseSignature(signature: string): Promise<ParseAccountResponse> {
    try {
      // Parse transaction using Helius API through Misc Plugin
      const tx = await this.agent.methods.parseTransaction(signature);

      if (!tx || !Array.isArray(tx) || tx.length === 0) {
        throw new Error('Invalid transaction data');
      }

      const transaction = tx[0];
      const tokenTransfers = transaction.tokenTransfers;

      if (!tokenTransfers || !Array.isArray(tokenTransfers)) {
        throw new Error('No token transfers found');
      }

      // Find input and output token transfers
      const inputTransfer = tokenTransfers.find(
        (transfer) => transfer.fromUserAccount === transaction.feePayer,
      );

      const outputTransfer = tokenTransfers.find(
        (transfer) => transfer.toUserAccount === transaction.feePayer,
      );

      if (!inputTransfer || !outputTransfer) {
        throw new Error('Swap transfers not found');
      }

      // Calculate the actual swap amounts
      const inputAmount = transaction.nativeTransfers?.find(
        (transfer) =>
          transfer.fromUserAccount === transaction.feePayer &&
          transfer.toUserAccount ===
            'FKwCWodqVoyLbxaKeKzryokiHoFB6FAc6Mzkg4eeriDJ',
      )?.amount
        ? Number(
            transaction.nativeTransfers.find(
              (transfer) =>
                transfer.fromUserAccount === transaction.feePayer &&
                transfer.toUserAccount ===
                  'FKwCWodqVoyLbxaKeKzryokiHoFB6FAc6Mzkg4eeriDJ',
            ).amount,
          ) / 1e9
        : inputTransfer.tokenAmount;
      const outputAmount = outputTransfer.tokenAmount;
      const inputTokenMint = inputTransfer.mint;
      const outputTokenMint = outputTransfer.mint;

      const result = {
        inputAmount: inputAmount.toString(),
        inputToken: inputTokenMint,
        outputAmount: outputAmount.toString(),
        outputToken: outputTokenMint,
      };

      return {
        status: 'success',
        message: 'Swap transaction parsed successfully',
        programName: transaction.type,
        ...result,
      };
    } catch (error) {
      console.error('Error parsing transaction:', error);
      if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      throw error;
    }
  }

  async getContractAssets(contractAddress: string): Promise<any> {
    try {
      const assets = await this.agent.methods.getAssetsByOwner(contractAddress);

      const simplifiedAssets = assets
        .filter((asset) => {
          // FungibleToken 인터페이스만 필터링
          return asset.interface === 'FungibleToken' && asset.token_info;
        })
        .map((asset) => ({
          symbol: asset.token_info?.symbol || 'Unknown',
          account: asset.token_info?.associated_token_address || asset.id,
          balance: asset.token_info?.balance?.toString() || '0',
        }));

      return {
        status: 'success',
        message: 'Contract assets retrieved successfully',
        data: simplifiedAssets,
      };
    } catch (error) {
      console.error('Error getting contract assets:', error);
      throw error;
    }
  }
}
