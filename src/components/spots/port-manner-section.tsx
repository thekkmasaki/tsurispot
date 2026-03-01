"use client";

import { AlertTriangle, Anchor, Fish, Trash2, Car, Clock, Users } from "lucide-react";

const MANNER_ITEMS = [
  { icon: Anchor, title: "漁業者の作業を優先", description: "漁船の出入りや作業中は釣りを一時中断し、通路を確保しましょう。" },
  { icon: Car, title: "駐車マナーを守る", description: "漁港の作業車両の通行を妨げないよう、指定場所に駐車してください。" },
  { icon: Trash2, title: "ゴミは必ず持ち帰る", description: "釣り糸やエサの残り、空き缶などすべてのゴミを持ち帰りましょう。" },
  { icon: Clock, title: "夜間・早朝は静かに", description: "周辺住民や漁業者への配慮として、大声や音楽は控えめに。" },
  { icon: Users, title: "地元ルールに従う", description: "漁港ごとに釣り禁止区域や時間制限があります。掲示物を確認しましょう。" },
  { icon: Fish, title: "資源を大切に", description: "小さな魚はリリース。乱獲は漁業資源を枯渇させます。" },
];

export function PortMannerSection() {
  return (
    <section className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="size-5 text-blue-600" />
        <h3 className="text-lg font-bold text-blue-900">漁港での釣りマナー</h3>
      </div>
      <p className="text-sm text-blue-800 mb-4">
        漁港は漁業者の仕事場です。マナーを守って、漁業者と釣り人が共存できる環境を維持しましょう。
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {MANNER_ITEMS.map((item) => (
          <div key={item.title} className="flex gap-3 rounded-lg bg-white p-3">
            <item.icon className="size-5 text-blue-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-gray-900">{item.title}</p>
              <p className="text-xs text-gray-600 mt-0.5">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 text-xs text-blue-700 flex items-center gap-1">
        <span>※ 水産庁「漁港における釣り利用・調整ガイドライン」に基づく</span>
      </div>
    </section>
  );
}
