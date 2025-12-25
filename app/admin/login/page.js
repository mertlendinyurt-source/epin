'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'

export default function AdminLogin() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      const data = await response.json()

      if (data.success) {
        localStorage.setItem('adminToken', data.data.token)
        localStorage.setItem('adminUsername', data.data.username)
        toast.success('Giriş başarılı!')
        setTimeout(() => {
          router.push('/admin/dashboard')
        }, 500)
      } else {
        toast.error(data.error || 'Giriş başarısız')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Giriş yapılırken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center p-4">
      <Toaster position="top-center" richColors />
      
      <Card className="bg-slate-900/50 border-slate-800 max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-blue-600/20 flex items-center justify-center mb-4">
            <ShieldCheck className="w-10 h-10 text-blue-500" />
          </div>
          <CardTitle className="text-white text-2xl">Admin Girişi</CardTitle>
          <CardDescription className="text-slate-400">
            Yönetim paneline erişmek için giriş yapın
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="username" className="text-white">Kullanıcı Adı</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
                className="bg-slate-800 border-slate-700 text-white mt-2"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-white">Şifre</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="bg-slate-800 border-slate-700 text-white mt-2"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Giriş yapılıyor...
                </>
              ) : (
                'Giriş Yap'
              )}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={() => router.push('/')}
                className="text-slate-400 hover:text-white"
              >
                Ana Sayfaya Dön
              </Button>
            </div>
          </form>

          <div className="mt-6 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
            <p className="text-xs text-slate-400 text-center">
              <span className="font-semibold">Test Hesabı:</span><br />
              Kullanıcı: admin | Şifre: admin123
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}