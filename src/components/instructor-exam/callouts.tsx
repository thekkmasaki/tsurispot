import type { ReactNode } from "react";

interface CalloutProps {
  children: ReactNode;
}

/** 重要ポイント（青） */
export function Point({ children }: CalloutProps) {
  return (
    <div className="my-6 rounded-xl border-l-4 border-blue-500 bg-blue-50 p-4">
      <p className="mb-1 text-sm font-bold text-blue-700">
        重要ポイント
      </p>
      <div className="text-sm leading-relaxed text-blue-900">
        {children}
      </div>
    </div>
  );
}

/** 試験に出る！（琥珀色） */
export function Exam({ children }: CalloutProps) {
  return (
    <div className="my-6 rounded-xl border-l-4 border-amber-500 bg-amber-50 p-4">
      <p className="mb-1 text-sm font-bold text-amber-700">
        試験に出る！
      </p>
      <div className="text-sm leading-relaxed text-amber-900">
        {children}
      </div>
    </div>
  );
}

/** ツリスポで理解する（緑） */
export function TsuriSpotBox({ children }: CalloutProps) {
  return (
    <div className="my-6 rounded-xl border-l-4 border-green-500 bg-green-50 p-4">
      <p className="mb-1 text-sm font-bold text-green-700">
        ツリスポで理解する
      </p>
      <div className="text-sm leading-relaxed text-green-900">
        {children}
      </div>
    </div>
  );
}

/** 注意（赤） */
export function Warn({ children }: CalloutProps) {
  return (
    <div className="my-6 rounded-xl border-l-4 border-red-500 bg-red-50 p-4">
      <p className="mb-1 text-sm font-bold text-red-700">
        注意
      </p>
      <div className="text-sm leading-relaxed text-red-900">
        {children}
      </div>
    </div>
  );
}

/** 身近な例えで理解（オレンジ） */
export function Analogy({ children }: CalloutProps) {
  return (
    <div className="my-6 rounded-xl border-l-4 border-orange-500 bg-orange-50 p-4">
      <p className="mb-1 text-sm font-bold text-orange-700">
        身近な例えで理解
      </p>
      <div className="text-sm leading-relaxed text-orange-900">
        {children}
      </div>
    </div>
  );
}
