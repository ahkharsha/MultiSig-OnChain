import './globals.css';
import { ChakraProvider } from '@chakra-ui/react';

export const metadata = { title: 'MultiSig UI' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ChakraProvider>
          {children}
        </ChakraProvider>
      </body>
    </html>
  );
}