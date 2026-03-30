#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os
OUTPUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'part3-advanced.html')
def w(text):
    with open(OUTPUT, 'a', encoding='utf-8') as f:
        f.write(text)

w('''
<h1 id="ch14"><span class="chapter-num">14</span> メッセージングとデカップリング 〜マイクロサービス設計の基本〜</h1>

<p>大規模なシステムでは、すべてのコンポーネント（部品）が直接つながっていると、一箇所の障害が全体に波及します。これを「密結合（きつけつごう）」と呼びます。AWSでは「メッセージング」サービスを使ってコンポーネント間を「疎結合（そけつごう）」にし、障害に強いシステムを作ります。</p>

<div class="analogy">
<p><strong>密結合</strong>: 電話のように相手がいないと通信できない。片方が忙しいと止まる。<br>
<strong>疎結合</strong>: メールのように相手が不在でも送れる。相手は好きなタイミングで読む。<br>
SQS/SNSはこの「メール」のような役割を果たし、送り手と受け手を切り離します。</p>
</div>

<h2>14.1 SQS（Simple Queue Service）〜メッセージキュー〜</h2>

<p>SQSは「キュー（待ち行列）」にメッセージを入れて、別のサービスが取り出すというシンプルな仕組みです。送り手（Producer）がメッセージをキューに入れ、受け手（Consumer）がキューからメッセージを取り出して処理します。</p>

<h3>Standard Queue vs FIFO Queue</h3>

<table>
<tr><th>特性</th><th>Standard Queue</th><th>FIFO Queue</th></tr>
<tr><td><strong>スループット</strong></td><td>ほぼ無制限</td><td>300 msg/秒（バッチで3,000）</td></tr>
<tr><td><strong>順序保証</strong></td><td>ベストエフォート（順番が入れ替わることがある）</td><td>厳密に順序保証</td></tr>
<tr><td><strong>重複配信</strong></td><td>まれに重複配信あり（At-Least-Once）</td><td>重複なし（Exactly-Once）</td></tr>
<tr><td><strong>キュー名</strong></td><td>自由</td><td>末尾に <code>.fifo</code> が必須</td></tr>
<tr><td><strong>ユースケース</strong></td><td>大量処理、順序不問</td><td>注文処理、金融取引など順序が重要な場面</td></tr>
</table>

<div class="exam">
<p><strong>SQSの重要パラメータ</strong>:</p>
<ul>
<li><strong>可視性タイムアウト（Visibility Timeout）</strong>: メッセージ取得後、他のConsumerから見えなくなる時間。デフォルト30秒、最大12時間。処理時間より長く設定する</li>
<li><strong>メッセージ保持期間</strong>: 1分〜14日（デフォルト4日）</li>
<li><strong>最大メッセージサイズ</strong>: 256KB。大きいデータはS3に保存しポインタ（URL）をSQSに送る</li>
<li><strong>ロングポーリング</strong>: キューが空のとき最大20秒待ってからレスポンスを返す。API呼び出し回数とコストを削減。<strong>ショートポーリング</strong>は即座に空レスポンスを返す（無駄なAPI呼び出しが増える）</li>
</ul>
</div>

<h3>デッドレターキュー（DLQ）</h3>
<p>処理に何度も失敗したメッセージを退避させる専用キューです。例えば「5回処理に失敗したメッセージはDLQに移動」と設定でき、問題のあるメッセージを後から調査できます。通常のキューの処理が詰まることを防ぐ安全弁です。</p>

<h3>遅延キュー（Delay Queue）</h3>
<p>メッセージを送信してから一定時間（0秒〜15分）はConsumerに見えなくする設定。「注文後5分間はキャンセル可能にしたい」といった場面で使います。</p>

<h3>SQS + Auto Scaling</h3>
<p>SQSのキュー内メッセージ数（ApproximateNumberOfMessages）をCloudWatchメトリクスとして監視し、メッセージが増えたらEC2やECSタスクをスケールアウトする構成です。</p>

<div class="tsurispot">
<p><strong>ツリスポの釣果投稿処理</strong>: 将来、ユーザーが釣果写真を投稿できる機能を追加した場合の構成例。ユーザー → API Gateway → SQS（Standard Queue）→ Lambda（画像リサイズ+DynamoDB保存）。大量投稿が来てもSQSがバッファになるので、Lambdaが処理しきれなくても投稿は受け付けられます。5回リサイズに失敗した画像はDLQに退避して後で調査。</p>
</div>

<div class="diagram">
<svg viewBox="0 0 780 250" xmlns="http://www.w3.org/2000/svg" font-family="Segoe UI, Hiragino Sans, sans-serif">
  <defs><marker id="a3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b"/></marker></defs>
  <text x="390" y="20" text-anchor="middle" font-size="13" fill="#0c4a6e" font-weight="bold">SQS + Auto Scaling スケーリング構成</text>
  <rect x="20" y="80" width="100" height="50" rx="8" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
  <text x="70" y="100" text-anchor="middle" font-size="11" fill="#1e40af" font-weight="bold">Producer</text>
  <text x="70" y="118" text-anchor="middle" font-size="9" fill="#3b82f6">メッセージ送信</text>
  <rect x="180" y="60" width="130" height="90" rx="8" fill="#fef3c7" stroke="#f59e0b" stroke-width="2"/>
  <text x="245" y="85" text-anchor="middle" font-size="13" fill="#92400e" font-weight="bold">SQS Queue</text>
  <text x="245" y="105" text-anchor="middle" font-size="10" fill="#b45309">メッセージ蓄積</text>
  <text x="245" y="125" text-anchor="middle" font-size="9" fill="#b45309">キュー長をCWで監視</text>
  <text x="245" y="142" text-anchor="middle" font-size="9" fill="#b45309">↓ メトリクス</text>
  <rect x="180" y="175" width="130" height="45" rx="8" fill="#eff6ff" stroke="#3b82f6" stroke-width="2"/>
  <text x="245" y="195" text-anchor="middle" font-size="10" fill="#1e40af" font-weight="bold">CloudWatch Alarm</text>
  <text x="245" y="212" text-anchor="middle" font-size="9" fill="#3b82f6">キュー長 > 閾値</text>
  <rect x="380" y="175" width="130" height="45" rx="8" fill="#f0fdf4" stroke="#22c55e" stroke-width="2"/>
  <text x="445" y="195" text-anchor="middle" font-size="10" fill="#166534" font-weight="bold">Auto Scaling</text>
  <text x="445" y="212" text-anchor="middle" font-size="9" fill="#15803d">スケールアウト/イン</text>
  <rect x="380" y="60" width="130" height="90" rx="8" fill="#fce7f3" stroke="#ec4899" stroke-width="2"/>
  <text x="445" y="85" text-anchor="middle" font-size="13" fill="#be185d" font-weight="bold">Consumer群</text>
  <text x="445" y="105" text-anchor="middle" font-size="10" fill="#db2777">EC2 / Lambda</text>
  <text x="445" y="125" text-anchor="middle" font-size="10" fill="#db2777">ECS タスク</text>
  <rect x="580" y="80" width="110" height="50" rx="8" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
  <text x="635" y="100" text-anchor="middle" font-size="11" fill="#1e40af" font-weight="bold">DB / S3</text>
  <text x="635" y="118" text-anchor="middle" font-size="9" fill="#3b82f6">処理結果保存</text>
  <line x1="120" y1="105" x2="180" y2="105" stroke="#64748b" stroke-width="2" marker-end="url(#a3)"/>
  <line x1="310" y1="105" x2="380" y2="105" stroke="#64748b" stroke-width="2" marker-end="url(#a3)"/>
  <line x1="510" y1="105" x2="580" y2="105" stroke="#64748b" stroke-width="2" marker-end="url(#a3)"/>
  <line x1="245" y1="150" x2="245" y2="175" stroke="#64748b" stroke-width="1.5" marker-end="url(#a3)"/>
  <line x1="310" y1="197" x2="380" y2="197" stroke="#64748b" stroke-width="1.5" marker-end="url(#a3)"/>
  <line x1="445" y1="175" x2="445" y2="150" stroke="#22c55e" stroke-width="1.5" marker-end="url(#a3)"/>
</svg>
<figcaption>図14-1: SQS + Auto Scaling のキュー長ベーススケーリング</figcaption>
</div>

<h2>14.2 SNS（Simple Notification Service）〜Pub/Subメッセージング〜</h2>

<p>SNSは「Pub/Sub（パブリッシュ/サブスクライブ）」モデルのメッセージングサービスです。Publisher（発行者）がトピック（テーマ）にメッセージを発行し、そのトピックを購読しているSubscriber（購読者）全員にメッセージが届きます。1対多の配信です。</p>

<h3>サブスクリプションの種類</h3>
<ul>
<li><strong>SQS</strong>: キューにメッセージを送信</li>
<li><strong>Lambda</strong>: 関数を呼び出し</li>
<li><strong>HTTP/HTTPS</strong>: WebhookでURLに通知</li>
<li><strong>Email / Email-JSON</strong>: メール送信</li>
<li><strong>SMS</strong>: ショートメッセージ送信</li>
<li><strong>Kinesis Data Firehose</strong>: ストリームに配信</li>
</ul>

<h3>SNS + SQS ファンアウトパターン</h3>
<p>1つのSNSトピックに複数のSQSキューをサブスクライブさせ、1回のメッセージ送信で複数の処理を並行実行するパターンです。これは試験で超頻出のアーキテクチャパターンです。</p>

<div class="exam">
<p><strong>ファンアウトパターン</strong>: 「1つのイベントを複数のサービスに同時に配信したい」→ SNS + SQS ファンアウト。SNSトピックに複数のSQSキューをサブスクライブし、各キューから独立した処理を実行。これにより処理間の依存がなくなり、片方が失敗しても他方に影響しません。</p>
</div>

<h4>メッセージフィルタリング</h4>
<p>サブスクリプションにフィルターポリシーを設定し、特定の属性を持つメッセージだけを受信できます。例: 注文トピックで「東京」の注文だけを受け取るSQSキュー。</p>

<div class="diagram">
<svg viewBox="0 0 780 280" xmlns="http://www.w3.org/2000/svg" font-family="Segoe UI, Hiragino Sans, sans-serif">
  <defs><marker id="a4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b"/></marker></defs>
  <text x="390" y="20" text-anchor="middle" font-size="13" fill="#0c4a6e" font-weight="bold">SNS + SQS ファンアウトパターン</text>
  <rect x="20" y="100" width="110" height="55" rx="8" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
  <text x="75" y="122" text-anchor="middle" font-size="11" fill="#1e40af" font-weight="bold">Publisher</text>
  <text x="75" y="142" text-anchor="middle" font-size="9" fill="#3b82f6">メッセージ発行</text>
  <rect x="200" y="80" width="140" height="90" rx="10" fill="#fef3c7" stroke="#f59e0b" stroke-width="3"/>
  <text x="270" y="110" text-anchor="middle" font-size="14" fill="#92400e" font-weight="bold">SNS Topic</text>
  <text x="270" y="130" text-anchor="middle" font-size="10" fill="#b45309">釣果投稿トピック</text>
  <text x="270" y="150" text-anchor="middle" font-size="9" fill="#b45309">1回発行 → 全員に配信</text>
  <rect x="430" y="35" width="140" height="45" rx="8" fill="#ede9fe" stroke="#8b5cf6" stroke-width="2"/>
  <text x="500" y="53" text-anchor="middle" font-size="10" fill="#6d28d9" font-weight="bold">SQS: DB保存用</text>
  <text x="500" y="70" text-anchor="middle" font-size="9" fill="#7c3aed">→ Lambda → DynamoDB</text>
  <rect x="430" y="100" width="140" height="45" rx="8" fill="#fce7f3" stroke="#ec4899" stroke-width="2"/>
  <text x="500" y="118" text-anchor="middle" font-size="10" fill="#be185d" font-weight="bold">SQS: 画像リサイズ用</text>
  <text x="500" y="135" text-anchor="middle" font-size="9" fill="#be185d">→ Lambda → S3</text>
  <rect x="430" y="165" width="140" height="45" rx="8" fill="#f0fdf4" stroke="#22c55e" stroke-width="2"/>
  <text x="500" y="183" text-anchor="middle" font-size="10" fill="#166534" font-weight="bold">SQS: 通知用</text>
  <text x="500" y="200" text-anchor="middle" font-size="9" fill="#15803d">→ Lambda → Push通知</text>
  <rect x="430" y="230" width="140" height="38" rx="8" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
  <text x="500" y="254" text-anchor="middle" font-size="10" fill="#1e40af" font-weight="bold">Lambda: ログ記録</text>
  <line x1="130" y1="127" x2="200" y2="127" stroke="#64748b" stroke-width="2" marker-end="url(#a4)"/>
  <line x1="340" y1="100" x2="430" y2="57" stroke="#64748b" stroke-width="1.5" marker-end="url(#a4)"/>
  <line x1="340" y1="122" x2="430" y2="122" stroke="#64748b" stroke-width="1.5" marker-end="url(#a4)"/>
  <line x1="340" y1="145" x2="430" y2="187" stroke="#64748b" stroke-width="1.5" marker-end="url(#a4)"/>
  <line x1="340" y1="160" x2="430" y2="249" stroke="#64748b" stroke-width="1.5" marker-end="url(#a4)"/>
</svg>
<figcaption>図14-2: SNS + SQS ファンアウトパターン（1メッセージ → 4つの独立した処理）</figcaption>
</div>

<div class="tsurispot">
<p><strong>ツリスポのファンアウト</strong>: ユーザーが釣果を投稿したら、SNSトピック「釣果投稿」に1回発行。サブスクライバーとして (1) SQS→DynamoDB保存、(2) SQS→画像リサイズ+S3保存、(3) SQS→フォロワーへのプッシュ通知、(4) Lambda→アクセスログ記録。各処理は完全に独立しているので、画像リサイズが失敗しても通知やDB保存には影響しません。</p>
</div>

<h2>14.3 Kinesis 〜リアルタイムストリーミング〜</h2>

<p>Amazon Kinesisは、大量のストリーミングデータ（リアルタイムに流れ続けるデータ）を収集・処理するサービス群です。</p>

<h3>Kinesisファミリー</h3>

<table>
<tr><th>サービス</th><th>用途</th><th>特徴</th></tr>
<tr><td><strong>Kinesis Data Streams</strong></td><td>リアルタイム処理</td><td>シャード単位のスケーリング。複数Consumerが同じデータを読める。24h〜365日保持</td></tr>
<tr><td><strong>Kinesis Data Firehose</strong></td><td>配信（S3/Redshift/OpenSearch等）</td><td>ニアリアルタイム（60秒バッファ）。完全マネージド、自動スケーリング</td></tr>
<tr><td><strong>Kinesis Data Analytics</strong></td><td>ストリーム分析</td><td>SQLまたはApache Flinkでリアルタイム分析</td></tr>
</table>

<div class="exam">
<p><strong>SQS vs Kinesis の使い分け（超頻出！）</strong></p>
<table>
<tr><th>観点</th><th>SQS</th><th>Kinesis Data Streams</th></tr>
<tr><td><strong>処理モデル</strong></td><td>メッセージを取り出して消す（キュー）</td><td>データを読むが消えない（ストリーム）</td></tr>
<tr><td><strong>Consumer数</strong></td><td>1つのメッセージは1Consumerが処理</td><td>複数Consumerが同じデータを読める</td></tr>
<tr><td><strong>順序</strong></td><td>Standard: 順序保証なし / FIFO: 保証あり</td><td>シャード内で順序保証</td></tr>
<tr><td><strong>スケーリング</strong></td><td>自動</td><td>シャード数を手動で管理</td></tr>
<tr><td><strong>データ保持</strong></td><td>最大14日</td><td>24h〜365日</td></tr>
<tr><td><strong>ユースケース</strong></td><td>タスクキュー、非同期処理</td><td>ログ集約、IoT、リアルタイム分析</td></tr>
</table>
<p>キーワード: 「デカップリング」「非同期処理」→ SQS。「リアルタイム」「ストリーミング」「複数Consumer」→ Kinesis。</p>
</div>

<h2>14.4 Amazon MQ 〜レガシー移行向けメッセージブローカー〜</h2>

<p>Amazon MQは、Apache ActiveMQやRabbitMQのマネージドサービスです。オンプレミスで既にActiveMQ/RabbitMQを使っている場合の移行先として使います。新規開発ではSQS/SNSを使うのがAWSのベストプラクティスです。</p>

<div class="exam">
<p><strong>Amazon MQの出題パターン</strong>:「オンプレミスのActiveMQ/RabbitMQをAWSに移行」「MQTT/AMQP/STOMPプロトコルを使いたい」→ Amazon MQ。新規開発でメッセージングが必要ならSQS/SNS。</p>
</div>

<div class="summary-box">
<h4>第14章まとめ</h4>
<ul>
<li><strong>SQS</strong>: メッセージキュー。Standard（高スループット）vs FIFO（順序保証）</li>
<li>可視性タイムアウト、DLQ、遅延キュー、ロングポーリングは試験頻出</li>
<li><strong>SNS</strong>: Pub/Subメッセージング。1対多の配信</li>
<li><strong>ファンアウトパターン</strong>: SNS → 複数SQS で1イベントを複数処理に分散</li>
<li><strong>Kinesis</strong>: リアルタイムストリーミング。SQSとの使い分けを確実に</li>
<li><strong>SQS vs Kinesis</strong>:「非同期処理」→SQS、「リアルタイム+複数Consumer」→Kinesis</li>
<li><strong>Amazon MQ</strong>: ActiveMQ/RabbitMQの移行用。新規はSQS/SNS</li>
<li>メッセージサイズ上限はSQS=256KB。大きいデータはS3+ポインタ</li>
</ul>
</div>

<div class="quiz">
<p><strong>Q1.</strong> SQSのStandard QueueとFIFO Queueの最大の違いは？</p>
<details><summary>答えを見る</summary><p>Standard=ほぼ無制限スループットだが順序保証なし・重複あり。FIFO=厳密な順序保証・重複なしだが300msg/秒の制限あり。</p></details>
</div>
<div class="quiz">
<p><strong>Q2.</strong> 1つのイベントを複数のサービスに同時配信するアーキテクチャパターンは？</p>
<details><summary>答えを見る</summary><p>SNS + SQS ファンアウトパターン。SNSトピックに複数のSQSキューをサブスクライブさせる。</p></details>
</div>
<div class="quiz">
<p><strong>Q3.</strong> SQSとKinesisの使い分けの基準は？</p>
<details><summary>答えを見る</summary><p>SQS=「非同期処理」「デカップリング」「タスクキュー」。Kinesis=「リアルタイムストリーミング」「複数Consumer」「ログ集約」「IoT」。</p></details>
</div>
<div class="quiz">
<p><strong>Q4.</strong> SQSで処理に5回失敗したメッセージを退避させる仕組みは？</p>
<details><summary>答えを見る</summary><p>デッドレターキュー（DLQ）。maxReceiveCount=5に設定すると、5回処理に失敗したメッセージは自動的にDLQに移動する。</p></details>
</div>
<div class="quiz">
<p><strong>Q5.</strong> オンプレミスのRabbitMQをAWSに移行する場合のサービスは？</p>
<details><summary>答えを見る</summary><p>Amazon MQ。既存のActiveMQ/RabbitMQのマネージドサービスで、プロトコル互換性がある。新規開発ならSQS/SNS。</p></details>
</div>
''')

print(f"Chapter 14 done. Total: {os.path.getsize(OUTPUT)} bytes")
