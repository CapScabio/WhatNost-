'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { publishProfile, NostrProfile } from '@/lib/nostr';
import { Save, User, Image as ImageIcon, Link2, Zap, Palette, CheckCircle2, ShoppingCart, QrCode } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProfileEditor() {
  const { profile, setUser, user } = useAuthStore();
  const [formData, setFormData] = useState<Partial<NostrProfile>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showNipMarket, setShowNipMarket] = useState(false);
  const [marketplaceStep, setMarketplaceStep] = useState(0);
  const [desiredNip, setDesiredNip] = useState('');

  // Sincronizar formData con profile cuando carga
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        displayName: profile.displayName || '',
        about: profile.about || '',
        picture: profile.picture || '',
        banner: profile.banner || '',
        nip05: profile.nip05 || '',
        lud16: profile.lud16 || '',
        website: profile.website || '',
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Usaremos profile.pubkey etc, pero validemos primero
      if (!user) throw new Error("No user found");
      const updatedProfile = { ...profile, ...formData } as NostrProfile;
      await publishProfile(updatedProfile);
      
      // Update local store (mutating auth store) - in real life we'd refetch or just update the object
      setUser(user, useAuthStore.getState().loginMethod);
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Error al guardar el perfil. Revisa tus relays.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBuyNIP = () => {
    if (!desiredNip) return;
    setMarketplaceStep(1);
    // Simular generacion de factura
    setTimeout(() => {
      setMarketplaceStep(2);
    }, 1500);
  };

  const simulatePayment = () => {
    setMarketplaceStep(3);
    setTimeout(() => {
      // Simular actualizacion exitosa
      setFormData(prev => ({...prev, nip05: `${desiredNip}@whatnost.com`}));
      setShowNipMarket(false);
      setMarketplaceStep(0);
    }, 2000);
  };

  if (!profile) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* Columna Izquierda: Editor (Bento Box) */}
      <div className="lg:col-span-7 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-lc-border">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Palette className="text-lc-purple w-6 h-6" /> Tu Bento Box
            </h2>
            <p className="text-gray-400 text-sm mt-1">Personaliza tu identidad en Nostr.</p>
          </div>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white transition-all shadow-lg
              ${saved ? 'bg-green-500' : 'bg-lc-purple hover:bg-lc-purple/80'}
            `}
          >
            {isSaving ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : saved ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {saved ? 'Guardado' : 'Publicar'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Box: Nombres */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <h3 className="text-white font-semibold flex items-center gap-2"><User className="w-4 h-4 text-gray-400"/> Identidad</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Display Name (Tu nombre visible)</label>
                <input name="displayName" value={formData.displayName || ''} onChange={handleChange} className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-lc-purple" placeholder="Satoshi Nakamoto" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Username (Identificador @)</label>
                <input name="name" value={formData.name || ''} onChange={handleChange} className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-lc-purple" placeholder="satoshi" />
              </div>
            </div>
          </div>

          {/* Box: Media */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <h3 className="text-white font-semibold flex items-center gap-2"><ImageIcon className="w-4 h-4 text-gray-400"/> Imágenes (URLs)</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Avatar URL</label>
                <input name="picture" value={formData.picture || ''} onChange={handleChange} className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-lc-purple" placeholder="https://..." />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Banner URL</label>
                <input name="banner" value={formData.banner || ''} onChange={handleChange} className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-lc-purple" placeholder="https://..." />
              </div>
            </div>
          </div>

          {/* Box: Bio (Span 2) */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4 md:col-span-2 shadow-xl">
            <h3 className="text-white font-semibold flex items-center gap-2">Biografía</h3>
            <textarea name="about" value={formData.about || ''} onChange={handleChange} rows={3} className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-lc-purple resize-none" placeholder="Cuentale al mundo quién eres..." />
          </div>

          {/* Box: Links & Lightning (Span 2) */}
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-900 border border-zinc-800 rounded-2xl p-5 md:col-span-2 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h3 className="text-white font-semibold flex items-center gap-2"><Link2 className="w-4 h-4 text-gray-400"/> Website / Enlace</h3>
                <input name="website" value={formData.website || ''} onChange={handleChange} className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-lc-purple" placeholder="https://mi-sitio.com" />
              </div>
              <div className="space-y-3">
                <h3 className="text-white font-semibold flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-500"/> Lightning Address</h3>
                <input name="lud16" value={formData.lud16 || ''} onChange={handleChange} className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500/50" placeholder="satoshi@getalby.com" />
              </div>
            </div>
          </div>

          {/* Box: NIP-05 Marketplace Cta (Span 2) */}
          <div className="bg-gradient-to-r from-lc-purple/20 to-pink-500/20 border border-lc-purple/30 rounded-2xl p-5 md:col-span-2 flex items-center justify-between shadow-xl">
            <div>
              <h3 className="text-white font-bold flex items-center gap-2 text-lg">
                <CheckCircle2 className="w-5 h-5 text-pink-400"/> Identidad Verificada (NIP-05)
              </h3>
              <p className="text-sm text-gray-300 mt-1 max-w-sm">No dependas de claves raras. Obtén tu dirección <b>nombre@whatnost.com</b> y aparece como verificado en toda la red.</p>
            </div>
            <button 
              onClick={() => setShowNipMarket(true)}
              className="bg-white text-lc-purple px-5 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-100 transition shadow-lg"
            >
              <ShoppingCart className="w-4 h-4" /> Comprar NIP05
            </button>
          </div>

        </div>
      </div>

      {/* Columna Derecha: Preview Live */}
      <div className="lg:col-span-5 sticky top-24">
        <h2 className="text-sm uppercase tracking-wider text-gray-500 font-bold mb-4 px-2">Live Preview</h2>
        
        {/* Contenedor del celular preview */}
        <div className="bg-black border-[6px] border-zinc-800 rounded-[2.5rem] overflow-hidden w-full max-w-[380px] mx-auto shadow-2xl relative">
          {/* Top Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-800 rounded-b-xl z-10 block"></div>
          
          <div className="h-[750px] overflow-y-auto bg-lc-black relative scrollbar-none">
            {/* Banner preview */}
            <div className="h-32 bg-zinc-800 relative">
              {formData.banner && <img src={formData.banner} className="w-full h-full object-cover" alt="banner" />}
            </div>
            
            {/* Contenido Preview */}
            <div className="px-5 pb-8 relative -mt-12">
              <div className="w-24 h-24 rounded-full border-4 border-black bg-zinc-800 overflow-hidden shadow-lg">
                {formData.picture ? (
                  <img src={formData.picture} className="w-full h-full object-cover" alt="avatar" />
                ) : (
                  <div className="w-full h-full bg-lc-olive flex items-center justify-center text-lc-green text-3xl font-bold">
                    {(formData.displayName || formData.name || 'A')[0].toUpperCase()}
                  </div>
                )}
              </div>

              <div className="mt-3">
                <h1 className="text-xl font-bold text-white leading-tight">{formData.displayName || 'Anon'}</h1>
                <p className="text-gray-400 text-sm">@{formData.name || 'anon'}</p>
                {formData.nip05 && (
                  <p className="text-lc-green text-xs mt-1 flex items-center gap-1 font-mono">
                    <CheckCircle2 className="w-3 h-3" /> {formData.nip05}
                  </p>
                )}
              </div>

              <div className="mt-4 text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                {formData.about || 'Sin biografía aún.'}
              </div>

              {(formData.website || formData.lud16) && (
                <div className="mt-4 space-y-2">
                  {formData.website && (
                    <a href={formData.website} className="flex items-center gap-2 text-xs text-lc-muted bg-white/5 py-2 px-3 rounded-lg border border-white/10">
                      <Link2 className="w-4 h-4" /> {formData.website}
                    </a>
                  )}
                  {formData.lud16 && (
                    <div className="flex items-center gap-2 text-xs text-yellow-500 bg-yellow-500/10 py-2 px-3 rounded-lg border border-yellow-500/20">
                      <Zap className="w-4 h-4" /> {formData.lud16}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Marketplace NIP05 Simulado */}
      {showNipMarket && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 relative shadow-2xl"
          >
            <button onClick={() => setShowNipMarket(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white">&times;</button>
            <h2 className="text-2xl font-bold text-white mb-6">WhatNost Market</h2>

            {marketplaceStep === 0 && (
              <div className="space-y-4">
                <p className="text-gray-400 text-sm">Elige tu nombre de usuario único y paga con Lightning Network (Simulado para Hackathon).</p>
                
                <div className="flex items-center gap-2 bg-black border border-zinc-700 rounded-xl px-3 py-3 focus-within:border-lc-purple transition-colors">
                  <input 
                    value={desiredNip} 
                    onChange={e => setDesiredNip(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    className="bg-transparent text-white focus:outline-none flex-1 text-right placeholder-gray-600" 
                    placeholder="satoshi"
                  />
                  <span className="text-gray-500 font-mono">@whatnost.com</span>
                </div>
                
                <button 
                  onClick={handleBuyNIP}
                  disabled={desiredNip.length < 3}
                  className="w-full bg-lc-purple text-white py-3 rounded-xl font-bold mt-4 disabled:opacity-50"
                >
                  Continuar - 2,000 Sats
                </button>
              </div>
            )}

            {marketplaceStep === 1 && (
              <div className="text-center py-8 space-y-4">
                <span className="w-8 h-8 border-4 border-lc-purple border-t-transparent rounded-full animate-spin mx-auto block"></span>
                <p className="text-white">Generando factura Lightning...</p>
              </div>
            )}

            {marketplaceStep === 2 && (
              <div className="text-center space-y-6 flex flex-col items-center">
                <p className="text-white">Escanea la factura o haz clic 👇</p>
                <div className="bg-white p-4 rounded-xl inline-block cursor-pointer" onClick={simulatePayment}>
                  <QrCode className="w-48 h-48 text-black" />
                </div>
                <div className="bg-black/50 border border-zinc-800 p-3 rounded-lg text-xs font-mono text-gray-400 break-all pointer-events-none opacity-60">
                  lnbc20u1p3qxzxxxxxxxxdq8xuqsqsp5x89a... (Click al QR para simular pago)
                </div>
              </div>
            )}

            {marketplaceStep === 3 && (
              <div className="text-center py-8 space-y-4">
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
                <h3 className="text-xl font-bold text-white">¡Pago Recibido!</h3>
                <p className="text-gray-400">Tu identidad ha sido verificada con NIP-05.</p>
              </div>
            )}

          </motion.div>
        </div>
      )}

    </div>
  );
}
