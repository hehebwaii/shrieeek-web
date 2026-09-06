"use client";

import React, { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Copy, Check, QrCode, Maximize2, X, Sparkles } from "lucide-react";

interface QRCodeDisplayProps {
  qrToken: string;
  manualCode: string;
  displayName: string;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  qrToken,
  manualCode,
  displayName,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const modalCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [fullscreenModal, setFullscreenModal] = useState(false);

  const drawQR = (canvas: HTMLCanvasElement | null, size: number) => {
    if (canvas && qrToken) {
      QRCode.toCanvas(
        canvas,
        qrToken,
        {
          width: size,
          margin: 1,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
          errorCorrectionLevel: "H",
        },
        (error) => {
          if (error) console.error("QR Code generation error:", error);
        }
      );
    }
  };

  useEffect(() => {
    drawQR(canvasRef.current, 190);
  }, [qrToken]);

  useEffect(() => {
    if (fullscreenModal) {
      setTimeout(() => drawQR(modalCanvasRef.current, 280), 50);
    }
  }, [fullscreenModal, qrToken]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(manualCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="flex flex-col items-center bg-[#181818] border-2 border-[#2C2C2C] p-4 rounded-xl shadow-xl w-full">
      <div className="flex items-center justify-between w-full mb-3 px-1">
        <div className="flex items-center gap-1.5">
          <QrCode className="w-4 h-4 text-brand-yellow" />
          <span className="text-xs font-bold uppercase tracking-wider text-brand-muted">
            Permanent Identity QR
          </span>
        </div>
        <button
          onClick={() => setFullscreenModal(true)}
          type="button"
          className="flex items-center gap-1 text-[11px] text-brand-yellow hover:underline font-mono"
        >
          <Maximize2 className="w-3 h-3" /> Expand
        </button>
      </div>

      {/* QR Code Canvas container */}
      <div
        onClick={() => setFullscreenModal(true)}
        className="p-2.5 bg-white rounded-xl border-3 border-brand-yellow shadow-comic-yellow mb-3 cursor-pointer hover:scale-102 transition-transform active:scale-98 relative group"
        title="Tap to enlarge for fast camera scanning"
      >
        <canvas ref={canvasRef} className="block w-[180px] h-[180px]" />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg transition-opacity text-white text-[11px] font-bold uppercase">
          Tap to Enlarge
        </div>
      </div>

      {/* Manual Code Fallback */}
      <div className="w-full mt-1 flex flex-col items-center">
        <div className="text-[11px] text-[#8e9192] uppercase font-semibold mb-1">
          Manual Backup Code
        </div>
        <button
          onClick={handleCopyCode}
          type="button"
          className="flex items-center justify-between gap-2 w-full max-w-[220px] px-3 py-1.5 bg-[#121212] border border-[#3A3A3A] hover:border-brand-yellow rounded-md text-sm font-mono text-brand-white transition-all active:scale-95 shadow-sm"
        >
          <span className="tracking-widest font-bold text-brand-yellow text-sm">
            {manualCode}
          </span>
          <span className="flex items-center text-xs text-brand-muted hover:text-white">
            {copied ? (
              <span className="flex items-center text-green-400 gap-1 text-[11px]">
                <Check className="w-3.5 h-3.5" /> Copied
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px]">
                <Copy className="w-3.5 h-3.5" /> Copy
              </span>
            )}
          </span>
        </button>
      </div>

      {/* Fullscreen High-Contrast Modal for Dark/Poor Lighting Venues */}
      {fullscreenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm bg-[#181818] border-3 border-brand-yellow p-6 rounded-3xl shadow-[0_0_50px_rgba(243,240,0,0.3)] text-center relative animate-comic-pop">
            <button
              onClick={() => setFullscreenModal(false)}
              className="absolute top-4 right-4 p-2 bg-[#252525] hover:bg-[#333333] text-brand-white rounded-full transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-xs font-mono uppercase tracking-widest text-brand-yellow font-black mb-1">
              FULLSCREEN BRIGHT SCAN
            </div>
            <h3 className="font-comic text-2xl text-white uppercase mb-4 truncate">
              {displayName}
            </h3>

            {/* High Contrast White Container */}
            <div className="p-4 bg-white rounded-2xl border-4 border-brand-yellow shadow-comic-yellow inline-block mb-4">
              <canvas ref={modalCanvasRef} className="block w-[260px] h-[260px]" />
            </div>

            <div className="bg-[#121212] border border-[#333333] p-2.5 rounded-xl text-center">
              <span className="text-[10px] text-brand-muted uppercase font-bold block mb-0.5">
                Manual Backup Code
              </span>
              <span className="font-mono text-xl font-bold tracking-widest text-brand-yellow">
                {manualCode}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
