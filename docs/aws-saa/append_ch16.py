#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os
OUTPUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'part3-advanced.html')
def w(text):
    with open(OUTPUT, 'a', encoding='utf-8') as f:
        f.write(text)

w('''
<h1 id="ch16"><span class="chapter-num">16</span> 移行と転送 〜オンプレミスからクラウドへ〜</h1>

<p>多くの企業がオンプレミス（自社サーバー）からAWSへの移行を検討しています。SAA試験では「どの移行戦略を選ぶか」「どのデータ転送サービスを使うか」が頻出です。</p>

<h2>16.1 クラウド移行の6R戦略</h2>

<p>AWSが提唱する移行戦略は6つあり、「6R」と呼ばれます。アプリケーションごとに最適な戦略を選びます。</p>

<table>
<tr><th>戦略</th><th>内容</th><th>変更度</th><th>例</th></tr>
<tr><td><strong>Rehost</strong><br>(リフト&シフト)</td><td>そのままAWSに移行</td><td>最小</td><td>EC2にそのまま載せ替え</td></tr>
<tr><td><strong>Replatform</strong><br>(リフト&最適化)</td><td>少し最適化して移行</td><td>小</td><td>DBをRDSに変更、OSはそのまま</td></tr>
<tr><td><strong>Repurchase</strong></td><td>SaaS製品に置き換え</td><td>中</td><td>自社CRM → Salesforce</td></tr>
<tr><td><strong>Refactor</strong><br>(リアーキテクト)</td><td>クラウドネイティブに再設計</td><td>大</td><td>モノリス → マイクロサービス</td></tr>
<tr><td><strong>Retire</strong></td><td>廃止</td><td>-</td><td>使われていないシステムを停止</td></tr>
<tr><td><strong>Retain</strong></td><td>現状維持（移行しない）</td><td>-</td><td>移行が困難なレガシーシステム</td></tr>
</table>

<div class="diagram">
<svg viewBox="0 0 760 260" xmlns="http://www.w3.org/2000/svg" font-family="Segoe UI, Hiragino Sans, sans-serif">
  <text x="380" y="22" text-anchor="middle" font-size="14" fill="#0c4a6e" font-weight="bold">6R移行戦略（変更度 vs クラウドネイティブ度）</text>
  <!-- 軸 -->
  <line x1="80" y1="230" x2="720" y2="230" stroke="#94a3b8" stroke-width="2"/>
  <line x1="80" y1="230" x2="80" y2="45" stroke="#94a3b8" stroke-width="2"/>
  <text x="400" y="255" text-anchor="middle" font-size="11" fill="#64748b">クラウドネイティブ度 →</text>
  <text x="35" y="140" text-anchor="middle" font-size="11" fill="#64748b" transform="rotate(-90,35,140)">変更の労力 →</text>
  <!-- 各R -->
  <rect x="100" y="190" width="90" height="35" rx="8" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
  <text x="145" y="212" text-anchor="middle" font-size="10" fill="#1e40af" font-weight="bold">Retain</text>
  <rect x="210" y="175" width="90" height="35" rx="8" fill="#f0fdf4" stroke="#22c55e" stroke-width="2"/>
  <text x="255" y="197" text-anchor="middle" font-size="10" fill="#166534" font-weight="bold">Rehost</text>
  <rect x="320" y="145" width="90" height="35" rx="8" fill="#fef3c7" stroke="#f59e0b" stroke-width="2"/>
  <text x="365" y="167" text-anchor="middle" font-size="10" fill="#92400e" font-weight="bold">Replatform</text>
  <rect x="430" y="110" width="90" height="35" rx="8" fill="#ede9fe" stroke="#8b5cf6" stroke-width="2"/>
  <text x="475" y="132" text-anchor="middle" font-size="10" fill="#6d28d9" font-weight="bold">Repurchase</text>
  <rect x="540" y="70" width="90" height="35" rx="8" fill="#fce7f3" stroke="#ec4899" stroke-width="2"/>
  <text x="585" y="92" text-anchor="middle" font-size="10" fill="#be185d" font-weight="bold">Refactor</text>
  <rect x="650" y="190" width="70" height="35" rx="8" fill="#fef2f2" stroke="#ef4444" stroke-width="2"/>
  <text x="685" y="212" text-anchor="middle" font-size="10" fill="#dc2626" font-weight="bold">Retire</text>
</svg>
<figcaption>図16-1: 6R移行戦略の比較</figcaption>
</div>

<div class="tsurispot">
<p><strong>ツリスポのVercel→AWS移行</strong>: Replatform戦略を採用しました。コード自体は大きく変更せず（Next.js standalone）、インフラだけVercel → App Runner（Docker）に変更。データベースを後から導入する場合は、オンプレMySQL → Aurora PostgreSQL への異種DB移行にDMSを使うことになります。</p>
</div>

<h2>16.2 DMS（Database Migration Service）</h2>

<p>AWS DMSは、データベースの移行を行うサービスです。ソース（移行元）からターゲット（移行先）にデータを転送します。</p>

<h3>DMSの特徴</h3>
<ul>
<li><strong>同種DB間移行</strong>: MySQL → MySQL、Oracle → Oracle（簡単）</li>
<li><strong>異種DB間移行</strong>: Oracle → Aurora PostgreSQL（SCTが必要）</li>
<li><strong>CDC（Change Data Capture）</strong>: 初期データロード後も、差分を継続的にレプリケーション（ダウンタイム最小化）</li>
<li><strong>ソースDBは稼働したまま</strong>移行可能</li>
</ul>

<h4>SCT（Schema Conversion Tool）</h4>
<p>異種DB間移行で必要なスキーマ変換ツール。OracleのストアドプロシージャをPostgreSQL形式に変換するなど、スキーマレベルの変換を自動化します。</p>

<div class="exam">
<p><strong>DMS出題パターン</strong>:「ダウンタイムを最小限にDBを移行」→ DMS + CDC。「Oracle → Aurora PostgreSQL」→ DMS + SCT。「移行中もソースDBは稼働」→ DMSの特徴。</p>
</div>

<div class="diagram">
<svg viewBox="0 0 760 180" xmlns="http://www.w3.org/2000/svg" font-family="Segoe UI, Hiragino Sans, sans-serif">
  <defs><marker id="a6" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b"/></marker></defs>
  <text x="380" y="20" text-anchor="middle" font-size="13" fill="#0c4a6e" font-weight="bold">DMS移行パターン</text>
  <rect x="20" y="55" width="150" height="80" rx="10" fill="#fef2f2" stroke="#ef4444" stroke-width="2"/>
  <text x="95" y="80" text-anchor="middle" font-size="12" fill="#dc2626" font-weight="bold">ソースDB</text>
  <text x="95" y="100" text-anchor="middle" font-size="10" fill="#dc2626">Oracle (オンプレ)</text>
  <text x="95" y="118" text-anchor="middle" font-size="9" fill="#ef4444">稼働したまま移行可能</text>
  <rect x="235" y="40" width="120" height="45" rx="8" fill="#fef3c7" stroke="#f59e0b" stroke-width="2"/>
  <text x="295" y="60" text-anchor="middle" font-size="11" fill="#92400e" font-weight="bold">SCT</text>
  <text x="295" y="78" text-anchor="middle" font-size="9" fill="#b45309">スキーマ変換</text>
  <rect x="235" y="95" width="120" height="55" rx="8" fill="#ede9fe" stroke="#8b5cf6" stroke-width="2"/>
  <text x="295" y="117" text-anchor="middle" font-size="12" fill="#6d28d9" font-weight="bold">DMS</text>
  <text x="295" y="137" text-anchor="middle" font-size="9" fill="#7c3aed">データ転送+CDC</text>
  <rect x="420" y="55" width="160" height="80" rx="10" fill="#f0fdf4" stroke="#22c55e" stroke-width="2"/>
  <text x="500" y="80" text-anchor="middle" font-size="12" fill="#166534" font-weight="bold">ターゲットDB</text>
  <text x="500" y="100" text-anchor="middle" font-size="10" fill="#15803d">Aurora PostgreSQL</text>
  <text x="500" y="118" text-anchor="middle" font-size="9" fill="#22c55e">(AWS)</text>
  <line x1="170" y1="80" x2="235" y2="62" stroke="#64748b" stroke-width="1.5" marker-end="url(#a6)"/>
  <line x1="170" y1="105" x2="235" y2="122" stroke="#64748b" stroke-width="1.5" marker-end="url(#a6)"/>
  <line x1="355" y1="62" x2="420" y2="80" stroke="#64748b" stroke-width="1.5" marker-end="url(#a6)"/>
  <line x1="355" y1="122" x2="420" y2="105" stroke="#64748b" stroke-width="1.5" marker-end="url(#a6)"/>
</svg>
<figcaption>図16-2: DMS + SCT による異種DB移行パターン</figcaption>
</div>

<h2>16.3 Snow Family 〜物理デバイスでのデータ移行〜</h2>

<p>ネットワーク経由では時間がかかりすぎる大量データの移行に、AWSが物理デバイスを郵送して使う「Snow Family」があります。</p>

<table>
<tr><th>デバイス</th><th>容量</th><th>用途</th></tr>
<tr><td><strong>Snowcone</strong></td><td>8TB HDD / 14TB SSD</td><td>小規模移行、エッジコンピューティング。2.1kgで最小・最軽量</td></tr>
<tr><td><strong>Snowball Edge Storage Optimized</strong></td><td>80TB</td><td>中規模データ移行。EC2互換のコンピューティング機能あり</td></tr>
<tr><td><strong>Snowball Edge Compute Optimized</strong></td><td>42TB</td><td>エッジでの処理が必要な場合。より強力なCPU/GPU</td></tr>
<tr><td><strong>Snowmobile</strong></td><td>100PB</td><td>超大規模移行。トラック1台で運搬。10PB以上ならSnowmobile推奨</td></tr>
</table>

<div class="exam">
<p><strong>Snow Familyの選択基準</strong>: 数TB → Snowcone。数十TB〜数百TB → Snowball Edge。10PB以上 → Snowmobile。「ネットワーク帯域が限られている」「数週間以上かかる」→ Snow Family。転送にかかる日数の計算問題も出ます。</p>
</div>

<div class="diagram">
<svg viewBox="0 0 760 170" xmlns="http://www.w3.org/2000/svg" font-family="Segoe UI, Hiragino Sans, sans-serif">
  <text x="380" y="20" text-anchor="middle" font-size="13" fill="#0c4a6e" font-weight="bold">Snow Family データ容量比較</text>
  <!-- Snowcone -->
  <rect x="30" y="50" width="120" height="90" rx="10" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
  <text x="90" y="75" text-anchor="middle" font-size="12" fill="#1e40af" font-weight="bold">Snowcone</text>
  <text x="90" y="95" text-anchor="middle" font-size="22" fill="#3b82f6" font-weight="bold">8-14TB</text>
  <text x="90" y="115" text-anchor="middle" font-size="9" fill="#64748b">2.1kg / 小型</text>
  <text x="90" y="130" text-anchor="middle" font-size="9" fill="#64748b">エッジ対応</text>
  <!-- Snowball -->
  <rect x="190" y="40" width="160" height="100" rx="10" fill="#fef3c7" stroke="#f59e0b" stroke-width="2"/>
  <text x="270" y="65" text-anchor="middle" font-size="12" fill="#92400e" font-weight="bold">Snowball Edge</text>
  <text x="270" y="90" text-anchor="middle" font-size="22" fill="#f59e0b" font-weight="bold">42-80TB</text>
  <text x="270" y="110" text-anchor="middle" font-size="9" fill="#64748b">Storage / Compute</text>
  <text x="270" y="125" text-anchor="middle" font-size="9" fill="#64748b">EC2互換コンピューティング</text>
  <!-- Snowmobile -->
  <rect x="400" y="30" width="200" height="110" rx="10" fill="#fce7f3" stroke="#ec4899" stroke-width="3"/>
  <text x="500" y="55" text-anchor="middle" font-size="12" fill="#be185d" font-weight="bold">Snowmobile</text>
  <text x="500" y="85" text-anchor="middle" font-size="28" fill="#ec4899" font-weight="bold">100PB</text>
  <text x="500" y="110" text-anchor="middle" font-size="10" fill="#64748b">トレーラートラック1台</text>
  <text x="500" y="128" text-anchor="middle" font-size="9" fill="#64748b">10PB以上ならSnowmobile</text>
</svg>
<figcaption>図16-3: Snow Family のデータ容量比較</figcaption>
</div>

<h2>16.4 DataSync 〜高速データ転送〜</h2>

<p>AWS DataSyncは、オンプレミスとAWS間、またはAWSサービス間のデータ転送を高速に行うサービスです。NFS、SMB、HDFS、S3、EFS、FSxに対応しています。</p>

<div class="point">
<p><strong>DataSync vs Snow Family</strong>: DataSyncはネットワーク経由（オンライン転送）。帯域が十分あれば高速。Snow Familyは物理デバイス（オフライン転送）。ネットワークが遅い・大量データのときに使う。</p>
</div>

<h2>16.5 その他の移行サービス</h2>

<ul>
<li><strong>Transfer Family</strong>: SFTP/FTPS/FTPでS3やEFSにファイル転送。既存のファイル転送ワークフローをそのまま使える</li>
<li><strong>Migration Hub</strong>: 移行プロジェクト全体の進捗を一元管理するダッシュボード</li>
<li><strong>Application Discovery Service</strong>: オンプレミス環境を調査し、サーバーの依存関係やリソース使用状況をマッピング</li>
<li><strong>Application Migration Service（MGN）</strong>: サーバーのRehost（リフト&シフト）移行を自動化</li>
<li><strong>Outposts</strong>: AWSのインフラ（ラック）をオンプレミスに物理的に設置。低レイテンシやデータ主権要件に対応</li>
</ul>

<div class="exam">
<p><strong>移行サービスの使い分け</strong>:</p>
<ul>
<li>「サーバーをそのまま移行（Rehost）」→ <strong>MGN</strong></li>
<li>「DB移行」→ <strong>DMS</strong></li>
<li>「大量データ（TB/PB級）をオフラインで」→ <strong>Snow Family</strong></li>
<li>「NFS/SMBデータをオンラインで」→ <strong>DataSync</strong></li>
<li>「FTP/SFTPで既存ワークフローのまま」→ <strong>Transfer Family</strong></li>
<li>「オンプレ環境を調査」→ <strong>Application Discovery Service</strong></li>
<li>「AWSをオンプレに設置」→ <strong>Outposts</strong></li>
</ul>
</div>

<div class="tsurispot">
<p><strong>ツリスポの移行を例に考える</strong>: もしツリスポがオンプレのMySQLに2,000件のスポットデータを持っていた場合、Aurora PostgreSQLへの移行はDMS+SCTで実現します。画像データが数百GBあればDataSyncでS3に転送。数PBの動画データがあればSnowball Edgeを使います。移行全体の進捗はMigration Hubで管理します。</p>
</div>

<div class="summary-box">
<h4>第16章まとめ</h4>
<ul>
<li><strong>6R戦略</strong>: Rehost/Replatform/Repurchase/Refactor/Retire/Retain</li>
<li><strong>DMS</strong>: DB移行。CDC（継続レプリケーション）でダウンタイム最小化。異種DBはSCT併用</li>
<li><strong>Snow Family</strong>: 物理デバイスで大量データ移行。Snowcone(〜14TB)/Snowball(〜80TB)/Snowmobile(100PB)</li>
<li><strong>DataSync</strong>: オンラインデータ転送（NFS/SMB/S3/EFS/FSx対応）</li>
<li><strong>Transfer Family</strong>: SFTP/FTPでS3/EFSへ転送</li>
<li><strong>MGN</strong>: サーバーのRehost移行を自動化</li>
<li><strong>Outposts</strong>: AWSインフラをオンプレミスに設置</li>
</ul>
</div>

<div class="quiz">
<p><strong>Q1.</strong> Oracle → Aurora PostgreSQL の移行に必要なサービスの組み合わせは？</p>
<details><summary>答えを見る</summary><p>DMS（データ転送）+ SCT（スキーマ変換）。異種DB間移行ではSCTでスキーマを変換してからDMSでデータを転送する。</p></details>
</div>
<div class="quiz">
<p><strong>Q2.</strong> 50TBのデータをAWSに移行。ネットワーク帯域が100Mbpsで転送に46日かかる場合の最適な方法は？</p>
<details><summary>答えを見る</summary><p>Snowball Edge Storage Optimized（80TB）を使用。物理デバイスの配送・データ転送・返送で1〜2週間程度と、ネットワーク転送の46日より大幅に短縮。</p></details>
</div>
<div class="quiz">
<p><strong>Q3.</strong> オンプレミスのNFSサーバーからS3へ定期的にデータを同期する場合は？</p>
<details><summary>答えを見る</summary><p>AWS DataSync。NFS/SMBに対応し、増分転送、スケジュール実行、データ整合性チェックが可能。</p></details>
</div>
''')

print(f"Chapter 16 done. Total: {os.path.getsize(OUTPUT)} bytes")
