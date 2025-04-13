import "@/app/globals.css"
import { FirebaseAuthProvider } from "@/components/firebase-provider"
import Header from "@/components/header"
import { ThemeProvider } from "@/components/theme-provider"
import { Inter } from "next/font/google"
import type React from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: 'Form Builder',
  description: 'Create and share forms easily',
  icons: {
    icon: 'https://cdn4.iconfinder.com/data/icons/new-google-logo-2015/400/new-google-favicon-1024.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="https://cdn4.iconfinder.com/data/icons/new-google-logo-2015/400/new-google-favicon-1024.png" type="image/png" />
      </head>
      <body className={inter.className}>
        <FirebaseAuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <Header formIcon="https://cdn1.iconfinder.com/data/icons/google_jfk_icons_by_carlosjj/128/forms.png" />
            {children}
          </ThemeProvider>
        </FirebaseAuthProvider>
      </body>
    </html>
  );
}