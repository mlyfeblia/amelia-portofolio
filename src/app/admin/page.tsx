'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Calendar, 
  MessageCircleHeart, 
  CheckCircle, 
  Clock, 
  Phone, 
  Mail, 
  ArrowLeft, 
  Lock, 
  LogOut, 
  Search,
  Filter,
  Send,
  Eye,
  EyeOff
} from 'lucide-react';
import { Booking, AnonymousMessage, BookingStatus } from '@/types';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);

  const [activeTab, setActiveTab] = useState<'bookings' | 'curhat'>('bookings');
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [curhatList, setCurhatList] = useState<AnonymousMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Curhat reply state
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyPublic, setReplyPublic] = useState(true);

  // Check session storage on mount
  useEffect(() => {
    const savedAuth = sessionStorage.getItem('amel_admin_auth');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
      loadAdminData();
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === 'amel2026' || pin === '1234') {
      setIsAuthenticated(true);
      sessionStorage.setItem('amel_admin_auth', 'true');
      setPinError(false);
      loadAdminData();
    } else {
      setPinError(true);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('amel_admin_auth');
    setIsAuthenticated(false);
    setPin('');
  };

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [resB, resC] = await Promise.all([
        fetch('/api/bookings'),
        fetch('/api/curhat')
      ]);
      const dataB = await resB.json();
      const dataC = await resC.json();

      if (dataB.success) setBookings(dataB.data);
      if (dataC.success) setCurhatList(dataC.data);
    } catch (e) {
      console.error('Error fetching admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: BookingStatus) => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
        );
      }
    } catch (e) {
      console.error('Failed to update status', e);
    }
  };

  const handleSendReply = async (id: string) => {
    if (!replyText.trim()) return;
    try {
      const res = await fetch(`/api/curhat/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answer: replyText,
          isPublic: replyPublic,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCurhatList((prev) =>
          prev.map((c) => (c.id === id ? { ...c, answer: replyText, isAnswered: true, isPublic: replyPublic } : c))
        );
        setReplyingId(null);
        setReplyText('');
      }
    } catch (e) {
      console.error('Failed to answer curhat', e);
    }
  };

  // Auth Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-3xl p-8 border border-[#E5DFD4] shadow-sm text-center space-y-6">
          <div className="w-14 h-14 rounded-full bg-[#EBF3EF] text-[#225844] mx-auto flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-medium text-[#1C2B24]">
              Portal Konselor Amelia
            </h1>
            <p className="text-xs text-[#566A61] mt-1">
              Masukkan PIN pengelola untuk mengelola janji temu & ruang curhat.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Masukkan PIN (Default: amel2026)"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5DFD4] text-center text-sm text-[#1C2B24] focus:outline-none focus:border-[#225844]"
              />
              {pinError && (
                <p className="text-xs text-red-500 mt-1.5">
                  PIN keliru. Coba gunakan: <code>amel2026</code>
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-full bg-[#225844] text-white text-xs font-semibold hover:bg-[#1A4636] transition-colors cursor-pointer"
            >
              Masuk Dashboard
            </button>
          </form>

          <div className="pt-2">
            <Link
              href="/"
              className="text-xs text-[#566A61] hover:text-[#225844] inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Kembali ke Halaman Utama
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard Stats
  const waitingBookings = bookings.filter((b) => b.status === 'menunggu').length;
  const confirmedBookings = bookings.filter((b) => b.status === 'terkonfirmasi').length;
  const unansweredCurhat = curhatList.filter((c) => !c.isAnswered).length;

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#1C2B24]">
      {/* Top Navbar */}
      <header className="bg-white border-b border-[#E5DFD4] sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xs text-[#566A61] hover:text-[#225844] flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              <span>Lihat Web</span>
            </Link>
            <span className="text-[#C8BFB0]">|</span>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#225844]" />
              <span className="font-semibold text-sm">Dashboard Konselor Amel</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#EBF3EF] text-[#225844] font-medium">
                UIN Siber Cirebon
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="text-xs text-[#566A61] hover:text-red-600 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-[#FAF8F3] transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-[#E5DFD4] shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#566A61] mb-2">
              <span>Perlu Konfirmasi</span>
              <Clock className="w-4 h-4 text-[#B8623A]" />
            </div>
            <div className="text-2xl font-bold text-[#1C2B24]">{waitingBookings}</div>
            <div className="text-[11px] text-[#81958C] mt-1">Janji temu baru masuk</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#E5DFD4] shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#566A61] mb-2">
              <span>Sesi Terkonfirmasi</span>
              <CheckCircle className="w-4 h-4 text-[#225844]" />
            </div>
            <div className="text-2xl font-bold text-[#225844]">{confirmedBookings}</div>
            <div className="text-[11px] text-[#81958C] mt-1">Jadwal konsultasi aktif</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#E5DFD4] shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#566A61] mb-2">
              <span>Curhat Menunggu Balasan</span>
              <MessageCircleHeart className="w-4 h-4 text-[#C99632]" />
            </div>
            <div className="text-2xl font-bold text-[#1C2B24]">{unansweredCurhat}</div>
            <div className="text-[11px] text-[#81958C] mt-1">Pesan anonim belum dijawab</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-3 border-b border-[#E5DFD4] pb-2">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`flex items-center gap-2 pb-2 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'bookings'
                ? 'border-[#225844] text-[#225844]'
                : 'border-transparent text-[#566A61] hover:text-[#1C2B24]'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Janji Temu ({bookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('curhat')}
            className={`flex items-center gap-2 pb-2 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'curhat'
                ? 'border-[#225844] text-[#225844]'
                : 'border-transparent text-[#566A61] hover:text-[#1C2B24]'
            }`}
          >
            <MessageCircleHeart className="w-4 h-4" />
            <span>Ruang Curhat ({curhatList.length})</span>
          </button>
        </div>

        {/* Tab 1: Bookings Management */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <h2 className="text-lg font-medium text-[#1C2B24]">Daftar Reservasi Konseling</h2>
              <button
                onClick={loadAdminData}
                className="text-xs text-[#225844] hover:underline"
              >
                Segarkan Data
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12 text-xs text-[#81958C]">Memuat data janji temu...</div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-3xl border border-[#E5DFD4] text-xs text-[#81958C]">
                Belum ada permohonan konsultasi.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {bookings.map((b) => (
                  <div
                    key={b.id}
                    className="bg-white rounded-2xl p-5 border border-[#E5DFD4] shadow-xs space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F3EFE6]">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-[#FAF8F3] border border-[#E5DFD4]">
                          {b.code}
                        </span>
                        <h3 className="font-semibold text-[#1C2B24] text-base">{b.name}</h3>
                        {b.alias && b.alias !== b.name && (
                          <span className="text-xs text-[#566A61]">({b.alias})</span>
                        )}
                      </div>

                      {/* Status Badges */}
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                            b.status === 'terkonfirmasi'
                              ? 'bg-[#EBF3EF] text-[#225844]'
                              : b.status === 'menunggu'
                              ? 'bg-[#FEF6E9] text-[#B8623A]'
                              : b.status === 'selesai'
                              ? 'bg-[#F3EFE6] text-[#566A61]'
                              : 'bg-red-50 text-red-600'
                          }`}
                        >
                          {b.status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Booking Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-[#81958C]">Topik:</span>
                        <div className="font-medium text-[#1C2B24] mt-0.5">{b.category}</div>
                      </div>
                      <div>
                        <span className="text-[#81958C]">Jadwal & Waktu:</span>
                        <div className="font-medium text-[#1C2B24] mt-0.5">
                          {b.date} • {b.timeSlot}
                        </div>
                      </div>
                      <div>
                        <span className="text-[#81958C]">Format Sesi:</span>
                        <div className="font-medium text-[#1C2B24] mt-0.5">
                          {b.mode === 'online_meet'
                            ? 'Google Meet (Siber)'
                            : b.mode === 'online_chat'
                            ? 'Chat Terjadwal'
                            : 'Tatap Muka di Cirebon'}
                        </div>
                      </div>
                    </div>

                    {b.notes && (
                      <div className="p-3 rounded-xl bg-[#FAF8F3] border border-[#E5DFD4] text-xs text-[#566A61]">
                        <span className="font-semibold text-[#1C2B24]">Catatan konseli: </span>
                        {b.notes}
                      </div>
                    )}

                    {/* Action Row */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="flex items-center gap-3">
                        <a
                          href={`https://wa.me/${b.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                            `Halo ${b.alias || b.name}, saya Amelia (Amel) dari Bimbingan Konseling Islam UIN Siber Syekh Nurjati Cirebon. Terkait jadwal konsultasi Anda (${b.code}) pada ${b.date}...`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#225844] text-white hover:bg-[#1A4636] transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          Hubungi via WhatsApp ({b.phone})
                        </a>
                        <a
                          href={`mailto:${b.email}`}
                          className="inline-flex items-center gap-1.5 text-xs text-[#566A61] hover:text-[#1C2B24] px-2.5 py-1.5 rounded-lg border border-[#E5DFD4] transition-colors"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          Email
                        </a>
                      </div>

                      {/* Status changer buttons */}
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-[#81958C] mr-1">Ubah Status:</span>
                        {b.status !== 'terkonfirmasi' && (
                          <button
                            onClick={() => updateStatus(b.id, 'terkonfirmasi')}
                            className="px-2.5 py-1 rounded bg-[#EBF3EF] text-[#225844] font-medium hover:bg-[#D5E5DD] transition-colors"
                          >
                            Konfirmasi
                          </button>
                        )}
                        {b.status !== 'selesai' && (
                          <button
                            onClick={() => updateStatus(b.id, 'selesai')}
                            className="px-2.5 py-1 rounded bg-[#F3EFE6] text-[#566A61] font-medium hover:bg-[#E5DFD4] transition-colors"
                          >
                            Selesai
                          </button>
                        )}
                        {b.status !== 'dibatalkan' && (
                          <button
                            onClick={() => updateStatus(b.id, 'dibatalkan')}
                            className="px-2.5 py-1 rounded bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-colors"
                          >
                            Batal
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Curhat Management */}
        {activeTab === 'curhat' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-[#1C2B24]">Daftar Cerita & Pertanyaan Anonim</h2>
              <button
                onClick={loadAdminData}
                className="text-xs text-[#225844] hover:underline"
              >
                Segarkan Data
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12 text-xs text-[#81958C]">Memuat cerita...</div>
            ) : curhatList.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-3xl border border-[#E5DFD4] text-xs text-[#81958C]">
                Belum ada curhat masuk.
              </div>
            ) : (
              <div className="space-y-4">
                {curhatList.map((c) => (
                  <div
                    key={c.id}
                    className="bg-white rounded-2xl p-5 border border-[#E5DFD4] shadow-xs space-y-4"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#1C2B24]">{c.alias}</span>
                        <span className="px-2 py-0.5 rounded-full bg-[#FAF8F3] text-[#566A61] border border-[#E5DFD4]">
                          {c.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {c.isAnswered ? (
                          <span className="px-2 py-0.5 rounded-full bg-[#EBF3EF] text-[#225844] font-medium text-[11px]">
                            Sudah Dijawab
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-[#FEF6E9] text-[#B8623A] font-medium text-[11px]">
                            Belum Dibalas
                          </span>
                        )}
                        <span className="text-[11px] text-[#81958C]">
                          {c.isPublic ? 'Publik di Web' : 'Privat'}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-[#1C2B24] leading-relaxed italic">
                      &ldquo;{c.message}&rdquo;
                    </p>

                    {c.answer && (
                      <div className="p-3.5 rounded-xl bg-[#FAF8F3] border border-[#D5E5DD] space-y-1">
                        <div className="text-xs font-semibold text-[#225844]">Tanggapan Amel:</div>
                        <p className="text-xs sm:text-sm text-[#566A61] leading-relaxed">
                          {c.answer}
                        </p>
                      </div>
                    )}

                    {/* Reply Input Trigger */}
                    {replyingId === c.id ? (
                      <div className="p-4 rounded-xl bg-[#FAF8F3] border border-[#E5DFD4] space-y-3">
                        <label className="block text-xs font-semibold text-[#1C2B24]">
                          Tulis Bimbingan / Tanggapan Anda:
                        </label>
                        <textarea
                          rows={4}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Tuliskan kata-kata penguatan, empati, dan arahan islami..."
                          className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5DFD4] text-xs text-[#1C2B24] focus:outline-none focus:border-[#225844] resize-none"
                        />
                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2 text-xs text-[#566A61] cursor-pointer">
                            <input
                              type="checkbox"
                              checked={replyPublic}
                              onChange={(e) => setReplyPublic(e.target.checked)}
                              className="rounded border-[#E5DFD4] text-[#225844]"
                            />
                            <span>Tampilkan di dinding curhat website</span>
                          </label>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setReplyingId(null)}
                              className="px-3 py-1.5 rounded-lg border border-[#E5DFD4] text-xs text-[#566A61]"
                            >
                              Batal
                            </button>
                            <button
                              onClick={() => handleSendReply(c.id)}
                              className="px-4 py-1.5 rounded-lg bg-[#225844] text-white text-xs font-semibold hover:bg-[#1A4636] transition-colors"
                            >
                              Simpan & Kirim
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => {
                            setReplyingId(c.id);
                            setReplyText(c.answer || '');
                            setReplyPublic(c.isPublic);
                          }}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-[#FAF8F3] border border-[#E5DFD4] text-[#225844] hover:bg-[#EBF3EF] transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{c.answer ? 'Edit Tanggapan' : 'Beri Tanggapan'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
