#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os
OUTPUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'part3-advanced.html')
def w(text):
    with open(OUTPUT, 'a', encoding='utf-8') as f:
        f.write(text)

w('''
<h1 id="ch18"><span class="chapter-num">18</span> 模擬問題50問 〜本番形式で力試し〜</h1>

<p>SAA-C03本番と同等の難易度で50問を出題します。各問題に詳細な解説付き。カテゴリ配分: セキュア(15問)/弾力性(13問)/パフォーマンス(12問)/コスト最適化(10問)。</p>

<div class="point">
<p>解答を見る前に自分で考えてみてください。間違えた問題は解説をしっかり読んで理解しましょう。合格ラインは72%（36/50問）です。</p>
</div>

<!-- Q1 -->
<div class="question-card">
  <h4>問題 1 / 50 <span style="font-size:0.8em;color:#64748b">（セキュアなアーキテクチャ）</span></h4>
  <p>ある釣り情報サイトでは、S3バケットに保存された画像をCloudFront経由で配信しています。S3バケットへの直接アクセスを防ぎ、CloudFront経由のアクセスのみを許可するために、最も適切な方法はどれですか？</p>
  <ol class="choices">
    <li>S3バケットポリシーでCloudFrontのIPレンジのみを許可する</li>
    <li>CloudFront Origin Access Control（OAC）を設定し、S3バケットポリシーでOACからのアクセスのみを許可する</li>
    <li>S3バケットをパブリックに設定し、CloudFrontのカスタムヘッダーで認証する</li>
    <li>S3バケットにVPCエンドポイントを設定する</li>
  </ol>
  <details>
    <summary>解答と解説を見る</summary>
    <div class="answer">
      <p class="correct">正解: B</p>
      <p><strong>OAC（Origin Access Control）</strong>は、CloudFrontからS3への安全なアクセスを実現するAWS推奨の方法です。OACを使うと、S3バケットをパブリックにする必要がなく、CloudFront経由のみでアクセスが可能になります。</p>
      <p>A: CloudFrontのIPレンジは変更される可能性があり、メンテナンスが困難。B: OACが正解。旧OAI（Origin Access Identity）の後継で現在の推奨。C: バケットをパブリックにするのはセキュリティ上不適切。D: VPCエンドポイントはVPC内からのアクセス用で、CloudFrontとは無関係。</p>
    </div>
  </details>
</div>

<!-- Q2 -->
<div class="question-card">
  <h4>問題 2 / 50 <span style="font-size:0.8em;color:#64748b">（セキュアなアーキテクチャ）</span></h4>
  <p>EC2インスタンスからS3バケットにアクセスする必要があります。アクセスキーをコードに埋め込まずに安全に実現する方法として、最も適切なものはどれですか？</p>
  <ol class="choices">
    <li>EC2インスタンスにIAMユーザーのアクセスキーを環境変数として設定する</li>
    <li>IAMロールを作成してEC2インスタンスプロファイルにアタッチする</li>
    <li>S3バケットをパブリック読み取り可能にする</li>
    <li>EC2のセキュリティグループでS3へのアウトバウンドを許可する</li>
  </ol>
  <details>
    <summary>解答と解説を見る</summary>
    <div class="answer">
      <p class="correct">正解: B</p>
      <p>IAMロールをEC2インスタンスプロファイルにアタッチすると、EC2内のアプリケーションは一時的な認証情報を自動取得してS3にアクセスできます。アクセスキーの管理が不要で、認証情報の自動ローテーションも行われます。</p>
      <p>A: アクセスキーの使用はベストプラクティスに反する（キーの漏洩リスク）。C: パブリックアクセスはセキュリティ上不適切。D: セキュリティグループはネットワークレベルの制御で、IAM認証とは別。</p>
    </div>
  </details>
</div>

<!-- Q3 -->
<div class="question-card">
  <h4>問題 3 / 50 <span style="font-size:0.8em;color:#64748b">（セキュアなアーキテクチャ）</span></h4>
  <p>VPC内のプライベートサブネットにあるEC2インスタンスからS3バケットにアクセスする際、トラフィックがインターネットを経由しないようにしたい。最も適切な方法はどれですか？</p>
  <ol class="choices">
    <li>NATゲートウェイを設定する</li>
    <li>S3用のVPCゲートウェイエンドポイントを作成する</li>
    <li>インターネットゲートウェイを追加する</li>
    <li>VPNを設定する</li>
  </ol>
  <details>
    <summary>解答と解説を見る</summary>
    <div class="answer">
      <p class="correct">正解: B</p>
      <p>VPCゲートウェイエンドポイントを使うと、VPC内からS3（およびDynamoDB）へのトラフィックがAWSの内部ネットワークを通り、インターネットを経由しません。追加費用もかかりません。</p>
      <p>A: NATゲートウェイはインターネット経由でアクセスするため要件を満たさない。C: インターネットゲートウェイも同様にインターネット経由。D: VPNはオンプレミスとの接続用。</p>
    </div>
  </details>
</div>

<!-- Q4 -->
<div class="question-card">
  <h4>問題 4 / 50 <span style="font-size:0.8em;color:#64748b">（セキュアなアーキテクチャ）</span></h4>
  <p>アプリケーションのデータベース接続パスワードを安全に管理し、定期的に自動ローテーションする必要があります。最も適切なAWSサービスはどれですか？</p>
  <ol class="choices">
    <li>AWS Systems Manager Parameter Store（Standard）</li>
    <li>AWS Secrets Manager</li>
    <li>AWS KMS</li>
    <li>AWS IAM</li>
  </ol>
  <details>
    <summary>解答と解説を見る</summary>
    <div class="answer">
      <p class="correct">正解: B</p>
      <p>AWS Secrets Managerは、シークレット（パスワード、APIキーなど）の安全な保存と<strong>自動ローテーション</strong>機能を備えたサービスです。RDSやRedshiftのパスワードをLambdaと連携して自動的にローテーションできます。</p>
      <p>A: Parameter Storeでもシークレットは保存できるが、自動ローテーション機能が組み込まれていない。B: Secrets Managerは自動ローテーションが最大の特徴。C: KMSは暗号化キーの管理サービスでシークレット管理とは異なる。D: IAMはアクセス制御で、シークレット管理機能はない。</p>
    </div>
  </details>
</div>

<!-- Q5 -->
<div class="question-card">
  <h4>問題 5 / 50 <span style="font-size:0.8em;color:#64748b">（セキュアなアーキテクチャ）</span></h4>
  <p>S3バケットに保存するデータを暗号化する必要があります。暗号化キーをAWSに管理させつつ、キーの使用を監査ログで追跡したい場合、最も適切な暗号化方式はどれですか？</p>
  <ol class="choices">
    <li>SSE-S3（S3管理キー）</li>
    <li>SSE-KMS（KMS管理キー）</li>
    <li>SSE-C（お客様提供キー）</li>
    <li>クライアントサイド暗号化</li>
  </ol>
  <details>
    <summary>解答と解説を見る</summary>
    <div class="answer">
      <p class="correct">正解: B</p>
      <p>SSE-KMSは、AWS KMSで管理されるキーを使ってS3オブジェクトを暗号化します。KMSではキーの使用がCloudTrailに記録されるため、「誰がいつキーを使ったか」を監査できます。</p>
      <p>A: SSE-S3はAWSが完全管理するが、個別のキー使用ログは取得できない。B: SSE-KMSはCloudTrailで監査可能。C: SSE-Cはお客様がキーを管理するため、AWSに管理させる要件に合わない。D: クライアントサイド暗号化もキーの自己管理。</p>
    </div>
  </details>
</div>

<!-- Q6 -->
<div class="question-card">
  <h4>問題 6 / 50 <span style="font-size:0.8em;color:#64748b">（セキュアなアーキテクチャ）</span></h4>
  <p>WebアプリケーションをSQLインジェクションやクロスサイトスクリプティング（XSS）などの一般的なWeb攻撃から保護するために使用するAWSサービスはどれですか？</p>
  <ol class="choices">
    <li>AWS Shield Standard</li>
    <li>AWS WAF</li>
    <li>Amazon GuardDuty</li>
    <li>Amazon Inspector</li>
  </ol>
  <details>
    <summary>解答と解説を見る</summary>
    <div class="answer">
      <p class="correct">正解: B</p>
      <p>AWS WAF（Web Application Firewall）は、SQLインジェクション、XSS、その他のWeb攻撃パターンをフィルタリングします。ALB、CloudFront、API Gatewayに適用可能です。</p>
      <p>A: Shield StandardはDDoS攻撃からの保護（レイヤー3/4）で、SQLインジェクション等のレイヤー7攻撃には対応しない。C: GuardDutyは脅威検知（不正なAPI呼び出し、不正なネットワーク通信の検出）。D: InspectorはEC2やコンテナの脆弱性スキャン。</p>
    </div>
  </details>
</div>

<!-- Q7 -->
<div class="question-card">
  <h4>問題 7 / 50 <span style="font-size:0.8em;color:#64748b">（セキュアなアーキテクチャ）</span></h4>
  <p>IAMポリシーで、特定のS3バケットへのアクセスをExplicit Deny（明示的拒否）したユーザーに対して、別のポリシーでAllowを追加した場合、結果はどうなりますか？</p>
  <ol class="choices">
    <li>Allowが優先されアクセスできる</li>
    <li>Explicit Denyが常に優先されアクセスできない</li>
    <li>最後に評価されたポリシーが適用される</li>
    <li>エラーが発生する</li>
  </ol>
  <details>
    <summary>解答と解説を見る</summary>
    <div class="answer">
      <p class="correct">正解: B</p>
      <p>IAMポリシーの評価ロジックでは、<strong>Explicit Deny（明示的拒否）は常にAllowより優先</strong>されます。これはIAMの最も重要な原則です。デフォルトはDeny（暗黙の拒否）→ Allowがあれば許可 → ただしExplicit Denyがあれば無条件で拒否、という順序で評価されます。</p>
    </div>
  </details>
</div>

<!-- Q8 -->
<div class="question-card">
  <h4>問題 8 / 50 <span style="font-size:0.8em;color:#64748b">（弾力性に優れたアーキテクチャ）</span></h4>
  <p>RDSインスタンスの可用性を高めるために、自動フェイルオーバーを設定したい。最も適切な構成はどれですか？</p>
  <ol class="choices">
    <li>RDSリードレプリカを作成する</li>
    <li>RDS Multi-AZデプロイメントを有効にする</li>
    <li>RDSのバックアップを有効にする</li>
    <li>RDSをElastiCacheと組み合わせる</li>
  </ol>
  <details>
    <summary>解答と解説を見る</summary>
    <div class="answer">
      <p class="correct">正解: B</p>
      <p>RDS Multi-AZは、プライマリDBと別のAZにスタンバイレプリカを配置し、プライマリに障害が発生した場合に<strong>自動フェイルオーバー</strong>（60-120秒）します。</p>
      <p>A: リードレプリカは読み取りスケーリング用で、自動フェイルオーバー機能はない（手動でプロモーション可能）。C: バックアップはデータの復元用で可用性向上とは異なる。D: ElastiCacheはキャッシュでDB可用性とは直接関係ない。</p>
    </div>
  </details>
</div>

<!-- Q9 -->
<div class="question-card">
  <h4>問題 9 / 50 <span style="font-size:0.8em;color:#64748b">（弾力性に優れたアーキテクチャ）</span></h4>
  <p>ある釣り情報サイトは3つのAZにまたがるALBとAuto Scaling Groupで運用されています。1つのAZで障害が発生した場合、サイトの動作について正しい説明はどれですか？</p>
  <ol class="choices">
    <li>サイト全体が停止する</li>
    <li>残り2つのAZのインスタンスで自動的にトラフィックが処理される</li>
    <li>手動で障害AZのインスタンスを削除する必要がある</li>
    <li>Route 53で手動でDNSを切り替える必要がある</li>
  </ol>
  <details>
    <summary>解答と解説を見る</summary>
    <div class="answer">
      <p class="correct">正解: B</p>
      <p>ALBは複数AZのヘルスチェックを行い、障害AZのインスタンスへのルーティングを自動停止します。Auto Scaling Groupは障害AZの不足分を残りのAZで自動補充します。これがMulti-AZ構成の信頼性の核心です。</p>
    </div>
  </details>
</div>

<!-- Q10 -->
<div class="question-card">
  <h4>問題 10 / 50 <span style="font-size:0.8em;color:#64748b">（弾力性に優れたアーキテクチャ）</span></h4>
  <p>S3バケットに保存されたオブジェクトの誤削除を防ぐために、最も効果的な方法はどれですか？（2つ選択）</p>
  <ol class="choices">
    <li>S3バージョニングを有効にする</li>
    <li>S3 MFA Deleteを有効にする</li>
    <li>S3のクロスリージョンレプリケーションを設定する</li>
    <li>S3のサーバーサイド暗号化を有効にする</li>
  </ol>
  <details>
    <summary>解答と解説を見る</summary>
    <div class="answer">
      <p class="correct">正解: A, B</p>
      <p>A: バージョニングを有効にすると、削除してもバージョンが残り復元可能。B: MFA Deleteは、バージョンの完全削除にMFA認証を要求し、誤削除・不正削除を防止。</p>
      <p>C: クロスリージョンレプリケーションはDR用だが、誤削除はレプリカにも伝播する。D: 暗号化はデータ保護で誤削除対策ではない。</p>
    </div>
  </details>
</div>

<!-- Q11 -->
<div class="question-card">
  <h4>問題 11 / 50 <span style="font-size:0.8em;color:#64748b">（弾力性に優れたアーキテクチャ）</span></h4>
  <p>ある企業のDR（災害復旧）戦略で、本番リージョンの障害発生時にRTO（目標復旧時間）を数分以内にする必要があります。コストを考慮した上で最も適切なDR戦略はどれですか？</p>
  <ol class="choices">
    <li>バックアップ&リストア</li>
    <li>パイロットライト</li>
    <li>ウォームスタンバイ</li>
    <li>マルチサイトアクティブ-アクティブ</li>
  </ol>
  <details>
    <summary>解答と解説を見る</summary>
    <div class="answer">
      <p class="correct">正解: C</p>
      <p>ウォームスタンバイは、DRリージョンに本番の縮小版（最小構成）を常時稼働させておく戦略です。障害時にスケールアップするだけで数分以内に復旧可能。</p>
      <p>A: バックアップ&リストアはRTO数時間。B: パイロットライトはコア部分のみ稼働でRTO数十分。C: ウォームスタンバイはRTO数分でコストとのバランスが良い。D: マルチサイトは最速だがコストが最も高い。</p>
    </div>
  </details>
</div>

<!-- Q12 -->
<div class="question-card">
  <h4>問題 12 / 50 <span style="font-size:0.8em;color:#64748b">（弾力性に優れたアーキテクチャ）</span></h4>
  <p>Auto Scaling Groupで、CPU使用率が70%を超えたらインスタンスを追加し、30%を下回ったら削除するポリシーを設定したい。最も適切なスケーリングポリシーはどれですか？</p>
  <ol class="choices">
    <li>シンプルスケーリング</li>
    <li>ステップスケーリング</li>
    <li>ターゲット追跡スケーリング</li>
    <li>スケジュールスケーリング</li>
  </ol>
  <details>
    <summary>解答と解説を見る</summary>
    <div class="answer">
      <p class="correct">正解: C</p>
      <p>ターゲット追跡スケーリングは、指定したターゲット値（例: CPU使用率50%）を維持するように自動でスケールイン/アウトします。最もシンプルで推奨される方法です。</p>
      <p>A: シンプルスケーリングはアラーム発動後のクールダウン期間中は反応しない。B: ステップスケーリングは閾値の段階に応じた増減。C: ターゲット追跡が最も適切で推奨。D: スケジュールは時間ベースで、負荷ベースではない。</p>
    </div>
  </details>
</div>

<!-- Q13 -->
<div class="question-card">
  <h4>問題 13 / 50 <span style="font-size:0.8em;color:#64748b">（弾力性に優れたアーキテクチャ）</span></h4>
  <p>SQSキューのメッセージ処理が何度も失敗するメッセージがあります。このメッセージが通常のキュー処理をブロックしないようにする最善の方法は？</p>
  <ol class="choices">
    <li>メッセージの保持期間を短くする</li>
    <li>デッドレターキュー（DLQ）を設定する</li>
    <li>可視性タイムアウトを長くする</li>
    <li>FIFO Queueに変更する</li>
  </ol>
  <details>
    <summary>解答と解説を見る</summary>
    <div class="answer">
      <p class="correct">正解: B</p>
      <p>DLQ（デッドレターキュー）は、指定した回数（maxReceiveCount）処理に失敗したメッセージを自動的に別のキューに移動します。問題のあるメッセージを隔離して後から調査でき、通常の処理フローをブロックしません。</p>
    </div>
  </details>
</div>

<!-- Q14 -->
<div class="question-card">
  <h4>問題 14 / 50 <span style="font-size:0.8em;color:#64748b">（セキュアなアーキテクチャ）</span></h4>
  <p>複数のAWSアカウントを一元管理し、共通のSCP（サービスコントロールポリシー）を適用したい。使用するサービスはどれですか？</p>
  <ol class="choices">
    <li>AWS IAM</li>
    <li>AWS Organizations</li>
    <li>AWS Control Tower</li>
    <li>AWS Config</li>
  </ol>
  <details>
    <summary>解答と解説を見る</summary>
    <div class="answer">
      <p class="correct">正解: B</p>
      <p>AWS Organizationsは複数AWSアカウントを組織単位（OU）で管理し、SCP（サービスコントロールポリシー）で組織全体のアクセス制御を行います。</p>
      <p>A: IAMは単一アカウント内の権限管理。C: Control Towerはマルチアカウント環境のセットアップを自動化するが、SCPの適用自体はOrganizationsの機能。D: Configはリソース設定の監査。</p>
    </div>
  </details>
</div>

<!-- Q15 -->
<div class="question-card">
  <h4>問題 15 / 50 <span style="font-size:0.8em;color:#64748b">（セキュアなアーキテクチャ）</span></h4>
  <p>CloudTrailのログが改ざんされていないことを証明する必要があるコンプライアンス要件があります。最も適切な方法は？</p>
  <ol class="choices">
    <li>CloudTrailログをS3のGlacierに保存する</li>
    <li>CloudTrailのログファイル整合性検証を有効にする</li>
    <li>CloudTrailログを暗号化する</li>
    <li>CloudTrailログのS3バケットにMFA Deleteを設定する</li>
  </ol>
  <details>
    <summary>解答と解説を見る</summary>
    <div class="answer">
      <p class="correct">正解: B</p>
      <p>CloudTrailのログファイル整合性検証（Log File Integrity Validation）を有効にすると、ダイジェストファイルが生成され、ログが作成後に変更・削除されていないことを暗号学的に証明できます。</p>
      <p>A: Glacierは長期保管のみで改ざん証明にはならない。C: 暗号化は転送中・保管中の保護で改ざん検知ではない。D: MFA Deleteは削除防止だが改ざん証明ではない。</p>
    </div>
  </details>
</div>

<!-- Q16 -->
<div class="question-card">
  <h4>問題 16 / 50 <span style="font-size:0.8em;color:#64748b">（セキュアなアーキテクチャ）</span></h4>
  <p>VPC内のセキュリティグループとネットワークACL（NACL）の違いについて正しい記述はどれですか？</p>
  <ol class="choices">
    <li>セキュリティグループはステートレスで、NACLはステートフルである</li>
    <li>セキュリティグループはステートフルで、NACLはステートレスである</li>
    <li>どちらもステートフルである</li>
    <li>どちらもステートレスである</li>
  </ol>
  <details>
    <summary>解答と解説を見る</summary>
    <div class="answer">
      <p class="correct">正解: B</p>
      <p><strong>セキュリティグループはステートフル</strong>: インバウンドを許可すれば、対応するアウトバウンドの戻りトラフィックは自動許可。<strong>NACLはステートレス</strong>: インバウンドとアウトバウンドのルールを別々に設定する必要がある。これは非常に頻出の問題です。</p>
    </div>
  </details>
</div>

<!-- Q17 -->
<div class="question-card">
  <h4>問題 17 / 50 <span style="font-size:0.8em;color:#64748b">（弾力性に優れたアーキテクチャ）</span></h4>
  <p>ある釣り情報サイトのデータベースで、読み取りクエリが書き込みの10倍あり、読み取りパフォーマンスを向上させたい。最も適切な方法はどれですか？</p>
  <ol class="choices">
    <li>RDSインスタンスをスケールアップ（より大きいインスタンスタイプ）する</li>
    <li>RDS Multi-AZを有効にする</li>
    <li>RDSリードレプリカを作成し、読み取りクエリをリードレプリカに分散する</li>
    <li>ElastiCacheを追加してDBへのアクセスを減らす</li>
  </ol>
  <details>
    <summary>解答と解説を見る</summary>
    <div class="answer">
      <p class="correct">正解: C</p>
      <p>リードレプリカは読み取り専用のDBコピーで、読み取りクエリを複数のレプリカに分散できます。読み取りが圧倒的に多い場合に最も効果的です。</p>
      <p>A: スケールアップには限界がありコスト増。B: Multi-AZは可用性向上で読み取りスケーリングではない。D: ElastiCacheも有効だが、問題は「読み取りパフォーマンス向上」に特化しており、リードレプリカが最も直接的。（実務ではC+Dの併用が多い）</p>
    </div>
  </details>
</div>
''')

print(f"Q1-17 done. Total: {os.path.getsize(OUTPUT)} bytes")
