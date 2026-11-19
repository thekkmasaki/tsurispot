import "@testing-library/jest-dom/vitest";

// jsdom には IntersectionObserver が無い。next/link の useIntersection は IO が無いと
// requestIdleCallback（= setTimeout 1ms）で setVisible(true) を呼ぶため、テストの外（act の外）で
// React の再レンダーが走り、Scheduler（setImmediate）に passive effect の flush が積まれる。
// それが jsdom 破棄後に実行されると「ReferenceError: window is not defined」の unhandled error になり、
// テストは全件 PASS でもジョブが落ちる（area-shop-list.test.tsx で発生）。
// ブラウザと同じく IO を「存在するが、jsdom では何も交差しない」ものとして用意し、遅延更新の発生源を断つ。
// vi.stubGlobal だと各テストの vi.unstubAllGlobals() で外れるため、直接代入する。
if (typeof globalThis.IntersectionObserver === "undefined") {
  class NoopIntersectionObserver implements IntersectionObserver {
    readonly root: Element | Document | null = null;
    readonly rootMargin: string = "0px";
    readonly thresholds: ReadonlyArray<number> = [0];
    readonly scrollMargin: string = "0px";
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  }
  globalThis.IntersectionObserver = NoopIntersectionObserver;
}
