/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TelegramConfig, NotifyLog } from '../types';
import { 
  Send, 
  Terminal, 
  Settings2, 
  BadgeCheck, 
  Info, 
  AlertCircle, 
  ShieldCheck,
  RefreshCcw,
  Zap
} from 'lucide-react';
import { motion } from 'motion/react';

interface IntegrationsProps {
  config: TelegramConfig;
  logs: NotifyLog[];
  onSaveConfig: (cfg: Partial<TelegramConfig>) => Promise<boolean>;
  onRefreshLogs: () => void;
}

export default function Integrations({ config, logs, onSaveConfig, onRefreshLogs }: IntegrationsProps) {
  // Input Binding State
  const [botToken, setBotToken] = useState(config.botToken || '');
  const [chatId, setChatId] = useState(config.chatId || '');
  const [aktifkan, setAktifkan] = useState(config.aktifkan || false);

  // Connection testing state
  const [testMessage, setTestMessage] = useState('Tes integrasi Telegram dari sistem awan BEB Production!');
  const [testingStatus, setTestingStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'FAIL'>('IDLE');
  const [testResultMsg, setTestResultMsg] = useState('');

  const [savingLoading, setSavingLoading] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Save config
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccessMsg('');
    setSavingLoading(true);

    try {
      const isSuccess = await onSaveConfig({
        botToken,
        chatId,
        aktifkan
      });

      if (isSuccess) {
        setSaveSuccessMsg('Konfigurasi Telegram berhasil disimpan!');
        setTimeout(() => setSaveSuccessMsg(''), 4000);
      } else {
        alert('Gagal menyimpan konfigurasi ke server.');
      }
    } catch {
      alert('Terjadi kesalahan koneksi.');
    } finally {
      setSavingLoading(false);
    }
  };

  // Dispatch live API notification test trace
  const handleTestConnection = async () => {
    if (!botToken || !chatId) {
      setTestingStatus('FAIL');
      setTestResultMsg('Token Bot dan Chat ID wajib diisi untuk melakukan tes.');
      return;
    }

    setTestingStatus('LOADING');
    setTestResultMsg('');

    try {
      const response = await fetch('/api/test-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: botToken,
          chatId: chatId,
          text: testMessage
        })
      });

      const data = await response.json();
      if (response.ok) {
        setTestingStatus('SUCCESS');
        setTestResultMsg(data.message || 'Tes notifikasi berhasil terkirim!');
        onRefreshLogs(); // refresh notifications stream
      } else {
        setTestingStatus('FAIL');
        setTestResultMsg(data.message || 'Gagal mengirim pesan bot Telegram.');
      }
    } catch (error: any) {
      setTestingStatus('FAIL');
      setTestResultMsg('Error jaringan: ' + (error?.message || error));
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Dynamic Header Display */}
      <div className="bg-[#111319] border border-white/10 rounded-sm p-6 shadow-sm">
        <h2 className="text-2xl font-serif italic text-white flex items-center gap-2">
          <Zap className="text-amber-500" size={20} />
          Konfigurasi Integrasi Telegram &amp; n8n
        </h2>
        <p className="text-white/50 text-xs mt-1 font-sans">
          Hubungkan sistem informasi pemesanan Anda dengan bot Telegram. Notifikasi otomatis saat pesanan baru masuk atau status pekerjaan diubah.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Kolom Kiri: Konfigurasi Form & Testing */}
        <div className="space-y-6">
          
          {/* Telegram Credentials Form */}
          <div className="bg-[#111319] border border-white/10 rounded-sm p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest font-mono flex items-center gap-1.5 border-b border-white/5 pb-2">
              <Settings2 size={13} className="text-amber-500" />
              1. Pengaturan Kredensial Bot Telegram
            </h3>

            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-white/50 font-semibold mb-1 font-mono">
                  Telegram Bot Token
                </label>
                <input
                  type="password"
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                  placeholder="Contoh: 123456789:ABCDefGhIJKlmNoPQRsT..."
                  className="w-full bg-black/40 border border-white/10 rounded-sm p-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500 focus:ring-0"
                />
                <span className="text-[9px] text-white/40 mt-1 block font-sans">
                  Didapatkan dari chat dengan <strong className="text-white/60">@BotFather</strong> di Telegram.
                </span>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-white/50 font-semibold mb-1 font-mono">
                  Telegram Chat ID Admin / Grup
                </label>
                <input
                  type="text"
                  value={chatId}
                  onChange={(e) => setChatId(e.target.value)}
                  placeholder="Contoh: 987654321 atau -1001234567890 (Grup)"
                  className="w-full bg-black/40 border border-white/10 rounded-sm p-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500 focus:ring-0"
                />
                <span className="text-[9px] text-white/40 mt-1 block font-sans">
                  ID chat Anda. Bisa didapatkan via bot <strong className="text-white/60">@userinfobot</strong> atau bot sejenis.
                </span>
              </div>

              <div className="flex items-center gap-2 py-1 bg-black/30 p-3 rounded-sm border border-white/5">
                <input
                  type="checkbox"
                  id="aktifkan-notif"
                  checked={aktifkan}
                  onChange={(e) => setAktifkan(e.target.checked)}
                  className="rounded border-white/10 accent-amber-500 h-4 w-4 cursor-pointer"
                />
                <label htmlFor="aktifkan-notif" className="text-xs text-white/70 cursor-pointer font-sans select-none">
                  Aktifkan Notifikasi Telegram Otomatis
                </label>
              </div>

              <div className="flex items-center justify-between pt-2">
                {saveSuccessMsg && (
                  <p className="text-xs text-emerald-400 font-semibold">{saveSuccessMsg}</p>
                )}
                <button
                  type="submit"
                  disabled={savingLoading}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:bg-white/5 disabled:text-white/20 text-black font-semibold font-mono uppercase tracking-wider text-[11px] rounded-sm transition-colors ml-auto shadow-sm"
                >
                  {savingLoading ? 'Menyimpan...' : 'Simpan Konfigurasi'}
                </button>
              </div>
            </form>
          </div>

          {/* Test connection module */}
          <div className="bg-[#111319] border border-white/10 rounded-sm p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest font-mono flex items-center gap-1.5 border-b border-white/5 pb-2">
              <ShieldCheck size={13} className="text-amber-500" />
              2. Uji Coba Pengiriman Notifikasi
            </h3>

            <div className="space-y-3.5">
              <div>
                <label className="block text-[10px] uppercase text-white/50 font-semibold mb-1 font-mono tracking-wider">
                  Pesan Tes Notifikasi
                </label>
                <input
                  type="text"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-sm p-2 text-white text-xs focus:outline-none focus:border-amber-500 focus:ring-0"
                />
              </div>

              <button
                type="button"
                disabled={testingStatus === 'LOADING'}
                onClick={handleTestConnection}
                className="w-full py-2 bg-black/40 hover:bg-black/65 border border-white/10 hover:border-amber-500/30 text-white/90 hover:text-white font-mono uppercase tracking-wider text-[11px] rounded-sm transition-colors flex items-center justify-center gap-1 shadow-sm"
              >
                {testingStatus === 'LOADING' ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-white/20 border-t-amber-500"></div>
                    Memproses tes API Telegram...
                  </>
                ) : (
                  <>
                    <Send size={11} className="text-amber-500" />
                    Kirim Paket Tes Notifikasi
                  </>
                )}
              </button>

              {testingStatus !== 'IDLE' && (
                <div className={`p-3 rounded-sm text-xs border ${
                  testingStatus === 'SUCCESS' 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                    : 'bg-rose-500/10 text-rose-455 border-rose-500/20'
                }`}>
                  <p className="font-bold uppercase tracking-wide text-[9px] font-mono mb-1">
                    {testingStatus === 'SUCCESS' ? '🟢 BERHASIL' : '🔴 GAGAL KONEKSI'}
                  </p>
                  <p className="font-sans text-[11px]">{testResultMsg}</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Kolom Kanan: Webhook Console Logs */}
        <div className="bg-[#111319] border border-white/10 rounded-sm p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3 flex-grow">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest font-mono flex items-center gap-1.5">
                <Terminal size={13} className="text-amber-500" />
                3. Terminal Log Jurnal Notifikasi Cloud
              </h3>
              <button
                type="button"
                onClick={onRefreshLogs}
                className="p-1 hover:bg-black/30 text-white/40 hover:text-white rounded-sm border border-transparent hover:border-white/15 transition-colors"
                title="Refresh Logs"
              >
                <RefreshCcw size={12} className="animate-hover-spin text-amber-500" />
              </button>
            </div>

            <div className="bg-black/40 p-4 rounded-sm border border-white/5 h-[380px] overflow-y-auto font-mono text-[11px] space-y-3.5 scrollbar-thin">
              {logs.length === 0 ? (
                <div className="text-white/30 text-center py-20 select-none font-mono">
                  [SISTEM] Belum ada notifikasi yang dipancarkan.
                </div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="border-b border-white/5 pb-2.5 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-white/40">
                        ⏱️ {new Date(log.timestamp).toLocaleTimeString('id-UID')}
                      </span>
                      <span className={`px-1.5 py-0.2 rounded-sm text-[9px] uppercase font-bold tracking-wide ${
                        log.tipe === 'Success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' :
                        log.tipe === 'Simulated' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/25' :
                        'bg-rose-500/10 text-rose-455 border-rose-550/25'
                      }`}>
                        {log.tipe}
                      </span>
                    </div>
                    <p className="text-white/80 text-[11px] text-justify font-sans leading-relaxed">
                      {log.pesan}
                    </p>
                    <p className="text-white/30 text-[9px] truncate leading-none pt-0.5 font-mono">
                      Endpoint: {log.detailEndpoint || 'system:event'}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-black/20 p-4 rounded-sm border border-white/5 flex gap-2.5 pt-3 mt-4 text-[10px] text-white/40 font-sans">
            <Info size={14} className="text-amber-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white/60 font-medium font-sans">Skema Otomatisasi n8n:</strong> Dalam arsitektur cloud n8n, webhook url didaftarkan untuk mendengarkan perubahan data pesanan, menyalurkan trigger webhook REST, dan meneruskannya ke Telegram Bot secara otomatis.
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
