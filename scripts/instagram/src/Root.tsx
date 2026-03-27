import { Composition } from "remotion";
import { SpotRevealReel } from "./reels/SpotRevealReel";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="SpotReveal"
        component={SpotRevealReel}
        durationInFrames={450} // 15秒 × 30fps
        fps={30}
        width={1080}
        height={1920} // 9:16 リール縦型
        defaultProps={{
          spotName: "平磯海づり公園",
          area: "明石・神戸",
          hook: "この堤防、知ってる？",
          catchCopy: "春のチヌが爆釣する堤防。",
          fish: [
            { name: "チヌ（クロダイ）", size: "40cm超", status: "激アツ" },
            { name: "メバル", size: "25cm級", status: "最盛期" },
            { name: "カレイ", size: "35cm級", status: "ラスト" },
          ],
          photos: {
            main: "https://images.unsplash.com/photo-1500463959177-e0869687df26?w=1200&q=90",
            fish: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=1200&q=90",
            silhouette: "https://images.unsplash.com/photo-1498654077810-12c21d4d6dc3?w=1200&q=90",
          },
          bgmUrl: "/public/bgm-cinematic.mp3",
        }}
      />
    </>
  );
};
