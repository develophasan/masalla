import Navbar from '@/components/Navbar';
import { BookOpen, Heart, Users, Sparkles, Mail, Phone, MapPin } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-purple-50 to-white">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-violet-400 to-pink-400 mb-6">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-800 mb-4">Masal Sepeti Hakkında</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Çocuklarınız için yapay zeka destekli, pedagojik temelli eğitici masallar üretiyoruz.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 text-center">
            <div className="w-14 h-14 rounded-full bg-violet-100 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-7 h-7 text-violet-600" />
            </div>
            <h3 className="font-bold text-slate-800 mb-2">Yapay Zeka Destekli</h3>
            <p className="text-slate-500 text-sm">
              En son yapay zeka teknolojisiyle özgün masallar üretiyoruz.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-100 text-center">
            <div className="w-14 h-14 rounded-full bg-pink-100 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-7 h-7 text-pink-600" />
            </div>
            <h3 className="font-bold text-slate-800 mb-2">Pedagojik Temelli</h3>
            <p className="text-slate-500 text-sm">
              Her masal, çocuk gelişimini destekleyen kazanımlarla tasarlanıyor.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-100 text-center">
            <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <Users className="w-7 h-7 text-amber-600" />
            </div>
            <h3 className="font-bold text-slate-800 mb-2">Aile Dostu</h3>
            <p className="text-slate-500 text-sm">
              Öğretmenler, ebeveynler ve çocuklar için güvenli içerik.
            </p>
          </div>
        </div>

        {/* Mission */}
        <div className="bg-white rounded-2xl p-8 border border-slate-100 mb-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Misyonumuz</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Masal Sepeti, çocukların hayal dünyasını geliştirmek ve onlara değerli yaşam dersleri vermek 
            amacıyla kurulmuştur. 15 ana kategori ve 150'den fazla alt konuyla, her çocuğun ihtiyacına 
            uygun masallar üretiyoruz.
          </p>
          <p className="text-slate-600 leading-relaxed">
            Türkçe seslendirme özelliğimiz sayesinde, çocuklar masalları dinleyerek hem eğlenebilir 
            hem de dil gelişimlerini destekleyebilir.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-6 text-center text-white">
            <p className="text-4xl font-bold">15</p>
            <p className="text-violet-100 text-sm">Ana Kategori</p>
          </div>
          <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl p-6 text-center text-white">
            <p className="text-4xl font-bold">150+</p>
            <p className="text-pink-100 text-sm">Alt Konu</p>
          </div>
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-center text-white">
            <p className="text-4xl font-bold">∞</p>
            <p className="text-amber-100 text-sm">Masal</p>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-gradient-to-r from-violet-50 to-pink-50 rounded-2xl p-8 border border-violet-100">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">İletişim</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                <Mail className="w-6 h-6 text-violet-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Email</p>
                <a href="mailto:info@masal.space" className="text-slate-800 font-medium hover:text-violet-600">
                  info@masal.space
                </a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                <MapPin className="w-6 h-6 text-violet-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Website</p>
                <a href="https://masal.space" className="text-slate-800 font-medium hover:text-violet-600">
                  masal.space
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-slate-500 text-sm">
          <p>© 2025 masal.space - Masal Sepeti. Tüm hakları saklıdır.</p>
          <p className="mt-2">
            Designed by{' '}
            <a href="https://github.com/develophasan" target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:text-violet-700">
              Hasan Özdemir
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
