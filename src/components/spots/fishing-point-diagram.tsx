'use client';

import { useState, useRef, useEffect } from 'react';

// ── 型定義 ──────────────────────────────────────────

export interface SeaFishLabel {
  text: string;
  x: number;
  y: number;
}

export interface SpotDiagramData {
  layout: 'seawall' | 'pier' | 'port' | 'beach';
  structureLabel?: string;
  seaLabel?: string;
  facilities: DiagramFacility[];
  positions: DiagramPosition[];
  seaFeatures?: SeaFeature[];
  fishNotes?: string[];
  seaFishLabels?: SeaFishLabel[];
  accessibilityNote?: string;
}

export interface DiagramFacility {
  id: string;
  name: string;
  icon: string;
  x?: number;
  y?: number;
}

export interface DiagramPosition {
  id: string;
  number: number;
  name: string;
  shortName: string;
  rating: 'hot' | 'good' | 'normal';
  fish: { name: string; method: string; season: string; difficulty: 'easy' | 'medium' | 'hard' }[];
  depth?: string;
  features?: string[];
  description: string;
  x?: number;
}

export interface SeaFeature {
  name: string;
  icon: string;
  left: number;
  width: number;
  type?: 'tetrapod' | 'reef-stone' | 'reef-concrete' | 'reef-hex';
  y?: number;
}

export interface FishingPointDiagramProps {
  spotName: string;
  data: SpotDiagramData;
}

// ── 定数 ──

const RATING_COLOR = { hot: '#c0392b', good: '#2980b9', normal: '#6a8a5a' } as const;
const DIFF_STYLE = {
  easy:   { bg: '#dcfce7', color: '#166534' },
  medium: { bg: '#fef9c3', color: '#854d0e' },
  hard:   { bg: '#fee2e2', color: '#991b1b' },
} as const;

// Y レイアウト
const LY = {
  buildCY: 55,     // 建物中心
  roadTop: 115,    // 道路上端
  roadH: 22,       // 道路高さ
  wallLine: 152,   // 護岸エッジ（線）
  tentCY: 174,     // テント三角の中心
  tentLabel: 196,  // テント番号
  shoreTop: 206,   // 足元ゾーン
  seaTop: 235,     // 海面
  deepTop: 510,    // 深場
  legendTop: 565,  // 凡例帯
  end: 600,
} as const;

// ── ヘルパー ──

function wavePath(y: number, amp: number): string {
  let d = `M0,${y}`;
  for (let x = 0; x < 1000; x += 50) {
    d += ` Q${x + 25},${y + ((x / 50) % 2 === 0 ? -amp : amp)} ${x + 50},${y}`;
  }
  return d;
}

function autoX(count: number, margin: number = 60): number[] {
  if (!count) return [];
  if (count === 1) return [500];
  const span = 1000 - margin * 2;
  return Array.from({ length: count }, (_, i) => Math.round(margin + (span * i) / (count - 1)));
}

function inferType(f: SeaFeature): NonNullable<SeaFeature['type']> {
  if (f.type) return f.type;
  const n = f.name;
  if (n.includes('テトラ')) return 'tetrapod';
  if (n.includes('六角')) return 'reef-hex';
  if (n.includes('コンクリ')) return 'reef-concrete';
  return 'reef-stone';
}

// ── 海底地物レンダラー（大型アイコン） ──

function TetrapodIcons({ x, y, w }: { x: number; y: number; w: number }) {
  const count = Math.max(Math.floor(w / 32), 3);
  const step = w / count;
  return <>{Array.from({ length: count }, (_, i) => {
    const cx = x + step / 2 + i * step;
    const cy = y + ((i % 3) - 1) * 5;
    return (
      <g key={i} transform={`translate(${cx},${cy})`}>
        <line x1="-8" y1="-8" x2="8" y2="8" stroke="#7a7a6a" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="8" y1="-8" x2="-8" y2="8" stroke="#7a7a6a" strokeWidth="3.5" strokeLinecap="round" />
      </g>
    );
  })}</>;
}

function StoneReefIcons({ x, y, w }: { x: number; y: number; w: number }) {
  const count = Math.max(Math.floor(w / 42), 3);
  const step = w / count;
  return <>{Array.from({ length: count }, (_, i) => {
    const cx = x + step / 2 + i * step;
    const cy = y + (i % 2 ? 5 : -4);
    return <polygon key={i} points={`${cx - 10},${cy + 9} ${cx},${cy - 10} ${cx + 10},${cy + 9}`}
      fill="#d4a030" stroke="#b88828" strokeWidth="1.5" />;
  })}</>;
}

