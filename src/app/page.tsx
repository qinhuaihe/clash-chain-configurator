"use client"

import Image from 'next/image'
import { Button } from "@/components/ui/button"
import App from './app'

export default function Home() {
  // const handleClick = async () => {
  //   try {
  //     const response = await fetch('/api/echo')
  //     const data = await response.json()
  //     alert(data.message)
  //   } catch (error) {
  //     console.error('Error fetching echo:', error)
  //     alert('Failed to fetch echo')
  //   }
  // }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="mb-32 text-center lg:w-full lg:mb-0 lg:text-left">
        <App />
      </div>
    </main>);

}
