## This is HOMO-MEMETUS Application Repository

[Website](https://www.homo-memetus.xyz) | [X](https://x.com/homo_memetus) | [Community](https://x.com/i/communities/1874464022457889056)

---

This repository does not include any code or logic related to AI Agent training. Currently this repository is the landing page for Homo Memetus. It includes functionality to collect data on what prompts users input during the development process of specialized AI Agents trained through prompts.

Share your strategy for traning better agent >> [Here](https://www.homo-memetus.xyz)

Once the our twitter scrapers, KoL trackers, llm finetuning logic include requirement data and simulation bot logic currently being developed by the team are completed to a shareable level, we will update the README of this repository accordingly. Also, When the agent development is complete and web services are provided, the development will take place in the corresponding repository.

While I cannot be certain if you, our esteemed audience, are curious about the structure of this repository, I would like to take a moment to express my gratitude for your interest by providing an explanation of its structure. I will strive to add meaningful projects as soon as possible. Thank you for visiting.

#### Directory Structure

```text
	.
	├── @types/ # declare custom global types
	├── public/ # import assets include */.png, jpg, mp4, etc.
	├── src / # application source code
	│ ├── app / # application router
	│ ├── components / # application usage ui
	| ├── shared / # application utility hooks
	| ├── states / # application global & partial data
	| ├── styles / # application style set
	│ └── providers / # application context sync scope
	└── package.json # application dependencies
```

#### Entry File

```typescript
// src/app/layout.tsx

import "ress";
import "@/styles/globals.scss";
import ReduxProvider from "@/states/global/provider";
import Web3Provider from "@/providers/Web3Provider";
import AppProvider from "@/providers/AppProvider";
import QueryProvider from "@/providers/QueryProvider";
import { GoogleAnalytics } from "@/shared/lib/ga";

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export const GA_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>
          <QueryProvider>
            <Web3Provider>
              <AppProvider>
                {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
                {children}
              </AppProvider>
            </Web3Provider>
          </QueryProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
```

#### Requirements

- Node.js 20+
- Next.js 14.1.2
- React.js ^18
- Redux ^5.0.1
- Socket.io ^4.8.1

  
#### P.S.
Possible thanks to Eliza.
