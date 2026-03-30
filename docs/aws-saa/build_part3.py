#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Build part3-advanced.html in chunks"""
import os

OUTPUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'part3-advanced.html')

def w(text):
    with open(OUTPUT, 'a', encoding='utf-8') as f:
        f.write(text)

# Clear file first
with open(OUTPUT, 'w', encoding='utf-8') as f:
    f.write('')

print(f"Writing to: {OUTPUT}")

# ==================== HEADER ====================
w('''<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AWS SAA-C03 完全攻略ガイド Part 3: 応用・実戦編 〜ツリスポで学ぶAWS〜</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Segoe UI', 'Hiragino Sans', 'Noto Sans JP', sans-serif; line-height: 1.9; color: #1e293b; background: #f8fafc; }
.container { max-width: 900px; margin: 0 auto; padding: 2rem 1.5rem; }
h1 { font-size: 2rem; color: #0c4a6e; border-bottom: 3px solid #0ea5e9; padding-bottom: 0.5rem; margin: 2rem 0 1rem; }
h2 { font-size: 1.6rem; color: #0369a1; margin: 3rem 0 1rem; border-left: 4px solid #0ea5e9; padding-left: 0.8rem; }
h3 { font-size: 1.25rem; color: #334155; margin: 2rem 0 0.8rem; }
h4 { font-size: 1.05rem; color: #475569; margin: 1.2rem 0 0.5rem; }
p { margin-bottom: 1rem; }
ul, ol { margin: 0.5rem 0 1rem 1.5rem; }
li { margin-bottom: 0.3rem; }
.header-bar { background: linear-gradient(135deg, #0c4a6e, #0369a1); color: #fff; padding: 2rem 1.5rem; text-align: center; }
.header-bar h1 { color: #fff; border: none; margin: 0; font-size: 1.8rem; }
.header-bar p { color: #bae6fd; margin: 0.5rem 0 0; }
.nav { display: flex; gap: 0.8rem; margin: 1.5rem 0; flex-wrap: wrap; }
.nav a { background: #e2e8f0; color: #334155; padding: 0.5rem 1rem; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 0.9rem; }
.nav a.current { background: #0c4a6e; color: #fff; }
.nav a:hover { background: #0ea5e9; color: #fff; }
.toc { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem 2rem; margin: 1.5rem 0; }
.toc h3 { margin-top: 0; }
.toc ul { list-style: none; padding: 0; }
.toc li { margin: 0.4rem 0; padding-left: 1rem; border-left: 2px solid #e2e8f0; }
.toc a { color: #0369a1; text-decoration: none; }
.toc a:hover { text-decoration: underline; }
.tsurispot { background: #f0fdf4; border: 1px solid #86efac; border-radius: 12px; padding: 1.2rem 1.5rem; margin: 1.5rem 0; }
.tsurispot::before { content: '\\1F3A3 ツリスポで理解する'; display: block; font-weight: 700; color: #166534; margin-bottom: 0.5rem; font-size: 1.05rem; }
.exam { background: #fef3c7; border: 1px solid #fcd34d; border-radius: 12px; padding: 1.2rem 1.5rem; margin: 1.5rem 0; }
.exam::before { content: '\\1F4DD 試験に出る！'; display: block; font-weight: 700; color: #92400e; margin-bottom: 0.5rem; font-size: 1.05rem; }
.point { background: #eff6ff; border: 1px solid #93c5fd; border-radius: 12px; padding: 1.2rem 1.5rem; margin: 1.5rem 0; }
.point::before { content: '\\1F4A1 重要ポイント'; display: block; font-weight: 700; color: #1d4ed8; margin-bottom: 0.5rem; font-size: 1.05rem; }
.warn { background: #fef2f2; border: 1px solid #fca5a5; border-radius: 12px; padding: 1.2rem 1.5rem; margin: 1.5rem 0; }
.warn::before { content: '\\26A0\\FE0F 注意'; display: block; font-weight: 700; color: #dc2626; margin-bottom: 0.5rem; }
.diagram { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; margin: 1.5rem 0; text-align: center; overflow-x: auto; }
.diagram figcaption { font-size: 0.85rem; color: #64748b; margin-top: 0.8rem; }
table { width: 100%; border-collapse: collapse; margin: 1.2rem 0; font-size: 0.9rem; }
th { background: #0c4a6e; color: #fff; padding: 0.7rem 0.8rem; text-align: left; }
td { padding: 0.7rem 0.8rem; border-bottom: 1px solid #e2e8f0; }
tr:nth-child(even) { background: #f8fafc; }
code { background: #f1f5f9; padding: 0.15em 0.4em; border-radius: 4px; font-size: 0.88em; color: #be185d; }
pre { background: #1e293b; color: #e2e8f0; padding: 1.2rem; border-radius: 8px; overflow-x: auto; margin: 1rem 0; font-size: 0.85rem; line-height: 1.6; }
.chapter-num { display: inline-block; background: #0ea5e9; color: #fff; width: 2rem; height: 2rem; line-height: 2rem; text-align: center; border-radius: 50%; font-weight: 700; margin-right: 0.5rem; font-size: 0.9rem; }
.summary-box { background: linear-gradient(135deg, #f0f9ff, #e0f2fe); border: 2px solid #0ea5e9; border-radius: 12px; padding: 1.5rem; margin: 2rem 0; }
.summary-box h4 { color: #0c4a6e; margin-top: 0; }
.quiz { background: #faf5ff; border: 1px solid #d8b4fe; border-radius: 12px; padding: 1.2rem 1.5rem; margin: 1.5rem 0; }
.quiz::before { content: '\\2753 確認クイズ'; display: block; font-weight: 700; color: #7c3aed; margin-bottom: 0.5rem; }
.quiz details { margin-top: 0.5rem; }
.quiz summary { cursor: pointer; color: #7c3aed; font-weight: 600; }
.analogy { background: #fff7ed; border: 1px solid #fed7aa; border-radius: 12px; padding: 1.2rem 1.5rem; margin: 1.5rem 0; }
.analogy::before { content: '\\1F3E0 身近な例えで理解'; display: block; font-weight: 700; color: #c2410c; margin-bottom: 0.5rem; }
.question-card { background: #fff; border: 2px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; margin: 1.5rem 0; }
.question-card h4 { color: #0c4a6e; margin-top: 0; }
.question-card .choices { list-style: upper-alpha; margin: 1rem 0 1rem 1.5rem; }
.question-card .choices li { margin: 0.5rem 0; padding: 0.3rem 0; }
.question-card details { margin-top: 1rem; border-top: 1px solid #e2e8f0; padding-top: 1rem; }
.question-card summary { cursor: pointer; color: #0369a1; font-weight: 700; }
.question-card .answer { margin-top: 0.5rem; }
.question-card .answer .correct { color: #166534; font-weight: 700; }
</style>
</head>
<body>
<div class="header-bar">
  <h1>AWS SAA-C03 完全攻略ガイド</h1>
  <p>Part 3: 応用・実戦編（第13章〜第18章）〜ツリスポで学ぶAWS〜</p>
</div>
<div class="container">
<div class="nav">
  <a href="part1-foundations.html">Part 1: 基礎編</a>
  <a href="part2-architecture.html">Part 2: 設計編</a>
  <a href="part3-advanced.html" class="current">Part 3: 応用・実戦編</a>
</div>
<div class="toc">
  <h3>目次 - Part 3: 応用・実戦編</h3>
  <ul>
    <li><a href="#ch13"><span class="chapter-num">13</span> モニタリングと運用</a></li>
    <li><a href="#ch14"><span class="chapter-num">14</span> メッセージングとデカップリング</a></li>
    <li><a href="#ch15"><span class="chapter-num">15</span> データ分析サービス</a></li>
    <li><a href="#ch16"><span class="chapter-num">16</span> 移行と転送</a></li>
    <li><a href="#ch17"><span class="chapter-num">17</span> コスト最適化とWell-Architected Framework</a></li>
    <li><a href="#ch18"><span class="chapter-num">18</span> 模擬問題50問</a></li>
  </ul>
</div>
''')

