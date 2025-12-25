'use client'

import { useSearchParams } from 'next/navigation'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function PaymentSuccess() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center p-4">
      <Card className="bg-slate-900/50 border-slate-800 max-w-md w-full">
        <CardHeader className="text-center">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <CardTitle className="text-white text-3xl">Ödeme Başarılı!</CardTitle>
          <CardDescription className="text-slate-400 text-lg">
            Siparişiniz başarıyla oluşturuldu
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
            <div className="text-sm text-slate-400 mb-1">Sipariş Numarası</div>
            <div className="text-white font-mono font-bold">{orderId}</div>
          </div>

          <div className="p-4 rounded-lg bg-green-900/20 border border-green-800 text-sm text-green-400">
            <p className="font-semibold mb-1">✓ UC'leriniz yüklenecek</p>
            <p className="text-xs">5-10 dakika içinde hesabınıza UC yüklemesi yapılacaktır.</p>
          </div>

          <div className="space-y-2">
            <Button
              onClick={() => window.location.href = '/'}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
            >
              Ana Sayfaya Dön
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}