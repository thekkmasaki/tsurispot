"use client";

import { useState } from "react";
import { Copy } from "lucide-react";

interface ShareButtonsProps {
  url: string;
  title: string;
}

export function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  function openPopup(shareUrl: string) {
    window.open(shareUrl, "_blank", "width=600,height=400,noopener,noreferrer");
  }

  function handleCopy() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="relative flex items-center gap-2">
      {/* X (Twitter) */}
      <button
        onClick={() =>
          openPopup(
            `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`
          )
        }
        aria-label="Xでシェア"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white opacity-100 hover:opacity-80 transition-opacity"
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </button>

      {/* LINE */}
      <button
        onClick={() =>
          openPopup(
            `https://social-plugins.line.me/lineit/share?url=${encodedUrl}`
          )
        }
        aria-label="LINEでシェア"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#06C755] text-white opacity-100 hover:opacity-80 transition-opacity"
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
        </svg>
      </button>

      {/* Facebook */}
      <button
        onClick={() =>
          openPopup(
            `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
          )
        }
        aria-label="Facebookでシェア"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1877F2] text-white opacity-100 hover:opacity-80 transition-opacity"
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      </button>

      {/* はてなブックマーク */}
      <button
        onClick={() =>
          openPopup(`https://b.hatena.ne.jp/entry/${url}`)
        }
        aria-label="はてなブックマークに追加"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00A4DE] text-white opacity-100 hover:opacity-80 transition-opacity"
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path d="M20.47 0C22.42 0 24 1.58 24 3.53v16.94C24 22.42 22.42 24 20.47 24H3.53C1.58 24 0 22.42 0 20.47V3.53C0 1.58 1.58 0 3.53 0h16.94zm-3.705 14.47a1.16 1.16 0 1 0 0 2.32 1.16 1.16 0 0 0 0-2.32zm-9.765.408v1.5h3.87v-1.5H6.998zm9.53-7.976c-1.7 0-2.91 1.2-2.91 2.75 0 1.02.56 1.89 1.4 2.38-.59.27-1.02.77-1.02 1.39 0 .5.24.95.64 1.23-.75.28-1.26.93-1.26 1.73 0 1.23 1.13 2.02 2.9 2.02 2.14 0 3.3-.98 3.3-2.3 0-.97-.64-1.67-1.88-1.97l-1.25-.3c-.51-.12-.73-.32-.73-.63 0-.22.1-.42.27-.57.28.07.57.11.88.11 1.69 0 2.88-1.14 2.88-2.74 0-.56-.18-1.08-.49-1.5h1.07V7.3h-2.16a3.14 3.14 0 0 0-1.61-.398zm-9.53.392v3.51H8.8c1.07 0 1.68-.56 1.68-1.51 0-.7-.38-1.17-.96-1.31.46-.17.73-.57.73-1.1 0-.87-.58-1.39-1.56-1.39H6.998zm9.53 1.03c.82 0 1.37.6 1.37 1.44 0 .85-.55 1.44-1.37 1.44-.83 0-1.37-.59-1.37-1.44 0-.84.54-1.44 1.37-1.44zM9.35 9.92c.42 0 .66.23.66.62 0 .4-.24.64-.66.64H8.5V9.92h.85zm-.25-2.02c.39 0 .61.21.61.58 0 .36-.22.58-.61.58H8.5V7.9h.6zm8.155 7.47l.99.24c.66.16.92.44.92.9 0 .6-.56.97-1.47.97-1.03 0-1.58-.36-1.58-.99 0-.5.34-.88.99-1.03l.15-.027z" />
        </svg>
      </button>

      {/* リンクコピー */}
      <button
        onClick={handleCopy}
        aria-label="リンクをコピー"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-700 opacity-100 hover:opacity-80 transition-opacity"
      >
        <Copy className="h-4 w-4" />
      </button>

      {/* コピー成功トースト */}
      {copied && (
        <span className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2.5 py-1 text-xs text-white shadow-md">
          コピーしました！
        </span>
      )}
    </div>
  );
}
