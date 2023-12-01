import { NextRequest, NextResponse } from 'next/server';
import Midtrans, { Snap } from 'midtrans-client';

const snap = new Snap({
  isProduction: false,
  serverKey: process.env.NEXT_PUBLIC_SECRET || '',
  clientKey: process.env.NEXT_PUBLIC_CLIENT || '',
});

export async function POST(request: NextRequest) {
  try {
    const { id, productName, price, quantity } = await request.json();

    const parameter: Midtrans.TransactionRequestBody = {
      item_details: {
        name: productName,
        price: price,
        quantity: quantity,
      },
      transaction_details: {
        order_id: id,
        gross_amount: price * quantity,
      },
    };

    const token = await snap.createTransactionToken(parameter);

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Error processing the request:', error);
    return NextResponse.error();
  }
}
