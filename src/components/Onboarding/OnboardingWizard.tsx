import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, ShieldAlert, ArrowRight, CheckCircle2, Download, Copy, AlertTriangle } from 'lucide-react';
import { generateIdentity, loginWithNsec } from '@/lib/nostr';
import { useAuthStore } from '@/store/auth';
import { useNavStore } from '@/store/nav';

export default function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const [keys, setKeys] = useState<{ nsec: string; npub: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [hasConfirmedBackup, setHasConfirmedBackup] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const { setUser, setError } = useAuthStore();
  const { setActiveSection } = useNavStore();

  const handleGenerate = () => {
    try {
      const newKeys = generateIdentity();
      setKeys(newKeys);
      setStep(1);
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
      setActiveSection('profile');
    } catch (err: any) {
      setError(err.message || "Error logging in");
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-12 p-6">
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="step0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex flex-col items-center justify-center space-y-8 py-12"
          >
            <div className="w-20 h-20 bg-lc-purple/20 rounded-full flex items-center justify-center border border-lc-purple/50">
              <Key className="w-10 h-10 text-lc-purple" />
            </div>
            
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-lc-purple to-pink-500">
                Bienvenido a <span className="font-black text-white ml-2">WhatNost?</span>
              </h1>
              <p className="text-lg text-gray-400 max-w-md mx-auto">
                Inicia en la red social que no censura en 2 simples pasos. Ni correos, ni contraseñas.
              </p>
            </div>

            <button 
              onClick={handleGenerate}
              className="px-8 py-4 bg-lc-purple hover:bg-lc-purple/90 text-white rounded-xl font-bold text-lg transition-all flex items-center gap-3 shadow-[0_0_20px_rgba(102,51,255,0.4)]"
            >
              Generar mi Identidad <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {step === 1 && keys && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex flex-col items-center justify-center space-y-8"
          >
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-yellow-500 mb-4">
                <AlertTriangle className="w-8 h-8" />
                <h2 className="text-2xl font-bold text-white">¡ATENCIÓN! Guarda tu NSEC</h2>
              </div>
              <p className="text-gray-400 max-w-lg">
                Tu <b>nsec</b> es como la llave de tu caja fuerte. Si la pierdes, perderás tu cuenta para siempre. Si alguien más la ve, podrá controlar tu cuenta. <b>Nosotros no la guardamos.</b>
              </p>
            </div>

            <div className="w-full bg-black/50 border border-red-500/30 rounded-xl p-6 flex flex-col items-center gap-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500"></div>
              
              <div className="text-sm text-gray-500 font-mono">Tu Clave Privada (nsec)</div>
              
              <div className="bg-black/60 font-mono p-4 rounded-lg text-red-400 text-sm w-full text-center break-all select-all border border-black/50">
                {keys.nsec}
              </div>

              <div className="flex w-full gap-3 mt-2">
                <button 
                  onClick={copyToClipboard}
                  className="flex-1 flex justify-center items-center gap-2 bg-zinc-800 hover:bg-zinc-700 py-3 rounded-lg text-white transition-colors"
                >
                  {copied ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                  {copied ? '¡Copiado!' : 'Copiar Clave'}
                </button>
              </div>
            </div>

            <label className="flex items-start gap-4 p-4 border border-zinc-800 rounded-xl bg-zinc-900/50 cursor-pointer hover:bg-zinc-800/50 transition-colors w-full">
              <input 
                type="checkbox" 
                checked={hasConfirmedBackup}
                onChange={(e) => setHasConfirmedBackup(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-zinc-600 text-lc-purple focus:ring-lc-purple bg-black cursor-pointer"
              />
              <span className="text-gray-300 text-sm">
                Entiendo que si pierdo esta clave (nsec), pierdo mi cuenta. Confirmo que la he copiado a un lugar seguro (administrador de contraseñas u offline).
              </span>
            </label>

            <button 
              onClick={finishOnboarding}
              disabled={!hasConfirmedBackup || isLoggingIn}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3
                ${hasConfirmedBackup 
                  ? 'bg-gradient-to-r from-lc-purple to-pink-600 hover:from-lc-purple/90 hover:to-pink-600/90 text-white shadow-lg' 
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}
            >
              {isLoggingIn ? 'Iniciando sesión...' : 'Entrar al Dashboard'}
              {!isLoggingIn && <ArrowRight className="w-5 h-5" />}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
