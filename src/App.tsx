/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  EquipmentItem, 
  Order, 
  TelegramConfig, 
  NotifyLog 
} from './types';
import Dashboard from './components/Dashboard';
import CatalogBooking from './components/CatalogBooking';
import InventoryManager from './components/InventoryManager';
import OrdersManager from './components/OrdersManager';
import Integrations from './components/Integrations';
import AboutUs from './components/AboutUs';

import { 
  LayoutDashboard, 
  Video, 
  Layers, 
  Send, 
  Zap, 
  Info,
  Menu,
  X,
  Tv,
  Users
} from 'lucide-react';

export default function App() {
  // Global synchronized states
  const [inventory, setInventory] = useState<EquipmentItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [telegramConfig, setTelegramConfig] = useState<TelegramConfig>({ botToken: '', chatId: '', aktifkan: false });
  const [notificationLogs, setNotificationLogs] = useState<NotifyLog[]>([]);

  // Navigation state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // loading states
  const [loading, setLoading] = useState(true);

  // Load state from backend APIs
  const fetchAllData = async () => {
    try {
      const [invRes, ordRes, teleRes, logRes] = await Promise.all([
        fetch('/api/inventory'),
        fetch('/api/orders'),
        fetch('/api/telegram-config'),
        fetch('/api/notify-logs')
      ]);

      if (invRes.ok) setInventory(await invRes.json());
      if (ordRes.ok) setOrders(await ordRes.ok ? await ordRes.json() : []);
      if (teleRes.ok) setTelegramConfig(await teleRes.json());
      if (logRes.ok) setNotificationLogs(await logRes.json());
    } catch (error) {
      console.error("Gagal menyingkronkan data dengan server:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Operation 1: Save custom booking reservation
  const handleAddOrder = async (orderData: Partial<Order>): Promise<boolean> => {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        // Refresh states
        await fetchAllData();
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  };

  // Operation 2: Update database equipment detail
  const handleAddInventoryItem = async (itemData: Partial<EquipmentItem>): Promise<boolean> => {
    try {
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData)
      });

      if (response.ok) {
        await fetchAllData();
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  };

  const handleUpdateInventoryItem = async (id: string, updates: Partial<EquipmentItem>): Promise<boolean> => {
    try {
      const response = await fetch(`/api/inventory/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        await fetchAllData();
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  };

  const handleDeleteInventoryItem = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/inventory/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchAllData();
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  };

  // Operation 3: Update Order Booking Statuses
  const handleUpdateOrderStatus = async (id: string, status: 'Pending' | 'Disetujui' | 'Selesai' | 'Dibatalkan'): Promise<boolean> => {
    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        // Side-effect: If marked "Disetujui" or "Selesai", we also update item availability count
        await fetchAllData();
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  };

  const handleDeleteOrder = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchAllData();
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  };

  // Operation 4: Save Telegram parameters setup
  const handleSaveTelegramConfig = async (cfg: Partial<TelegramConfig>): Promise<boolean> => {
    try {
      const response = await fetch('/api/telegram-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cfg)
      });

      if (response.ok) {
        await fetchAllData();
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  };

  // Pull notification logs manually
  const refreshLogs = async () => {
    try {
      const res = await fetch('/api/notify-logs');
      if (res.ok) setNotificationLogs(await res.json());
    } catch (e) {
      console.error("Gagal mematangkan log:", e);
    }
  };

  const navItems = [
    { id: 'dashboard', name: 'Dashboard Admin', icon: LayoutDashboard },
    { id: 'booking', name: 'Jasa & Booking AI', icon: Video },
    { id: 'inventory', name: 'Alat & Inventori', icon: Layers },
    { id: 'orders', name: 'Pengelolaan Pesanan', icon: Send },
    { id: 'integrations', name: 'Integrasi Bot', icon: Zap },
    { id: 'about', name: 'About Us', icon: Info },
  ];

  return (
    <div className="min-h-screen bg-[#0A0B10] text-[#E2E8F0] font-sans flex flex-col md:flex-row antialiased select-none">
      
      {/* 1. LEFT SIDEBAR NAVIGATION PANEL (STATIC ON DESKTOP, COLLAPSIBLE ON MOBILE) */}
      <header className="md:w-64 bg-[#0A0B10] border-b md:border-b-0 md:border-r border-white/10 flex flex-col justify-between shrink-0 z-20">
        <div className="flex flex-col h-full">
          {/* Branding Top Header */}
          <div className="p-6 border-b border-white/10 flex flex-col">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h1 className="text-2xl font-serif italic font-bold tracking-tighter uppercase text-amber-500">
                  BEB Production
                </h1>
                <p className="text-[9px] tracking-[0.22em] font-semibold text-white/40 uppercase font-mono leading-none">
                  CLOUD INFRASTRUCTURE v1.0
                </p>
              </div>

              {/* Mobile burger button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-1.5 bg-white/5 border border-white/10 hover:border-white/20 rounded text-slate-350"
              >
                {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
              </button>
            </div>
          </div>

          <p className="text-[10px] uppercase tracking-[0.2em] text-white/45 px-6 pt-5 pb-2 font-mono">
            Main Console
          </p>

          {/* Nav List (Desktop View / Collapsed Mobile) */}
          <nav className={`flex-1 px-4 space-y-1.5 md:block ${mobileMenuOpen ? 'block' : 'hidden md:block'}`}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3.5 px-3 py-2 rounded-sm text-xs font-medium tracking-wider transition-all uppercase ${
                    isActive
                      ? 'border-l-2 border-amber-500 text-amber-500 bg-white/5'
                      : 'text-slate-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent'
                  }`}
                >
                  <Icon size={13} className={isActive ? 'text-amber-550' : 'text-slate-500'} />
                  <span className="font-sans font-medium text-[11px]">{item.name}</span>
                  {item.id === 'orders' && orders.filter(o => o.status === 'Pending').length > 0 && (
                    <span className="ml-auto bg-amber-550 text-slate-950 font-bold text-[9px] font-mono px-1.5 py-0.5 rounded-full">
                      {orders.filter(o => o.status === 'Pending').length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Brand Credit */}
        <div className={`p-6 border-t border-white/10 bg-black/20 text-[10px] text-white/40 space-y-2 md:block ${mobileMenuOpen ? 'block' : 'hidden md:block'}`}>
          <div className="flex flex-col gap-0.5 text-[10.5px] font-medium text-white/60">
            <span>Isnu Ardianto</span>
            <span className="opacity-75 font-mono text-[9px] font-normal">Cloud Computing</span>
          </div>
          <div className="text-[9px] opacity-50 space-y-0.5 leading-relaxed font-sans">
            <p>PCC - Triyono, S.Kom., M.Kom.</p>
            <p className="font-mono">CLASS_CODE: Cloud-UAS</p>
          </div>
        </div>
      </header>

      {/* 2. CHOSEN WORKSPACE WINDOW (SCROLLABLE STAGE) */}
      <main className="flex-1 overflow-y-auto max-w-7xl mx-auto p-6 md:p-10 w-full">
        {loading ? (
          <div className="h-[80vh] flex flex-col items-center justify-center space-y-3 select-none">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-500/30 border-t-amber-500"></div>
            <p className="text-xs font-mono text-amber-550 uppercase tracking-[0.25em] animate-pulse">Establishing Connected DB...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {activeTab === 'dashboard' && (
              <Dashboard 
                inventory={inventory} 
                orders={orders} 
                onNavigateToTab={(tab) => setActiveTab(tab)} 
              />
            )}
            
            {activeTab === 'booking' && (
              <CatalogBooking 
                inventory={inventory} 
                onAddOrder={handleAddOrder} 
              />
            )}

            {activeTab === 'inventory' && (
              <InventoryManager 
                inventory={inventory}
                onAddItem={handleAddInventoryItem}
                onUpdateItem={handleUpdateInventoryItem}
                onDeleteItem={handleDeleteInventoryItem}
              />
            )}

            {activeTab === 'orders' && (
              <OrdersManager
                orders={orders}
                inventory={inventory}
                onUpdateOrderStatus={handleUpdateOrderStatus}
                onDeleteOrder={handleDeleteOrder}
              />
            )}

            {activeTab === 'integrations' && (
              <Integrations 
                config={telegramConfig}
                logs={notificationLogs}
                onSaveConfig={handleSaveTelegramConfig}
                onRefreshLogs={refreshLogs}
              />
            )}

            {activeTab === 'about' && (
              <AboutUs />
            )}
          </div>
        )}
      </main>

    </div>
  );
}
