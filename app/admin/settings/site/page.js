'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingBag, LogOut, Headphones, Mail, Save, Loader2, Upload, Image as ImageIcon, Globe, Phone, AtSign, Type, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';

export default function SiteSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    logo: null,
    favicon: null,
    heroImage: null,
    categoryIcon: null,
    siteName: '',
    metaTitle: '',
    metaDescription: '',
    contactEmail: '',
    contactPhone: '',
    dailyBannerEnabled: true,
    dailyBannerTitle: 'Bugüne Özel Fiyatlar',
    dailyBannerSubtitle: ''
  });
  const [uploads, setUploads] = useState({ logo: null, favicon: null, heroImage: null, categoryIcon: null });
  const [previews, setPreviews] = useState({ logo: null, favicon: null, heroImage: null, categoryIcon: null });

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/settings/site', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        router.push('/admin/login');
        return;
      }

      const result = await response.json();
      if (result.success) {
        setSettings(result.data);
        setPreviews({
          logo: result.data.logo,
          favicon: result.data.favicon,
          heroImage: result.data.heroImage,
          categoryIcon: result.data.categoryIcon
        });
      }
    } catch (error) {
      console.error('Load error:', error);
      toast.error('Ayarlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2097152) {
      toast.error('Maksimum dosya boyutu 2MB');
      return;
    }

    setUploads({ ...uploads, [type]: file });
    const reader = new FileReader();
    reader.onloadend = () => setPreviews({ ...previews, [type]: reader.result });
    reader.readAsDataURL(file);
  };

  const handleUploadAndSave = async (type) => {
    if (!uploads[type]) return;
    setSaving(true);

    try {
      const token = localStorage.getItem('adminToken');
      const fd = new FormData();
      fd.append('file', uploads[type]);
      fd.append('category', type);

      const uploadRes = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd
      });

      const uploadData = await uploadRes.json();
      if (!uploadData.success) {
        toast.error(uploadData.error || 'Yükleme hatası');
        return;
      }

      const newSettings = { ...settings, [type]: uploadData.data.url };
      const settingsRes = await fetch('/api/admin/settings/site', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });

      const settingsData = await settingsRes.json();
      if (settingsData.success) {
        setSettings(newSettings);
        setUploads({ ...uploads, [type]: null });
        toast.success('Görsel güncellendi!');
      } else {
        toast.error(settingsData.error || 'Kaydetme hatası');
      }
    } catch (error) {
      toast.error('Bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    // Validation
    if (!settings.siteName || settings.siteName.trim().length === 0) {
      toast.error('Site adı boş olamaz');
      return;
    }

    if (settings.metaTitle && settings.metaTitle.length > 70) {
      toast.error('META başlık en fazla 70 karakter olabilir');
      return;
    }

    if (settings.metaDescription && settings.metaDescription.length > 160) {
      toast.error('META açıklama en fazla 160 karakter olabilir');
      return;
    }

    if (settings.contactEmail && settings.contactEmail.length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(settings.contactEmail)) {
        toast.error('Geçersiz e-posta adresi');
        return;
      }
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/settings/site', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Site ayarları kaydedildi!');
      } else {
        toast.error(data.error || 'Kaydetme hatası');
      }
    } catch (error) {
      toast.error('Bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUsername');
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Toaster position="top-center" richColors />
      
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-slate-900 border-r border-slate-800 p-4 overflow-y-auto">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center font-bold text-white">
            UC
          </div>
          <div>
            <div className="text-white font-bold">PUBG UC</div>
            <div className="text-slate-400 text-xs">Admin Panel</div>
          </div>
        </div>

        <nav className="space-y-2">
          <Button
            onClick={() => router.push('/admin/dashboard')}
            variant="ghost"
            className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
          >
            <LayoutDashboard className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
          <Button
            onClick={() => router.push('/admin/orders')}
            variant="ghost"
            className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            Siparişler
          </Button>
          <Button
            onClick={() => router.push('/admin/products')}
            variant="ghost"
            className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
          >
            <Package className="w-4 h-4 mr-2" />
            Ürünler
          </Button>
          <Button
            onClick={() => router.push('/admin/support')}
            variant="ghost"
            className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
          >
            <Headphones className="w-4 h-4 mr-2" />
            Destek
          </Button>
          <Button
            onClick={() => router.push('/admin/settings/site')}
            className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Globe className="w-4 h-4 mr-2" />
            Site Ayarları
          </Button>
          <Button
            onClick={() => router.push('/admin/settings/email')}
            variant="ghost"
            className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
          >
            <Mail className="w-4 h-4 mr-2" />
            E-posta Ayarları
          </Button>
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full border-slate-700 text-slate-300 hover:text-white"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Çıkış Yap
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Site Ayarları</h1>
          <p className="text-slate-400">Site adı, SEO bilgileri ve iletişim ayarları</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Text Settings */}
          <div className="space-y-6">
            {/* Site Name & SEO */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-400" />
                Site Bilgileri
              </h3>

              <div className="space-y-2">
                <Label className="text-slate-300">Site Adı *</Label>
                <Input
                  value={settings.siteName || ''}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  placeholder="PreSatis"
                  className="bg-slate-800 border-slate-700 text-white"
                />
                <p className="text-slate-500 text-xs">Eğer logo yüklüyse header'da logo görünür, yoksa bu isim gösterilir</p>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300 flex items-center justify-between">
                  <span>META Başlık (Title)</span>
                  <span className={`text-xs ${(settings.metaTitle?.length || 0) > 70 ? 'text-red-400' : 'text-slate-500'}`}>
                    {settings.metaTitle?.length || 0}/70
                  </span>
                </Label>
                <Input
                  value={settings.metaTitle || ''}
                  onChange={(e) => setSettings({ ...settings, metaTitle: e.target.value })}
                  placeholder="Dijital Platform Hizmetleri | PreSatis"
                  className="bg-slate-800 border-slate-700 text-white"
                  maxLength={70}
                />
                <p className="text-slate-500 text-xs">Tarayıcı sekmesinde ve arama sonuçlarında görünür</p>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300 flex items-center justify-between">
                  <span>META Açıklama (Description)</span>
                  <span className={`text-xs ${(settings.metaDescription?.length || 0) > 160 ? 'text-red-400' : 'text-slate-500'}`}>
                    {settings.metaDescription?.length || 0}/160
                  </span>
                </Label>
                <textarea
                  value={settings.metaDescription || ''}
                  onChange={(e) => setSettings({ ...settings, metaDescription: e.target.value })}
                  placeholder="PreSatis, dijital platformlara yönelik online hizmetler sunar..."
                  className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none resize-none"
                  rows={3}
                  maxLength={160}
                />
                <p className="text-slate-500 text-xs">Google arama sonuçlarında site açıklaması olarak görünür</p>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Phone className="w-5 h-5 text-green-400" />
                İletişim Bilgileri
              </h3>

              <div className="space-y-2">
                <Label className="text-slate-300">Telefon Numarası</Label>
                <Input
                  value={settings.contactPhone || ''}
                  onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                  placeholder="555 555 55 55"
                  className="bg-slate-800 border-slate-700 text-white"
                />
                <p className="text-slate-500 text-xs">Footer'da görünecek iletişim telefonu</p>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">E-posta Adresi</Label>
                <Input
                  type="email"
                  value={settings.contactEmail || ''}
                  onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                  placeholder="iletisim@presatis.com"
                  className="bg-slate-800 border-slate-700 text-white"
                />
                <p className="text-slate-500 text-xs">Footer'da görünecek iletişim e-postası</p>
              </div>
            </div>

            {/* Daily Banner Settings */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                </svg>
                Günlük Banner
              </h3>

              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                <div>
                  <Label className="text-white font-medium">Banner Aktif</Label>
                  <p className="text-slate-400 text-sm mt-1">Hero altında "Bugüne Özel Fiyatlar" banner'ı</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, dailyBannerEnabled: !settings.dailyBannerEnabled })}
                  className={`relative w-12 h-6 rounded-full transition-colors ${settings.dailyBannerEnabled ? 'bg-blue-600' : 'bg-slate-700'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${settings.dailyBannerEnabled ? 'translate-x-6' : ''}`} />
                </button>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Banner Başlığı</Label>
                <Input
                  value={settings.dailyBannerTitle || ''}
                  onChange={(e) => setSettings({ ...settings, dailyBannerTitle: e.target.value })}
                  placeholder="Bugüne Özel Fiyatlar"
                  className="bg-slate-800 border-slate-700 text-white"
                  disabled={!settings.dailyBannerEnabled}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Alt Metin (Opsiyonel)</Label>
                <Input
                  value={settings.dailyBannerSubtitle || ''}
                  onChange={(e) => setSettings({ ...settings, dailyBannerSubtitle: e.target.value })}
                  placeholder="Boş bırakılırsa bugünün tarihi gösterilir"
                  className="bg-slate-800 border-slate-700 text-white"
                  disabled={!settings.dailyBannerEnabled}
                />
                <p className="text-slate-500 text-xs">Boş bırakılırsa otomatik olarak bugünün tarihi gösterilir</p>
              </div>

              {/* Banner Preview */}
              {settings.dailyBannerEnabled && (
                <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-[#1a1f35] via-[#252d4a] to-[#1a1f35] border border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🔥</span>
                      <div>
                        <p className="text-white font-semibold">{settings.dailyBannerTitle || 'Bugüne Özel Fiyatlar'}</p>
                        <p className="text-white/60 text-sm">
                          {settings.dailyBannerSubtitle || new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-yellow-400 bg-yellow-500/20 px-3 py-1 rounded-full border border-yellow-500/30">Günlük Kampanya</span>
                  </div>
                </div>
              )}
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSaveSettings}
              disabled={saving}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Kaydet ve Uygula
                </>
              )}
            </Button>
          </div>

          {/* Right Column - Image Uploads */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-purple-400" />
                Site Görselleri
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <UploadBox
                  type="logo"
                  title="Logo"
                  description="Header'da görünür"
                  uploads={uploads}
                  previews={previews}
                  handleFileSelect={handleFileSelect}
                  handleUploadAndSave={handleUploadAndSave}
                  saving={saving}
                />
                <UploadBox
                  type="favicon"
                  title="Favicon"
                  description="Tarayıcı sekmesi ikonu"
                  uploads={uploads}
                  previews={previews}
                  handleFileSelect={handleFileSelect}
                  handleUploadAndSave={handleUploadAndSave}
                  saving={saving}
                />
                <UploadBox
                  type="categoryIcon"
                  title="Kategori İkonu"
                  description="Ürün kategorisi ikonu"
                  uploads={uploads}
                  previews={previews}
                  handleFileSelect={handleFileSelect}
                  handleUploadAndSave={handleUploadAndSave}
                  saving={saving}
                />
              </div>

              <div className="pt-4 border-t border-slate-800">
                <UploadBox
                  type="heroImage"
                  title="Hero Banner"
                  description="Ana sayfa üst görseli"
                  uploads={uploads}
                  previews={previews}
                  handleFileSelect={handleFileSelect}
                  handleUploadAndSave={handleUploadAndSave}
                  saving={saving}
                  large
                />
              </div>
            </div>

            {/* SEO Preview */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-yellow-400" />
                Google Önizleme
              </h3>
              <div className="bg-white rounded-lg p-4">
                <div className="text-blue-600 text-lg font-medium truncate">
                  {settings.metaTitle || 'Site Başlığı'}
                </div>
                <div className="text-green-700 text-sm truncate">
                  https://siteadresi.com
                </div>
                <div className="text-gray-600 text-sm mt-1 line-clamp-2">
                  {settings.metaDescription || 'Site açıklaması buraya gelecek...'}
                </div>
              </div>
              <p className="text-slate-500 text-xs mt-3">
                Bu önizleme, sitenizin Google arama sonuçlarında nasıl görüneceğini gösterir.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function UploadBox({ type, title, description, uploads, previews, handleFileSelect, handleUploadAndSave, saving, large }) {
  return (
    <div className={`${large ? '' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <Label className="text-white">{title}</Label>
          {description && <p className="text-slate-500 text-xs">{description}</p>}
        </div>
      </div>
      
      <div className={`bg-slate-800/50 rounded-lg p-3 ${large ? 'min-h-[120px]' : 'min-h-[80px]'} flex items-center justify-center mb-2`}>
        {previews[type] ? (
          <img 
            src={previews[type]} 
            alt={title}
            className={`${large ? 'max-h-[100px]' : 'max-h-[60px]'} max-w-full object-contain`}
          />
        ) : (
          <div className="text-slate-600 text-center">
            <ImageIcon className="w-8 h-8 mx-auto mb-1" />
            <span className="text-xs">Görsel yok</span>
          </div>
        )}
      </div>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => handleFileSelect(e, type)}
        className="hidden"
        id={`upload-${type}`}
      />
      
      <div className="flex gap-2">
        <label
          htmlFor={`upload-${type}`}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-dashed border-slate-700 rounded-lg cursor-pointer hover:border-blue-500 text-slate-400 hover:text-blue-400 text-sm transition-colors"
        >
          <Upload className="w-4 h-4" />
          {uploads[type] ? uploads[type].name.substring(0, 15) + '...' : 'Seç'}
        </label>
        {uploads[type] && (
          <Button
            onClick={() => handleUploadAndSave(type)}
            disabled={saving}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Yükle'}
          </Button>
        )}
      </div>
    </div>
  );
}
