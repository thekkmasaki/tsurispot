@echo off
REM ツリスポ自己改善エージェントを Windows タスクスケジューラに登録する。
REM 1日4回(03/09/15/21時)起動。二重起動は run-cycle.mjs のロックで防止。
REM
REM 使い方: このファイルを「管理者として実行」するか、cmd で叩く。
REM         パスは自分の環境に合わせて REPO を書き換えること。

setlocal
REM エージェント本拠地（OneDrive外・対話作業ツリーと分離）。
set REPO=C:\tsurispot-agent
set TASKNAME=TsuriSpot-SelfImprove

REM 既存タスクがあれば一旦削除（再登録のため）
schtasks /Query /TN "%TASKNAME%" >nul 2>&1 && schtasks /Delete /TN "%TASKNAME%" /F

REM DAILY + 6時間ごと(RI=360分) + 24時間継続(DU) = 1日4回
REM /RL LIMITED: 一般ユーザー権限で実行（masterはdenyで守られているので昇格不要）
schtasks /Create /TN "%TASKNAME%" /SC DAILY /ST 03:00 /RI 360 /DU 24:00 /F /RL LIMITED ^
  /TR "cmd /c cd /d \"%REPO%\" && node scripts\agent\run-cycle.mjs >> logs\agent\schtasks.out 2>&1"

if %ERRORLEVEL%==0 (
  echo.
  echo 登録成功: %TASKNAME%
  echo 確認: schtasks /Query /TN "%TASKNAME%" /V /FO LIST
  echo 手動実行: schtasks /Run /TN "%TASKNAME%"
  echo 削除:    schtasks /Delete /TN "%TASKNAME%" /F
  echo.
  echo ※ 朝の1回だけメトリクス強制更新したい場合は、別途 03:00 用に
  echo    run-cycle.mjs --force-metrics を呼ぶタスクを分けてもよい。
) else (
  echo 登録失敗。管理者権限で実行しているか、REPOパスが正しいか確認。
)
endlocal
