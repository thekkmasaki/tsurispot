#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os
OUTPUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'part3-advanced.html')
def w(text):
    with open(OUTPUT, 'a', encoding='utf-8') as f:
        f.write(text)

w('''
<!-- Q35 -->
<div class="question-card">
  <h4>問題 35 / 50 <span style="font-size:0.8em;color:#64748b">（弾力性に優れたアーキテクチャ）</span></h4>
  <p>50TBのオンプレミスデータをAWSに移行する必要があります。ネットワーク帯域は100Mbpsで、転送完了まで約46日かかります。1週間以内に移行を完了させる方法は？</p>
  <ol class="choices">
    <li>AWS Direct Connectを設定する</li>
    <li>AWS Snowball Edgeを使用する</li>
    <li>S3 Transfer Accelerationを使用する</li>
    <li>AWS DataSyncを使用する</li>
  </ol>
  <details>
    <summary>解答と解説を見る</summary>
    <div class="answer">
      <p class="correct">正解: B</p>
      <p>Snowball Edge（80TB容量）に物理的にデータをコピーしてAWSに送付。配送+データ転送+返送で約1週間で完了。ネットワーク帯域の制限を回避できます。</p>
      <p>A: Direct Connectの設定自体に数週間〜数ヶ月かかる。C: S3 TAはアップロード高速化だが100Mbpsの帯域制限は解決しない。D: DataSyncもネットワーク経由なので46日は変わらない。</p>
    </div>
  </details>
</div>

<!-- Q36 -->
<div class="question-card">
  <h4>問題 36 / 50 <span style="font-size:0.8em;color:#64748b">（コスト最適化されたアーキテクチャ）</span></h4>
  <p>AWSの月額コストが予算を超えそうになったらメール通知を受けたい。最も適切なサービスは？</p>
  <ol class="choices">
    <li>AWS Cost Explorer</li>
    <li>AWS Budgets</li>
    <li>AWS CloudWatch Billing Alarm</li>
    <li>AWS Cost and Usage Report</li>
  </ol>
  <details>
    <summary>解答と解説を見る</summary>
    <div class="answer">
      <p class="correct">正解: B</p>
      <p>AWS Budgetsは予算を設定し、実際のコストまたは予測コストが閾値を超えた場合にSNS/メールで通知します。実コスト予算、予測予算、使用量予算などを設定可能。</p>
      <p>A: Cost Explorerは分析ツールで通知機能は限定的。C: Billing Alarmも通知可能だが、BudgetsのほうがForecast（予測）通知やアクション機能が豊富。D: CURは詳細レポートで通知機能なし。</p>
    </div>
  </details>
</div>

<!-- Q37 -->
<div class="question-card">
  <h4>問題 37 / 50 <span style="font-size:0.8em;color:#64748b">（高パフォーマンスなアーキテクチャ）</span></h4>
  <p>マイクロサービスアーキテクチャで、リクエストがどのサービスを通過し、どこでレイテンシが発生しているかを特定するサービスは？</p>
  <ol class="choices">
    <li>Amazon CloudWatch</li>
    <li>AWS X-Ray</li>
    <li>AWS CloudTrail</li>
    <li>Amazon EventBridge</li>
  </ol>
  <details>
    <summary>解答と解説を見る</summary>
    <div class="answer">
      <p class="correct">正解: B</p>
      <p>AWS X-Rayは分散トレーシングサービスで、リクエストの経路を可視化し、各サービスでの処理時間を特定します。サービスマップで全体像を把握し、ボトルネックを発見できます。</p>
      <p>A: CloudWatchはメトリクス/ログ監視だが、リクエスト経路の追跡は不可。C: CloudTrailはAPI操作ログ。D: EventBridgeはイベントルーティング。</p>
    </div>
  </details>
</div>

<!-- Q38 -->
<div class="question-card">
  <h4>問題 38 / 50 <span style="font-size:0.8em;color:#64748b">（弾力性に優れたアーキテクチャ）</span></h4>
  <p>ある釣り情報サイトで、ユーザーのお気に入りスポットデータをミリ秒レベルの低レイテンシで取得する必要があり、データサイズは小さくアクセスパターンが単純です。最適なデータベースは？</p>
  <ol class="choices">
    <li>Amazon RDS MySQL</li>
    <li>Amazon DynamoDB</li>
    <li>Amazon Redshift</li>
    <li>Amazon DocumentDB</li>
  </ol>
  <details>
    <summary>解答と解説を見る</summary>
    <div class="answer">
      <p class="correct">正解: B</p>
      <p>DynamoDBはキーバリュー型NoSQLデータベースで、単純なアクセスパターン（キーでの取得/書き込み）に対してミリ秒以下のレイテンシを提供します。自動スケーリング、サーバーレスにも対応。</p>
      <p>A: RDSは汎用的だがDynamoDBほどの低レイテンシは保証しない。C: Redshiftは分析用DWH。D: DocumentDBはドキュメントDB（MongoDB互換）で、単純なキーバリューにはDynamoDBの方が適切。</p>
    </div>
  </details>
</div>

<!-- Q39 -->
<div class="question-card">
  <h4>問題 39 / 50 <span style="font-size:0.8em;color:#64748b">（セキュアなアーキテクチャ）</span></h4>
  <p>EC2インスタンスのメモリ使用率が90%を超えたら通知を受けたい。必要な手順として正しいものは？</p>
  <ol class="choices">
    <li>CloudWatch標準メトリクスでメモリ使用率のアラームを設定する</li>
    <li>CloudWatch Agentをインストールしてカスタムメトリクスを送信し、アラームを設定する</li>
    <li>AWS Configでメモリ使用率ルールを作成する</li>
    <li>EC2のモニタリングタブで詳細モニタリングを有効にする</li>
  </ol>
  <details>
    <summary>解答と解説を見る</summary>
    <div class="answer">
      <p class="correct">正解: B</p>
      <p>メモリ使用率はEC2の標準メトリクスに含まれません。CloudWatch Agentをインストールして、OSレベルのメモリ使用率をカスタムメトリクスとしてCloudWatchに送信し、そのメトリクスにアラームを設定します。</p>
      <p>A: メモリは標準メトリクスに含まれない。C: Configはリソース設定の評価でメトリクスではない。D: 詳細モニタリングはCPU等の間隔を1分にするだけでメモリは増えない。</p>
    </div>
  </details>
</div>

<!-- Q40 -->
<div class="question-card">
  <h4>問題 40 / 50 <span style="font-size:0.8em;color:#64748b">（コスト最適化されたアーキテクチャ）</span></h4>
  <p>開発環境のRDS MySQLインスタンスを、毎日18時に自動停止し翌朝9時に自動起動してコストを削減したい。最も適切な方法は？</p>
  <ol class="choices">
    <li>RDSの自動停止/起動スケジュール機能を使う</li>
    <li>EventBridgeスケジュール → Lambda関数でRDS APIを呼び出す</li>
    <li>Systems Manager Maintenance Windowを使う</li>
    <li>AWS Budgetsでアクションを設定する</li>
  </ol>
  <details>
    <summary>解答と解説を見る</summary>
    <div class="answer">
      <p class="correct">正解: B</p>
      <p>EventBridgeのスケジュールルール（cron式）でLambda関数を定期実行し、LambdaからRDSのstop-db-instance / start-db-instance APIを呼び出します。RDS自体には自動スケジュール停止/起動の組み込み機能はないため（手動停止は7日後に自動再起動される）、このパターンが定番です。</p>
      <p>A: RDSには組み込みのスケジュール停止/起動機能がない。C: Maintenance Windowはパッチ適用等向け。D: Budgetsは予算アラート。</p>
    </div>
  </details>
</div>

<!-- Q41 -->
<div class="question-card">
  <h4>問題 41 / 50 <span style="font-size:0.8em;color:#64748b">（弾力性に優れたアーキテクチャ）</span></h4>
  <p>オンプレミスのOracleデータベースをAurora PostgreSQLに移行する際、ダウンタイムを最小限にする方法は？</p>
  <ol class="choices">
    <li>mysqldumpでエクスポートしてAuroraにインポート</li>
    <li>AWS DMSでCDC（Change Data Capture）を使用した継続的レプリケーション</li>
    <li>Snowball Edgeでデータを物理転送</li>
    <li>S3経由でデータをエクスポート/インポート</li>
  </ol>
  <details>
    <summary>解答と解説を見る</summary>
    <div class="answer">
      <p class="correct">正解: B</p>
      <p>DMSのCDCは、初回のフルロード後も、ソースDBの変更をリアルタイムでターゲットにレプリケーションし続けます。ソースDBは稼働したままで、切り替え時のダウンタイムは最小（分単位）。Oracle→PostgreSQLの異種DB移行ではSCT（Schema Conversion Tool）も併用します。</p>
    </div>
  </details>
</div>

<!-- Q42 -->
<div class="question-card">
  <h4>問題 42 / 50 <span style="font-size:0.8em;color:#64748b">（高パフォーマンスなアーキテクチャ）</span></h4>
  <p>ある釣り情報サイトで、全2,000スポットの全文検索機能を実装したい。スポット名、住所、釣れる魚名で横断検索でき、タイプミスにも対応する必要があります。最適なサービスは？</p>
  <ol class="choices">
    <li>Amazon RDS（LIKE検索）</li>
    <li>Amazon OpenSearch Service</li>
    <li>Amazon DynamoDB（Scanオペレーション）</li>
    <li>Amazon Athena</li>
  </ol>
  <details>
    <summary>解答と解説を見る</summary>
    <div class="answer">
      <p class="correct">正解: B</p>
      <p>OpenSearch Serviceは全文検索に特化しており、あいまい検索（タイプミス対応のfuzzy検索）、形態素解析（日本語対応）、ファセット検索、レレバンシースコアリングなどの高度な検索機能を提供します。</p>
      <p>A: LIKE検索は大規模データで非常に遅い。C: DynamoDB Scanはテーブル全件走査で非効率。D: Athenaはバッチ分析向けでリアルタイム検索には不向き。</p>
    </div>
  </details>
</div>

<!-- Q43 -->
<div class="question-card">
  <h4>問題 43 / 50 <span style="font-size:0.8em;color:#64748b">（セキュアなアーキテクチャ）</span></h4>
  <p>DDoS攻撃（分散型サービス拒否攻撃）からWebアプリケーションを保護するための最も包括的なAWSサービスは？</p>
  <ol class="choices">
    <li>AWS WAF のみ</li>
    <li>AWS Shield Standard のみ</li>
    <li>AWS Shield Advanced + AWS WAF の組み合わせ</li>
    <li>Amazon GuardDuty</li>
  </ol>
  <details>
    <summary>解答と解説を見る</summary>
    <div class="answer">
      <p class="correct">正解: C</p>
      <p>Shield Advanced（有料: $3,000/月）はL3/L4のDDoS保護に加え、24/7 DRTサポート、コスト保護、高度な攻撃検出を提供。WAFをL7保護として組み合わせることで最も包括的な防御を実現します。</p>
      <p>A: WAFはL7のみでL3/L4攻撃に対応不可。B: Shield Standardは無料で基本的なL3/L4保護のみ。D: GuardDutyは脅威検知で防御ではない。</p>
    </div>
  </details>
</div>

<!-- Q44 -->
<div class="question-card">
  <h4>問題 44 / 50 <span style="font-size:0.8em;color:#64748b">（コスト最適化されたアーキテクチャ）</span></h4>
  <p>AWSのコストを最も詳細なレベル（リソース単位、時間単位）で分析するために使用するレポートは？</p>
  <ol class="choices">
    <li>AWS Cost Explorer</li>
    <li>AWS Budgets</li>
    <li>AWS Cost and Usage Report（CUR）</li>
    <li>AWS Trusted Advisor</li>
  </ol>
  <details>
    <summary>解答と解説を見る</summary>
    <div class="answer">
      <p class="correct">正解: C</p>
      <p>Cost and Usage Report（CUR）は最も詳細なコストデータを提供します。リソースID単位、時間単位の明細がCSV形式でS3に出力され、Athenaで分析可能です。</p>
      <p>A: Cost Explorerはグラフィカルな分析ツールだがCURほど詳細ではない。B: Budgetsは予算管理。D: Trusted Advisorはベストプラクティス推奨。</p>
    </div>
  </details>
</div>

<!-- Q45 -->
<div class="question-card">
  <h4>問題 45 / 50 <span style="font-size:0.8em;color:#64748b">（弾力性に優れたアーキテクチャ）</span></h4>
  <p>S3バケットのデータを別リージョンにリアルタイムで複製し、DR（災害復旧）に備えたい。最も適切な機能は？</p>
  <ol class="choices">
    <li>S3バージョニング</li>
    <li>S3クロスリージョンレプリケーション（CRR）</li>
    <li>S3 Transfer Acceleration</li>
    <li>AWS DataSync</li>
  </ol>
  <details>
    <summary>解答と解説を見る</summary>
    <div class="answer">
      <p class="correct">正解: B</p>
      <p>S3クロスリージョンレプリケーション（CRR）は、ソースバケットのオブジェクトを別リージョンのバケットに非同期で自動複製します。DR、コンプライアンス（データの地理的分散）、レイテンシ削減に使用。前提条件としてバージョニングの有効化が必要です。</p>
      <p>A: バージョニングはオブジェクトの履歴管理で別リージョン複製ではない。C: Transfer Accelerationはアップロード高速化。D: DataSyncは主にオンプレミス↔AWS間。</p>
    </div>
  </details>
</div>

<!-- Q46 -->
<div class="question-card">
  <h4>問題 46 / 50 <span style="font-size:0.8em;color:#64748b">（高パフォーマンスなアーキテクチャ）</span></h4>
  <p>CloudFormationテンプレートで定義するインフラを複数のAWSアカウントと複数のリージョンに同時展開したい。使用する機能は？</p>
  <ol class="choices">
    <li>CloudFormation ネスティッド スタック</li>
    <li>CloudFormation スタックセット</li>
    <li>CloudFormation ドリフト検出</li>
    <li>CloudFormation 変更セット</li>
  </ol>
  <details>
    <summary>解答と解説を見る</summary>
    <div class="answer">
      <p class="correct">正解: B</p>
      <p>CloudFormation StackSets（スタックセット）は、1つのテンプレートを複数のAWSアカウントと複数のリージョンに同時展開する機能です。AWS Organizationsと連携して、組織全体にインフラを展開できます。</p>
      <p>A: ネスティッドスタックはテンプレートの再利用（親子構造）。C: ドリフト検出はテンプレートと実リソースの差異検出。D: 変更セットは更新前のプレビュー。</p>
    </div>
  </details>
</div>

<!-- Q47 -->
<div class="question-card">
  <h4>問題 47 / 50 <span style="font-size:0.8em;color:#64748b">（コスト最適化されたアーキテクチャ）</span></h4>
  <p>ある釣り情報サイトのApp Runner環境をCloudFormationで管理しています。開発者がコードのデプロイだけに集中し、インフラの詳細を気にしないようにしたい場合、最も適切なサービスは？</p>
  <ol class="choices">
    <li>Amazon ECS on Fargate</li>
    <li>AWS Elastic Beanstalk</li>
    <li>Amazon EKS</li>
    <li>Amazon Lightsail</li>
  </ol>
  <details>
    <summary>解答と解説を見る</summary>
    <div class="answer">
      <p class="correct">正解: B</p>
      <p>Elastic BeanstalkはPaaS（Platform as a Service）で、コードをアップロードするだけでEC2、ALB、Auto Scaling、RDSなどのインフラを自動構築します。開発者はコードに集中でき、インフラの詳細はBeanstalkが管理。裏ではCloudFormationが動いています。</p>
      <p>A: Fargateはコンテナの定義やタスク定義の管理が必要。C: EKSはKubernetesの知識が必要で最も複雑。D: Lightsailはシンプルだが自動スケーリングが限定的。</p>
    </div>
  </details>
</div>

<!-- Q48 -->
<div class="question-card">
  <h4>問題 48 / 50 <span style="font-size:0.8em;color:#64748b">（弾力性に優れたアーキテクチャ）</span></h4>
  <p>VPC内のEC2インスタンスがインターネットからのHTTPリクエストを受信できるようにするために必要なコンポーネントの組み合わせは？（3つ選択）</p>
  <ol class="choices">
    <li>インターネットゲートウェイをVPCにアタッチ</li>
    <li>パブリックサブネットのルートテーブルにIGWへのルートを追加</li>
    <li>セキュリティグループでHTTP(80)のインバウンドを許可</li>
    <li>NATゲートウェイを設定</li>
  </ol>
  <details>
    <summary>解答と解説を見る</summary>
    <div class="answer">
      <p class="correct">正解: A, B, C</p>
      <p>インターネットからEC2にアクセスするには: (A) IGWをVPCにアタッチ + (B) ルートテーブルで0.0.0.0/0 → IGWのルート + (C) SGでHTTPポート許可 + パブリックIPの割り当てが必要。</p>
      <p>D: NATゲートウェイはプライベートサブネット→インターネットの片方向通信用で、インターネットからのインバウンドには使えない。</p>
    </div>
  </details>
</div>

<!-- Q49 -->
<div class="question-card">
  <h4>問題 49 / 50 <span style="font-size:0.8em;color:#64748b">（コスト最適化されたアーキテクチャ）</span></h4>
  <p>ある釣り情報サイトで、Athenaを使ってS3のアクセスログを分析しています。クエリコストを大幅に削減する方法として最も効果的なものは？</p>
  <ol class="choices">
    <li>Athenaのクエリ結果をキャッシュする</li>
    <li>S3のログデータをCSVからParquet形式に変換する</li>
    <li>Athenaのワークグループでクエリ実行数を制限する</li>
    <li>S3バケットのストレージクラスをGlacierに変更する</li>
  </ol>
  <details>
    <summary>解答と解説を見る</summary>
    <div class="answer">
      <p class="correct">正解: B</p>
      <p>AthenaはスキャンしたデータGB量に課金されます。Parquet（列指向フォーマット）に変換すると、必要な列だけスキャンするため、CSV比で数十〜数百分の1にデータスキャン量が減少します。さらにデータの圧縮率も高いため、コストが劇的に削減されます。パーティション分割との併用でさらに効果的。</p>
      <p>A: キャッシュは同じクエリの再実行時のみ有効。C: 制限はコスト削減ではなく使いすぎ防止。D: GlacierのデータにAthenaは直接クエリできない。</p>
    </div>
  </details>
</div>

<!-- Q50 -->
<div class="question-card">
  <h4>問題 50 / 50 <span style="font-size:0.8em;color:#64748b">（コスト最適化されたアーキテクチャ）</span></h4>
  <p>ある釣り情報サイト（Next.js、5,000+ページ、月間50万PV目標）を最もコスト効率よくAWS上で運用するアーキテクチャとして、最適な組み合わせはどれですか？</p>
  <ol class="choices">
    <li>EC2（m5.xlarge）+ RDS MySQL + CloudFront</li>
    <li>ECS Fargate + Aurora Serverless + CloudFront + S3</li>
    <li>App Runner + S3（静的アセット）+ CloudFront + DynamoDB（必要時）</li>
    <li>Lightsail + S3</li>
  </ol>
  <details>
    <summary>解答と解説を見る</summary>
    <div class="answer">
      <p class="correct">正解: C</p>
      <p>App Runnerはコンテナをサーバーレスで実行し、アイドル時のコストが最小。CloudFrontで静的アセットをキャッシュし、S3に画像を保存。現状DBが不要（SSGでJSONデータ）なら、必要になったときだけDynamoDBを追加。月間50万PV程度なら、この構成で月$30-50程度に収められます。</p>
      <p>A: m5.xlargeは過剰でコスト高。RDS MySQLも常時稼働でコスト増。B: FargateとAurora Serverlessは柔軟だが、App Runnerよりセットアップが複雑。D: Lightsailは固定リソースでスケーリングが限定的。</p>
    </div>
  </details>
</div>

<div class="summary-box">
<h4>模擬試験の採点</h4>
<p>合格ライン: <strong>36問以上正解（72%）</strong></p>
<ul>
<li>45問以上: 合格圏内。本番でも十分合格できる実力</li>
<li>36〜44問: 合格ライン付近。弱点分野を復習しましょう</li>
<li>25〜35問: もう一歩。各章を読み直して再挑戦</li>
<li>24問以下: Part 1〜3を体系的に復習し、用語と概念を固めましょう</li>
</ul>
<p>間違えた問題のカテゴリを分析して、弱点を集中的に強化しましょう。</p>
</div>

</div><!-- /.container -->

<div class="header-bar" style="margin-top:3rem;">
  <p>AWS SAA-C03 完全攻略ガイド Part 3: 応用・実戦編</p>
  <p style="font-size:0.85rem; margin-top:0.5rem;">ツリスポ（tsurispot.com）で学ぶ実践的AWS</p>
</div>

</body>
</html>
''')

print(f"Q35-50 + footer done. Total: {os.path.getsize(OUTPUT)} bytes")
