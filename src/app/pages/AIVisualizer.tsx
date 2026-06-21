import React, { useState } from "react";
import { motion } from "motion/react";
import { Download, RotateCcw, ShoppingBag, Sparkles, Loader2 } from "lucide-react";

// ─────────────────────────────── DATA ──────────────────────────────────────

const SHAPES = [
  {
    id: "round",
    name: "Silencer Bulat",
    sub: "Classic Round",
    desc: "Universal — cocok semua motor",
    badge: "POPULER",
    bc: "#f97316",
  },
  {
    id: "oval",
    name: "Silencer Oval",
    sub: "Oval Sport",
    desc: "Aliran optimal, tampilan sporty",
    badge: "SPORT",
    bc: "#3b82f6",
  },
  {
    id: "twin",
    name: "Laras Kembar",
    sub: "Twin Barrel",
    desc: "Dual pipe, tampilan agresif",
    badge: "AGRESIF",
    bc: "#ef4444",
  },
  {
    id: "mega",
    name: "Mega Bore",
    sub: "Wide Racing",
    desc: "Bore besar, performa sirkuit",
    badge: "RACING",
    bc: "#a855f7",
  },
] as const;

const COLORS: [string, string][] = [
  ["#111111", "Hitam Jet"],
  ["#2d2d2d", "Hitam Doff"],
  ["#b5b5b2", "Chrome"],
  ["#7a8ba0", "Titanium"],
  ["#a07820", "Emas Tua"],
  ["#7a1515", "Merah Darah"],
  ["#152545", "Biru Malam"],
  ["#3d4658", "Gunmetal"],
  ["#1e3a14", "Army Green"],
  ["#5a3020", "Tembaga"],
  ["#c2c2c2", "Silver"],
  ["#1c1c22", "Carbon"],
];

const FINISHES = [
  { id: "glossy", name: "Glossy", desc: "Kilap tinggi" },
  { id: "matte", name: "Matte", desc: "Tanpa kilap" },
  { id: "brushed", name: "Brushed", desc: "Tekstur sikat" },
  { id: "mirror", name: "Mirror", desc: "Cermin penuh" },
  { id: "titanium-burnt", name: "Ti-Burnt", desc: "Iridescent" },
] as const;

const ELEMENTS = [
  { id: "carbon-fiber", name: "Carbon Fiber" },
  { id: "chrome-tip", name: "Chrome Tip" },
  { id: "heat-wrap", name: "Heat Wrap" },
  { id: "racing-stripe", name: "Racing Stripe" },
  { id: "titanium-tip", name: "Titanium Tip" },
  { id: "perf-shield", name: "Perf. Shield" },
] as const;

// ─────────────────────────────── TYPES ─────────────────────────────────────

interface Config {
  shape: string;
  color: string;
  finish: string;
  elements: string[];
  diameter: number;
  length: number;
  brand: string;
}

const INIT: Config = {
  shape: "round",
  color: "#1a1a1a",
  finish: "glossy",
  elements: [],
  diameter: 65,
  length: 380,
  brand: "",
};

// ─────────────────────────── SECTION LABEL ─────────────────────────────────

function SectionLabel({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="h-0.5 w-3 bg-orange-500 flex-shrink-0" />
      <span
        className="text-[10px] font-bold text-orange-400/75"
        style={{ letterSpacing: "0.22em", textTransform: "uppercase", fontFamily: "'Rajdhani', sans-serif" }}
      >
        {children}
      </span>
    </div>
  );
}

// ─────────────────────────── SHAPE THUMBNAILS ──────────────────────────────

