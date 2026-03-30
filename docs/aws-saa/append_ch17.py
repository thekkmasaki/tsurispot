#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os
OUTPUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'part3-advanced.html')
def w(text):
    with open(OUTPUT, 'a', encoding='utf-8') as f:
        f.write(text)

w('''
<h1 id="ch17"><span class="chapter-num">17</span> コスト最適化とWell-Architected Framework 〜賢くAWSを使う〜</h1>

<p>SAA試験の約20%はコスト最適化に関する問題です。また、Well-Architected Frameworkは試験全体を通じて問われる「設計思想」の基盤です。この章は試験の得点源になりますので、しっかり理解しましょう。</p>

<h2>17.1 Well-Architected Framework の6本柱</h2>

<p>AWSが推奨する「良い設計」の指針で、6つの柱（ピラー）で構成されています。</p>

<table>
<tr><th>柱</th><th>概要</th><th>関連サービス例</th></tr>
<tr><td><strong>1. 運用上の優秀性</strong><br>(Operational Excellence)</td><td>運用の自動化、改善の継続</td><td>CloudFormation, Systems Manager, CodeDeploy, Config</td></tr>
<tr><td><strong>2. セキュリティ</strong></td><td>データ保護、権限管理、検知</td><td>IAM, KMS, VPC, Shield, WAF, CloudTrail, GuardDuty</td></tr>
<tr><td><strong>3. 信頼性</strong><br>(Reliability)</td><td>障害からの自動復旧、スケーリング</td><td>Multi-AZ, Auto Scaling, Route 53, バックアップ</td></tr>
<tr><td><strong>4. パフォーマンス効率</strong></td><td>リソースの効率的な使用</td><td>Auto Scaling, CloudFront, ElastiCache, Lambda</td></tr>
<tr><td><strong>5. コスト最適化</strong></td><td>不要な支出の排除</td><td>RI, Savings Plans, Spot, S3ライフサイクル, Compute Optimizer</td></tr>
<tr><td><strong>6. サステナビリティ</strong><br>(2022年追加)</td><td>環境への影響の最小化</td><td>適切なリージョン選択、効率的なリソース使用</td></tr>
</table>

<div class="exam">
<p><strong>Well-Architected Tool</strong>: ワークロード（アプリケーション）を6本柱に基づいてレビューし、改善点を提案するAWSのツール。試験では「ワークロードのベストプラクティスへの準拠を確認したい」→ Well-Architected Toolが正解。</p>
</div>

<div class="diagram">
<svg viewBox="0 0 760 320" xmlns="http://www.w3.org/2000/svg" font-family="Segoe UI, Hiragino Sans, sans-serif">
  <text x="380" y="25" text-anchor="middle" font-size="14" fill="#0c4a6e" font-weight="bold">Well-Architected Framework 6本柱</text>
  <!-- 中心 -->
  <circle cx="380" cy="175" r="55" fill="#eff6ff" stroke="#3b82f6" stroke-width="2"/>
  <text x="380" y="168" text-anchor="middle" font-size="11" fill="#1e40af" font-weight="bold">Well-</text>
  <text x="380" y="185" text-anchor="middle" font-size="11" fill="#1e40af" font-weight="bold">Architected</text>
  <!-- 柱1: 運用 -->
  <rect x="310" y="45" width="140" height="38" rx="8" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
  <text x="380" y="69" text-anchor="middle" font-size="10" fill="#1e40af" font-weight="bold">1. 運用上の優秀性</text>
  <line x1="380" y1="83" x2="380" y2="120" stroke="#3b82f6" stroke-width="1.5"/>
  <!-- 柱2: セキュリティ -->
  <rect x="545" y="80" width="140" height="38" rx="8" fill="#fef2f2" stroke="#ef4444" stroke-width="2"/>
  <text x="615" y="104" text-anchor="middle" font-size="10" fill="#dc2626" font-weight="bold">2. セキュリティ</text>
  <line x1="545" y1="99" x2="435" y2="155" stroke="#ef4444" stroke-width="1.5"/>
  <!-- 柱3: 信頼性 -->
  <rect x="565" y="175" width="140" height="38" rx="8" fill="#f0fdf4" stroke="#22c55e" stroke-width="2"/>
  <text x="635" y="199" text-anchor="middle" font-size="10" fill="#166534" font-weight="bold">3. 信頼性</text>
  <line x1="565" y1="194" x2="435" y2="180" stroke="#22c55e" stroke-width="1.5"/>
  <!-- 柱4: パフォーマンス -->
  <rect x="520" y="255" width="160" height="38" rx="8" fill="#fef3c7" stroke="#f59e0b" stroke-width="2"/>
  <text x="600" y="279" text-anchor="middle" font-size="10" fill="#92400e" font-weight="bold">4. パフォーマンス効率</text>
  <line x1="520" y1="270" x2="420" y2="210" stroke="#f59e0b" stroke-width="1.5"/>
  <!-- 柱5: コスト -->
  <rect x="80" y="255" width="160" height="38" rx="8" fill="#ede9fe" stroke="#8b5cf6" stroke-width="2"/>
  <text x="160" y="279" text-anchor="middle" font-size="10" fill="#6d28d9" font-weight="bold">5. コスト最適化</text>
  <line x1="240" y1="265" x2="340" y2="210" stroke="#8b5cf6" stroke-width="1.5"/>
  <!-- 柱6: サステナビリティ -->
  <rect x="60" y="145" width="160" height="38" rx="8" fill="#fff7ed" stroke="#f97316" stroke-width="2"/>
  <text x="140" y="169" text-anchor="middle" font-size="10" fill="#c2410c" font-weight="bold">6. サステナビリティ</text>
  <line x1="220" y1="164" x2="325" y2="170" stroke="#f97316" stroke-width="1.5"/>
</svg>
<figcaption>図17-1: Well-Architected Framework の6本柱</figcaption>
</div>

<h2>17.2 コスト管理サービス</h2>

<h3>AWS Cost Explorer</h3>
<p>過去のコストデータを分析し、将来のコストを予測するツール。サービス別、リージョン別、タグ別などで可視化できます。</p>

<h3>AWS Budgets</h3>
<p>予算を設定し、予算の超過（またはその予測）をSNSやメールで通知。実コスト予算、使用量予算、RI/Savings Plansの活用率予算を設定可能。</p>

<h3>Cost and Usage Report（CUR）</h3>
<p>最も詳細なコストデータ。1時間単位のリソースレベルまでの明細が含まれ、S3に出力されます。Athenaで分析可能。</p>

<h3>AWS Compute Optimizer</h3>
<p>EC2、EBS、Lambda、ECSのリソースサイズが適切かどうかを機械学習で分析し、最適なサイズを推奨します。</p>

<h2>17.3 EC2購入オプション（コスト最適化の核心）</h2>

<table>
<tr><th>購入オプション</th><th>割引率</th><th>期間</th><th>特徴</th></tr>
<tr><td><strong>オンデマンド</strong></td><td>0%（定価）</td><td>なし</td><td>従量課金。いつでも開始・停止可能</td></tr>
<tr><td><strong>Reserved Instances (RI)</strong></td><td>最大72% OFF</td><td>1年 or 3年</td><td>インスタンスタイプ・リージョン・OSを予約。全額前払い/一部前払い/前払いなし</td></tr>
<tr><td><strong>Savings Plans</strong></td><td>最大72% OFF</td><td>1年 or 3年</td><td>コンピューティング使用量（$/時）を約束。EC2/Fargate/Lambdaに適用。RIより柔軟</td></tr>
<tr><td><strong>Spot Instances</strong></td><td>最大90% OFF</td><td>なし</td><td>余剰キャパシティ。<strong>2分前通知で中断される可能性あり</strong>。バッチ処理、CI/CD、ビッグデータ分析など中断耐性のあるワークロード向け</td></tr>
<tr><td><strong>Dedicated Hosts</strong></td><td>-</td><td>-</td><td>物理サーバーを専有。ライセンス要件（BYOL）やコンプライアンス要件</td></tr>
<tr><td><strong>Dedicated Instances</strong></td><td>-</td><td>-</td><td>ハードウェアは専有だが物理サーバーの指定はできない</td></tr>
</table>

<div class="exam">
<p><strong>RI vs Savings Plans</strong>: どちらも1年/3年のコミットで最大72%割引。RIはインスタンスタイプが固定、Savings Plansは使用量（$/h）を約束するので柔軟。試験では「最もコスト効率が良い」=「3年全額前払いのRI or Savings Plans」、「柔軟性が必要」=「Savings Plans」が正解パターン。</p>
</div>

<div class="exam">
<p><strong>Spot Instancesの注意点</strong>: 最大90%割引だが中断される可能性がある。「中断耐性」が必要。本番Webサーバーには不適切。バッチ処理、データ分析、CI/CD、テスト環境に使う。Spot Fleet（複数Spotの組み合わせ）やEC2 Auto Scaling Groupのミックスインスタンスポリシーで活用。</p>
</div>

<div class="diagram">
<svg viewBox="0 0 760 280" xmlns="http://www.w3.org/2000/svg" font-family="Segoe UI, Hiragino Sans, sans-serif">
  <text x="380" y="22" text-anchor="middle" font-size="14" fill="#0c4a6e" font-weight="bold">EC2購入オプション コスト比較</text>
  <!-- Y軸 -->
  <line x1="100" y1="50" x2="100" y2="240" stroke="#94a3b8" stroke-width="2"/>
  <text x="50" y="150" text-anchor="middle" font-size="11" fill="#64748b" transform="rotate(-90,50,150)">コスト</text>
  <!-- X軸 -->
  <line x1="100" y1="240" x2="700" y2="240" stroke="#94a3b8" stroke-width="2"/>
  <!-- オンデマンド 100% -->
  <rect x="140" y="60" width="80" height="180" rx="4" fill="#ef4444" opacity="0.8"/>
  <text x="180" y="55" text-anchor="middle" font-size="10" fill="#dc2626" font-weight="bold">100%</text>
  <text x="180" y="260" text-anchor="middle" font-size="10" fill="#64748b">オンデマンド</text>
  <!-- RI 1年 -->
  <rect x="260" y="105" width="80" height="135" rx="4" fill="#f59e0b" opacity="0.8"/>
  <text x="300" y="100" text-anchor="middle" font-size="10" fill="#92400e" font-weight="bold">〜40% OFF</text>
  <text x="300" y="260" text-anchor="middle" font-size="10" fill="#64748b">RI (1年)</text>
  <!-- RI 3年 / Savings Plans -->
  <rect x="380" y="140" width="80" height="100" rx="4" fill="#22c55e" opacity="0.8"/>
  <text x="420" y="135" text-anchor="middle" font-size="10" fill="#166534" font-weight="bold">〜72% OFF</text>
  <text x="420" y="260" text-anchor="middle" font-size="9" fill="#64748b">RI (3年)</text>
  <text x="420" y="273" text-anchor="middle" font-size="9" fill="#64748b">Savings Plans</text>
  <!-- Spot -->
  <rect x="500" y="198" width="80" height="42" rx="4" fill="#8b5cf6" opacity="0.8"/>
  <text x="540" y="193" text-anchor="middle" font-size="10" fill="#6d28d9" font-weight="bold">〜90% OFF</text>
  <text x="540" y="260" text-anchor="middle" font-size="10" fill="#64748b">Spot</text>
  <text x="540" y="273" text-anchor="middle" font-size="8" fill="#dc2626">(中断リスクあり)</text>
</svg>
<figcaption>図17-2: EC2購入オプションのコスト比較</figcaption>
</div>

<div class="tsurispot">
<p><strong>ツリスポのコスト最適化</strong>: App Runnerは使った分だけ課金（アイドル時は最小インスタンスのみ）で、小規模サイトには最適。将来トラフィックが増えてEC2に移行するなら、Savings Plans（3年、全額前払い=最大72%OFF）を検討。SSGビルドのようなバッチ処理にはSpot Instancesを使えば最大90%OFF。S3の画像はライフサイクルポリシーで30日後にIA、90日後にGlacierへ自動移行。</p>
</div>

<h2>17.4 インフラ自動化（IaC）</h2>

<h3>CloudFormation</h3>
<p>Infrastructure as Code（IaC）サービス。YAMLまたはJSON形式のテンプレートでAWSリソースを定義し、「スタック」として一括作成・更新・削除できます。</p>

<ul>
<li><strong>テンプレート</strong>: リソース定義（必須セクション: Resources）</li>
<li><strong>スタック</strong>: テンプレートから作成されたリソースの集合</li>
<li><strong>スタックセット</strong>: 複数アカウント・リージョンに同じスタックを展開</li>
<li><strong>ドリフト検出</strong>: テンプレートと実際のリソースの差異を検出</li>
</ul>

<div class="exam">
<p><strong>CloudFormationの出題パターン</strong>:「インフラの再現性」「複数環境を同じ構成で」「設定をバージョン管理」→ CloudFormation。テンプレートのResourcesセクションは唯一の必須セクション。</p>
</div>

<h3>CDK（Cloud Development Kit）</h3>
<p>TypeScript、Python、Javaなどのプログラミング言語でインフラを定義し、CloudFormationテンプレートを生成するツール。プログラマにとってはYAMLより書きやすい。</p>

<h3>Elastic Beanstalk</h3>
<p>PaaS（Platform as a Service）。コードをアップロードするだけで、EC2、ALB、Auto Scaling、RDSなどのインフラを自動構築。開発者はコードに集中できます。裏ではCloudFormationが動いています。</p>

<h3>SAM（Serverless Application Model）</h3>
<p>サーバーレスアプリ（Lambda + API Gateway + DynamoDB等）に特化したIaCフレームワーク。CloudFormationの拡張版です。</p>

<h3>Systems Manager</h3>
<p>EC2やオンプレミスサーバーの運用を自動化するサービス群。</p>
<ul>
<li><strong>Run Command</strong>: コマンドをリモート実行（SSHなしで）</li>
<li><strong>Patch Manager</strong>: OSパッチの自動適用</li>
<li><strong>Session Manager</strong>: ブラウザからシェルアクセス（SSHポート不要、セキュア）</li>
<li><strong>Parameter Store</strong>: 設定値やシークレットの安全な保存</li>
</ul>

<div class="diagram">
<svg viewBox="0 0 760 240" xmlns="http://www.w3.org/2000/svg" font-family="Segoe UI, Hiragino Sans, sans-serif">
  <defs><marker id="a7" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b"/></marker></defs>
  <text x="380" y="22" text-anchor="middle" font-size="14" fill="#0c4a6e" font-weight="bold">CloudFormation ワークフロー</text>
  <rect x="30" y="70" width="150" height="80" rx="10" fill="#fef3c7" stroke="#f59e0b" stroke-width="2"/>
  <text x="105" y="100" text-anchor="middle" font-size="12" fill="#92400e" font-weight="bold">テンプレート</text>
  <text x="105" y="120" text-anchor="middle" font-size="10" fill="#b45309">YAML / JSON</text>
  <text x="105" y="140" text-anchor="middle" font-size="9" fill="#b45309">Gitでバージョン管理</text>
  <rect x="250" y="70" width="150" height="80" rx="10" fill="#ede9fe" stroke="#8b5cf6" stroke-width="2"/>
  <text x="325" y="95" text-anchor="middle" font-size="12" fill="#6d28d9" font-weight="bold">CloudFormation</text>
  <text x="325" y="115" text-anchor="middle" font-size="10" fill="#7c3aed">スタック作成</text>
  <text x="325" y="135" text-anchor="middle" font-size="9" fill="#7c3aed">変更セット / ロールバック</text>
  <rect x="480" y="40" width="120" height="38" rx="8" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
  <text x="540" y="64" text-anchor="middle" font-size="10" fill="#1e40af" font-weight="bold">VPC / Subnet</text>
  <rect x="480" y="90" width="120" height="38" rx="8" fill="#f0fdf4" stroke="#22c55e" stroke-width="2"/>
  <text x="540" y="114" text-anchor="middle" font-size="10" fill="#166534" font-weight="bold">EC2 / ALB</text>
  <rect x="480" y="140" width="120" height="38" rx="8" fill="#fce7f3" stroke="#ec4899" stroke-width="2"/>
  <text x="540" y="164" text-anchor="middle" font-size="10" fill="#be185d" font-weight="bold">RDS / S3</text>
  <rect x="630" y="80" width="85" height="55" rx="8" fill="#fff7ed" stroke="#f97316" stroke-width="2" stroke-dasharray="4"/>
  <text x="672" y="102" text-anchor="middle" font-size="10" fill="#c2410c" font-weight="bold">スタック</text>
  <text x="672" y="122" text-anchor="middle" font-size="9" fill="#ea580c">= リソース群</text>
  <line x1="180" y1="110" x2="250" y2="110" stroke="#64748b" stroke-width="2" marker-end="url(#a7)"/>
  <line x1="400" y1="90" x2="480" y2="59" stroke="#64748b" stroke-width="1.5" marker-end="url(#a7)"/>
  <line x1="400" y1="110" x2="480" y2="109" stroke="#64748b" stroke-width="1.5" marker-end="url(#a7)"/>
  <line x1="400" y1="130" x2="480" y2="159" stroke="#64748b" stroke-width="1.5" marker-end="url(#a7)"/>
</svg>
<figcaption>図17-3: CloudFormationのワークフロー（テンプレート → スタック → リソース群）</figcaption>
</div>

<div class="tsurispot">
<p><strong>ツリスポのインフラ管理</strong>: ツリスポのAWSインフラ（App Runner、S3バケット、CloudFront、Route 53）をCloudFormationテンプレートで管理すれば、環境を簡単に複製できます。開発環境と本番環境を同じテンプレートから作成し、パラメータだけ変更。テンプレートはGitで管理するので「いつ何を変更したか」が追跡可能です。</p>
</div>

<div class="summary-box">
<h4>第17章まとめ</h4>
<ul>
<li><strong>Well-Architected Framework</strong>: 6本柱（運用/セキュリティ/信頼性/パフォーマンス/コスト/サステナビリティ）</li>
<li><strong>Cost Explorer</strong>: コスト分析・予測。<strong>Budgets</strong>: 予算アラート。<strong>CUR</strong>: 最詳細データ</li>
<li><strong>RI</strong>: インスタンスタイプ固定で最大72%OFF。<strong>Savings Plans</strong>: $/h約束で柔軟+最大72%OFF</li>
<li><strong>Spot</strong>: 最大90%OFFだが中断あり。バッチ処理・テスト向け</li>
<li><strong>CloudFormation</strong>: IaC。テンプレート(YAML/JSON)でインフラをコード管理</li>
<li><strong>Elastic Beanstalk</strong>: PaaS。コードアップロードだけでインフラ自動構築</li>
<li><strong>Systems Manager</strong>: Run Command（リモート実行）、Session Manager（SSHなしシェル）、Patch Manager</li>
<li><strong>Compute Optimizer</strong>: 機械学習でEC2/EBS/Lambda/ECSの最適サイズを推奨</li>
</ul>
</div>

<div class="quiz">
<p><strong>Q1.</strong> EC2の長期利用で最もコスト効率が良い購入方法は？</p>
<details><summary>答えを見る</summary><p>3年全額前払いのReserved Instances または Savings Plans。最大72%の割引が得られる。柔軟性が必要ならSavings Plans。</p></details>
</div>
<div class="quiz">
<p><strong>Q2.</strong> Spot Instancesが適切なワークロードは？</p>
<details><summary>答えを見る</summary><p>中断耐性のあるワークロード: バッチ処理、ビッグデータ分析、CI/CD、テスト環境、画像/動画処理。2分前通知で中断されるため、本番Webサーバーには不適切。</p></details>
</div>
<div class="quiz">
<p><strong>Q3.</strong> CloudFormationテンプレートで唯一の必須セクションは？</p>
<details><summary>答えを見る</summary><p>Resources セクション。作成するAWSリソースを定義する部分。他のセクション（Parameters、Mappings、Outputs等）はオプション。</p></details>
</div>
<div class="quiz">
<p><strong>Q4.</strong> Well-Architected Framework の6本柱を全て挙げよ。</p>
<details><summary>答えを見る</summary><p>1.運用上の優秀性、2.セキュリティ、3.信頼性、4.パフォーマンス効率、5.コスト最適化、6.サステナビリティ</p></details>
</div>
''')

print(f"Chapter 17 done. Total: {os.path.getsize(OUTPUT)} bytes")
