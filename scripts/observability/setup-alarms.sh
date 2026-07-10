#!/usr/bin/env bash
# 障害アラートを整備する（CloudWatch Alarms + SNS メール通知 + heap OOM 検知）。
#
# なぜ必要か:
#  2026-07 の V8 ヒープ OOM 障害は 1.5 日間気づかれず、人手のログ調査で発見された。
#  当時アラートは 0 件。しかも障害中は RequestLatency がむしろ低下・MemoryUtilization は
#  64% 止まり（真の律速は V8 old-space でコンテナメモリに出ない）だったため、latency/memory
#  アラートでは検知不能だった。よって「5xx率・heap limitログ・4xx急増」を監視軸に据える。
#
# 実行環境: cloudwatch:PutMetricAlarm / logs:PutMetricFilter / sns:* 権限を持つプリンシパルで
#   （CI 用 tsurispot-deploy には無いため、管理者アカウントの CloudShell 等で実行）。
# 実行: bash scripts/observability/setup-alarms.sh [通知先メールアドレス]
set -euo pipefail

REGION="ap-northeast-1"
EMAIL="${1:-kk471279419@gmail.com}"
SVC_NAME="tsurispot"
SVC_ID="5a8d55c727a94c029c2666e7fc3b5108"
LOG_GROUP="/aws/apprunner/${SVC_NAME}/${SVC_ID}/application"
NS_APPRUNNER="AWS/AppRunner"
NS_CUSTOM="tsurispot/app"

echo "1) SNS トピック作成 + メール購読 ($EMAIL)..."
TOPIC_ARN=$(aws sns create-topic --name tsurispot-alerts --region "$REGION" --query TopicArn --output text)
aws sns subscribe --topic-arn "$TOPIC_ARN" --protocol email --notification-endpoint "$EMAIL" --region "$REGION" >/dev/null
echo "   SNS: $TOPIC_ARN"
echo "   → 受信メールの 'Confirm subscription' を必ずクリックしてください（未確認だと通知が届きません）"

echo "2) heap OOM 検知のメトリクスフィルタ（application log の 'Reached heap limit'）..."
aws logs put-metric-filter \
  --region "$REGION" \
  --log-group-name "$LOG_GROUP" \
  --filter-name tsurispot-heap-oom \
  --filter-pattern '"Reached heap limit"' \
  --metric-transformations \
    metricName=HeapOOM,metricNamespace="$NS_CUSTOM",metricValue=1,defaultValue=0 >/dev/null
echo "   metric filter: $NS_CUSTOM/HeapOOM"

DIM="Name=ServiceName,Value=${SVC_NAME} Name=ServiceID,Value=${SVC_ID}"

echo "3) アラーム(a) 5xx 急増（5分Sum > 100）..."
aws cloudwatch put-metric-alarm --region "$REGION" \
  --alarm-name "tsurispot-5xx-spike" \
  --alarm-description "App Runner 5xx が5分で100件超（OOM/障害の主指標）" \
  --namespace "$NS_APPRUNNER" --metric-name 5xxStatusResponses \
  --dimensions $DIM \
  --statistic Sum --period 300 --evaluation-periods 1 --threshold 100 \
  --comparison-operator GreaterThanThreshold --treat-missing-data notBreaching \
  --alarm-actions "$TOPIC_ARN" --ok-actions "$TOPIC_ARN"

echo "4) アラーム(b) heap OOM（発生即通知）..."
aws cloudwatch put-metric-alarm --region "$REGION" \
  --alarm-name "tsurispot-heap-oom" \
  --alarm-description "V8 ヒープ OOM を application log から検知（コンテナメモリには出ない）" \
  --namespace "$NS_CUSTOM" --metric-name HeapOOM \
  --statistic Sum --period 300 --evaluation-periods 1 --threshold 0 \
  --comparison-operator GreaterThanThreshold --treat-missing-data notBreaching \
  --alarm-actions "$TOPIC_ARN" --ok-actions "$TOPIC_ARN"

echo "5) アラーム(c) 4xx 急増（1時間Sum > 8000＝平常の約2倍。現在加速中の監視）..."
aws cloudwatch put-metric-alarm --region "$REGION" \
  --alarm-name "tsurispot-4xx-spike" \
  --alarm-description "App Runner 4xx が1時間で8000件超（平常~4000の2倍。加速中の異常を検知）" \
  --namespace "$NS_APPRUNNER" --metric-name 4xxStatusResponses \
  --dimensions $DIM \
  --statistic Sum --period 3600 --evaluation-periods 1 --threshold 8000 \
  --comparison-operator GreaterThanThreshold --treat-missing-data notBreaching \
  --alarm-actions "$TOPIC_ARN" --ok-actions "$TOPIC_ARN"

echo ""
echo "✅ アラート整備完了（SNS + heapフィルタ + アラーム3本）。"
echo "   確認: aws cloudwatch describe-alarms --region $REGION --query \"MetricAlarms[].[AlarmName,StateValue]\" --output text"
echo "   テスト発火(任意): aws cloudwatch set-alarm-state --region $REGION --alarm-name tsurispot-5xx-spike --state-value ALARM --state-reason test"
echo "   ※ メール購読の Confirm を忘れずに。"
echo ""
echo "★ Lightsail 移行後は CloudWatch が使えなくなるため、外形監視(UptimeRobot 等で"
echo "  https://tsurispot.com/api/health)と、Lightsail のログを CloudWatch へ転送する構成の検討を。"
