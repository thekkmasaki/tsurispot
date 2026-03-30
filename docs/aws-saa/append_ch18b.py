#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os
OUTPUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'part3-advanced.html')
def w(text):
    with open(OUTPUT, 'a', encoding='utf-8') as f:
        f.write(text)

w('''
<!-- Q18 -->
<div class="question-card">
  <h4>問題 18 / 50 <span style="font-size:0.8em;color:#64748b">（高パフォーマンスなアーキテクチャ）</span></h4>
  <p>世界中のユーザーにWebコンテンツを低レイテンシで配信するために使用すべきサービスはどれですか？</p>
  <ol class="choices">
    <li>Amazon S3 Transfer Acceleration</li>
    <li>Amazon CloudFront</li>
    <li>AWS Global Accelerator</li>
    <li>Amazon Route 53 レイテンシーベースルーティング</li>
  </ol>
  <details>
    <summary>解答と解説を見る</summary>
    <div class="answer">
      <p class="correct">正解: B</p>
      <p>CloudFrontは世界中のエッジロケーションにコンテンツをキャッシュし、ユーザーに最も近い場所から配信するCDNです。静的コンテンツ（画像、CSS、JS）だけでなく動的コンテンツも高速化します。</p>
      <p>A: S3 Transfer Accelerationはアップロード高速化。C: Global Acceleratorは固定IPとAWSネットワーク最適化だがキャッシュなし。D: Route 53は最も近いリージョンへルーティングするがキャッシュなし。</p>
    </div>
  </details>
</div>

<!-- Q19 -->
<div class="question-card">
  <h4>問題 19 / 50 <span style="font-size:0.8em;color:#64748b">（高パフォーマンスなアーキテクチャ）</span></h4>
  <p>ALBとNLBの使い分けについて正しい記述はどれですか？</p>
  <ol class="choices">
    <li>ALBはレイヤー4で動作し、NLBはレイヤー7で動作する</li>
    <li>ALBはHTTP/HTTPSに対応し、NLBはTCP/UDP/TLSに対応する</li>
    <li>NLBはパスベースルーティングをサポートする</li>
    <li>ALBは固定IPアドレスを提供する</li>
  </ol>
  <details>
    <summary>解答と解説を見る</summary>
    <div class="answer">
      <p class="correct">正解: B</p>
      <p>ALBはレイヤー7（HTTP/HTTPS）で動作し、パスベース/ホストベースルーティングが可能。NLBはレイヤー4（TCP/UDP/TLS）で動作し、超低レイテンシと固定IP（Elastic IP）を提供します。</p>
      <p>A: 逆。ALB=L7、NLB=L4。C: パスベースルーティングはALBの機能。D: 固定IPはNLBの特徴。</p>
    </div>
  </details>
</div>

<!-- Q20 -->
<div class="question-card">
  <h4>問題 20 / 50 <span style="font-size:0.8em;color:#64748b">（高パフォーマンスなアーキテクチャ）</span></h4>
  <p>ある釣り情報サイトで、頻繁にアクセスされるスポット情報のDBクエリ結果をキャッシュしてレイテンシを削減したい。最も適切なサービスはどれですか？</p>
  <ol class="choices">
    <li>Amazon DynamoDB DAX</li>
    <li>Amazon ElastiCache</li>
    <li>Amazon CloudFront</li>
    <li>Amazon RDS リードレプリカ</li>
  </ol>
  <details>
    <summary>解答と解説を見る</summary>
    <div class="answer">
      <p class="correct">正解: B</p>
      <p>ElastiCache（Redis/Memcached）は汎用的なインメモリキャッシュで、RDS等のDBクエリ結果をキャッシュしてレイテンシを大幅に削減します。</p>
      <p>A: DAXはDynamoDB専用のキャッシュ。問題文がRDSならDAXは不適切。B: ElastiCacheは汎用キャッシュで最適。C: CloudFrontはCDNでHTTPレスポンスのキャッシュ。DBクエリ結果の直接キャッシュではない。D: リードレプリカはDB負荷分散だがキャッシュではない。</p>
    </div>
  </details>
</div>

<!-- Q21 -->
<div class="question-card">
  <h4>問題 21 / 50 <span style="font-size:0.8em;color:#64748b">（高パフォーマンスなアーキテクチャ）</span></h4>
  <p>Lambda関数のタイムアウトが15分では足りない長時間処理を実行する必要があります。サーバーレスで実現する最も適切な方法は？</p>
  <ol class="choices">
    <li>Lambdaのタイムアウトを延長する</li>
    <li>AWS Step Functionsで処理を複数のLambda関数に分割する</li>
    <li>EC2インスタンスで処理する</li>
    <li>ECS Fargateでコンテナを実行する</li>
  </ol>
  <details>
    <summary>解答と解説を見る</summary>
    <div class="answer">
      <p class="correct">正解: B</p>
      <p>Lambdaの最大タイムアウトは15分で延長不可。Step Functionsで処理を複数のLambdaに分割し、ワークフローとして実行すれば、最大1年間の長時間処理が可能です（サーバーレスのまま）。</p>
      <p>A: 15分が最大で延長不可。C: EC2はサーバーレスではない。D: Fargateはサーバーレスだが、Step Functionsの方が問題の趣旨（Lambda処理の延長）に合っている。</p>
    </div>
  </details>
</div>

<!-- Q22 -->
<div class="question-card">
  <h4>問題 22 / 50 <span style="font-size:0.8em;color:#64748b">（高パフォーマンスなアーキテクチャ）</span></h4>
  <p>Route 53で、ユーザーを最も近いリージョンのリソースにルーティングしたい。使用すべきルーティングポリシーは？</p>
  <ol class="choices">
    <li>シンプルルーティング</li>
    <li>加重ルーティング</li>
    <li>レイテンシーベースルーティング</li>
    <li>フェイルオーバールーティング</li>
  </ol>
  <details>
    <summary>解答と解説を見る</summary>
    <div class="answer">
      <p class="correct">正解: C</p>
      <p>レイテンシーベースルーティングは、ユーザーとAWSリージョン間のレイテンシを測定し、最もレイテンシの低いリージョンにルーティングします。</p>
      <p>A: シンプルは1つのリソースにルーティング。B: 加重は割合でトラフィック配分（A/Bテスト等）。D: フェイルオーバーはプライマリ障害時にセカンダリへ。</p>
    </div>
  </details>
</div>

<!-- Q23 -->
<div class="question-card">
  <h4>問題 23 / 50 <span style="font-size:0.8em;color:#64748b">（高パフォーマンスなアーキテクチャ）</span></h4>
  <p>IoTデバイスから毎秒数千件のデータを受信し、リアルタイムでダッシュボードに表示する必要があります。データ収集に最も適切なサービスは？</p>
  <ol class="choices">
    <li>Amazon SQS</li>
    <li>Amazon Kinesis Data Streams</li>
    <li>Amazon SNS</li>
    <li>Amazon MQ</li>
  </ol>
  <details>
    <summary>解答と解説を見る</summary>
    <div class="answer">
      <p class="correct">正解: B</p>
      <p>Kinesis Data Streamsはリアルタイムストリーミングデータの収集・処理に特化しています。IoTデバイスからの大量データをシャード単位で並列処理し、複数のConsumerが同時に読み取れます。</p>
      <p>A: SQSは非同期タスクキューでリアルタイムストリーミングには不向き。C: SNSはPub/Sub通知。D: MQはレガシー移行用。</p>
    </div>
  </details>
</div>

<!-- Q24 -->
<div class="question-card">
  <h4>問題 24 / 50 <span style="font-size:0.8em;color:#64748b">（高パフォーマンスなアーキテクチャ）</span></h4>
  <p>ECS上でコンテナを実行する際、インフラ管理を一切行わずにコンテナだけに集中したい。最も適切な起動タイプは？</p>
  <ol class="choices">
    <li>ECS on EC2</li>
    <li>ECS on Fargate</li>
    <li>EKS on EC2</li>
    <li>Amazon Lightsail</li>
  </ol>
  <details>
    <summary>解答と解説を見る</summary>
    <div class="answer">
      <p class="correct">正解: B</p>
      <p>Fargateはサーバーレスのコンテナ実行環境です。EC2インスタンスの管理（プロビジョニング、パッチ適用、スケーリング）が一切不要で、コンテナの定義だけに集中できます。</p>
      <p>A: ECS on EC2はEC2の管理が必要。C: EKS on EC2も同様。D: Lightsailは仮想サーバーのシンプル版。</p>
    </div>
  </details>
</div>

<!-- Q25 -->
<div class="question-card">
  <h4>問題 25 / 50 <span style="font-size:0.8em;color:#64748b">（弾力性に優れたアーキテクチャ）</span></h4>
  <p>Aurora Serverlessが最も適しているワークロードはどれですか？</p>
  <ol class="choices">
    <li>常時高負荷のOLTPデータベース</li>
    <li>アクセスパターンが不規則で、アイドル時間が長い開発/テスト環境</li>
    <li>大規模なデータウェアハウス分析</li>
    <li>グローバルに分散した読み取り負荷</li>
  </ol>
  <details>
    <summary>解答と解説を見る</summary>
    <div class="answer">
      <p class="correct">正解: B</p>
      <p>Aurora Serverlessは需要に応じてキャパシティを自動スケーリングし、アイドル時には一時停止してコストをゼロにできます。アクセスパターンが不規則なワークロード、開発/テスト環境、新規アプリケーション（トラフィック予測が困難）に最適です。</p>
      <p>A: 常時高負荷ならプロビジョンドAuroraの方がコスト効率が良い。C: DWHはRedshift。D: グローバル読み取りはAurora Global Database。</p>
    </div>
  </details>
</div>

<!-- Q26 -->
<div class="question-card">
  <h4>問題 26 / 50 <span style="font-size:0.8em;color:#64748b">（コスト最適化されたアーキテクチャ）</span></h4>
  <p>アクセス頻度が30日後に激減し、90日後にはほぼアクセスされないS3オブジェクトのストレージコストを最適化する方法は？</p>
  <ol class="choices">
    <li>S3 Standard-IA を使用する</li>
    <li>S3ライフサイクルポリシーで30日後にStandard-IA、90日後にGlacierへ自動移行</li>
    <li>すべてのオブジェクトをS3 Glacierに保存する</li>
    <li>S3 Intelligent-Tieringを使用する</li>
  </ol>
  <details>
    <summary>解答と解説を見る</summary>
    <div class="answer">
      <p class="correct">正解: B</p>
      <p>S3ライフサイクルポリシーで段階的にストレージクラスを変更するのが最適。30日後にStandard-IA（低頻度アクセス、安価だが取得費用あり）、90日後にGlacier（アーカイブ、最安だが取り出しに時間がかかる）。</p>
      <p>A: 最初からIAにすると30日間は過剰。C: 最初からGlacierだとアクセスに時間がかかる。D: Intelligent-Tieringも有効だが、アクセスパターンが明確な場合はライフサイクルポリシーの方が確実。</p>
    </div>
  </details>
</div>

<!-- Q27 -->
<div class="question-card">
  <h4>問題 27 / 50 <span style="font-size:0.8em;color:#64748b">（コスト最適化されたアーキテクチャ）</span></h4>
  <p>ある釣り情報サイトで、毎週日曜深夜にSSGビルド（バッチ処理）を実行しています。処理は約2時間で完了し、中断されても再実行可能です。最もコスト効率の良いEC2購入オプションは？</p>
  <ol class="choices">
    <li>オンデマンドインスタンス</li>
    <li>Reserved Instances（1年）</li>
    <li>Spot Instances</li>
    <li>Dedicated Hosts</li>
  </ol>
  <details>
    <summary>解答と解説を見る</summary>
    <div class="answer">
      <p class="correct">正解: C</p>
      <p>Spot Instancesは最大90%OFFの割引があり、「中断されても再実行可能」なバッチ処理に最適です。毎週2時間のみの使用なので、RIのような長期コミットは不要。</p>
      <p>A: オンデマンドは定価で割引なし。B: 週2時間の利用にRIは過剰。C: 中断耐性あり+短時間使用=Spot最適。D: Dedicated HostsはBYOLライセンス要件向け。</p>
    </div>
  </details>
</div>

<!-- Q28 -->
<div class="question-card">
  <h4>問題 28 / 50 <span style="font-size:0.8em;color:#64748b">（コスト最適化されたアーキテクチャ）</span></h4>
  <p>EC2インスタンスのサイズが適切かどうかを分析し、最適なインスタンスタイプを推奨してくれるサービスは？</p>
  <ol class="choices">
    <li>AWS Trusted Advisor</li>
    <li>AWS Cost Explorer</li>
    <li>AWS Compute Optimizer</li>
    <li>Amazon CloudWatch</li>
  </ol>
  <details>
    <summary>解答と解説を見る</summary>
    <div class="answer">
      <p class="correct">正解: C</p>
      <p>AWS Compute Optimizerは機械学習を使ってCloudWatchメトリクスを分析し、EC2/EBS/Lambda/ECSの最適なリソースサイズを推奨します。</p>
      <p>A: Trusted Advisorもサイズ推奨はあるが、Compute Optimizerの方が詳細で精度が高い。B: Cost Explorerはコスト分析。D: CloudWatchはメトリクス監視で推奨はしない。</p>
    </div>
  </details>
</div>

<!-- Q29 -->
<div class="question-card">
  <h4>問題 29 / 50 <span style="font-size:0.8em;color:#64748b">（高パフォーマンスなアーキテクチャ）</span></h4>
  <p>S3に保存されたCloudFrontアクセスログを、サーバーを構築せずにSQLでアドホック分析したい。最も適切なサービスは？</p>
  <ol class="choices">
    <li>Amazon Redshift</li>
    <li>Amazon Athena</li>
    <li>Amazon EMR</li>
    <li>Amazon RDS</li>
  </ol>
  <details>
    <summary>解答と解説を見る</summary>
    <div class="answer">
      <p class="correct">正解: B</p>
      <p>AthenaはサーバーレスでS3上のデータに直接SQLクエリを実行できます。「サーバーを構築せず」「S3のデータに」「SQLで」「アドホック分析」=全てAthenaのキーワードです。</p>
      <p>A: Redshiftはデータウェアハウスでサーバー（クラスター）の管理が必要。C: EMRもクラスター管理が必要。D: RDSはRDBMSでログ分析向きではない。</p>
    </div>
  </details>
</div>

<!-- Q30 -->
<div class="question-card">
  <h4>問題 30 / 50 <span style="font-size:0.8em;color:#64748b">（弾力性に優れたアーキテクチャ）</span></h4>
  <p>ステートレスなWebアプリケーションで、ユーザーセッション情報をEC2インスタンスから切り離して管理する最も適切な方法は？</p>
  <ol class="choices">
    <li>各EC2インスタンスのローカルディスクにセッションを保存</li>
    <li>ElastiCache（Redis）やDynamoDBにセッションを保存</li>
    <li>ALBのスティッキーセッションを有効にする</li>
    <li>EBSボリュームにセッションを保存する</li>
  </ol>
  <details>
    <summary>解答と解説を見る</summary>
    <div class="answer">
      <p class="correct">正解: B</p>
      <p>セッション情報をElastiCache（Redis）やDynamoDBなどの外部ストアに保存することで、どのEC2インスタンスがリクエストを処理してもセッションを共有できます。これによりEC2はステートレスになり、Auto Scalingでのスケーリングが容易になります。</p>
      <p>A: ローカルディスクだとインスタンス終了でセッション消失。C: スティッキーセッションは特定インスタンスに固定するが、スケーリング時に問題。D: EBSはインスタンスに紐づくため共有不可。</p>
    </div>
  </details>
</div>

<!-- Q31 -->
<div class="question-card">
  <h4>問題 31 / 50 <span style="font-size:0.8em;color:#64748b">（セキュアなアーキテクチャ）</span></h4>
  <p>EC2インスタンスにSSHでログインせずに、安全にコマンドを実行する方法は？</p>
  <ol class="choices">
    <li>EC2 Instance Connect</li>
    <li>AWS Systems Manager Session Manager</li>
    <li>AWS CloudShell</li>
    <li>AWS Lambda</li>
  </ol>
  <details>
    <summary>解答と解説を見る</summary>
    <div class="answer">
      <p class="correct">正解: B</p>
      <p>Systems Manager Session Managerは、SSHポートを開放せずにブラウザやCLIからEC2にシェルアクセスできます。IAMで認証し、操作ログがCloudTrailに記録されるため監査にも対応。セキュリティグループでSSH(22)を開ける必要がありません。</p>
      <p>A: EC2 Instance ConnectもSSH不要だが、一時的なSSHキーを使う。B: Session Managerの方が包括的でSSHポート不要。C: CloudShellはAWS CLI用の環境でEC2へのアクセスではない。D: LambdaはEC2操作用ではない。</p>
    </div>
  </details>
</div>

<!-- Q32 -->
<div class="question-card">
  <h4>問題 32 / 50 <span style="font-size:0.8em;color:#64748b">（高パフォーマンスなアーキテクチャ）</span></h4>
  <p>DynamoDBテーブルで、読み取り/書き込みキャパシティを自動的に調整したい。最も適切な方法は？</p>
  <ol class="choices">
    <li>プロビジョンドキャパシティモードで手動調整</li>
    <li>オンデマンドキャパシティモード</li>
    <li>DynamoDB Auto Scaling</li>
    <li>DynamoDB DAX</li>
  </ol>
  <details>
    <summary>解答と解説を見る</summary>
    <div class="answer">
      <p class="correct">正解: B</p>
      <p>オンデマンドキャパシティモードは、トラフィックに応じてキャパシティを自動調整し、使った分だけ課金されます。トラフィックが予測できない場合に最適。</p>
      <p>A: 手動調整は自動ではない。B: オンデマンドが最もシンプルに自動調整。C: Auto Scalingもプロビジョンドモードでの自動調整だが、オンデマンドの方がシンプル。D: DAXはキャッシュ。</p>
    </div>
  </details>
</div>

<!-- Q33 -->
<div class="question-card">
  <h4>問題 33 / 50 <span style="font-size:0.8em;color:#64748b">（弾力性に優れたアーキテクチャ）</span></h4>
  <p>ある釣り情報サイトで、ユーザーが釣果写真をアップロードする機能を追加します。大量の同時アップロードを処理する最も堅牢なアーキテクチャは？</p>
  <ol class="choices">
    <li>ユーザー → EC2（直接受信）→ S3保存</li>
    <li>ユーザー → S3 Presigned URL（直接アップロード）→ S3イベント通知 → Lambda（リサイズ処理）</li>
    <li>ユーザー → API Gateway → Lambda → S3保存</li>
    <li>ユーザー → CloudFront → EC2 → S3保存</li>
  </ol>
  <details>
    <summary>解答と解説を見る</summary>
    <div class="answer">
      <p class="correct">正解: B</p>
      <p>S3 Presigned URLを使うと、ユーザーがS3に直接アップロードでき、サーバーの負荷がゼロです。S3のイベント通知でLambdaを起動し、リサイズ等の後処理を行います。最もスケーラブルでコスト効率が良い構成です。</p>
      <p>A: EC2がボトルネックになる。C: API Gateway+Lambdaは10MBのペイロード制限がある。D: EC2がボトルネック。</p>
    </div>
  </details>
</div>

<!-- Q34 -->
<div class="question-card">
  <h4>問題 34 / 50 <span style="font-size:0.8em;color:#64748b">（コスト最適化されたアーキテクチャ）</span></h4>
  <p>EC2、Fargate、Lambdaのコンピューティング使用量に対して割引を受けたいが、インスタンスタイプやリージョンの変更に柔軟に対応したい。最適な購入オプションは？</p>
  <ol class="choices">
    <li>Standard Reserved Instances</li>
    <li>Convertible Reserved Instances</li>
    <li>Compute Savings Plans</li>
    <li>EC2 Instance Savings Plans</li>
  </ol>
  <details>
    <summary>解答と解説を見る</summary>
    <div class="answer">
      <p class="correct">正解: C</p>
      <p>Compute Savings Plansは、EC2/Fargate/Lambdaに適用でき、インスタンスファミリー、リージョン、OS、テナンシーを変更しても割引が継続します。最も柔軟な割引オプション。</p>
      <p>A: Standard RIはインスタンスタイプ・リージョン固定。B: Convertible RIは変更可能だがFargate/Lambdaに適用不可。C: Compute SPが最も柔軟。D: EC2 Instance SPはEC2専用でFargate/Lambdaに適用不可。</p>
    </div>
  </details>
</div>
''')

print(f"Q18-34 done. Total: {os.path.getsize(OUTPUT)} bytes")