function ShapeThumb({ id, color }: { id: string; color: string }) {
  const hi = "rgba(255,255,255,0.3)";
  const hole = "#060606";

  if (id === "twin") {
    return (
      <svg viewBox="0 0 100 62" className="w-full h-10">
        {([10, 38] as const).map((y) => (
          <g key={y}>
            <rect x="6" y={y} width="88" height="16" fill={color} />
            <rect x="6" y={y} width="88" height="5" fill={hi} />
            <ellipse cx="6" cy={y + 8} rx="8" ry="8" fill={color} />
            <ellipse cx="6" cy={y + 8} rx="8" ry="8" fill="rgba(0,0,0,0.4)" />
            <ellipse cx="94" cy={y + 8} rx="8" ry="8" fill={color} />
            <ellipse cx="94" cy={y + 8} rx="5" ry="5" fill={hole} />
          </g>
        ))}
      </svg>
    );
  }

  if (id === "mega") {
    return (
      <svg viewBox="0 0 100 62" className="w-full h-10">
        <rect x="15" y="11" width="52" height="40" fill={color} />
        <rect x="15" y="11" width="52" height="9" fill={hi} />
        <ellipse cx="15" cy="31" rx="12" ry="20" fill={color} />
        <ellipse cx="15" cy="31" rx="12" ry="20" fill="rgba(0,0,0,0.38)" />
        <ellipse cx="67" cy="31" rx="17" ry="27" fill={color} />
        <ellipse cx="67" cy="31" rx="10" ry="17" fill={hole} />
        <ellipse cx="67" cy="31" rx="5" ry="9" fill="#030303" />
      </svg>
    );
  }

  if (id === "oval") {
    return (
      <svg viewBox="0 0 100 62" className="w-full h-10">
        <rect x="8" y="9" width="84" height="44" fill={color} />
        <rect x="8" y="9" width="84" height="9" fill={hi} />
        <ellipse cx="8" cy="31" rx="11" ry="22" fill={color} />
        <ellipse cx="8" cy="31" rx="11" ry="22" fill="rgba(0,0,0,0.38)" />
        <ellipse cx="92" cy="31" rx="11" ry="22" fill={color} />
        <ellipse cx="92" cy="31" rx="7" ry="14" fill={hole} />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 100 62" className="w-full h-10">
      <rect x="8" y="15" width="84" height="32" fill={color} />
      <rect x="8" y="15" width="84" height="7" fill={hi} />
      <ellipse cx="8" cy="31" rx="9" ry="16" fill={color} />
      <ellipse cx="8" cy="31" rx="9" ry="16" fill="rgba(0,0,0,0.38)" />
      <ellipse cx="92" cy="31" rx="9" ry="16" fill={color} />
      <ellipse cx="92" cy="31" rx="5.5" ry="10" fill={hole} />
    </svg>
  );
}

// ──────────────────────── LIVE EXHAUST PREVIEW ─────────────────────────────

function ExhaustPreview({ cfg }: { cfg: Config }) {
  const { shape, color, finish, elements, diameter, length } = cfg;

  const bodyH = Math.round(52 + ((diameter - 45) / 75) * 65);
  const bodyW = Math.round(208 + ((length - 200) / 300) * 175);
  const CX = 285;
  const CY = 142;
  const X1 = CX - bodyW / 2;
  const X2 = CX + bodyW / 2;
  const capRy = bodyH / 2;
  const capRx = Math.max(10, Math.round(capRy * 0.21));

  const isMirror = finish === "mirror";
  const isGlossy = finish === "glossy";
  const isMatte = finish === "matte";
  const isBrushed = finish === "brushed";
  const isTi = finish === "titanium-burnt";

  const tA = isMirror ? 0.9 : isGlossy ? 0.68 : isBrushed ? 0.38 : isMatte ? 0.14 : 0;
  const bA = isMirror ? 0.88 : isGlossy ? 0.65 : isBrushed ? 0.6 : isMatte ? 0.44 : 0;

  const hasCF = elements.includes("carbon-fiber");
  const hasCT = elements.includes("chrome-tip");
  const hasHW = elements.includes("heat-wrap");
  const hasRS = elements.includes("racing-stripe");
  const hasTT = elements.includes("titanium-tip");
  const hasPS = elements.includes("perf-shield");

  // Inline draw helpers (closures over config vars)
  const drawBody = (x: number, y: number, w: number, h: number, rx = 5) => (
    <>
      <rect x={x} y={y} width={w} height={h} rx={rx} fill={color} />
      {hasCF && <rect x={x} y={y} width={w} height={h} rx={rx} fill="url(#xCF)" />}
      {isTi && <rect x={x} y={y} width={w} height={h} rx={rx} fill="url(#xTi)" />}
      <rect x={x} y={y} width={w} height={h} rx={rx} fill="url(#xBd)" />
      {hasPS && <rect x={x + w * 0.15} y={y} width={w * 0.7} height={h} fill="url(#xPS)" />}
      {hasHW &&
        Array.from({ length: 9 }).map((_, i) => (
          <rect
            key={i}
            x={x + 12 + i * (w / 10)}
            y={y}
            width={4}
            height={h}
            fill="rgba(100,60,15,0.4)"
          />
        ))}
      {hasRS && <rect x={x + w * 0.36} y={y} width={9} height={h} fill="#f97316" opacity={0.9} />}
    </>
  );

  const drawCap = (cx: number, cy: number, rx: number, ry: number) => (
    <>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={color} />
      {isTi && <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="url(#xTi)" />}
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="url(#xCp)" />
    </>
  );

  const drawOutlet = (cx: number, cy: number, rx: number, ry: number) => (
    <>
      {drawCap(cx, cy, rx, ry)}
      {hasCT && (
        <ellipse cx={cx} cy={cy} rx={rx + 4} ry={ry + 4} fill="none" stroke="#cccccc" strokeWidth="3.5" />
      )}
      {hasTT && (
        <ellipse cx={cx} cy={cy} rx={rx + 3} ry={ry + 3} fill="none" stroke="#8b5cf6" strokeWidth="2.5" />
      )}
      <ellipse cx={cx} cy={cy} rx={rx * 0.64} ry={ry * 0.64} fill="#090909" />
      <ellipse cx={cx} cy={cy} rx={rx * 0.38} ry={ry * 0.38} fill="#040404" />
    </>
  );

  const drawClamps = (x: number, y: number, w: number, h: number) => (
    <>
      {([0.17, 0.83] as const).map((p) => (
        <g key={p}>
          <rect x={x + w * p} y={y - 5} width={8} height={h + 10} rx={4} fill={color} opacity={0.58} />
          <rect x={x + w * p} y={y - 5} width={8} height={h + 10} rx={4} fill="url(#xBd)" opacity={0.58} />
        </g>
      ))}
    </>
  );

  const drawInlet = (ix: number, iy: number, ih: number) => (
    <>
      <rect x={ix - 65} y={iy - ih / 2} width={65} height={ih} fill={color} />
      <rect x={ix - 65} y={iy - ih / 2} width={65} height={ih} fill="url(#xBd)" />
      {drawCap(ix - 65, iy, 7, ih / 2)}
    </>
  );

  // Build shape-specific content
  let shapeContent: React.ReactElement;

  if (shape === "twin") {
    const gap = 12;
    const sH = Math.round((bodyH - gap) / 2);
    const sRy = sH / 2;
    const sRx = Math.max(8, Math.round(sRy * 0.22));
    const yA = CY - sH - gap / 2;
    const yB = CY + gap / 2;

    shapeContent = (
      <>
        <ellipse cx={CX} cy={244} rx={bodyW * 0.48} ry={13} fill="url(#xGnd)" />
        {drawInlet(X1, yA + sRy, sH * 0.88)}
        {drawBody(X1, yA, bodyW, sH, 4)}
        {drawCap(X1, yA + sRy, sRx, sRy)}
        {drawOutlet(X2, yA + sRy, sRx, sRy)}
        {drawClamps(X1, yA, bodyW, sH)}
        {drawInlet(X1, yB + sRy, sH * 0.88)}
        {drawBody(X1, yB, bodyW, sH, 4)}
        {drawCap(X1, yB + sRy, sRx, sRy)}
        {drawOutlet(X2, yB + sRy, sRx, sRy)}
        {drawClamps(X1, yB, bodyW, sH)}
      </>
    );
  } else if (shape === "mega") {
    const mW = Math.round(bodyW * 0.58);
    const mH = Math.round(bodyH * 1.38);
    const mx1 = CX - mW / 2;
    const mx2 = CX + mW / 2;
    const mRy = mH / 2;
    const mRx = Math.max(12, Math.round(mRy * 0.22));
    const tRy = mRy + 16;
    const tRx = mRx + 8;

    shapeContent = (
      <>
        <ellipse cx={CX} cy={246} rx={mW * 0.7} ry={15} fill="url(#xGnd)" />
        {drawInlet(mx1, CY, mH * 0.6)}
        {drawBody(mx1, CY - mRy, mW, mH, 6)}
        {drawCap(mx1, CY, mRx, mRy)}
        {drawOutlet(mx2, CY, tRx, tRy)}
        {drawClamps(mx1, CY - mRy, mW, mH)}
      </>
    );
  } else {
    const mult = shape === "oval" ? 1.2 : 1.0;
    const aH = Math.round(bodyH * mult);
    const aRy = aH / 2;
    const aRx = Math.max(10, Math.round(aRy * 0.21));
    const oRx = shape === "oval" ? aRx + 5 : aRx;
    const oRy = shape === "oval" ? Math.round(aRy * 0.9) : aRy;

    shapeContent = (
      <>
        <ellipse cx={CX} cy={242} rx={bodyW * 0.5} ry={13} fill="url(#xGnd)" />
        {drawInlet(X1, CY, aH * 0.55)}
        {drawBody(X1, CY - aRy, bodyW, aH)}
        {drawCap(X1, CY, aRx, aRy)}
        {drawOutlet(X2, CY, oRx, oRy)}
        {drawClamps(X1, CY - aRy, bodyW, aH)}
      </>
    );
  }

  return (
    <svg viewBox="0 0 570 284" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="xBd" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={`rgba(255,255,255,${tA})`} />
          <stop offset="20%" stopColor="rgba(255,255,255,0)" />
          <stop offset="80%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor={`rgba(0,0,0,${bA})`} />
        </linearGradient>
        <radialGradient id="xCp" cx="32%" cy="28%" r="70%">
          <stop offset="0%" stopColor={`rgba(255,255,255,${tA})`} />
          <stop offset="100%" stopColor={`rgba(0,0,0,${bA})`} />
        </radialGradient>
        {isTi && (
          <linearGradient id="xTi" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(148,90,255,0.58)" />
            <stop offset="28%" stopColor="rgba(38,148,255,0.36)" />
            <stop offset="52%" stopColor="rgba(38,235,175,0.24)" />
            <stop offset="78%" stopColor="rgba(255,128,18,0.38)" />
            <stop offset="100%" stopColor="rgba(198,22,22,0.68)" />
          </linearGradient>
        )}
        {hasCF && (
          <pattern id="xCF" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
            <rect width="4" height="4" fill="rgba(0,0,0,0.5)" />
            <rect x="4" y="4" width="4" height="4" fill="rgba(0,0,0,0.5)" />
            <rect
              width="8"
              height="8"
              fill="none"
              stroke="rgba(255,255,255,0.055)"
              strokeWidth="0.5"
            />
          </pattern>
        )}
        {hasPS && (
          <pattern id="xPS" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
            <circle cx="5" cy="5" r="2.5" fill="rgba(0,0,0,0.62)" />
          </pattern>
        )}
        <radialGradient id="xGnd" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(0,0,0,0.45)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
      </defs>
      {shapeContent}
    </svg>
  );
}

// ────────────────────────── MAIN COMPONENT ─────────────────────────────────

export default function DesignVisualizer() {
  const [cfg, setCfg] = useState<Config>(INIT);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const update = (partial: Partial<Config>) => setCfg((c) => ({ ...c, ...partial }));

  const toggleEl = (id: string) =>
    update({
      elements: cfg.elements.includes(id)
        ? cfg.elements.filter((e) => e !== id)
        : [...cfg.elements, id],
    });

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:5000/generate-custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exhaustType: cfg.shape,
          shapeDesign: cfg.shape,
          color: cfg.color,
          finish: cfg.finish,
          additionalDesign: cfg.elements.join(","),
          motorcycleBrand: cfg.brand,
          diameter: cfg.diameter,
          length: cfg.length,
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setGeneratedImage(data.image);
    } catch {
      setError(
        "Gagal menghasilkan visualisasi AI. Pastikan server backend sedang berjalan."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const a = document.createElement("a");
    a.href = generatedImage;
    a.download = `masterpiece-knalpot-${Date.now()}.png`;
    a.click();
  };

  const selectedShape = SHAPES.find((s) => s.id === cfg.shape)!;
  const selectedFinish = FINISHES.find((f) => f.id === cfg.finish)!;

  return (
    <div
      className="min-h-screen text-zinc-100"
      style={{
        background: "#0a0a12",
        fontFamily: "'Rajdhani', 'Inter', sans-serif",
      }}
    >
      {/* ── HEADER ────────────────────────────────────────────────── */}
      <header className="border-b border-orange-500/15">
        <div className="max-w-[1400px] mx-auto px-6 py-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-0.5 w-8 bg-orange-500" />
            <span
              className="text-[11px] font-semibold text-orange-400/80"
              style={{ letterSpacing: "0.25em", textTransform: "uppercase" }}
            >
              Masterpiece Purbalingga
            </span>
          </div>
          <h1
            className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-50"
            style={{ fontFamily: "'Rajdhani', sans-serif" }}
          >
            KUSTOMISASI KNALPOT
          </h1>
          <p className="text-zinc-500 mt-1.5 text-sm max-w-xl">
            Pilih bentuk, warna, finishing, dan elemen tambahan — lihat perubahannya secara langsung
          </p>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-5">
        {/* ── SHAPE SELECTOR + PREVIEW ──────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[268px_1fr] gap-5">

          {/* Shape Cards */}
          <div className="space-y-2.5">
            <SectionLabel>PILIH BENTUK</SectionLabel>
            {SHAPES.map((s) => {
              const active = cfg.shape === s.id;
              return (
                <motion.button
                  key={s.id}
                  onClick={() => update({ shape: s.id })}
                  className="w-full text-left rounded-xl border transition-colors duration-150 overflow-hidden"
                  style={{
                    borderColor: active ? "#f97316" : "rgba(63,63,70,0.6)",
                    background: active ? "#1c1308" : "#111118",
                    boxShadow: active ? "0 0 0 1px rgba(249,115,22,0.2), 0 4px 20px rgba(249,115,22,0.12)" : "none",
                  }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="px-3.5 pt-3 pb-3">
                    <div
                      className="rounded-lg overflow-hidden mb-2.5 px-2 py-1.5"
                      style={{ background: "#08080e" }}
                    >
                      <ShapeThumb id={s.id} color={cfg.color} />
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-sm text-zinc-100 leading-tight">{s.name}</div>
                        <div className="text-[11px] text-zinc-500 mt-0.5">{s.desc}</div>
                      </div>
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5"
                        style={{
                          background: s.bc + "22",
                          color: s.bc,
                          border: `1px solid ${s.bc}44`,
                          letterSpacing: "0.08em",
                        }}
                      >
                        {s.badge}
                      </span>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Preview Canvas */}
          <div className="space-y-2.5">
            <SectionLabel>PREVIEW LIVE</SectionLabel>
            <div
              className="rounded-xl border border-zinc-800/70 overflow-hidden"
              style={{
                background: "#09090f",
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, rgba(249,115,22,0.065) 1px, transparent 0)",
                backgroundSize: "26px 26px",
              }}
            >
              {/* SVG Canvas */}
              <div style={{ height: "320px" }} className="p-5">
                <ExhaustPreview cfg={cfg} />
              </div>

              {/* Spec bar */}
              <div
                className="border-t border-zinc-800/50 px-5 py-3 flex items-center justify-between"
                style={{ background: "rgba(10,10,18,0.85)", backdropFilter: "blur(8px)" }}
              >
                <div>
                  <div className="font-bold text-sm text-zinc-100 flex items-center gap-2">
                    {selectedShape.name}
                    <span className="text-orange-400 text-xs font-medium">{selectedShape.sub}</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">
                    Ø {cfg.diameter}mm &middot; Panjang {cfg.length}mm
                    {cfg.elements.length > 0 && ` · ${cfg.elements.length} elemen aktif`}
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-5 h-5 rounded-full border-2 border-zinc-700 flex-shrink-0"
                    style={{ background: cfg.color }}
                  />
                  <div
                    className="text-[10px] text-zinc-500"
                    style={{ letterSpacing: "0.12em", textTransform: "uppercase" }}
                  >
                    {selectedFinish.name}
                  </div>
                </div>
              </div>
            </div>

            {/* AI-Generated preview */}
            {generatedImage && (
              <div className="rounded-xl overflow-hidden border border-zinc-700 relative group">
                <div
                  className="text-[10px] text-orange-400/70 px-3 py-1.5 border-b border-zinc-800"
                  style={{
                    background: "#0e0e18",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                  }}
                >
                  AI Render
                </div>
                <img src={generatedImage} alt="AI Generated Exhaust" className="w-full" />
                <div className="absolute inset-0 top-8 bg-gradient-to-t from-black/65 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                  <button
                    onClick={handleDownload}
                    className="bg-orange-500 hover:bg-orange-400 text-black font-bold px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Unduh Gambar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── CUSTOMIZATION PANELS ──────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

          {/* Color */}
          <div className="rounded-xl bg-[#111118] border border-zinc-800/60 p-5">
            <SectionLabel>WARNA</SectionLabel>
            <div className="grid grid-cols-6 gap-2">
              {COLORS.map(([hex, name]) => (
                <button
                  key={hex}
                  title={name}
                  onClick={() => update({ color: hex })}
                  className="aspect-square rounded-md border-2 transition-all duration-100"
                  style={{
                    background: hex,
                    borderColor: cfg.color === hex ? "#f97316" : "transparent",
                    boxShadow:
                      cfg.color === hex
                        ? "0 0 0 2px rgba(249,115,22,0.28)"
                        : "inset 0 0 0 1px rgba(255,255,255,0.06)",
                  }}
                />
              ))}
            </div>
            <div className="mt-3 flex gap-2 items-center">
              <input
                type="color"
                value={cfg.color}
                onChange={(e) => update({ color: e.target.value })}
                className="w-9 h-8 rounded cursor-pointer border border-zinc-700 bg-transparent flex-shrink-0"
              />
              <input
                type="text"
                value={cfg.color}
                onChange={(e) => update({ color: e.target.value })}
                className="flex-1 bg-[#0d0d16] border border-zinc-700/60 rounded-lg px-2.5 py-1.5 text-sm text-zinc-300 focus:outline-none focus:border-orange-500/50"
                style={{ fontFamily: "monospace" }}
                placeholder="#1a1a1a"
              />
            </div>
          </div>

          {/* Finish */}
          <div className="rounded-xl bg-[#111118] border border-zinc-800/60 p-5">
            <SectionLabel>FINISHING</SectionLabel>
            <div className="space-y-2">
              {FINISHES.map((f) => {
                const active = cfg.finish === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => update({ finish: f.id })}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-all text-left"
                    style={{
                      borderColor: active ? "#f97316" : "rgba(63,63,70,0.4)",
                      background: active ? "rgba(249,115,22,0.08)" : "rgba(39,39,42,0.3)",
                    }}
                  >
                    <div>
                      <div
                        className="text-sm font-semibold"
                        style={{ color: active ? "#fb923c" : "#a1a1aa" }}
                      >
                        {f.name}
                      </div>
                      <div className="text-[11px] text-zinc-600">{f.desc}</div>
                    </div>
                    {active && (
                      <div className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Elements */}
          <div className="rounded-xl bg-[#111118] border border-zinc-800/60 p-5">
            <SectionLabel>ELEMEN TAMBAHAN</SectionLabel>
            <div className="space-y-2">
              {ELEMENTS.map((el) => {
                const active = cfg.elements.includes(el.id);
                return (
                  <button
                    key={el.id}
                    onClick={() => toggleEl(el.id)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-all"
                    style={{
                      borderColor: active ? "#f97316" : "rgba(63,63,70,0.4)",
                      background: active ? "rgba(249,115,22,0.08)" : "rgba(39,39,42,0.3)",
                    }}
                  >
                    <span
                      className="text-sm font-medium"
                      style={{ color: active ? "#fb923c" : "#a1a1aa" }}
                    >
                      {el.name}
                    </span>
                    <div
                      className="w-5 h-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0"
                      style={{
                        borderColor: active ? "#f97316" : "#52525b",
                        background: active ? "#f97316" : "transparent",
                      }}
                    >
                      {active && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path
                            d="M1 4L3.5 6.5L9 1"
                            stroke="#000"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size + Brand */}
          <div className="rounded-xl bg-[#111118] border border-zinc-800/60 p-5">
            <SectionLabel>UKURAN</SectionLabel>
            <div className="space-y-5">
              {/* Diameter */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-xs text-zinc-500">Diameter</span>
                  <span className="text-xs font-bold text-orange-400">
                    Ø {cfg.diameter} mm
                  </span>
                </div>
                <input
                  type="range"
                  min={45}
                  max={120}
                  value={cfg.diameter}
                  onChange={(e) => update({ diameter: +e.target.value })}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #f97316 0%, #f97316 ${((cfg.diameter - 45) / 75) * 100}%, #3f3f46 ${((cfg.diameter - 45) / 75) * 100}%, #3f3f46 100%)`,
                    accentColor: "#f97316",
                  }}
                />
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-zinc-700">45mm</span>
                  <span className="text-[10px] text-zinc-700">120mm</span>
                </div>
              </div>

              {/* Length */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-xs text-zinc-500">Panjang</span>
                  <span className="text-xs font-bold text-orange-400">{cfg.length} mm</span>
                </div>
                <input
                  type="range"
                  min={200}
                  max={500}
                  value={cfg.length}
                  onChange={(e) => update({ length: +e.target.value })}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #f97316 0%, #f97316 ${((cfg.length - 200) / 300) * 100}%, #3f3f46 ${((cfg.length - 200) / 300) * 100}%, #3f3f46 100%)`,
                    accentColor: "#f97316",
                  }}
                />
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-zinc-700">200mm</span>
                  <span className="text-[10px] text-zinc-700">500mm</span>
                </div>
              </div>

              {/* Brand */}
              <div className="pt-2 border-t border-zinc-800/60">
                <label className="text-xs text-zinc-500 block mb-2">Merek / Model Motor</label>
                <input
                  type="text"
                  value={cfg.brand}
                  onChange={(e) => update({ brand: e.target.value })}
                  placeholder="cth: Yamaha R15, Honda CBR"
                  className="w-full bg-[#0d0d16] border border-zinc-700/60 rounded-lg px-3 py-2 text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── ERROR ─────────────────────────────────────────────── */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* ── ACTION BAR ────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-3 pb-10 pt-1">
          <button
            onClick={() => {
              setCfg(INIT);
              setGeneratedImage(null);
              setError(null);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-700/60 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200 transition-all text-sm font-semibold"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>

          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-orange-500/35 text-orange-400 hover:bg-orange-500/10 transition-all text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "rgba(249,115,22,0.06)" }}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Membuat AI...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate AI Render
              </>
            )}
          </button>

          <a
            href="/customer-service"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-black hover:brightness-110 transition-all ml-auto"
            style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
          >
            <ShoppingBag className="w-4 h-4" />
            Pesan Sekarang
            <span className="opacity-75 text-xs">→</span>
          </a>
        </div>
      </div>
    </div>
  );
}
