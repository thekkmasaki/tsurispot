import { homeSearchIndex } from "@/lib/data/search-index";
import { HomeSearchBarClient } from "./home-search-bar-client";

export function HomeSearchBar() {
  return <HomeSearchBarClient items={homeSearchIndex} />;
}
