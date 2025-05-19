import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Schema as MongooseSchema } from 'mongoose';

export type RugCheckDocument = RugCheck & mongoose.Document;

type CreatorLockShape = {
  locked: boolean;
  amount: number;
  lockedAddress: string;
  tokenAddress: string;
  type: 'streamflow' | 'jupiter';
  signature: string;
};

type TokenSocialType = 'twitter' | 'discord' | 'telegram' | 'github';

type TokenSocialShape = {
  type: string;
  value: string;
};

type TokenLinkResourceType = 'website' | 'whitepaper' | 'docs';

type TokenLinkResourceShape = {
  type: TokenLinkResourceType;
  url: string;
};

type HashTagShape = {
  hashtag: string;
};

type CashTagShape = {
  cashtag: string;
};

type MentionShape = {
  mention: string;
};

enum TwitterAccountRelation {
  RETWEETED = 0,
  ENGAGED_PARTNER,
  IDENTICAL_ACCOUNT,
}

type TwitterAccountRelationShape = {
  name: string;
  related_type: TwitterAccountRelation;
};

type TwitterAccountShape = {
  uid: string;
  username: string;
};

type TokenTwitterDataShape = {
  uid: string;
  username: string;
  verified: boolean;
  follower_count: number;
  tweet_count: number;
  media_count: number;
  hashtags: HashTagShape[];
  cashtags: CashTagShape[];
  mentions: MentionShape[];
  avg_view_count: number;
  avg_like_count: number;
  avg_retweet_count: number;
  last_updated_at: string | undefined;
  created_at: string | undefined;
  related_accounts: TwitterAccountRelationShape[];
  high_perform_accounts: TwitterAccountShape[];
  name_history: string[];
};

type TopHolderShape = {
  percentage: number;
  address: string;
  balance: number;
};

type TokenDexType = 'raydium' | 'orca' | 'meteora';

type TokenLiquidityShape = {
  type: TokenDexType;
  pair: string;
  liquidity: number;
  percentage: number;
  reserve: string;
};

type Top10HolderValidationShape = {
  address: string;
  valid: boolean;
};

type CreatorTransferShape = {
  type: 'send' | 'receive';
  from: string;
  to: string;
  amount: number;
  signature: string;
};

type CreatorSwapShape = {
  type: 'buy' | 'sell';
  amount: number;
  signature: string;
};

type TokenGithubDataShape = {
  organization: TokenOrganizationDataShape;
  repository_list: TokenGithubRepositoryDataShape[];
};

type TokenOrganizationDataShape = {
  name: string;
  company: string;
  followers: number;
  total_private_repos: number;
  public_repos: number;
  contributors: number;
};

type TokenGithubRepositoryDataShape = {
  name: string;
  description: string;
  is_fork: boolean;
  created_at: string;
  updated_at: string;
  size: number;
  star_count: number;
  watcher_count: number;
  fork_count: number;
  visibility: 'private' | 'public';
  has_issues: boolean;
  has_projects: boolean;
  has_downloads: boolean;
  has_wikis: boolean;
  has_pages: boolean;
  has_discussions: boolean;
};

type TokenLinkDataShape = {
  url: string;
  type: string;
  title: string;
  description: string;
  keyword: string[];
  is_running: boolean;
};

@Schema({ timestamps: true, versionKey: '_v' })
export class RugCheck {
  @Prop()
  creator_address: string;

  @Prop()
  creator_token_address: string;

  @Prop()
  creator_token_balance: number;

  @Prop()
  creator_token_percentage: number;

  @Prop()
  create_signature: string;

  @Prop()
  last_signature: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  creator_lock_history: CreatorLockShape[];

  @Prop()
  name: string;

  @Prop()
  symbol: string;

  @Prop()
  address: string;

  @Prop()
  total_supply: number;

  @Prop()
  mutability: boolean;

  @Prop()
  mintability: boolean;

  @Prop()
  freezability: boolean;

  @Prop()
  is_pumpfun: boolean;

  @Prop()
  metadata_address: string;

  @Prop()
  uri: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  socials: TokenSocialShape[];

  @Prop({ type: MongooseSchema.Types.Mixed })
  link_resources: TokenLinkResourceShape[];

  @Prop({ type: MongooseSchema.Types.Mixed })
  twitter: TokenTwitterDataShape;

  @Prop()
  total_holder: number;

  @Prop({ type: MongooseSchema.Types.Mixed })
  top_holder_list: TopHolderShape[];

  @Prop({ type: MongooseSchema.Types.Mixed })
  top10_holder_validation: Top10HolderValidationShape[];

  @Prop()
  total_liquidity: number;

  @Prop()
  market_cap: number;

  @Prop()
  total_lp_count: number;

  @Prop({ type: MongooseSchema.Types.Mixed })
  liquidity_list: TokenLiquidityShape[];

  @Prop({ type: MongooseSchema.Types.Mixed })
  creator_transfer_history: CreatorTransferShape[];

  @Prop({ type: MongooseSchema.Types.Mixed })
  creator_swap_history: CreatorSwapShape[];

  @Prop({ type: MongooseSchema.Types.Mixed })
  github: TokenGithubDataShape[];

  @Prop({ type: MongooseSchema.Types.Mixed })
  links: TokenLinkDataShape[];

  @Prop()
  total_score: number;

  @Prop()
  social_score: number;

  @Prop()
  github_score: number;

  @Prop()
  liquidity_score: number;

  @Prop()
  holder_score: number;

  @Prop()
  token_score: number;

  @Prop()
  reference_score: number;

  @Prop()
  updatedAt: Date;
}

export const RugCheckSchema = SchemaFactory.createForClass(RugCheck);
