import { searchIndex } from "@/lib/data/search-index";
import { SearchOverlayClient } from "./search-overlay-client";

export function SearchOverlay() {
  return <SearchOverlayClient items={searchIndex} />;
}
