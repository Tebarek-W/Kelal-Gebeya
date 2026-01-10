import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import StoreProvider from '@/components/StoreProvider'
import AuthProvider from '@/components/AuthProvider'
import Navbar from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Kelal Gebeya - Fashion Marketplace',
  description: 'Multi-vendor fashion marketplace',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StoreProvider>
          <AuthProvider>
            <Navbar />
            <main className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100">
              {children}
            </main>
          </AuthProvider>
        </StoreProvider>
      </body>
    </html>
  )
}
