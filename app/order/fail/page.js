'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { XCircle, RefreshCw, Home, AlertTriangle } from 'lucide-react'

export default function OrderFailPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const error = searchParams.get('error')
  const [siteSettings, setSiteSettings] = useState(null)

  useEffect(() => {
    loadSiteSettings()
  }, [])

  const loadSiteSettings = async () => {
    try {
      const res = await fetch('/api/site/settings')
      const data = await res.json()
      if (data.success) {
        setSiteSettings(data.data)
      }
    } catch (err) {
      console.error('Failed to load site settings:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950/30 to-slate-950 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-red-500/30 rounded-2xl p-8 text-center shadow-2xl shadow-red-500/10">
          {/* Fail Icon */}
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/30">
            <XCircle className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">Ödeme Başarısız</h1>
          <p className="text-slate-400 mb-6">
            Ödeme işlemi tamamlanamadı. Lütfen tekrar deneyin.
          </p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm text-left">{decodeURIComponent(error)}</p>
            </div>
          )}

          {orderId && (
            <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
              <p className="text-slate-400 text-sm">
                Sipariş No: <span className="text-white font-mono">{orderId.slice(0, 8)}...</span>
              </p>
            </div>
          )}

          <div className="space-y-3">
            <a
              href="/"
              className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              <RefreshCw className="w-5 h-5" />
              Tekrar Dene
            </a>
            <a
              href="/"
              className="flex items-center justify-center gap-2 w-full py-3 bg-slate-800 text-white font-medium rounded-xl hover:bg-slate-700 transition-all"
            >
              <Home className="w-5 h-5" />
              Ana Sayfaya Dön
            </a>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-700">
            <p className="text-slate-500 text-sm">
              Sorun devam ederse lütfen müşteri desteği ile iletişime geçin.
            </p>
          </div>
        </div>

        <p className="text-center text-slate-500 text-sm mt-6">
          {siteSettings?.siteName || 'PINLY'} – Dijital Ürün ve Kod Satış Platformu
        </p>
      </div>
    </div>
  )
}
