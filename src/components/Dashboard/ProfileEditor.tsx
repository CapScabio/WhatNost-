'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { publishProfile, NostrProfile } from '@/lib/nostr';
import { Save, User, Image as ImageIcon, Link2, Zap, Palette, CheckCircle2 } from 'lucide-react';

export default function ProfileEditor() {
  const { profile, setUser, user } = useAuthStore();
  const [formData, setFormData] = useState<Partial<NostrProfile>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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

  if (!profile) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* Columna Izquierda: Editor (Bento Box) */}
      <div className="lg:col-span-7 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-lc-border">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Palette className="text-lc-green w-6 h-6" /> Tu Bento Box
            </h2>
            <p className="text-gray-400 text-sm mt-1">Personaliza tu identidad en Nostr.</p>
          </div>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg text-lc-black
              ${saved ? 'bg-green-500 text-white' : 'bg-lc-green hover:bg-lc-green/80'}
            `}
          >
            {isSaving ? (
              <span className="w-5 h-5 border-2 border-lc-black/30 border-t-lc-black rounded-full animate-spin" />
            ) : saved ? (
              <CheckCircle2 className="w-5 h-5 text-white" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {saved ? 'Guardado' : 'Publicar'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Box: Nombres */}
          <div className="bg-lc-dark border border-lc-border rounded-2xl p-5 space-y-4 shadow-xl">
            <h3 className="text-white font-semibold flex items-center gap-2"><User className="w-4 h-4 text-gray-400"/> Identidad</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Display Name (Tu nombre visible)</label>
                <input name="displayName" value={formData.displayName || ''} onChange={handleChange} className="w-full bg-lc-black border border-lc-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-lc-green transition-colors" placeholder="Satoshi Nakamoto" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Username (Identificador @)</label>
                <input name="name" value={formData.name || ''} onChange={handleChange} className="w-full bg-lc-black border border-lc-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-lc-green transition-colors" placeholder="satoshi" />
              </div>
            </div>
          </div>

          {/* Box: Media */}
          <div className="bg-lc-dark border border-lc-border rounded-2xl p-5 space-y-4 shadow-xl">
            <h3 className="text-white font-semibold flex items-center gap-2"><ImageIcon className="w-4 h-4 text-gray-400"/> Imágenes (URLs)</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Avatar URL</label>
                <input name="picture" value={formData.picture || ''} onChange={handleChange} className="w-full bg-lc-black border border-lc-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-lc-green transition-colors" placeholder="https://..." />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Banner URL</label>
                <input name="banner" value={formData.banner || ''} onChange={handleChange} className="w-full bg-lc-black border border-lc-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-lc-green transition-colors" placeholder="https://..." />
              </div>
            </div>
          </div>

          {/* Box: Bio (Span 2) */}
          <div className="bg-lc-dark border border-lc-border rounded-2xl p-5 space-y-4 md:col-span-2 shadow-xl">
            <h3 className="text-white font-semibold flex items-center gap-2">Biografía</h3>
            <textarea name="about" value={formData.about || ''} onChange={handleChange} rows={3} className="w-full bg-lc-black border border-lc-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-lc-green transition-colors resize-none" placeholder="Cuentale al mundo quién eres..." />
          </div>

          {/* Box: Links & Lightning (Span 2) */}
          <div className="bg-lc-dark border border-lc-border rounded-2xl p-5 md:col-span-2 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h3 className="text-white font-semibold flex items-center gap-2"><Link2 className="w-4 h-4 text-gray-400"/> Website / Enlace</h3>
                <input name="website" value={formData.website || ''} onChange={handleChange} className="w-full bg-lc-black border border-lc-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-lc-green transition-colors" placeholder="https://mi-sitio.com" />
              </div>
              <div className="space-y-3">
                <h3 className="text-white font-semibold flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-500"/> Lightning Address (Wallet)</h3>
                <input name="lud16" value={formData.lud16 || ''} onChange={handleChange} className="w-full bg-lc-black border border-lc-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500/50 transition-colors" placeholder="satoshi@getalby.com" />
              </div>
            </div>
          </div>

          {/* Box: NIP-05 Verification (Span 2) */}
          <div className="bg-lc-black border border-lc-border rounded-2xl p-5 md:col-span-2 shadow-xl">
            <h3 className="text-white font-semibold flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-lc-green"/> Identidad Verificada (NIP-05)
            </h3>
            <input 
              name="nip05" 
              value={formData.nip05 || ''} 
              onChange={handleChange} 
              className="w-full bg-lc-dark border border-lc-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-lc-green transition-colors" 
              placeholder="satoshi@dominio.com" 
            />
            <p className="text-xs text-gray-500 mt-2">Introduce tu NIP-05 si ya posees uno registrado en algún dominio.</p>
          </div>

        </div>
      </div>

      {/* Columna Derecha: Preview Live */}
      <div className="lg:col-span-5 sticky top-24">
        <h2 className="text-sm uppercase tracking-wider text-gray-500 font-bold mb-4 px-2">Live Preview</h2>
        
        {/* Contenedor del celular preview */}
        <div className="bg-lc-black border-[6px] border-lc-dark rounded-[2.5rem] overflow-hidden w-full max-w-[380px] mx-auto shadow-2xl relative">
          {/* Top Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-lc-dark rounded-b-xl z-10 block"></div>
          
          <div className="h-[750px] overflow-y-auto bg-lc-black relative scrollbar-none">
            {/* Banner preview */}
            <div className="h-32 bg-lc-dark relative">
              {formData.banner && <img src={formData.banner} className="w-full h-full object-cover" alt="banner" />}
            </div>
            
            {/* Contenido Preview */}
            <div className="px-5 pb-8 relative -mt-12">
              <div className="w-24 h-24 rounded-full border-4 border-lc-black bg-lc-dark overflow-hidden shadow-lg">
                {formData.picture ? (
                  <img src={formData.picture} className="w-full h-full object-cover" alt="avatar" />
                ) : (
                  <div className="w-full h-full bg-lc-border flex items-center justify-center text-lc-green text-3xl font-bold">
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
                    <a href={formData.website} className="flex items-center gap-2 text-xs text-lc-muted bg-lc-dark py-2 px-3 rounded-lg border border-lc-border">
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

    </div>
  );
}
