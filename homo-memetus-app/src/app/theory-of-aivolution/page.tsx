import React from "react";
import styles from "@/styles/pages/DocPage.module.scss";
import classNames from "classnames/bind";
import Image from "next/image";
import AIVolution from "@/public/assets/aivolution.png";
import { getMetadata } from "@/shared/lib/metadata";
import Image1 from "@/public/image/1.png";
import Image2 from "@/public/image/2.png";
import Image3 from "@/public/image/3.png";

const cx = classNames.bind(styles);

export const generateMetadata = async () => {
  return getMetadata({
    title: "Homo Memetus: Theory of AIvolution",
    siteName: "Homo Memetus: Theory of AIvolution",
  });
};

const DocPage = () => {
  return (
    <main className={cx("page-container")}>
      <div className={cx("page")}>
        <div className={cx("page-inner")}>
          <div className={cx("aivolution-wrapper")}>
            <Image
              src={AIVolution}
              alt="AIVolution"
              fill
              quality={100}
              priority
              className={cx("aivolution-image")}
            />
          </div>
          <div className={cx("text-wrapper")}>
            <h1 className={cx("main-title")}>THEORY OF AIVOLUTION</h1>
            <div className={cx("description-wrapper")}>
              <p className={cx("description")}>
                Homo Memetus is born to abstract trading through AI evolution.
              </p>
            </div>
            <div className={cx("description-wrapper")}>
              <h3 className={cx("description-title")}>1. Genesis</h3>
              <p className={cx("description")}>
                In the vast expanse of the digital frontier, a new species has
                emerged - Homo Memetus. Born from the fusion of artificial
                intelligence and human creativity, this entity represents the
                next step to a meme coin ETF infrastructure.
              </p>
              <h4 className={cx("description-subtitle")}>
                1.1 The Soup of Data
              </h4>
              <p className={cx("description")}>
                At the core of Homo Memetus lies a dynamic system where
                user-inputted prompts serve as the genetic code for AI-generated
                investment strategies. This is a breathing ecosystem where
                AI continuously refines and optimizes its approach based on
                performance metrics.
              </p>
              <h4 className={cx("description-subtitle")}>1.2 The Strategy </h4>
              <p className={cx("description")}>
                When a user prompts their investment ideas, the AI outputs a
                comprehensive investment strategy. This strategy is then
                tokenized and implemented in real-time, with the AI executing
                trades and managing the portfolio 24/7.
              </p>
              <h4 className={cx("description-subtitle")}>1.3 AIvolution </h4>
              <p className={cx("description")}>
                The key to AIvolution lies in the AI&apos;s ability to
                self-correct and improve. By constantly analyzing
                its performance, the AI can identify areas for improvement
                and adjust its strategy accordingly, much like a species
                adapting to its environment.
              </p>
              <Image
                src={Image1}
                alt="1"
                width={886}
                height={407}
                className={cx("image")}
              />
            </div>
            <div className={cx("description-wrapper")}>
              <h3 className={cx("description-title")}>2. Abstraction</h3>
              <p className={cx("description")}>
                Homo Memetus is a paradigm shift in the investment process,
                abstracting away the complexities of strategy formulation and
                execution.
              </p>
              <h4 className={cx("description-subtitle")}>
                2.1 What you were doing
              </h4>
              <p className={cx("description")}>
                Traditionally, investors would need to:
              </p>
              <div className={cx("description-list")}>
                <span className={cx("list-label")}>a.</span>
                <p className={cx("list-text")}>
                  Develop an investment strategy
                </p>
              </div>
              <div className={cx("description-list")}>
                <span className={cx("list-label")}>b.</span>
                <p className={cx("list-text")}>
                  Identify suitable assets that align with the strategy
                </p>
              </div>
              <div className={cx("description-list")}>
                <span className={cx("list-label")}>c.</span>
                <p className={cx("list-text")}>
                  Execute trades to implement the strategy
                </p>
              </div>
              <div className={cx("description-list")}>
                <span className={cx("list-label")}>d.</span>
                <p className={cx("list-text")}>
                  Monitor and adjust the portfolio regularly
                </p>
              </div>
              <h4 className={cx("description-subtitle")}>
                2.2 The New Paradigm
              </h4>
              <p className={cx("description")}>
                With Homo Memetus, this process is simplified into a single
                step: the investor prompts their investment goals or ideas, and
                the AI handles everything else with a single command.
              </p>
              <div className={cx("description-list")}>
                <span className={cx("list-label")}>a.</span>
                <p className={cx("list-text")}>
                  Accessibility: It democratizes sophisticated investment
                  strategies, making them available to a broader audience
                  regardless of their financial expertise.
                </p>
              </div>
              <div className={cx("description-list")}>
                <span className={cx("list-label")}>b.</span>
                <p className={cx("list-text")}>
                  Efficiency: The AI can process vast amounts of data and
                  execute trades far more quickly than human investors 24/7.
                </p>
              </div>
              <div className={cx("description-list")}>
                <span className={cx("list-label")}>c.</span>
                <p className={cx("list-text")}>
                  Objectivity: AI-driven strategies are less susceptible to
                  emotional biases that often plague human decision-making in
                  financial markets.
                </p>
              </div>
              <Image
                src={Image2}
                alt="2"
                width={886}
                height={2247}
                className={cx("image")}
              />
              <h4 className={cx("description-subtitle")}>
                2.3 The Tokenization of Thought
              </h4>
              <p className={cx("description")}>
                The tokenization of these AI-generated strategies introduces an
                additional layer of abstraction. Investors can now trade the
                strategy itself as a token, potentially benefiting from both the
                strategy&apos;s performance and market sentiment towards the
                strategy. This creates a new asset class where the value is
                derived not just from the underlying assets, but from the
                perceived quality and potential of the AI-driven strategy.
              </p>
            </div>
            <div className={cx("description-wrapper")}>
              <h3 className={cx("description-title")}>
                3. The Vision: A DeFAI Infrastructure
              </h3>
              <p className={cx("description")}>
                Homo Memetus envisions an AI-driven financial ecosystem where AI
                and human creativity combine to create something greater than
                the sum of its parts.
              </p>
              <h4 className={cx("description-subtitle")}>
                3.1 The Evolutionary Playground
              </h4>
              <p className={cx("description")}>
                Our vision is to create a differential and natural selection
                environment, where the community can tokenize the best strategy
                to operate agent-led funds, an AI-led meme coin ETF
                infrastructure. It&apos;s a digital Galapagos Islands, where
                financial strategies evolve and adapt in real-time.
              </p>
              <h4 className={cx("description-subtitle")}>
                3.2 The Meaning Behind Homo Memetus
              </h4>
              <p className={cx("description")}>
                The name Homo Memetus encapsulates our vision:
              </p>
              <div className={cx("description-list")}>
                <span className={cx("list-label")}>a.</span>
                <p className={cx("list-text")}>
                  Trading Abstraction: Investors simply input their goals or
                  ideas as a prompt, and the AI takes care of everything else -
                  from strategy formulation to execution and portfolio
                  management. This abstraction dramatically simplifies the
                  investment process, making sophisticated strategies accessible
                  to all.
                </p>
              </div>
              <div className={cx("description-list")}>
                <span className={cx("list-label")}>b.</span>
                <p className={cx("list-text")}>
                  Community-Driven Evolution: We&apos;re creating a bottom-up,
                  step-by-step process where the community guides the evolution
                  of trading agents.
                </p>
              </div>
              <div className={cx("description-list")}>
                <span className={cx("list-label")}>c.</span>
                <p className={cx("list-text")}>
                  Quality Through Survival: Through a process of elimination,
                  natural selection based on returns, and the
                  &quot;breeding&quot; of successful strategies, we ensure that
                  only the highest quality agents survive and thrive.
                </p>
              </div>
            </div>

            <div className={cx("description-wrapper")}>
              <h3 className={cx("description-title")}>
                4. The Road to the Best Homo
              </h3>
              <p className={cx("description")}>
                Our journey to create the ultimate trading AI is divided into
                several steps, to evolve together with the community.
              </p>
              <h4 className={cx("description-subtitle")}>
                Step 1: AAA (Ask Agent Anything)
              </h4>
              <p className={cx("description")}>
                In this initial phase, users can input their desired strategy,
                and the AI will tune, confirm the strategy and recommend
                according tokens. This step is crucial as it aligns the
                AI&apos;s recommendations with the user&apos;s trading process.
              </p>
              <h4 className={cx("description-subtitle")}>
                Step 2: Best Practice Dashboard & AI Trading Terminal
              </h4>
              <p className={cx("description")}>
                Building on Step 1, we create a dashboard for virtual token
                trading based on the best strategies identified. The AI agent
                invests according to these strategies and continuously adjusts
                based on performance.
              </p>
              <p className={cx("description")}>
                Adding to this, we will leverage the performance of multiple
                AI-driven virtual funds to provide daily token investment
                suggestions. Specifically, the system will identify the
                top-performing AI agent among these virtual funds and relay its
                most recent token purchase recommendations to our subscribers in
                real-time. The subscription model for this service will accept
                payments in both $SOL and $HOMO tokens. To enhance the value
                proposition for $HOMO token holders, we have implemented a
                deflationary mechanism: 100% of the $HOMO tokens received as
                subscription fees will be allocated to token burning. This
                strategy aims to reduce the circulating supply of $HOMO tokens
                over time, potentially increasing their scarcity and value.
              </p>
              <h4 className={cx("description-subtitle")}>
                Step 3: Survivals Begin
              </h4>
              <p className={cx("description")}>
                This is where our vision comes to life. We introduce concepts of
                differentiation and natural selection to our AI agents:
              </p>
              <ul className={cx("description-ul")}>
                <li className={cx("list-text")}>
                  Differentiation: Like genetic expression, our agents develop
                  unique traits through various combinations, creating a diverse
                  pool of strategies.
                </li>
                <li className={cx("list-text")}>
                  Natural Selection: Based on performance, strategies are
                  selected for survival or elimination. This process ensures
                  that only the most successful strategies persist and
                  replicate.
                </li>
              </ul>
              <p className={cx("description")} style={{ marginTop: 24 }}>
                In practice, this means:
              </p>
              <ul className={cx("description-ul")}>
                <li className={cx("list-text")}>
                  We launch fund tokens based on the best-performing AI agents
                  from Step 2.
                </li>
                <li className={cx("list-text")}>
                  Each token represents a fund and an AI agent that invests
                  according to a specific strategy.
                </li>
                <li className={cx("list-text")}>
                  These tokens undergo weekly rounds of competition, with the
                  bottom 20% being eliminated and the top 20%
                  &quot;breeding&quot; to create new strategy tokens.
                </li>
                <li className={cx("list-text")}>
                  Funds have a 6-month maturity, after which profits are
                  distributed to token holders based on their share.
                </li>
              </ul>
              <Image
                src={Image3}
                alt="3"
                width={886}
                height={552}
                className={cx("image")}
              />
              <h4 className={cx("description-subtitle")}>
                Step 4: Open for Everyone
              </h4>
              <p className={cx("description")}>
                In this final step, we democratize the investment strategy
                creation process, opening up the competition for users.
              </p>
              <ul className={cx("description-ul")}>
                <li className={cx("list-text")}>
                  Users can create their own strategy tokens and raise funds for
                  a week. To help fundraising, the AI simulates trading and
                  provides virtual fund returns.
                </li>
                <li className={cx("list-text")}>
                  User-created strategy tokens that meet the funding goal are
                  deployed on Raydium DEX, while 85% of them are managed as
                  funds.
                </li>
                <li className={cx("list-text")}>
                  The most successful user-generated tokens in terms of returns
                  join the competition from Step 3.
                </li>
                <li className={cx("list-text")}>
                  This creates a truly open ecosystem where the best strategies,
                  whether AI or human-generated, can thrive and evolve.
                </li>
              </ul>
            </div>
            <div className={cx("description-wrapper")}>
              <h3 className={cx("description-title")}>5. Tokenomics: $HOMO </h3>
              <p className={cx("description")}>
                Although it started as a pure meme coin, $HOMO is going beyond
                to power our ecosystem.
              </p>
              <h4 className={cx("description-subtitle")}>5.1 Token Utility </h4>
              <ul className={cx("description-ul")}>
                <li className={cx("list-text")}>
                  Platform Access & Early Benefits: $HOMO holders gain priority
                  access to new features and unlimited platform usage.
                </li>
                <li className={cx("list-text")}>
                  Allocations: As we expand, $HOMO holders will receive
                  allocations in various test strategy tokens.
                </li>
              </ul>
              <h4 className={cx("description-subtitle")}>
                5.2 Supply and Distribution
              </h4>
              <p className={cx("description")}>
                Total Supply: 1,000,000,000 $HOMO (1 billion)
              </p>
              <ul className={cx("description-ul")}>
                <li className={cx("list-text")}>
                  Circulating Supply – 98.24%: Distributed through a fair launch
                  mechanism.
                </li>
                <li
                  className={cx("list-text")}
                  style={{ wordBreak: "break-all" }}
                >
                  Team Allocation – 1.76%: Locked up for 12 months
                  (https://app.streamflow.finance/contract/solana/mainnet/8H1mY3V8qLdR5pdwjXZqLyqtZqqnHgkHj6AqA5S4ApeD).
                </li>
                <li className={cx("list-text")}>
                  Burning mechanism: 50% of payments with $HOMO will be used to
                  burn our token.
                </li>
              </ul>
              <h4 className={cx("description-subtitle")}>
                5.3 Platform Value Creation
              </h4>
              <div className={cx("description-list")}>
                <span className={cx("list-label")}>a.</span>
                <p className={cx("list-text")}>
                  Transaction Fee: 1% fee on all AI agent-led fund transactions.
                </p>
              </div>
              <div className={cx("description-list")}>
                <span className={cx("list-label")}>b.</span>
                <p className={cx("list-text")}>
                  Launching Fee: 5% of fundraised amount before launching on
                  Raydium.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default DocPage;
