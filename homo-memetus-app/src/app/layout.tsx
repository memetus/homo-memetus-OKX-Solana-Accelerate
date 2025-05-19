import 'ress';
import '@/styles/globals.scss';
import ReduxProvider from '@/states/global/provider';
import Web3Provider from '@/providers/Web3Provider';
import AppProvider from '@/providers/AppProvider';
import QueryProvider from '@/providers/QueryProvider';
import { GoogleAnalytics } from '@/shared/lib/ga';
import { cookies } from 'next/headers';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const GA_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookie = cookies().get('accessToken');

  return (
    <html lang="en">
      <body>
        <ReduxProvider>
          <QueryProvider>
            <Web3Provider>
              <AppProvider jwt={cookie?.value}>
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
