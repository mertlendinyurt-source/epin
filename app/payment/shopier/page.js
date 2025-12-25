'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ShopierPayment() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderId = searchParams.get('orderId')
  const amount = searchParams.get('amount')
  const [status, setStatus] = useState('pending') // pending, success, failed
  const [processing, setProcessing] = useState(false)

  const handlePayment = async (paymentStatus) => {
    setProcessing(true)
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))

    try {
      const response = await fetch('/api/payment/shopier/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          status: paymentStatus,
          transactionId: `MOCK_TXN_${Date.now()}`
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setStatus(paymentStatus)
        
        // Redirect after 3 seconds
        setTimeout(() => {
          if (paymentStatus === 'success') {
            router.push(`/payment/success?orderId=${orderId}`)
          } else {
            router.push(`/payment/failed?orderId=${orderId}`)
          }
        }, 3000)
      }
    } catch (error) {
      console.error('Payment error:', error)
      setStatus('failed')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center p-4">
      <Card className="bg-slate-900/50 border-slate-800 max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-blue-600/20 flex items-center justify-center mb-4">
            <img src="https://www.shopier.com/images/logo.png" alt="Shopier" className="w-12 h-12" onError={(e) => e.target.style.display = 'none'} />
          </div>
          <CardTitle className="text-white text-2xl">Ödeme Sayfası (Mock)</CardTitle>
          <CardDescription className="text-slate-400">
            Test amaçlı mock ödeme sayfası
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {status === 'pending' && (
            <>
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Sipariş No</span>
                  <span className="text-white font-mono">{orderId?.slice(0, 8)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tutar</span>
                  <span className="text-white font-bold text-xl">{amount} ₺</span>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={() => handlePayment('success')}
                  disabled={processing}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      İşleniyor...
                    </>
                  ) : (
                    '✓ Ödemeyi Başarılı Olarak Simüle Et'
                  )}
                </Button>
                
                <Button
                  onClick={() => handlePayment('failed')}
                  disabled={processing}
                  variant="outline"
                  className="w-full border-red-600 text-red-400 hover:bg-red-900/20"
                >
                  ✗ Ödemeyi Başarısız Olarak Simüle Et
                </Button>
              </div>

              <div className="text-xs text-slate-500 text-center p-3 bg-yellow-900/20 border border-yellow-800 rounded-lg">
                ⚠️ Bu bir test sayfasıdır. Gerçek ödeme yapılmamaktadır.
              </div>
            </>
          )}

          {status === 'success' && (
            <div className="text-center space-y-4 py-4">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              <div>
                <h3 className="text-white font-bold text-xl mb-2">Ödeme Başarılı!</h3>
                <p className="text-slate-400">Yönlendiriliyorsunuz...</p>
              </div>
            </div>
          )}

          {status === 'failed' && (
            <div className="text-center space-y-4 py-4">
              <XCircle className="w-16 h-16 text-red-500 mx-auto" />
              <div>
                <h3 className="text-white font-bold text-xl mb-2">Ödeme Başarısız</h3>
                <p className="text-slate-400">Yönlendiriliyorsunuz...</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}