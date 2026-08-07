# Operational Runbook: Upstash QStash DLQ Message Replay

## 1. Overview
This runbook describes the operational procedures for inspecting and replaying failed jobs stored in the Dead Letter Queue (DLQ).

## 2. DLQ Inspection Procedure
1. Access the Upstash QStash Console or query the REST API endpoint:
   `GET https://qstash.upstash.io/v2/dlq`
2. Inspect the failure reason (`Upstash-Failure-Reason`) and payload.

## 3. Replay Executions
To replay a dead-lettered message back to the main queue:
```bash
curl -X POST "https://qstash.upstash.io/v2/dlq/{dlq_id}/requeue" \
  -H "Authorization: Bearer $UPSTASH_QSTASH_TOKEN"
```

## 4. Verification
Check `/api/health/readiness` and Datadog/Sentry dashboard to ensure the replayed job executed with HTTP 200 OK.
