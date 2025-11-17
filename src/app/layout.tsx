import { ReactNode } from 'react'
import Navbar from '../../components/Navbar'
import './globals.css'

export const metadata = {
  title: 'EasyRupee',
  description: 'Digital wallet & expense manager',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="container mx-auto p-4">{children}</main>
      </body>
    </html>
  )
}