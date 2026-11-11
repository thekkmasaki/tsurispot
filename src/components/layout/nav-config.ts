/**
 * ヘッダー「もっと見る」とモバイル「もっと」メニューの共通定義（UI/UX刷新Phase5）。
 * 以前はヘッダーとモバイルで別々に定義され、同じページが「図鑑」と「魚図鑑」、
 * 「釣果レポート(/blog)」と「ブログ」のように違う名前で出ていた。ここで1つにまとめ、
 * サウナイキタイのドロワーのように目的別グループで並べる。
 */
import {
  Fish,
  Map,
  MapPin,
  BookOpen,
  GraduationCap,
  Scale,
  Package,
  Target,
  Trophy,
  Calendar,
  Sparkles,
  Compass,
  FileText,
  Anchor,
  Store,
  ClipboardCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon };
export type NavGroup = { title: string; items: NavItem[] };

export const NAV_GROUPS: NavGroup[] = [
  {
    title: "釣り場を探す",
    items: [
      { href: "/spots", label: "スポット", icon: MapPin },
      { href: "/map", label: "地図", icon: Map },
      { href: "/catchable-now", label: "今釣れる魚", icon: Fish },
      { href: "/ranking", label: "ランキング", icon: Trophy },
      { href: "/area", label: "エリア一覧", icon: Compass },
      { href: "/shops", label: "釣具店ガイド", icon: Store },
    ],
  },
  {
    title: "みんなの釣果",
    items: [
      { href: "/timeline", label: "タイムライン", icon: Users },
      { href: "/catch-reports", label: "釣行レポート", icon: Fish },
      { href: "/users", label: "釣り人を探す", icon: Users },
      { href: "/blog", label: "ブログ", icon: FileText },
    ],
  },
  {
    title: "釣りを学ぶ",
    items: [
      { href: "/fish", label: "魚図鑑", icon: BookOpen },
      { href: "/methods", label: "釣り方ガイド", icon: Anchor },
      { href: "/guide", label: "釣りガイド", icon: GraduationCap },
      { href: "/monthly", label: "月別ガイド", icon: Calendar },
      { href: "/area-guide", label: "エリアガイド", icon: MapPin },
      { href: "/gear", label: "おすすめ道具", icon: Package },
      { href: "/fishing-rules", label: "ルール・マナー", icon: Scale },
    ],
  },
  {
    title: "楽しむ",
    items: [
      { href: "/bouzu-checker", label: "ボウズ確率チェッカー", icon: Target },
      { href: "/quiz", label: "釣りクイズ", icon: Sparkles },
      { href: "/instructor-exam", label: "インストラクター試験", icon: ClipboardCheck },
      { href: "/umigyo", label: "海業推進", icon: Anchor },
    ],
  },
];

export function isNavActive(pathname: string, href: string): boolean {
  return pathname === href || (href !== "/" && pathname.startsWith(href));
}