print("Header done")

# ==================== CHAPTER 13 ====================
w('''
<h1 id="ch13"><span class="chapter-num">13</span> モニタリングと運用 〜システムの健康状態を監視する〜</h1>

<p>AWSで本番環境を運用する上で最も重要なことの一つが「モニタリング（監視）」です。サーバーが落ちていることに気づかない、CPU使用率が100%に張り付いているのに誰も知らない――そんな事態を防ぐのが、この章で学ぶサービス群です。</p>

<div class="analogy">
<p>モニタリングは「車のダッシュボード」に例えられます。速度計、燃料計、エンジン警告灯など、車の状態を一目で確認できますよね。AWSのモニタリングサービスは、システム全体のダッシュボードを提供し、問題があれば警告を鳴らしてくれます。</p>
</div>

<h2>13.1 CloudWatch 〜AWSの統合監視サービス〜</h2>

<p>Amazon CloudWatchは、AWSリソースとアプリケーションの監視サービスです。メトリクス（数値データ）の収集、ログの管理、アラームの設定など、監視に関するほぼすべてを担います。</p>

<h3>13.1.1 メトリクス（Metrics）</h3>

<p>メトリクスとは、時系列で記録される数値データのことです。「EC2のCPU使用率」「ALBのリクエスト数」「RDSの接続数」などがメトリクスにあたります。</p>

<h4>標準メトリクス vs カスタムメトリクス</h4>

<table>
<tr><th>種類</th><th>説明</th><th>例</th><th>費用</th></tr>
<tr><td><strong>標準メトリクス</strong></td><td>AWSが自動で収集</td><td>EC2: CPUUtilization, NetworkIn/Out<br>ALB: RequestCount, TargetResponseTime</td><td>無料</td></tr>
<tr><td><strong>カスタムメトリクス</strong></td><td>ユーザーが独自に送信</td><td>メモリ使用率、ディスク使用率、アプリ固有の数値</td><td>有料（$0.30/メトリクス/月）</td></tr>
</table>

<div class="exam">
<p><strong>EC2の「メモリ使用率」は標準メトリクスに含まれない！</strong> EC2のCPU使用率は自動で取得できますが、メモリ使用率はOSの中の情報なのでCloudWatch Agentをインストールしてカスタムメトリクスとして送信する必要があります。これは超頻出問題です。</p>
</div>

<h4>メトリクスの基本概念</h4>
<ul>
<li><strong>名前空間（Namespace）</strong>: メトリクスのグループ分け。例: <code>AWS/EC2</code>、<code>AWS/RDS</code>、<code>Custom/TsuriSpot</code></li>
<li><strong>ディメンション（Dimension）</strong>: メトリクスを細分化する属性。例: <code>InstanceId=i-12345</code> で特定のEC2を指定</li>
<li><strong>統計（Statistics）</strong>: Average（平均）、Sum（合計）、Maximum、Minimum、SampleCount、pNN（パーセンタイル）</li>
<li><strong>期間（Period）</strong>: データの集計間隔。標準5分、詳細モニタリング（有料）で1分</li>
</ul>

<h3>13.1.2 CloudWatch Alarms</h3>

<p>メトリクスが閾値（しきいち）を超えたときに通知やアクションを実行します。</p>

<p>アラームの3つの状態:</p>
<ul>
<li><strong>OK</strong>: 閾値の範囲内（正常）</li>
<li><strong>ALARM</strong>: 閾値を超えた（異常）</li>
<li><strong>INSUFFICIENT_DATA</strong>: データ不足で判定不可</li>
</ul>

<p>発動時のアクション:</p>
<ul>
<li><strong>SNS通知</strong>: メール・SMSで関係者に通知</li>
<li><strong>Auto Scalingアクション</strong>: インスタンスを増減</li>
<li><strong>EC2アクション</strong>: 停止・終了・再起動・復旧</li>
</ul>

<h4>コンポジットアラーム</h4>
<p>複数のアラームをAND/OR条件で組み合わせた上位アラーム。「CPU 80%超え AND メモリ 70%超え」のときだけ通知、のように設定でき、アラームの嵐を防げます。</p>

<div class="tsurispot">
<p><strong>ツリスポのApp Runner監視</strong>: App RunnerのCPU使用率が80%を超えたらCloudWatch Alarm → SNS → 運営者メールに通知。コンポジットアラームで「CPU高 AND メモリ高」のときだけ緊急通知にすれば、一時的なスパイクによる誤報を減らせます。</p>
</div>

<h3>13.1.3 CloudWatch Logs</h3>

<p>アプリケーションやAWSサービスのログを集中管理するサービスです。</p>

<ul>
<li><strong>ロググループ（Log Group）</strong>: ログの大きなまとまり。アプリごとに1つ（例: <code>/app-runner/tsurispot</code>）</li>
<li><strong>ログストリーム（Log Stream）</strong>: ロググループ内の個別ログの流れ。インスタンスごとに1つ</li>
<li><strong>保持期間</strong>: 1日〜10年、または無期限</li>
</ul>

<h4>主要機能</h4>
<ul>
<li><strong>メトリクスフィルター</strong>: ログから特定パターン（"ERROR"等）を検出 → メトリクス化 → アラーム設定可能</li>
<li><strong>Logs Insights</strong>: SQLライクなクエリでログ分析</li>
<li><strong>S3エクスポート</strong>: 長期保管用（最大12時間の遅延あり）</li>
<li><strong>サブスクリプションフィルター</strong>: リアルタイムで他サービス（Lambda、Kinesis Data Firehose、OpenSearch）に転送</li>
</ul>

<div class="exam">
<p><strong>S3エクスポート vs サブスクリプションフィルター</strong>: S3エクスポートは最大12時間遅延。リアルタイム処理にはサブスクリプションフィルター → Kinesis Data Firehose → S3 を使う。「リアルタイム」が出たらサブスクリプションフィルター！</p>
</div>

<h3>13.1.4 CloudWatch Agent</h3>

<p>EC2やオンプレミスサーバーにインストールし、OS内部の情報を取得してCloudWatchに送信するエージェントです。</p>

<ul>
<li><strong>カスタムメトリクス</strong>: メモリ使用率、ディスク使用率、スワップ使用率</li>
<li><strong>ログ収集</strong>: アプリケーションログ、OSログをCloudWatch Logsに転送</li>
</ul>

<div class="exam">
<p><strong>定番問題</strong>:「EC2のメモリ使用率を監視したい」→ CloudWatch Agent。「アプリログをCloudWatch Logsに送りたい」→ CloudWatch Agent。エージェントが必要な場面は必ず出題されます。</p>
</div>

<h3>13.1.5 その他のCloudWatch機能</h3>
<ul>
<li><strong>Dashboards</strong>: メトリクス一覧表示。リージョン横断で表示可能</li>
<li><strong>Contributor Insights</strong>: ログからTop-Nの要因を特定（最もエラーを出すIPなど）</li>
<li><strong>Metric Streams</strong>: メトリクスをKinesis Data Firehose経由で外部（Datadog等）に配信</li>
</ul>

<div class="diagram">
<svg viewBox="0 0 780 320" xmlns="http://www.w3.org/2000/svg" font-family="Segoe UI, Hiragino Sans, sans-serif">
  <defs><marker id="a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b"/></marker></defs>
  <rect x="15" y="120" width="100" height="55" rx="8" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
  <text x="65" y="143" text-anchor="middle" font-size="11" fill="#1e40af" font-weight="bold">App / EC2</text>
  <text x="65" y="162" text-anchor="middle" font-size="10" fill="#3b82f6">ログ出力</text>
  <rect x="150" y="120" width="95" height="55" rx="8" fill="#fef3c7" stroke="#f59e0b" stroke-width="2"/>
  <text x="197" y="143" text-anchor="middle" font-size="11" fill="#92400e" font-weight="bold">CW Agent</text>
  <text x="197" y="162" text-anchor="middle" font-size="10" fill="#b45309">収集・転送</text>
  <rect x="280" y="100" width="120" height="95" rx="8" fill="#eff6ff" stroke="#3b82f6" stroke-width="2"/>
  <text x="340" y="128" text-anchor="middle" font-size="13" fill="#1e40af" font-weight="bold">CloudWatch</text>
  <text x="340" y="148" text-anchor="middle" font-size="13" fill="#1e40af" font-weight="bold">Logs</text>
  <text x="340" y="172" text-anchor="middle" font-size="10" fill="#3b82f6">ロググループ</text>
  <text x="340" y="188" text-anchor="middle" font-size="10" fill="#3b82f6">ログストリーム</text>
  <rect x="460" y="15" width="130" height="42" rx="8" fill="#fef3c7" stroke="#f59e0b" stroke-width="2"/>
  <text x="525" y="33" text-anchor="middle" font-size="10" fill="#92400e" font-weight="bold">メトリクスフィルター</text>
  <text x="525" y="49" text-anchor="middle" font-size="9" fill="#b45309">パターン検出→数値化</text>
  <rect x="640" y="15" width="110" height="42" rx="8" fill="#fef2f2" stroke="#ef4444" stroke-width="2"/>
  <text x="695" y="33" text-anchor="middle" font-size="10" fill="#dc2626" font-weight="bold">Alarm → SNS</text>
  <text x="695" y="49" text-anchor="middle" font-size="9" fill="#dc2626">メール通知</text>
  <rect x="460" y="80" width="130" height="42" rx="8" fill="#f0fdf4" stroke="#22c55e" stroke-width="2"/>
  <text x="525" y="98" text-anchor="middle" font-size="10" fill="#166534" font-weight="bold">Logs Insights</text>
  <text x="525" y="114" text-anchor="middle" font-size="9" fill="#15803d">SQLクエリ分析</text>
  <rect x="460" y="145" width="130" height="42" rx="8" fill="#ede9fe" stroke="#8b5cf6" stroke-width="2"/>
  <text x="525" y="163" text-anchor="middle" font-size="10" fill="#6d28d9" font-weight="bold">サブスクリプション</text>
  <text x="525" y="179" text-anchor="middle" font-size="9" fill="#7c3aed">リアルタイム転送</text>
  <rect x="640" y="145" width="110" height="42" rx="8" fill="#fce7f3" stroke="#ec4899" stroke-width="2"/>
  <text x="695" y="163" text-anchor="middle" font-size="10" fill="#be185d" font-weight="bold">Lambda/Firehose</text>
  <text x="695" y="179" text-anchor="middle" font-size="9" fill="#be185d">→ S3/OpenSearch</text>
  <rect x="460" y="210" width="130" height="42" rx="8" fill="#f0fdf4" stroke="#22c55e" stroke-width="2"/>
  <text x="525" y="228" text-anchor="middle" font-size="10" fill="#166534" font-weight="bold">S3エクスポート</text>
  <text x="525" y="244" text-anchor="middle" font-size="9" fill="#15803d">最大12h遅延</text>
  <rect x="640" y="210" width="110" height="42" rx="8" fill="#fef3c7" stroke="#f59e0b" stroke-width="2"/>
  <text x="695" y="236" text-anchor="middle" font-size="12" fill="#92400e" font-weight="bold">S3</text>
  <line x1="115" y1="148" x2="150" y2="148" stroke="#64748b" stroke-width="2" marker-end="url(#a1)"/>
  <line x1="245" y1="148" x2="280" y2="148" stroke="#64748b" stroke-width="2" marker-end="url(#a1)"/>
  <line x1="400" y1="120" x2="460" y2="36" stroke="#64748b" stroke-width="1.5" marker-end="url(#a1)"/>
  <line x1="400" y1="135" x2="460" y2="101" stroke="#64748b" stroke-width="1.5" marker-end="url(#a1)"/>
  <line x1="400" y1="158" x2="460" y2="166" stroke="#64748b" stroke-width="1.5" marker-end="url(#a1)"/>
  <line x1="400" y1="180" x2="460" y2="231" stroke="#64748b" stroke-width="1.5" marker-end="url(#a1)"/>
  <line x1="590" y1="36" x2="640" y2="36" stroke="#64748b" stroke-width="1.5" marker-end="url(#a1)"/>
  <line x1="590" y1="166" x2="640" y2="166" stroke="#64748b" stroke-width="1.5" marker-end="url(#a1)"/>
  <line x1="590" y1="231" x2="640" y2="231" stroke="#64748b" stroke-width="1.5" marker-end="url(#a1)"/>
</svg>
<figcaption>図13-1: CloudWatch Logsのデータフロー</figcaption>
</div>

<h2>13.2 CloudTrail 〜誰が何をしたかの記録〜</h2>

<p>AWS CloudTrailは、AWSアカウント内で「誰が」「いつ」「どのAPI操作を行ったか」を記録する監査ログサービスです。CloudWatchが「システムの状態」を監視するのに対し、CloudTrailは「人やプログラムの操作」を記録します。</p>

<div class="analogy">
<p>CloudTrailは「監視カメラの録画」です。オフィスの出入り口のカメラが誰がいつ入退室したかを記録するように、AWSの全API操作を記録します。何か問題が起きたとき「誰がやったのか」を特定するために不可欠です。</p>
</div>

<h3>イベントの種類</h3>

<table>
<tr><th>イベント種類</th><th>内容</th><th>デフォルト</th><th>例</th></tr>
<tr><td><strong>管理イベント</strong></td><td>リソースの作成・変更・削除</td><td>有効（無料）</td><td>EC2起動、IAMロール作成</td></tr>
<tr><td><strong>データイベント</strong></td><td>リソース内のデータ操作</td><td>無効（有料）</td><td>S3のGet/Put、Lambda実行</td></tr>
<tr><td><strong>インサイトイベント</strong></td><td>異常なAPIアクティビティ検出</td><td>無効（有料）</td><td>大量のTerminateInstances</td></tr>
</table>

<div class="exam">
<p><strong>CloudTrailのログ配信先</strong>: S3バケットに保存。CloudWatch Logsにも配信可能で、「ルートユーザーがログインしたら通知」のようなセキュリティ監視に使えます。ログの整合性チェック機能で改ざん検知もできます。</p>
</div>

<div class="tsurispot">
<p><strong>ツリスポのCloudTrail活用</strong>: 「誰がS3バケットの権限を変更したか」「いつApp Runnerが更新されたか」が全て記録されます。不正アクセス調査や、昨日のデプロイで何が変わったかの振り返りにも使えます。</p>
</div>

<h2>13.3 EventBridge 〜イベント駆動の心臓部〜</h2>

<p>Amazon EventBridge（旧CloudWatch Events）は、イベントを検知しターゲットにルーティングする「イベントバス」です。</p>

<div class="analogy">
<p>EventBridgeは「郵便局の仕分けシステム」です。差出人（AWSサービスやアプリ）からの手紙（イベント）を、宛先ルールに基づいて届け先（Lambda、SQSなど）に仕分けます。</p>
</div>

<h3>イベントバスの種類</h3>
<ul>
<li><strong>デフォルトイベントバス</strong>: AWSサービスからのイベント</li>
<li><strong>パートナーイベントバス</strong>: SaaSパートナーからのイベント</li>
<li><strong>カスタムイベントバス</strong>: 自作アプリからのイベント</li>
</ul>

<h3>ルールとターゲット</h3>
<ul>
<li><strong>イベントパターン</strong>: 特定イベントに反応（EC2停止、S3オブジェクト作成など）</li>
<li><strong>スケジュール</strong>: cron式（<code>cron(0 9 * * ? *)</code> = 毎日UTC 9:00）やrate式で定期実行</li>
</ul>

<p>ターゲット: Lambda、SQS、SNS、Step Functions、ECSタスク等150以上のサービス</p>

<div class="exam">
<p><strong>EventBridgeのスキーマレジストリ</strong>: イベントの構造（スキーマ）を自動検出・保存する機能。開発者がイベント形式を調べる手間を省けます。</p>
</div>

<div class="diagram">
<svg viewBox="0 0 760 270" xmlns="http://www.w3.org/2000/svg" font-family="Segoe UI, Hiragino Sans, sans-serif">
  <defs><marker id="a2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b"/></marker></defs>
  <rect x="10" y="15" width="125" height="38" rx="8" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
  <text x="72" y="39" text-anchor="middle" font-size="11" fill="#1e40af" font-weight="bold">EC2 状態変化</text>
  <rect x="10" y="65" width="125" height="38" rx="8" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
  <text x="72" y="89" text-anchor="middle" font-size="11" fill="#1e40af" font-weight="bold">S3 Put/Delete</text>
  <rect x="10" y="115" width="125" height="38" rx="8" fill="#f0fdf4" stroke="#22c55e" stroke-width="2"/>
  <text x="72" y="139" text-anchor="middle" font-size="11" fill="#166534" font-weight="bold">カスタムアプリ</text>
  <rect x="10" y="165" width="125" height="38" rx="8" fill="#fef3c7" stroke="#f59e0b" stroke-width="2"/>
  <text x="72" y="189" text-anchor="middle" font-size="11" fill="#92400e" font-weight="bold">cron スケジュール</text>
  <rect x="220" y="45" width="155" height="140" rx="12" fill="#ede9fe" stroke="#8b5cf6" stroke-width="3"/>
  <text x="297" y="90" text-anchor="middle" font-size="15" fill="#6d28d9" font-weight="bold">EventBridge</text>
  <text x="297" y="115" text-anchor="middle" font-size="11" fill="#7c3aed">イベントバス</text>
  <text x="297" y="138" text-anchor="middle" font-size="11" fill="#7c3aed">+ ルール</text>
  <text x="297" y="160" text-anchor="middle" font-size="10" fill="#7c3aed">(フィルタリング)</text>
  <rect x="470" y="5" width="115" height="36" rx="8" fill="#fce7f3" stroke="#ec4899" stroke-width="2"/>
  <text x="527" y="28" text-anchor="middle" font-size="11" fill="#be185d" font-weight="bold">Lambda</text>
  <rect x="470" y="55" width="115" height="36" rx="8" fill="#fef3c7" stroke="#f59e0b" stroke-width="2"/>
  <text x="527" y="78" text-anchor="middle" font-size="11" fill="#92400e" font-weight="bold">SQS</text>
  <rect x="470" y="105" width="115" height="36" rx="8" fill="#f0fdf4" stroke="#22c55e" stroke-width="2"/>
  <text x="527" y="128" text-anchor="middle" font-size="11" fill="#166534" font-weight="bold">SNS → Email</text>
  <rect x="470" y="155" width="115" height="36" rx="8" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
  <text x="527" y="178" text-anchor="middle" font-size="11" fill="#1e40af" font-weight="bold">Step Functions</text>
  <rect x="470" y="205" width="115" height="36" rx="8" fill="#fef2f2" stroke="#ef4444" stroke-width="2"/>
  <text x="527" y="228" text-anchor="middle" font-size="11" fill="#dc2626" font-weight="bold">ECS タスク</text>
  <line x1="135" y1="34" x2="220" y2="85" stroke="#64748b" stroke-width="1.5" marker-end="url(#a2)"/>
  <line x1="135" y1="84" x2="220" y2="105" stroke="#64748b" stroke-width="1.5" marker-end="url(#a2)"/>
  <line x1="135" y1="134" x2="220" y2="125" stroke="#64748b" stroke-width="1.5" marker-end="url(#a2)"/>
  <line x1="135" y1="184" x2="220" y2="155" stroke="#64748b" stroke-width="1.5" marker-end="url(#a2)"/>
  <line x1="375" y1="85" x2="470" y2="23" stroke="#64748b" stroke-width="1.5" marker-end="url(#a2)"/>
  <line x1="375" y1="100" x2="470" y2="73" stroke="#64748b" stroke-width="1.5" marker-end="url(#a2)"/>
  <line x1="375" y1="118" x2="470" y2="123" stroke="#64748b" stroke-width="1.5" marker-end="url(#a2)"/>
  <line x1="375" y1="138" x2="470" y2="173" stroke="#64748b" stroke-width="1.5" marker-end="url(#a2)"/>
  <line x1="375" y1="160" x2="470" y2="223" stroke="#64748b" stroke-width="1.5" marker-end="url(#a2)"/>
</svg>
<figcaption>図13-2: EventBridgeのイベントバスパターン</figcaption>
</div>

<div class="tsurispot">
<p><strong>ツリスポの自動化</strong>: EventBridgeで毎週月曜朝9時にLambda起動 → microCMS APIで記事の公開状態を自動チェック。App Runnerデプロイ完了イベント → SNS → Slack通知。手作業ゼロの運用自動化が実現できます。</p>
</div>

<h2>13.4 X-Ray 〜分散トレーシング〜</h2>

<p>AWS X-Rayは、マイクロサービスでリクエストが複数サービスを通過する様子を可視化する「分散トレーシング」サービスです。API Gateway → Lambda → DynamoDB のどこで遅延が発生しているかを特定できます。</p>

<div class="exam">
<p><strong>X-Rayの出題キーワード</strong>:「レイテンシの原因特定」「分散アプリのデバッグ」「サービスマップ」「トレース」「ボトルネック」→ 全てX-Ray。</p>
</div>

<h2>13.5 Config / Trusted Advisor / Health Dashboard</h2>

<h3>AWS Config</h3>
<p>リソースの設定変更を記録し、コンプライアンスルールへの準拠を評価。「S3がパブリックでないか」「EC2にタグがあるか」を自動チェックします。</p>

<div class="point">
<p><strong>CloudTrail vs Config</strong>: CloudTrail=「誰が何をした」（API操作ログ）、Config=「設定がどう変わった、正しいか」（設定変更履歴+評価）。</p>
</div>

<h3>Trusted Advisor</h3>
<p>5カテゴリでベストプラクティスを提案: コスト最適化/パフォーマンス/セキュリティ/耐障害性/サービス制限。</p>

<div class="warn">
<p>全チェック項目は<strong>Business以上のサポートプラン</strong>が必要。Basic/Developerでは一部のみ。</p>
</div>

<h3>Health Dashboard</h3>
<ul>
<li><strong>Service Health</strong>: AWSサービス全体の稼働状況</li>
<li><strong>Your Account Health</strong>: 自分のアカウントに影響するイベント通知</li>
</ul>

<div class="diagram">
<svg viewBox="0 0 760 310" xmlns="http://www.w3.org/2000/svg" font-family="Segoe UI, Hiragino Sans, sans-serif">
  <text x="380" y="22" text-anchor="middle" font-size="14" fill="#0c4a6e" font-weight="bold">モニタリング・運用サービス全体図</text>
  <rect x="15" y="40" width="165" height="110" rx="10" fill="#eff6ff" stroke="#3b82f6" stroke-width="2"/>
  <text x="97" y="65" text-anchor="middle" font-size="13" fill="#1e40af" font-weight="bold">CloudWatch</text>
  <text x="97" y="85" text-anchor="middle" font-size="10" fill="#3b82f6">メトリクス / ログ</text>
  <text x="97" y="102" text-anchor="middle" font-size="10" fill="#3b82f6">アラーム / ダッシュボード</text>
  <text x="97" y="140" text-anchor="middle" font-size="9" fill="#64748b" font-style="italic">「今の状態は？」</text>
  <rect x="200" y="40" width="165" height="110" rx="10" fill="#fef3c7" stroke="#f59e0b" stroke-width="2"/>
  <text x="282" y="65" text-anchor="middle" font-size="13" fill="#92400e" font-weight="bold">CloudTrail</text>
  <text x="282" y="85" text-anchor="middle" font-size="10" fill="#b45309">API操作ログ / 監査</text>
  <text x="282" y="102" text-anchor="middle" font-size="10" fill="#b45309">整合性チェック</text>
  <text x="282" y="140" text-anchor="middle" font-size="9" fill="#64748b" font-style="italic">「誰が何をした？」</text>
  <rect x="385" y="40" width="165" height="110" rx="10" fill="#ede9fe" stroke="#8b5cf6" stroke-width="2"/>
  <text x="467" y="65" text-anchor="middle" font-size="13" fill="#6d28d9" font-weight="bold">EventBridge</text>
  <text x="467" y="85" text-anchor="middle" font-size="10" fill="#7c3aed">イベント駆動</text>
  <text x="467" y="102" text-anchor="middle" font-size="10" fill="#7c3aed">スケジュール(cron)</text>
  <text x="467" y="140" text-anchor="middle" font-size="9" fill="#64748b" font-style="italic">「何か起きたら実行」</text>
  <rect x="570" y="40" width="165" height="110" rx="10" fill="#fce7f3" stroke="#ec4899" stroke-width="2"/>
  <text x="652" y="65" text-anchor="middle" font-size="13" fill="#be185d" font-weight="bold">X-Ray</text>
  <text x="652" y="85" text-anchor="middle" font-size="10" fill="#db2777">分散トレーシング</text>
  <text x="652" y="102" text-anchor="middle" font-size="10" fill="#db2777">サービスマップ</text>
  <text x="652" y="140" text-anchor="middle" font-size="9" fill="#64748b" font-style="italic">「どこが遅い？」</text>
  <rect x="15" y="175" width="165" height="100" rx="10" fill="#f0fdf4" stroke="#22c55e" stroke-width="2"/>
  <text x="97" y="200" text-anchor="middle" font-size="13" fill="#166534" font-weight="bold">AWS Config</text>
  <text x="97" y="220" text-anchor="middle" font-size="10" fill="#15803d">設定記録 / 評価</text>
  <text x="97" y="260" text-anchor="middle" font-size="9" fill="#64748b" font-style="italic">「設定は正しい？」</text>
  <rect x="200" y="175" width="165" height="100" rx="10" fill="#fff7ed" stroke="#f97316" stroke-width="2"/>
  <text x="282" y="200" text-anchor="middle" font-size="13" fill="#c2410c" font-weight="bold">Trusted Advisor</text>
  <text x="282" y="220" text-anchor="middle" font-size="10" fill="#ea580c">5カテゴリBP</text>
  <text x="282" y="260" text-anchor="middle" font-size="9" fill="#64748b" font-style="italic">「改善点はある？」</text>
  <rect x="385" y="175" width="165" height="100" rx="10" fill="#f0f9ff" stroke="#38bdf8" stroke-width="2"/>
  <text x="467" y="200" text-anchor="middle" font-size="13" fill="#0369a1" font-weight="bold">Health Dashboard</text>
  <text x="467" y="220" text-anchor="middle" font-size="10" fill="#0284c7">サービス / アカウント</text>
  <text x="467" y="260" text-anchor="middle" font-size="9" fill="#64748b" font-style="italic">「AWS側は大丈夫？」</text>
</svg>
<figcaption>図13-3: モニタリング・運用サービスの全体像</figcaption>
</div>

<div class="summary-box">
<h4>第13章まとめ</h4>
<ul>
<li><strong>CloudWatch</strong>: メトリクス + ログ + アラームの統合監視</li>
<li>EC2の<strong>メモリ使用率</strong>はCloudWatch Agent必須（標準メトリクスに含まれない）</li>
<li>ログのリアルタイム転送は<strong>サブスクリプションフィルター</strong>。S3エクスポートは最大12h遅延</li>
<li><strong>CloudTrail</strong> = API操作ログ（誰が何をしたか）</li>
<li><strong>EventBridge</strong> = イベント駆動 + cron スケジュール</li>
<li><strong>X-Ray</strong> = 分散トレーシング（ボトルネック特定）</li>
<li><strong>Config</strong> = リソース設定の記録・評価（CloudTrailとは別物）</li>
<li><strong>Trusted Advisor</strong> = 5カテゴリのBPチェック（Business以上で全機能）</li>
</ul>
</div>

<div class="quiz">
<p><strong>Q1.</strong> EC2のメモリ使用率を監視するのに必要なものは？</p>
<details><summary>答えを見る</summary><p>CloudWatch Agentをインストールしカスタムメトリクスとして送信。メモリはOS内部情報のため標準メトリクスでは取得不可。</p></details>
</div>
<div class="quiz">
<p><strong>Q2.</strong> CloudWatch Logsをリアルタイムで処理するには？</p>
<details><summary>答えを見る</summary><p>サブスクリプションフィルター → Kinesis Data Firehose → S3/Lambda/OpenSearch。S3エクスポートは最大12h遅延で不適切。</p></details>
</div>
<div class="quiz">
<p><strong>Q3.</strong> 「誰がS3をパブリックにしたか」を調べるサービスは？</p>
<details><summary>答えを見る</summary><p>CloudTrail。API操作ログからPutBucketPolicy等の呼び出し元を特定できる。</p></details>
</div>
<div class="quiz">
<p><strong>Q4.</strong> CloudWatch / CloudTrail / Config の違いを一言ずつで。</p>
<details><summary>答えを見る</summary><p>CloudWatch=「今の状態は？」、CloudTrail=「誰が何をした？」、Config=「設定は正しい？」</p></details>
</div>
''')

print(f"Chapter 13 done. Size: {os.path.getsize(filepath)} bytes")
