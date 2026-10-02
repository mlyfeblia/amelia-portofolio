'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  MessageSquareText, 
  Send, 
  CheckCircle2, 
  Clock, 
  Eye, 
  EyeOff, 
  RefreshCw,
  Sparkles,
  HeartHandshake
} from 'lucide-react';
import { AnonymousMessage } from '@/types';

const CATEGORIES = [
  'Semua',
  'Quarter-Life Crisis',
  'Kecemasan & Ibadah',
  'Akademik & Burnout',
  'Keluarga & Relasi',
  'Umum',
];

export default function AdminCounselingPage() {
  const [curhatList, setCurhatList] = useState<AnonymousMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Semua');
  const [statusFilter, setStatusFilter] = useState<'semua' | 'unanswered' | 'answered'>('semua');

  // Reply drawer state
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyPublic, setReplyPublic] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadCurhat = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/curhat');
      const data = await res.json();
      if (data.success) {
        setCurhatList(data.data);
      }
    } catch (e) {
      console.error('Failed to load curhat:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCurhat();
  }, []);

  const handleSendReply = async (id: string) => {
    if (!replyText.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/curhat/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answer: replyText.trim(),
          isPublic: replyPublic,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCurhatList((prev) =>
          prev.map((c) =>
            c.id === id
              ? { ...c, answer: replyText.trim(), isAnswered: true, isPublic: replyPublic }
              : c
          )
        );
        setReplyingId(null);
        setReplyText('');
      }
    } catch (e) {
      console.error('Failed to answer curhat:', e);
    } finally {
      setSaving(false);
    }
  };

  const filtered = useMemo(() => {
    return curhatList.filter((c) => {
      const matchesCategory = categoryFilter === 'Semua' || c.category === categoryFilter;
      const matchesStatus =
        statusFilter === 'semua' ||
        (statusFilter === 'unanswered' && !c.isAnswered) ||
        (statusFilter === 'answered' && c.isAnswered);
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        c.alias.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.message.toLowerCase().includes(q) ||
        (c.answer && c.answer.toLowerCase().includes(q));

      return matchesCategory && matchesStatus && matchesSearch;
    });
  }, [curhatList, categoryFilter, statusFilter, search]);

  const unansweredCount = curhatList.filter((c) => !c.isAnswered).length;
  const answeredCount = curhatList.filter((c) => c.isAnswered).length;

  return (
    <div className="space-y-6 animate-fade-in-up">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-medium text-[var(--color-ink)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Kelola Ruang Curhat Anonim
          </h1>
          <p className="text-sm text-[var(--color-ink-muted)] mt-1">
            Total {curhatList.length} pesan curhat masuk ({unansweredCount} menunggu balasan).
          </p>
        </div>

        <button
          onClick={loadCurhat}
          disabled={loading}
          className="btn-secondary text-xs py-2 px-3.5 inline-flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Segarkan</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs">
        
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-[var(--color-ink-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari berdasarkan alias, topik, isi curhat, atau tanggapan..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--color-paper)] border border-[var(--color-paper-border)] text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)]/70 focus:outline-none focus:border-[var(--color-accent)]"
          />
        </div>

        {/* Filter Badges: Status & Categories */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-[var(--color-paper-border)]">
          
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            <button
              onClick={() => setStatusFilter('semua')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all shrink-0 ${
                statusFilter === 'semua'
                  ? 'bg-[var(--color-accent)] text-white shadow-xs font-semibold'
                  : 'bg-[var(--color-paper)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] border border-[var(--color-paper-border)]'
              }`}
            >
              Semua ({curhatList.length})
            </button>
            <button
              onClick={() => setStatusFilter('unanswered')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all shrink-0 ${
                statusFilter === 'unanswered'
                  ? 'bg-rose-600 text-white shadow-xs font-semibold'
                  : 'bg-[var(--color-paper)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] border border-[var(--color-paper-border)]'
              }`}
            >
              Belum Dibalas ({unansweredCount})
            </button>
            <button
              onClick={() => setStatusFilter('answered')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all shrink-0 ${
                statusFilter === 'answered'
                  ? 'bg-[var(--color-accent)] text-white shadow-xs font-semibold'
                  : 'bg-[var(--color-paper)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] border border-[var(--color-paper-border)]'
              }`}
            >
              Sudah Dijawab ({answeredCount})
            </button>
          </div>

          {/* Category Dropdown/Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-xs text-[var(--color-ink-muted)] mr-1">Topik:</span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs whitespace-nowrap cursor-pointer transition-colors ${
                  categoryFilter === cat
                    ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)] font-semibold border border-[var(--color-accent-border)]'
                    : 'text-[var(--color-ink-muted)] hover:bg-[var(--color-paper-muted)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

        </div>

      </div>

      {/* Curhat List */}
      {loading ? (
        <div className="p-12 text-center bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-2xl text-xs text-[var(--color-ink-muted)]">
          Memuat pesan curhat...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-2xl text-xs text-[var(--color-ink-muted)] space-y-1">
          <MessageSquareText className="w-8 h-8 text-[var(--color-ink-muted)]/50 mx-auto mb-2" />
          <p className="font-semibold text-[var(--color-ink)]">Tidak ada pesan curhat ditemukan</p>
          <p>Coba sesuaikan filter atau kata kunci pencarian Anda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-5 sm:p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-paper-border)] shadow-xs space-y-4 card-interactive"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--color-paper-border)]">
                <div className="flex items-center gap-2.5">
                  <span className="font-semibold text-[var(--color-ink)] text-sm sm:text-base">
                    {item.alias}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)] font-medium">
                    {item.category}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  {item.isAnswered ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 font-medium">
                      Sudah Dijawab
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 font-medium">
                      Menunggu Tanggapan
                    </span>
                  )}

                  <span className="inline-flex items-center gap-1 text-[11px] text-[var(--color-ink-muted)] px-2 py-0.5 rounded-md bg-[var(--color-paper)] border border-[var(--color-paper-border)]">
                    {item.isPublic ? <Eye className="w-3 h-3 text-[var(--color-accent)]" /> : <EyeOff className="w-3 h-3" />}
                    <span>{item.isPublic ? 'Publik' : 'Privat'}</span>
                  </span>
                </div>
              </div>

              {/* Message */}
              <blockquote className="text-sm sm:text-base text-[var(--color-ink)] leading-relaxed italic bg-[var(--color-paper)] p-4 rounded-xl border border-[var(--color-paper-border)]">
                &ldquo;{item.message}&rdquo;
              </blockquote>

              {/* Existing Answer */}
              {item.answer && (
                <div className="p-4 rounded-xl bg-[var(--color-accent-soft)]/50 border border-[var(--color-accent-border)] space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-accent)] uppercase tracking-wider">
                    <HeartHandshake className="w-3.5 h-3.5" />
                    <span>Tanggapan Bimbingan Amel:</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[var(--color-ink)] leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              )}

              {/* Reply Box or Action Button */}
              {replyingId === item.id ? (
                <div className="p-4 sm:p-5 rounded-xl bg-[var(--color-paper)] border border-[var(--color-paper-border)] space-y-3.5 animate-fade-in-up">
                  <label className="block text-xs font-semibold text-[var(--color-ink)]">
                    Tulis Tanggapan Konseling / Penguatan Sahabat:
                  </label>
                  <textarea
                    rows={4}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Tuliskan kata-kata penerimaan, empati, pendekatan CBT/spiritual, dan dorongan semangat..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-paper-border)] text-sm text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-soft)] resize-none"
                    autoFocus
                  />

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
                    <label className="flex items-center gap-2 text-xs text-[var(--color-ink)] cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={replyPublic}
                        onChange={(e) => setReplyPublic(e.target.checked)}
                        className="rounded border-[var(--color-paper-border)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                      />
                      <span>Tampilkan di dinding curhat website publik</span>
                    </label>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => setReplyingId(null)}
                        type="button"
                        className="btn-secondary text-xs py-1.5 px-3"
                      >
                        Batal
                      </button>
                      <button
                        onClick={() => handleSendReply(item.id)}
                        disabled={saving || !replyText.trim()}
                        type="button"
                        className="btn-primary text-xs py-1.5 px-3.5 inline-flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{saving ? 'Menyimpan...' : 'Simpan Tanggapan'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => {
                      setReplyingId(item.id);
                      setReplyText(item.answer || '');
                      setReplyPublic(item.isPublic);
                    }}
                    type="button"
                    className="btn-primary text-xs py-1.5 px-3.5 inline-flex items-center gap-1.5"
                  >
                    <Send className="w-3 h-3" />
                    <span>{item.answer ? 'Ubah Tanggapan' : 'Beri Tanggapan'}</span>
                  </button>
                </div>
              )}

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
