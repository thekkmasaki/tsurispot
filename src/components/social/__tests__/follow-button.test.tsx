// FollowButton の initialFollowing 分岐のテスト。
// タイムラインはカードが並ぶため、1枚ごとに /api/follow を叩くとリクエストが件数ぶん増える。
// 呼び出し側が状態を渡したときに取得が発生しないことを担保する。
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import { FollowButton } from "@/components/social/follow-button";

const mockSession = vi.fn();

vi.mock("next-auth/react", () => ({
  useSession: () => mockSession(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/components/ui/toast", () => ({
  toast: { info: vi.fn(), error: vi.fn() },
}));

describe("FollowButton", () => {
  beforeEach(() => {
    mockSession.mockReturnValue({
      data: { user: { tsuriId: "viewer-1" } },
      status: "authenticated",
    });
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("initialFollowing を渡すと状態取得の fetch が発生しない", () => {
    render(<FollowButton tsuriId="other-1" initialFollowing={true} />);

    expect(screen.getByRole("button")).toHaveTextContent("フォロー中");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("initialFollowing=false でも fetch せず即座に押せる状態になる", () => {
    render(<FollowButton tsuriId="other-1" initialFollowing={false} />);

    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("フォロー");
    // 状態取得待ちの "…" / disabled にならないこと
    expect(button).not.toBeDisabled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("initialFollowing 未指定なら従来どおり状態を取得する", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ following: true }),
    } as Response);

    render(<FollowButton tsuriId="other-1" />);

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    expect(vi.mocked(fetch).mock.calls[0][0]).toBe("/api/follow?tsuriId=other-1");
    await waitFor(() => expect(screen.getByRole("button")).toHaveTextContent("フォロー中"));
  });

  it("自分自身には何も描画しない", () => {
    const { container } = render(<FollowButton tsuriId="viewer-1" initialFollowing={false} />);

    expect(container).toBeEmptyDOMElement();
    expect(fetch).not.toHaveBeenCalled();
  });
});