function ConcreteReefIcons({ x, y, w }: { x: number; y: number; w: number }) {
  const count = Math.max(Math.floor(w / 48), 3);
  const step = w / count;
  return <>{Array.from({ length: count }, (_, i) => {
    const cx = x + step / 2 + i * step;
    const cy = y + (i % 2 ? 4 : -3);
    return <rect key={i} x={cx - 10} y={cy - 6} width={20} height={12} rx={2}
      fill="#8a9aaa" stroke="#6a7a8a" strokeWidth="1.5" />;
  })}</>;
}

function HexReefIcons({ x, y, w }: { x: number; y: number; w: number }) {
  const count = Math.max(Math.floor(w / 42), 3);
  const step = w / count;
  return <>{Array.from({ length: count }, (_, i) => {
    const cx = x + step / 2 + i * step;
    const cy = y + (i % 2 ? 5 : -4);
    const r = 9;
    const pts = Array.from({ length: 6 }, (_, j) => {
      const a = (Math.PI / 3) * j - Math.PI / 6;
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
    }).join(' ');
    return <polygon key={i} points={pts} fill="#7a8a7a" stroke="#5a6a5a" strokeWidth="1.5" />;
  })}</>;
}

function FeatureShapes({ type, x, y, w }: { type: string; x: number; y: number; w: number }) {
  switch (type) {
    case 'tetrapod': return <TetrapodIcons x={x} y={y} w={w} />;
    case 'reef-concrete': return <ConcreteReefIcons x={x} y={y} w={w} />;
    case 'reef-hex': return <HexReefIcons x={x} y={y} w={w} />;
    default: return <StoneReefIcons x={x} y={y} w={w} />;
  }
}

// ── 凡例1アイテム ──

function LegendTriangle({ x, y, fill }: { x: number; y: number; fill: string }) {
  return <polygon points={`${x},${y - 8} ${x + 8},${y + 6} ${x - 8},${y + 6}`} fill={fill} stroke="#fff" strokeWidth="0.8" />;
}

// ── メインコンポーネント ──

