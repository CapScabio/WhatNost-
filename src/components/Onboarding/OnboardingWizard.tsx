import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, ArrowRight, CheckCircle2, Copy, AlertTriangle, RefreshCw, User, Image as ImageIcon, AtSign, ShieldAlert } from 'lucide-react';
import { generateIdentity, loginWithNsec, publishProfile, publishFollows } from '@/lib/nostr';
import { useAuthStore } from '@/store/auth';
import { useNavStore } from '@/store/nav';

// Cuentas locales recomendadas (ejemplo ecosistema)
const SUGGESTED_FOLLOWS = [
  { name: 'Hodl', npub: 'npub180cvv07tjdrrgpa0j7j7tmnyl2yr6yr7l8j4s3evf6u64th6gkwsyjh6w6', pubkey: '3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d', about: 'Creator of Nostr' },
  { name: 'La Crypta', npub: 'npub1lacrypta... (La Crypta Oficial)', pubkey: '3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d', about: 'Comunidad Hacker' }
];

const EDUCATIONAL_SLIDES = [
  {
    title: "Bienvenido a WhatNost",
    desc: "Imagina un Twitter donde nadie puede banearte ni borrar tus publicaciones. Eso es Nostr.",
    icon: <AtSign className="w-12 h-12 text-lc-green" />
  },
  {
    title: "Sin Emails, Sin Contraseñas",
    desc: "Aquí no te registras. Eres dueño de una 'Llave Maestra' criptográfica que te da acceso universal.",
    icon: <ShieldAlert className="w-12 h-12 text-lc-green" />
  },
  {
    title: "Tu Perfil, Tus Reglas",
    desc: "Crea tu perfil ahora y úsalo en cualquier otra app del ecosistema Nostr. Empecemos.",
    icon: <User className="w-12 h-12 text-lc-green" />
  }
];

