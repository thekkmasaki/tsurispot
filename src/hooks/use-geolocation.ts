"use client";

import { useState, useEffect, useCallback } from "react";

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
  permissionDenied: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: false,
    permissionDenied: false,
  });

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: "お使いのブラウザは位置情報に対応していません",
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
          loading: false,
          permissionDenied: false,
        });
      },
      (err) => {
        const permissionDenied = err.code === err.PERMISSION_DENIED;
        setState({
          latitude: null,
          longitude: null,
          error: permissionDenied
            ? "位置情報の使用が許可されていません"
            : "位置情報を取得できませんでした",
          loading: false,
          permissionDenied,
        });
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000, // 5分キャッシュ
      }
    );
  }, []);

  // 初回: 保存済み位置情報またはpermission許可済みなら自動取得
  useEffect(() => {
    // まずlocalStorageに保存済みの位置情報をチェック（バナー経由で保存されたもの）
    try {
      const saved = localStorage.getItem("tsurispot_user_location");
      if (saved) {
        const parsed = JSON.parse(saved);
        // 1時間以内の位置情報なら再利用
        if (parsed.latitude && parsed.longitude && Date.now() - parsed.timestamp < 3600000) {
          setState({
            latitude: parsed.latitude,
            longitude: parsed.longitude,
            error: null,
            loading: false,
            permissionDenied: false,
          });
          return;
        }
      }
    } catch {
      // パースエラーは無視
    }

    // permissions APIでチェック
    if (navigator.permissions) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        if (result.state === "granted") {
          requestLocation();
        }
      });
    } else {
      // permissions API未対応（iOS Safari等）: geolocation APIを直接試行
      // permissionが既に許可されていれば成功する
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setState({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            error: null,
            loading: false,
            permissionDenied: false,
          });
        },
        () => {
          // 失敗は無視（ボタン押下で再試行される）
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }
      );
    }
  }, [requestLocation]);

  return { ...state, requestLocation };
}