export function FishingPointDiagram({ data }: FishingPointDiagramProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState(false);

  const rawPos = data?.positions ?? [];
  const rawFac = data?.facilities ?? [];

  const posAuto = autoX(rawPos.length, 50);
  const positions = rawPos.map((p, i) => ({ ...p, cx: p.x ?? posAuto[i] }));

  const facAuto = autoX(rawFac.length, 80);
  const facilities = rawFac.map((f, i) => ({ ...f, cx: f.x ?? facAuto[i], cy: f.y ?? LY.buildCY }));

  const seaFeatures = (data?.seaFeatures ?? []).map(f => {
    const t = inferType(f);
    return { ...f, t, svgX: f.left * 10, svgW: f.width * 10, svgY: f.y ?? (t === 'tetrapod' ? LY.shoreTop + 12 : 360) };
  });

  const seaFishLabels = data?.seaFishLabels ?? [];
  const fishNotes = data?.fishNotes ?? [];

  useEffect(() => {
    const el = scrollRef.current;
    if (el) setCanScroll(el.scrollWidth > el.clientWidth + 4);
  }, [positions.length]);

  const selected = positions.find(p => p.id === selectedId);
  const toggle = (id: string) => setSelectedId(prev => (prev === id ? null : id));

  if (positions.length === 0) return null;

  // 建物の幅を名前の長さから推定
  const buildW = (name: string) => Math.max(name.length * 10.5 + 18, 55);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* スクロールヒント */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '10px', color: '#94a3b8' }}>
        {canScroll ? '← スクロール → / タップで詳細' : 'タップで詳細表示'}
      </div>

      {/* ── SVG 俯瞰マップ ── */}
      <div ref={scrollRef} className="rounded-xl border shadow-sm overflow-hidden select-none"
        style={{ overflowX: 'auto' }}>
        <svg viewBox="0 0 1000 600" xmlns="http://www.w3.org/2000/svg"
          style={{ width: '100%', minWidth: '800px', height: 'auto', display: 'block', fontFamily: 'system-ui, sans-serif' }}>
          <defs>
            <linearGradient id="dg-land" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f5e6c8" /><stop offset="100%" stopColor="#ead8b8" />
            </linearGradient>
            <linearGradient id="dg-shore" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#b3e5fc" /><stop offset="100%" stopColor="#81d4fa" />
            </linearGradient>
            <linearGradient id="dg-sea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4fc3f7" /><stop offset="100%" stopColor="#0288d1" />
            </linearGradient>
            <linearGradient id="dg-deep" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0277bd" /><stop offset="100%" stopColor="#01579b" />
            </linearGradient>
            <filter id="dg-bs"><feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="rgba(0,0,0,0.12)" /></filter>
            <filter id="dg-ts"><feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="rgba(0,0,0,0.35)" /></filter>
            <filter id="dg-glow"><feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#facc15" floodOpacity="0.7" /></filter>
          </defs>

          {/* ===== ゾーン背景 ===== */}
          <rect x="0" y="0" width="1000" height={LY.wallLine} fill="url(#dg-land)" />
          {/* 道路 */}
          <rect x="0" y={LY.roadTop} width="1000" height={LY.roadH} fill="#d8cdb8" />
          <line x1="0" y1={LY.roadTop + LY.roadH / 2} x2="1000" y2={LY.roadTop + LY.roadH / 2}
            stroke="#c4b8a0" strokeWidth="1" strokeDasharray="12,10" />
          {/* 護岸（薄い帯＋エッジ線） */}
          <rect x="0" y={LY.wallLine} width="1000" height={LY.shoreTop - LY.wallLine} fill="#c8bfb0" />
          <line x1="0" y1={LY.wallLine} x2="1000" y2={LY.wallLine} stroke="#a09080" strokeWidth="2.5" />
          {/* 足元・テトラ帯 */}
          <rect x="0" y={LY.shoreTop} width="1000" height={LY.seaTop - LY.shoreTop} fill="url(#dg-shore)" />
          {/* 海 */}
          <rect x="0" y={LY.seaTop} width="1000" height={LY.deepTop - LY.seaTop} fill="url(#dg-sea)" />
          {/* 深場 */}
          <rect x="0" y={LY.deepTop} width="1000" height={LY.legendTop - LY.deepTop} fill="url(#dg-deep)" />
          {/* 凡例帯 */}
          <rect x="0" y={LY.legendTop} width="1000" height={LY.end - LY.legendTop} fill="#f8f4ed" />
          <line x1="0" y1={LY.legendTop} x2="1000" y2={LY.legendTop} stroke="#ddd5c8" strokeWidth="1" />

          {/* 波紋 */}
          <path d={wavePath(LY.shoreTop, 3)} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
          <path d={wavePath(LY.seaTop, 4)} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />

          {/* ===== 陸地：木 ===== */}
          {[35, 95, 380, 460, 700, 850, 955].map((tx, i) =>
            <circle key={`tree${i}`} cx={tx} cy={[18, 22, 15, 20, 14, 24, 18][i]}
              r={[9, 11, 8, 10, 12, 9, 8][i]} fill="#7aaa5a" opacity="0.55" />
          )}

          {/* ===== 陸地：建物 ===== */}
          {facilities.map(f => {
            const w = buildW(f.name);
            const h = 44;
            const bx = f.cx - w / 2;
            const by = f.cy - h / 2;
            return (
              <g key={f.id} filter="url(#dg-bs)">
                <rect x={bx} y={by} width={w} height={h} fill="#f5ead8" stroke="#c8b898" strokeWidth="1.5" rx="4" />
                <text x={f.cx} y={f.cy - 2} textAnchor="middle" fontSize="16" dominantBaseline="middle">{f.icon}</text>
                <text x={f.cx} y={f.cy + 17} textAnchor="middle" fontSize="9" fontWeight="700" fill="#5d4e37">{f.name}</text>
              </g>
            );
          })}

          {/* 中央入口ラベル */}
          <text x="500" y={LY.roadTop + LY.roadH / 2 + 4} textAnchor="middle"
            fontSize="10" fontWeight="700" fill="#6a5a48">中央入口</text>

          {/* ===== 護岸ラベル ===== */}
          <text x="15" y={LY.tentCY + 4} fontSize="10" fontWeight="600" fill="rgba(0,0,0,0.2)">← 西</text>
          <text x="500" y={LY.wallLine + 11} textAnchor="middle" fontSize="10" fontWeight="700"
            fill="rgba(0,0,0,0.12)" letterSpacing="0.3em">{data?.structureLabel || '護岸'}</text>
          <text x="985" y={LY.tentCY + 4} textAnchor="end" fontSize="10" fontWeight="600" fill="rgba(0,0,0,0.2)">東 →</text>

          {/* ===== テントマーカー（三角形） ===== */}
          {positions.map(pos => {
            const isSel = selectedId === pos.id;
            const dimmed = selectedId !== null && !isSel;
            const color = RATING_COLOR[pos.rating];
            const cy = LY.tentCY;
            return (
              <g key={pos.id} onClick={() => toggle(pos.id)}
                style={{ cursor: 'pointer' }} opacity={dimmed ? 0.3 : 1}>
                {isSel && (
                  <circle cx={pos.cx} cy={cy} r="22" fill="none" stroke="#facc15" strokeWidth="3" filter="url(#dg-glow)" />
                )}
                <polygon
                  points={`${pos.cx - 12},${cy + 10} ${pos.cx},${cy - 10} ${pos.cx + 12},${cy + 10}`}
                  fill={color} stroke="white" strokeWidth="1.5"
                />
                <text x={pos.cx} y={cy + 6} textAnchor="middle"
                  fontSize="10" fontWeight="800" fill="white">{pos.number}</text>
                <text x={pos.cx} y={LY.tentLabel} textAnchor="middle"
                  fontSize="8" fontWeight="600"
                  fill={isSel ? '#b8860b' : '#5a4a3a'}>{pos.shortName}</text>
                {pos.rating === 'hot' && (
                  <g>
                    <rect x={pos.cx + 9} y={cy - 20} width="24" height="13" rx="3" fill="#facc15" />
                    <text x={pos.cx + 21} y={cy - 10} textAnchor="middle" fontSize="7" fontWeight="900" fill="#713f12">一級</text>
                  </g>
                )}
              </g>
            );
          })}

          {/* ===== 海底地物（シェイプ＋ラベル） ===== */}
          {seaFeatures.map((sf, i) => (
            <g key={`sf-${i}`}>
              <FeatureShapes type={sf.t} x={sf.svgX} y={sf.svgY} w={sf.svgW} />
              <text
                x={sf.svgX + sf.svgW / 2}
                y={sf.t === 'tetrapod' ? sf.svgY + 24 : sf.svgY - 18}
                textAnchor="middle" fontSize="9" fontWeight="600"
                fill={sf.t === 'tetrapod' ? 'rgba(80,70,50,0.5)' : 'rgba(255,255,255,0.45)'}
              >{sf.name}</text>
            </g>
          ))}

          {/* ===== 魚種ラベル ===== */}
          {seaFishLabels.map((lb, i) => {
            const fishNames = lb.text.split('・');
            const cols = fishNames.length > 6 ? 2 : 1;
            const perCol = Math.ceil(fishNames.length / cols);
            return (
              <g key={`fl-${i}`}>
                {/* 背景 */}
                <rect x={lb.x - 4} y={lb.y - 12}
                  width={cols === 2 ? 220 : 120}
                  height={perCol * 16 + 8}
                  rx="4" fill="rgba(0,40,80,0.5)" />
                {fishNames.map((name, j) => {
                  const col = Math.floor(j / perCol);
                  const row = j % perCol;
                  return (
                    <text key={j}
                      x={lb.x + col * 110}
                      y={lb.y + row * 16}
                      textAnchor="start"
                      fontSize="11" fontWeight="700" fill="rgba(255,255,255,0.95)"
                    >{name}</text>
                  );
                })}
              </g>
            );
          })}

          {/* 海名 */}
          <text x="500" y={LY.deepTop + 28} textAnchor="middle" fontSize="14" fontWeight="500"
            fill="rgba(255,255,255,0.15)" letterSpacing="0.8em">{'~ ' + (data?.seaLabel || '海') + ' ~'}</text>

          {/* ===== 凡例 ===== */}
          <g fontSize="9" fontWeight="600" fill="#5a5a5a">
            {/* テトラ */}
            <g transform={`translate(40,${LY.legendTop + 18})`}>
              <line x1="-6" y1="-6" x2="6" y2="6" stroke="#7a7a6a" strokeWidth="3" strokeLinecap="round" />
              <line x1="6" y1="-6" x2="-6" y2="6" stroke="#7a7a6a" strokeWidth="3" strokeLinecap="round" />
            </g>
            <text x="55" y={LY.legendTop + 22}>テトラ</text>

            {/* 捨石魚礁 */}
            <LegendTriangle x={120} y={LY.legendTop + 18} fill="#d4a030" />
            <text x="133" y={LY.legendTop + 22}>捨石魚礁</text>

            {/* コンクリート魚礁 */}
            <rect x="215" y={LY.legendTop + 12} width="16" height="10" rx="1" fill="#8a9aaa" stroke="#6a7a8a" strokeWidth="1" />
            <text x="237" y={LY.legendTop + 22}>コンクリート魚礁</text>

            {/* 六角錐魚礁 */}
            {(() => {
              const cx = 370, cy = LY.legendTop + 18, r = 7;
              const pts = Array.from({ length: 6 }, (_, j) => {
                const a = (Math.PI / 3) * j - Math.PI / 6;
                return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
              }).join(' ');
              return <polygon points={pts} fill="#7a8a7a" stroke="#5a6a5a" strokeWidth="1" />;
            })()}
            <text x="383" y={LY.legendTop + 22}>六角錐魚礁</text>

            {/* テント */}
            <LegendTriangle x={480} y={LY.legendTop + 18} fill="#6a8a5a" />
            <text x="493" y={LY.legendTop + 22}>テント</text>

            {/* 一級ポイント */}
            <LegendTriangle x={545} y={LY.legendTop + 18} fill="#c0392b" />
            <text x="558" y={LY.legendTop + 22}>一級ポイント</text>

            {/* 好ポイント */}
            <LegendTriangle x={660} y={LY.legendTop + 18} fill="#2980b9" />
            <text x="673" y={LY.legendTop + 22}>好ポイント</text>
          </g>
        </svg>
      </div>

      {/* アクセシビリティ注記 */}
      {data?.accessibilityNote && (
        <p style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>{data.accessibilityNote}</p>
      )}

      {/* 魚の分布メモ */}
      {fishNotes.length > 0 && (
        <div style={{
          display: 'flex', flexDirection: 'column', gap: '2px', padding: '8px 12px',
          background: '#fafaf8', border: '1px solid #e8e4dc', borderRadius: '8px', fontSize: '11px', color: '#64748b',
        }}>
          {fishNotes.map((note, i) => (
            <span key={i} style={{ lineHeight: 1.4 }}>※ {note}</span>
          ))}
        </div>
      )}

      {/* ── 選択中のポイント詳細 ── */}
      {selected && (
        <div className="rounded-xl border bg-card shadow-sm" style={{ padding: '12px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{
              width: '0', height: '0',
              borderLeft: '14px solid transparent', borderRight: '14px solid transparent',
              borderBottom: `24px solid ${RATING_COLOR[selected.rating]}`,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative',
            }}>
              <span style={{
                position: 'absolute', top: '8px', left: '-5px', width: '10px', textAlign: 'center',
                fontSize: '10px', fontWeight: 800, color: 'white',
              }}>{selected.number}</span>
            </span>
            <span style={{ fontWeight: 700, fontSize: '15px' }}>{selected.name}</span>
            {selected.rating === 'hot' && (
              <span style={{
                fontSize: '10px', fontWeight: 700,
                background: '#fef3c7', color: '#92400e',
                padding: '1px 6px', borderRadius: '4px',
              }}>一級ポイント</span>
            )}
          </div>

          <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px', lineHeight: 1.5 }}>
            {selected.description}
          </p>

          {selected.depth && (
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#0284c7', marginBottom: '8px' }}>
              水深: {selected.depth}
            </p>
          )}

          {selected.fish.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '8px' }}>
              {selected.fish.map((f, i) => {
                const s = DIFF_STYLE[f.difficulty];
                return (
                  <span key={i} style={{
                    fontSize: '11px', fontWeight: 600,
                    padding: '3px 8px', borderRadius: '9999px',
                    background: s.bg, color: s.color,
                  }}>
                    {f.name}（{f.method}）
                  </span>
                );
              })}
            </div>
          )}

          {selected.features && selected.features.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {selected.features.map((f, i) => (
                <span key={i} style={{
                  fontSize: '10px', fontWeight: 600,
                  padding: '2px 8px', borderRadius: '9999px',
                  background: '#e0f2fe', color: '#0369a1',
                }}>{f}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