export default function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const [slide, setSlide] = useState(0);
  
  // Profile Data
  const [profile, setProfile] = useState({ name: '', about: '', picture: '' });
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);

  // Key Data
  const [keys, setKeys] = useState<{ nsec: string; npub: string; privkey: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [hasConfirmedBackup, setHasConfirmedBackup] = useState(false);
  
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { setUser, setError } = useAuthStore();
  const { setActiveSection } = useNavStore();

  // Generate random avatar on load
  useEffect(() => {
    generateRandomAvatar();
  }, []);

  const generateRandomAvatar = () => {
    setIsGeneratingAvatar(true);
    const seed = Math.random().toString(36).substring(7);
    const url = `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}&backgroundColor=0a0a0a`;
    setProfile(prev => ({ ...prev, picture: url }));
    setTimeout(() => setIsGeneratingAvatar(false), 500);
  };

  const nextSlide = () => {
    if (slide < EDUCATIONAL_SLIDES.length - 1) {
      setSlide(s => s + 1);
    } else {
      setStep(1); // Mover a perfil
    }
  };

  const handleCreateKeys = () => {
    try {
      const newKeys = generateIdentity();
      setKeys(newKeys);
      setStep(2);
    } catch (e) {
      console.error(e);
    }
  };

  const copyToClipboard = async () => {
    if (keys?.nsec) {
      await navigator.clipboard.writeText(keys.nsec);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const finishOnboarding = async () => {
    if (!keys?.nsec) return;
    setIsLoggingIn(true);
    try {
      const user = await loginWithNsec(keys.nsec);
      setUser(user, 'nsec');

      // Publish profile and auto-follows silently
      if (profile.name) {
        publishProfile({
          pubkey: user.pubkey,
          npub: user.npub,
          name: profile.name,
          about: profile.about,
          picture: profile.picture
        });
      }
      publishFollows(SUGGESTED_FOLLOWS.map(f => f.pubkey));

      setActiveSection('profile');
    } catch (err: any) {
      setError(err.message || "Error logging in");
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto mt-12 p-6">
      <AnimatePresence mode="wait">
        
        {/* STEP 0: EDUCATIONAL SLIDES */}
        {step === 0 && (
          <motion.div
            key="step0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex flex-col items-center text-center space-y-8 bg-lc-dark border border-lc-border p-8 rounded-2xl lc-glow"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={slide}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col items-center space-y-6"
              >
                <div className="w-24 h-24 bg-lc-green/10 rounded-full flex items-center justify-center border border-lc-green/30">
                  {EDUCATIONAL_SLIDES[slide].icon}
                </div>
                <h2 className="text-3xl font-bold text-white">{EDUCATIONAL_SLIDES[slide].title}</h2>
                <p className="text-lc-muted text-lg">{EDUCATIONAL_SLIDES[slide].desc}</p>
              </motion.div>
            </AnimatePresence>

            <div className="flex gap-2">
              {EDUCATIONAL_SLIDES.map((_, i) => (
                <div key={i} className={`w-3 h-3 rounded-full transition-colors ${i === slide ? 'bg-lc-green' : 'bg-lc-border'}`} />
              ))}
            </div>

            <button 
              onClick={nextSlide}
              className="w-full py-4 bg-lc-green hover:bg-lc-green/90 text-lc-black rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3"
            >
              {slide === EDUCATIONAL_SLIDES.length - 1 ? 'Crear mi Identidad' : 'Siguiente'} <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {/* STEP 1: PROFILE SETUP */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex flex-col space-y-6 bg-lc-dark border border-lc-border p-8 rounded-2xl lc-glow"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Configura tu Personaje</h2>
              <p className="text-lc-muted">Nadie sabrá quién eres, a menos que se lo digas.</p>
            </div>

            <div className="flex justify-center">
              <div className="relative group">
                <img 
                  src={profile.picture} 
                  alt="Avatar" 
                  className={`w-32 h-32 rounded-full border-4 border-lc-green/30 bg-lc-black object-cover ${isGeneratingAvatar ? 'opacity-50' : 'opacity-100'} transition-opacity`}
                />
                <button 
                  onClick={generateRandomAvatar}
                  title="Generar otro avatar"
                  className="absolute bottom-0 right-0 p-3 bg-lc-green hover:bg-lc-green/90 text-lc-black rounded-full shadow-lg transition-transform hover:scale-110"
                >
                  <RefreshCw className={`w-5 h-5 ${isGeneratingAvatar ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-lc-muted mb-1 block">¿Cómo te llamamos?</label>
                <input 
                  type="text" 
                  placeholder="Ej. Nakamoto"
                  value={profile.name}
                  onChange={e => setProfile({...profile, name: e.target.value})}
                  className="w-full bg-lc-black border border-lc-border text-white px-4 py-3 rounded-lg focus:outline-none focus:border-lc-green transition-colors"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-lc-muted mb-1 block">Una frase sobre ti</label>
                <input 
                  type="text" 
                  placeholder="Descubriendo la madriguera del conejo..."
                  value={profile.about}
                  onChange={e => setProfile({...profile, about: e.target.value})}
                  className="w-full bg-lc-black border border-lc-border text-white px-4 py-3 rounded-lg focus:outline-none focus:border-lc-green transition-colors"
                />
              </div>
            </div>

            <button 
              onClick={handleCreateKeys}
              disabled={!profile.name.trim()}
              className="w-full py-4 bg-lc-green disabled:opacity-50 disabled:cursor-not-allowed hover:bg-lc-green/90 text-lc-black rounded-xl font-bold text-lg transition-all"
            >
              Continuar
            </button>
          </motion.div>
        )}

        {/* STEP 2: KEY BACKUP */}
        {step === 2 && keys && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex flex-col items-center justify-center space-y-6 bg-lc-dark border border-amber-500/30 p-8 rounded-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-yellow-500"></div>

            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-yellow-500 mb-2">
                <AlertTriangle className="w-8 h-8" />
                <h2 className="text-2xl font-bold text-white">Tu Llave Maestra</h2>
              </div>
              <p className="text-lc-muted">
                Esta es tu identidad. Si la pierdes, no hay botón de "olvidé mi contraseña". Copíala y guárdala ahora.
              </p>
            </div>

            <div className="w-full bg-lc-black border border-lc-border rounded-xl p-4 flex flex-col items-center gap-4">
              <div className="text-xs text-lc-muted font-mono uppercase tracking-widest">NSEC (Clave Privada)</div>
              <div className="bg-lc-dark font-mono p-4 rounded-lg text-amber-400 text-sm w-full text-center break-all select-all border border-lc-border">
                {keys.nsec}
              </div>

              <button 
                onClick={copyToClipboard}
                className="w-full flex justify-center items-center gap-2 bg-lc-border hover:bg-lc-muted/20 py-3 rounded-lg text-white transition-colors"
              >
                {copied ? <CheckCircle2 className="w-5 h-5 text-lc-green" /> : <Copy className="w-5 h-5" />}
                {copied ? '¡Copiado al portapapeles!' : 'Copiar mi Llave'}
              </button>
            </div>

            <label className="flex items-start gap-3 p-4 border border-lc-border rounded-xl bg-lc-black/50 cursor-pointer hover:bg-lc-border w-full transition-colors">
              <input 
                type="checkbox" 
                checked={hasConfirmedBackup}
                onChange={(e) => setHasConfirmedBackup(e.target.checked)}
                className="mt-1 w-5 h-5 rounded bg-lc-black border-lc-border text-lc-green focus:ring-lc-green focus:ring-offset-lc-dark cursor-pointer"
              />
              <span className="text-white text-sm">
                Confirmo que he copiado mi Llave Maestra en un lugar seguro. Entiendo que Nostr no puede recuperarla por mí.
              </span>
            </label>

            <button 
              onClick={() => setStep(3)}
              disabled={!hasConfirmedBackup}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3
                ${hasConfirmedBackup 
                  ? 'bg-lc-green hover:bg-lc-green/90 text-lc-black shadow-[0_0_15px_rgba(180,249,83,0.3)]' 
                  : 'bg-lc-border text-lc-muted cursor-not-allowed'}`}
            >
              Ya la guardé <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {/* STEP 3: COMMUNITY / AUTO-FOLLOW */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center space-y-6 bg-lc-dark border border-lc-border p-8 rounded-2xl lc-glow"
          >
            <div className="w-20 h-20 bg-lc-green/10 rounded-full flex items-center justify-center border border-lc-green/30">
              <User className="w-10 h-10 text-lc-green" />
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">¡No empieces solo!</h2>
              <p className="text-lc-muted">
                Te hemos preparado tu primera red de contactos para que tu inicio no esté vacío.
              </p>
            </div>

            <div className="w-full bg-lc-black border border-lc-border rounded-xl p-4 space-y-3">
              <div className="text-sm text-lc-muted mb-2 font-medium">Seguirás automáticamente a:</div>
              {SUGGESTED_FOLLOWS.map((f, i) => (
                <div key={i} className="flex items-center gap-3 p-2 bg-lc-dark rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-lc-border flex items-center justify-center text-xl">👾</div>
                  <div>
                    <div className="text-white font-bold text-sm">{f.name}</div>
                    <div className="text-lc-muted text-xs truncate w-48">{f.about}</div>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={finishOnboarding}
              disabled={isLoggingIn}
              className="w-full py-4 bg-lc-green hover:bg-lc-green/90 text-lc-black rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3"
            >
              {isLoggingIn ? (
                <>Conectando con la red... <RefreshCw className="w-5 h-5 animate-spin" /></>
              ) : (
                'Publicar perfil y Entrar'
              )}
            </button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
