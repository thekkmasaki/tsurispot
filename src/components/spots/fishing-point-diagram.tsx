'use client';

import { useState, useRef, useEffect } from 'react';

// ── 型定義 ──────────────────────────────────────────

export interface SpotDiagramData {
  layout: 'seawall' | 'pier' | 'port' | 'beach';
  structureLabel?: string;
  seaLabel?: string;
  facilities: DiagramFacility[];
  /** 左→右の表示順 */
  positions: DiagramPosition[];
  seaFeatures?: SeaFeature[];
  fishNotes?: string[];
}

export interface DiagramFacility {
  id: string;
  name: string;
  icon: string;
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
}

export interface SeaFeature {
  name: string;
  icon: string;
  left: number;
  width: number;
}

export interface FishingPointDiagramProps {
  spotName: string;
  data: SpotDiagramData;
}

// ── 定数 ──

const RATING_COLOR = { hot: '#ef4444', good: '#3b82f6', normal: '#94a3b8' } as const;
const DIFF_STYLE = {
  easy:   { bg: '#dcfce7', color: '#166534' },
  medium: { bg: '#fef9c3', color: '#854d0e' },
  hard:   { bg: '#fee2e2', color: '#991b1b' },
} as const;

// ── コンポーネント ──

export function FishingPointDiagram({ data }: FishingPointDiagramProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) setCanScroll(el.scrollWidth > el.clientWidth + 4);
  }, [data.positions.length]);

  const selected = data.positions.find(p => p.id === selectedId);
  const toggle = (id: string) => setSelectedId(prev => (prev === id ? null : id));
  const posCount = data.positions.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

      {/* ── 凡例 ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px', fontSize: '11px', color: '#64748b' }}>
        {[
          { color: '#ef4444', label: '一級ポイント' },
          { color: '#3b82f6', label: '好ポイント' },
          { color: '#94a3b8', label: '釣り座' },
        ].map(l => (
          <span key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: l.color }} />
            {l.label}
          </span>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: '10px', color: '#94a3b8' }}>
          {canScroll ? '← スクロール → / タップで詳細' : 'タップで詳細表示'}
        </span>
      </div>

      {/* ── 模式図 ── */}
      <div className="rounded-xl border shadow-sm overflow-hidden select-none"
        style={{ display: 'flex', flexDirection: 'column' }}>

        {/* 施設バー */}
        {data.facilities.length > 0 && (
          <div style={{
            display: 'flex', justifyContent: 'space-evenly', alignItems: 'center',
            minHeight: '32px', background: 'linear-gradient(to bottom, #f5f5f4, #e7e5e4)',
            borderBottom: '1px solid #d6d3d1', padding: '4px 8px', gap: '6px',
            flexWrap: 'wrap',
          }}>
            {data.facilities.map(f => (
              <span key={f.id} style={{
                display: 'flex', alignItems: 'center', gap: '2px',
                whiteSpace: 'nowrap', fontSize: '10px', fontWeight: 600, color: '#57534e',
              }}>
                <span style={{ fontSize: '12px' }}>{f.icon}</span>{f.name}
              </span>
            ))}
          </div>
        )}

        {/* 護岸 / 堤防 + ポイント */}
        <div style={{ background: 'linear-gradient(to bottom, #607d8b, #455a64)' }}>
          {/* 方角 + 構造名 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 10px 0' }}>
            <span style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.45)' }}>← 西</span>
            <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.2em' }}>
              {data.structureLabel || '護岸'}
            </span>
            <span style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.45)' }}>東 →</span>
          </div>

          {/* ポイント列（横スクロール可） */}
          <div ref={scrollRef} style={{
            overflowX: 'auto', overflowY: 'hidden',
            scrollbarWidth: 'none' as const,
            padding: '6px 8px 10px',
          }}>
            <div style={{
              display: 'flex', gap: '2px',
              minWidth: `${Math.max(posCount * 52, 400)}px`,
              justifyContent: 'space-evenly',
            }}>
              {data.positions.map(pos => {
                const isSelected = selectedId === pos.id;
                const color = RATING_COLOR[pos.rating];
                const topFish = pos.rating !== 'normal' ? pos.fish.slice(0, 2) : [];
                return (
                  <button
                    key={pos.id}
                    style={{
                      flex: '1 1 0', minWidth: '42px',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
                      border: 'none', background: 'none', cursor: 'pointer', padding: '2px 0',
                      opacity: selectedId && !isSelected ? 0.3 : 1,
                      transition: 'opacity 0.15s, transform 0.15s',
                      transform: isSelected ? 'scale(1.1)' : 'none',
                    }}
                    onClick={() => toggle(pos.id)}
                  >
                    {/* マーカー円 */}
                    <span style={{
                      position: 'relative',
                      width: '30px', height: '30px', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: color, border: '2px solid rgba(255,255,255,0.85)',
                      boxShadow: isSelected
                        ? '0 0 0 3px #facc15, 0 2px 8px rgba(0,0,0,0.3)'
                        : '0 1px 4px rgba(0,0,0,0.3)',
                      fontSize: '11px', fontWeight: 800, color: 'white',
                    }}>
                      {pos.number}
                      {pos.rating === 'hot' && (
                        <span style={{
                          position: 'absolute', top: '-6px', right: '-8px',
                          background: '#facc15', borderRadius: '3px',
                          padding: '0 3px', fontSize: '7px', fontWeight: 900,
                          color: '#713f12', lineHeight: '13px',
                        }}>
                          一級
                        </span>
                      )}
                    </span>

                    {/* ポイント名 */}
                    <span style={{
                      fontSize: '9px', fontWeight: 700,
                      color: isSelected ? '#facc15' : 'rgba(255,255,255,0.85)',
                      whiteSpace: 'nowrap', lineHeight: 1.1,
                    }}>
                      {pos.shortName}
                    </span>

                    {/* 主要魚名（hot/good のみ） */}
                    {topFish.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        {topFish.map((f, j) => (
                          <span key={j} style={{
                            fontSize: '8px', fontWeight: 600, lineHeight: 1.2,
                            color: pos.rating === 'hot'
                              ? 'rgba(255,200,200,0.9)'
                              : 'rgba(200,220,255,0.9)',
                            whiteSpace: 'nowrap',
                          }}>
                            {f.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 海 + 海底特徴 */}
        <div style={{
          position: 'relative',
          height: data.seaFeatures?.length ? '52px' : '32px',
          background: 'linear-gradient(to bottom, #b3e5fc, #4fc3f7)',
          overflow: 'hidden',
        }}>
          {data.seaFeatures?.map((f, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: `${f.left}%`, width: `${f.width}%`,
              top: '4px', height: '20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,77,128,0.15)', borderRadius: '4px',
              fontSize: '9px', fontWeight: 700,
              color: 'rgba(1,67,120,0.6)', whiteSpace: 'nowrap', padding: '0 4px',
            }}>
              {f.icon} {f.name}
            </div>
          ))}
          <div style={{
            position: 'absolute', bottom: '4px', left: 0, right: 0,
            textAlign: 'center', fontSize: '10px', fontWeight: 500,
            color: 'rgba(1,87,155,0.3)', letterSpacing: '0.5em',
          }}>
            ～ {data.seaLabel || '海'} ～
          </div>
        </div>
      </div>

      {/* ── 魚の分布メモ ── */}
      {data.fishNotes && data.fishNotes.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '0 2px' }}>
          {data.fishNotes.map((note, i) => (
            <span key={i} style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.4 }}>
              📝 {note}
            </span>
          ))}
        </div>
      )}

      {/* ── 選択中のポイント詳細 ── */}
      {selected && (
        <div className="rounded-xl border bg-card shadow-sm" style={{ padding: '12px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{
              width: '28px', height: '28px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: RATING_COLOR[selected.rating],
              fontSize: '12px', fontWeight: 800, color: 'white',
              border: '2px solid rgba(255,255,255,0.7)',
            }}>
              {selected.number}
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
              💧 水深: {selected.depth}
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
                }}>
                  {f}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
