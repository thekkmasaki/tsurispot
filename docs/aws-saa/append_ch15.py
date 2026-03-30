#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os
OUTPUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'part3-advanced.html')
def w(text):
    with open(OUTPUT, 'a', encoding='utf-8') as f:
        f.write(text)

w('''
<h1 id="ch15"><span class="chapter-num">15</span> データ分析サービス 〜ビッグデータを活用する〜</h1>

<p>AWSには膨大なデータを分析するためのサービスが多数あります。SAA試験では「どのサービスをどの場面で使うか」の選択が問われます。ここでは各サービスの特徴と使い分けを明確にしましょう。</p>

<div class="analogy">
<p>データ分析を「釣りの記録」に例えると: 生データ（釣果記録ノート）→ ETL（ノートを整理してExcelに入力）→ データレイク（Excelファイルの保管庫）→ 分析（ピボットテーブルで集計）→ 可視化（グラフ作成）。AWSにはこの各段階に特化したサービスがあります。</p>
</div>

<h2>15.1 Athena 〜S3にSQLを実行〜</h2>

<p>Amazon Athenaは、S3に保存されたデータに対して直接SQLクエリを実行できるサーバーレスサービスです。サーバーの構築やデータベースへのロードが不要で、S3にデータを置くだけですぐにクエリできます。</p>

<h3>Athenaの特徴</h3>
<ul>
<li><strong>サーバーレス</strong>: インフラ管理不要</li>
<li><strong>課金体系</strong>: スキャンしたデータ量に対して課金（$5/TB）</li>
<li><strong>対応形式</strong>: CSV、JSON、Parquet、ORC、Avroなど</li>
<li><strong>Glueカタログ連携</strong>: テーブル定義をGlue Data Catalogで管理</li>
</ul>

<div class="exam">
<p><strong>Athenaのコスト最適化（超頻出）</strong>: データを<strong>Parquet</strong>や<strong>ORC</strong>などの列指向フォーマットに変換すると、必要な列だけスキャンするためコストが劇的に下がります。CSVの100分の1以下になることも。さらにデータを<strong>パーティション分割</strong>（例: 年/月/日でフォルダ分け）すると、スキャン範囲が限定されてさらにコスト削減。試験では「Athenaのコスト最適化」=「Parquet/ORC変換 + パーティション」が正解です。</p>
</div>

<div class="tsurispot">
<p><strong>ツリスポのアクセスログ分析</strong>: CloudFrontのアクセスログをS3に保存 → Athenaで「どのスポットページが最もアクセスされているか」「どの地域からのアクセスが多いか」をSQLで集計。Parquet形式にしておけば月間50万PVのログ分析でもクエリ1回あたり$0.01以下で済みます。</p>
</div>

<h2>15.2 AWS Glue 〜ETLとデータカタログ〜</h2>

<p>AWS Glueは、データの抽出・変換・ロード（ETL: Extract, Transform, Load）を行うサーバーレスサービスです。</p>

<h3>主要コンポーネント</h3>
<ul>
<li><strong>Glue Data Catalog</strong>: データのメタデータ（テーブル定義、スキーマ情報）を管理する中央カタログ。Athena、Redshift Spectrum、EMRから参照される</li>
<li><strong>Glue Crawler</strong>: S3やRDSなどのデータソースを自動スキャンし、スキーマを検出してData Catalogに登録する</li>
<li><strong>Glue Job</strong>: PythonやSparkでデータ変換処理を実行（例: CSVをParquetに変換）</li>
<li><strong>Glue Studio</strong>: ビジュアルなGUIでETLジョブを作成</li>
</ul>

<div class="exam">
<p><strong>Glue Data CatalogはAthenaに必須</strong>: AthenaでS3データにクエリするには、まずGlue Data Catalogでテーブル定義を作成する必要があります。Crawlerで自動検出するか、手動でテーブルを定義します。</p>
</div>

<h2>15.3 EMR（Elastic MapReduce）</h2>

<p>Amazon EMRは、Apache Hadoop、Apache Spark、Prestoなどのビッグデータフレームワークをマネージドで実行するサービスです。ペタバイト級のデータ処理に使います。</p>

<div class="point">
<p><strong>Athena vs EMR</strong>: 軽量な分析（アドホッククエリ）→ Athena。大規模で複雑な処理（機械学習、大量のETL）→ EMR。EMRはクラスターの管理が必要なため、手軽さではAthenaに劣ります。</p>
</div>

<h2>15.4 Redshift 〜データウェアハウス〜</h2>

<p>Amazon Redshiftは、大規模データの分析に特化した列指向のデータウェアハウスサービスです。ペタバイト級のデータに対して高速なSQLクエリを実行できます。</p>

<h3>Redshiftの特徴</h3>
<ul>
<li><strong>列指向ストレージ</strong>: 分析クエリ（特定の列を集計するなど）に最適化</li>
<li><strong>ノードベースの課金</strong>: 常時稼働型（Athenaのようなクエリ単位ではない）</li>
<li><strong>Redshift Spectrum</strong>: Redshiftから直接S3のデータにクエリ（Redshiftにロード不要）</li>
<li><strong>Redshift Serverless</strong>: サーバーレス版。使った分だけ課金</li>
</ul>

<div class="exam">
<p><strong>Athena vs Redshift の使い分け</strong>:</p>
<ul>
<li><strong>Athena</strong>: アドホック（その場限り）クエリ、不定期な分析、小〜中規模データ、サーバーレス</li>
<li><strong>Redshift</strong>: 定期的な大量データ分析、複雑な結合、ダッシュボード用の高速クエリ、常時稼働</li>
</ul>
<p>キーワード: 「サーバーレス」「S3上のデータに直接クエリ」「アドホック」→ Athena。「データウェアハウス」「ペタバイト」「BI」「高速ダッシュボード」→ Redshift。</p>
</div>

<h2>15.5 OpenSearch（旧Elasticsearch）</h2>

<p>Amazon OpenSearch Serviceは、全文検索とログ分析のためのマネージドサービスです。Kibanaダッシュボード（OpenSearch Dashboards）で可視化もできます。</p>

<p>よくあるパターン: CloudWatch Logs → サブスクリプションフィルター → Lambda → OpenSearch → ダッシュボードで可視化</p>

<div class="exam">
<p><strong>OpenSearchの出題キーワード</strong>:「全文検索」「ログ分析とダッシュボード」「Elasticsearch」「Kibana」→ OpenSearch。Athenaとの違い: AthenaはS3上のデータへのSQLクエリ、OpenSearchは全文検索とリアルタイムログ分析に特化。</p>
</div>

<h2>15.6 QuickSight 〜BIダッシュボード〜</h2>

<p>Amazon QuickSightは、BI（ビジネスインテリジェンス）ダッシュボードサービスです。様々なデータソース（Athena、Redshift、RDS、S3など）からデータを取得し、グラフやチャートで可視化します。機械学習ベースのインサイト機能（ML Insights）もあります。</p>

<h2>15.7 その他のデータ分析サービス</h2>

<ul>
<li><strong>Lake Formation</strong>: データレイク（S3上の大規模データ保管庫）の構築・管理・セキュリティを簡素化するサービス</li>
<li><strong>MSK（Managed Streaming for Apache Kafka）</strong>: Apache Kafkaのマネージドサービス。Kinesisの代替で、既にKafkaを使っている環境の移行先</li>
<li><strong>Data Pipeline</strong>: データの移動・変換をスケジュール実行するオーケストレーションサービス（レガシー。新規はStep Functions + Glueが推奨）</li>
</ul>

<div class="diagram">
<svg viewBox="0 0 780 380" xmlns="http://www.w3.org/2000/svg" font-family="Segoe UI, Hiragino Sans, sans-serif">
  <defs><marker id="a5" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b"/></marker></defs>
  <text x="390" y="22" text-anchor="middle" font-size="14" fill="#0c4a6e" font-weight="bold">データ分析パイプライン全体図</text>

  <!-- データソース -->
  <rect x="15" y="55" width="110" height="35" rx="8" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
  <text x="70" y="78" text-anchor="middle" font-size="10" fill="#1e40af" font-weight="bold">CloudFront ログ</text>
  <rect x="15" y="105" width="110" height="35" rx="8" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
  <text x="70" y="128" text-anchor="middle" font-size="10" fill="#1e40af" font-weight="bold">RDS / DynamoDB</text>
  <rect x="15" y="155" width="110" height="35" rx="8" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
  <text x="70" y="178" text-anchor="middle" font-size="10" fill="#1e40af" font-weight="bold">IoT / アプリログ</text>
  <text x="70" y="48" text-anchor="middle" font-size="11" fill="#64748b" font-weight="bold">データソース</text>

  <!-- Glue -->
  <rect x="175" y="70" width="120" height="110" rx="10" fill="#fef3c7" stroke="#f59e0b" stroke-width="2"/>
  <text x="235" y="95" text-anchor="middle" font-size="12" fill="#92400e" font-weight="bold">AWS Glue</text>
  <text x="235" y="115" text-anchor="middle" font-size="10" fill="#b45309">Crawler</text>
  <text x="235" y="132" text-anchor="middle" font-size="10" fill="#b45309">ETL Job</text>
  <text x="235" y="149" text-anchor="middle" font-size="10" fill="#b45309">Data Catalog</text>
  <text x="235" y="170" text-anchor="middle" font-size="9" fill="#b45309">CSV→Parquet変換</text>

  <!-- S3 データレイク -->
  <rect x="345" y="70" width="130" height="110" rx="10" fill="#f0fdf4" stroke="#22c55e" stroke-width="3"/>
  <text x="410" y="100" text-anchor="middle" font-size="14" fill="#166534" font-weight="bold">S3</text>
  <text x="410" y="120" text-anchor="middle" font-size="11" fill="#15803d">データレイク</text>
  <text x="410" y="140" text-anchor="middle" font-size="10" fill="#15803d">Parquet/ORC形式</text>
  <text x="410" y="157" text-anchor="middle" font-size="9" fill="#15803d">パーティション分割</text>

  <!-- 分析サービス群 -->
  <rect x="540" y="40" width="120" height="42" rx="8" fill="#ede9fe" stroke="#8b5cf6" stroke-width="2"/>
  <text x="600" y="58" text-anchor="middle" font-size="11" fill="#6d28d9" font-weight="bold">Athena</text>
  <text x="600" y="74" text-anchor="middle" font-size="9" fill="#7c3aed">SQLクエリ(サーバーレス)</text>
  <rect x="540" y="100" width="120" height="42" rx="8" fill="#fce7f3" stroke="#ec4899" stroke-width="2"/>
  <text x="600" y="118" text-anchor="middle" font-size="11" fill="#be185d" font-weight="bold">Redshift</text>
  <text x="600" y="134" text-anchor="middle" font-size="9" fill="#be185d">DWH(大規模分析)</text>
  <rect x="540" y="160" width="120" height="42" rx="8" fill="#fff7ed" stroke="#f97316" stroke-width="2"/>
  <text x="600" y="178" text-anchor="middle" font-size="11" fill="#c2410c" font-weight="bold">EMR</text>
  <text x="600" y="194" text-anchor="middle" font-size="9" fill="#ea580c">Spark/Hadoop</text>

  <!-- QuickSight -->
  <rect x="540" y="240" width="120" height="50" rx="8" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
  <text x="600" y="260" text-anchor="middle" font-size="12" fill="#1e40af" font-weight="bold">QuickSight</text>
  <text x="600" y="280" text-anchor="middle" font-size="9" fill="#3b82f6">BIダッシュボード</text>

  <!-- 矢印 -->
  <line x1="125" y1="72" x2="175" y2="100" stroke="#64748b" stroke-width="1.5" marker-end="url(#a5)"/>
  <line x1="125" y1="122" x2="175" y2="125" stroke="#64748b" stroke-width="1.5" marker-end="url(#a5)"/>
  <line x1="125" y1="172" x2="175" y2="150" stroke="#64748b" stroke-width="1.5" marker-end="url(#a5)"/>
  <line x1="295" y1="125" x2="345" y2="125" stroke="#64748b" stroke-width="2" marker-end="url(#a5)"/>
  <line x1="475" y1="100" x2="540" y2="61" stroke="#64748b" stroke-width="1.5" marker-end="url(#a5)"/>
  <line x1="475" y1="120" x2="540" y2="121" stroke="#64748b" stroke-width="1.5" marker-end="url(#a5)"/>
  <line x1="475" y1="140" x2="540" y2="181" stroke="#64748b" stroke-width="1.5" marker-end="url(#a5)"/>
  <line x1="600" y1="82" x2="600" y2="240" stroke="#93c5fd" stroke-width="1.5" stroke-dasharray="5,3" marker-end="url(#a5)"/>
  <text x="625" y="220" font-size="9" fill="#64748b">可視化</text>
</svg>
<figcaption>図15-1: データ分析パイプライン全体図</figcaption>
</div>

<div class="diagram">
<svg viewBox="0 0 700 300" xmlns="http://www.w3.org/2000/svg" font-family="Segoe UI, Hiragino Sans, sans-serif">
  <text x="350" y="22" text-anchor="middle" font-size="14" fill="#0c4a6e" font-weight="bold">Athena vs Redshift 使い分けフローチャート</text>
  <rect x="220" y="40" width="260" height="40" rx="8" fill="#eff6ff" stroke="#3b82f6" stroke-width="2"/>
  <text x="350" y="65" text-anchor="middle" font-size="12" fill="#1e40af" font-weight="bold">S3上のデータを分析したい</text>
  <rect x="100" y="120" width="220" height="40" rx="8" fill="#fef3c7" stroke="#f59e0b" stroke-width="2"/>
  <text x="210" y="145" text-anchor="middle" font-size="11" fill="#92400e" font-weight="bold">不定期 / アドホック / 小〜中規模？</text>
  <rect x="380" y="120" width="220" height="40" rx="8" fill="#fef3c7" stroke="#f59e0b" stroke-width="2"/>
  <text x="490" y="145" text-anchor="middle" font-size="11" fill="#92400e" font-weight="bold">定期的 / 大規模 / 高速BI？</text>
  <rect x="110" y="200" width="200" height="55" rx="10" fill="#ede9fe" stroke="#8b5cf6" stroke-width="3"/>
  <text x="210" y="222" text-anchor="middle" font-size="14" fill="#6d28d9" font-weight="bold">Athena</text>
  <text x="210" y="244" text-anchor="middle" font-size="10" fill="#7c3aed">サーバーレス / スキャン量課金</text>
  <rect x="390" y="200" width="200" height="55" rx="10" fill="#fce7f3" stroke="#ec4899" stroke-width="3"/>
  <text x="490" y="222" text-anchor="middle" font-size="14" fill="#be185d" font-weight="bold">Redshift</text>
  <text x="490" y="244" text-anchor="middle" font-size="10" fill="#be185d">DWH / ノード課金 / 高速</text>
  <line x1="300" y1="80" x2="210" y2="120" stroke="#64748b" stroke-width="1.5" marker-end="url(#a5)"/>
  <line x1="400" y1="80" x2="490" y2="120" stroke="#64748b" stroke-width="1.5" marker-end="url(#a5)"/>
  <line x1="210" y1="160" x2="210" y2="200" stroke="#64748b" stroke-width="1.5" marker-end="url(#a5)"/>
  <line x1="490" y1="160" x2="490" y2="200" stroke="#64748b" stroke-width="1.5" marker-end="url(#a5)"/>
  <text x="210" y="108" text-anchor="middle" font-size="10" fill="#22c55e" font-weight="bold">YES</text>
  <text x="490" y="108" text-anchor="middle" font-size="10" fill="#22c55e" font-weight="bold">YES</text>
</svg>
<figcaption>図15-2: Athena vs Redshift の使い分けフローチャート</figcaption>
</div>

<div class="tsurispot">
<p><strong>ツリスポのデータ分析パイプライン</strong>: CloudFrontアクセスログ → S3に蓄積 → Glue CrawlerでスキーマをData Catalogに登録 → Glue JobでParquet形式に変換 → AthenaでSQL集計（人気スポットランキング、地域別アクセス数）→ QuickSightでダッシュボード化。月間50万PVのログをParquet形式でクエリすれば1回あたり$0.01以下。年間コストは数ドルで済みます。</p>
</div>

<div class="summary-box">
<h4>第15章まとめ</h4>
<ul>
<li><strong>Athena</strong>: S3にSQL。サーバーレス、スキャン量課金。Parquet/ORC変換でコスト大幅削減</li>
<li><strong>Glue</strong>: ETL + Data Catalog + Crawler。AthenaやRedshiftのメタデータ管理</li>
<li><strong>EMR</strong>: Hadoop/Sparkの大規模ビッグデータ処理</li>
<li><strong>Redshift</strong>: 列指向DWH。大規模・定期分析・高速BI向け</li>
<li><strong>OpenSearch</strong>: 全文検索 + リアルタイムログ分析 + ダッシュボード</li>
<li><strong>QuickSight</strong>: BIダッシュボード。多数のデータソースに対応</li>
<li>Athena vs Redshift: 「アドホック・サーバーレス」→ Athena、「大規模・常時」→ Redshift</li>
</ul>
</div>

<div class="quiz">
<p><strong>Q1.</strong> AthenaのクエリコストをCSV対比で大幅に下げる方法は？</p>
<details><summary>答えを見る</summary><p>データをParquetまたはORC（列指向フォーマット）に変換する。必要な列だけスキャンするため、コストが数十〜数百分の1になる。パーティション分割も有効。</p></details>
</div>
<div class="quiz">
<p><strong>Q2.</strong> S3のデータのスキーマを自動検出してAthenaで使えるようにするには？</p>
<details><summary>答えを見る</summary><p>Glue Crawlerを実行してスキーマを自動検出し、Glue Data Catalogにテーブル定義を登録する。AthenaはGlue Data Catalogを参照してクエリを実行する。</p></details>
</div>
<div class="quiz">
<p><strong>Q3.</strong> アドホッククエリにAthena、常時稼働の大規模分析にRedshiftを使う理由は？</p>
<details><summary>答えを見る</summary><p>Athenaはスキャン量課金のサーバーレスで不定期利用に最適。Redshiftはノード課金で常時稼働だが、大規模データの複雑なクエリを高速処理できる。</p></details>
</div>
''')

print(f"Chapter 15 done. Total: {os.path.getsize(OUTPUT)} bytes")
