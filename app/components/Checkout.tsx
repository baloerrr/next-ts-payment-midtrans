import React, { useState, ChangeEvent } from 'react'
import { product } from '../libs/product'
import { NextResponse } from 'next/server'
import Link from 'next/link'

const Checkout: React.FC = () => {
  const [quantity, setQuantity] = useState<number>(1)
  const [paymentLink, setPaymentLink] = useState<string>("")

  const decreaseQuantity = () => {
    setQuantity((prevQuantity) => (prevQuantity > 1 ? prevQuantity - 1 : 1))
  }

  const increaseQuantity = () => {
    setQuantity((prevQuantity) => prevQuantity + 1)
  }

  const checkout = async () => {
    const data = {
      id: product.id,
      productName: product.name,
      price: product.price,
      quantity: quantity,
    }

    try {
      const response = await fetch('/api/tokenizer', {
        method: 'POST',
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const responseData = await response.json()

      if (!responseData || !responseData.token) {
        throw new Error('Invalid response data')
      }

      ;(window as any).snap.pay(responseData.token)
    } catch (error: any) {
      console.error('Error during checkout:', error.message)
      // Handle the error as needed
    }
  }

  const generatePaymentLink = async () => {

    const secret: any = process.env.NEXT_PUBLIC_SECRET
    const encodedSecret = Buffer.from(secret).toString('base64')
    const basicAuth = `Basic ${encodedSecret}`

    let data = {
      item_details: [
        {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: quantity,
        }
      ],
      transaction_details: {
        order_id: product.id,
        gross_amount: product.price * quantity
      }
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API}/v1/payment-links`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': basicAuth,
        },
        body: JSON.stringify(data)
      },
    )

    const paymentLink = await response.json()
    setPaymentLink(paymentLink.payment_url)
  }

  const handleQuantityChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newQuantity = parseInt(e.target.value, 10)
    if (!isNaN(newQuantity) && newQuantity >= 1) {
      setQuantity(newQuantity)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex sm:gap-4">
          <button
            className="transition-all hover:opacity-75"
            onClick={decreaseQuantity}
          >
            ➖
          </button>

          <input
            type="number"
            id="quantity"
            value={quantity}
            className="h-10 w-16 text-black border-transparent text-center"
            onChange={handleQuantityChange}
          />

          <button
            className="transition-all hover:opacity-75"
            onClick={increaseQuantity}
          >
            ➕
          </button>
        </div>
        <button
          className="rounded bg-indigo-500 p-4 text-sm font-medium transition hover:scale-105"
          onClick={checkout}
        >
          Checkout
        </button>
      </div>
      <button
        className="text-indigo-500 py-4 text-sm font-medium transition hover:scale-105"
        onClick={generatePaymentLink}
      >
        Create Payment Link
      </button>

      <Link className='text-blue-600 underline' href={paymentLink} target='_blank'>{paymentLink}</Link>
    </>
  )
}

export default Checkout
