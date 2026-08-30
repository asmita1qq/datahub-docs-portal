---
sidebar_position: 2
title: 📊 DataHub API Documentation
---

# DataHub API Documentation

DataHub is an internal data catalog and metrics service. It helps teams discover available datasets, understand what a metric means and how it's calculated, and trace how data flows between systems — so that "what does this number mean?" and "where does this data come from?" stop being Slack questions and start being API calls.

This is the complete documentation set for the DataHub API: getting started, authentication, core concepts, the full endpoint reference, and operational details like pagination, errors, and rate limits.

**Base URL:** `https://datahub-mock-api.onrender.com`

![DataHub Core Architecture Overview](/img/datahub-api-lp.png)


---

## Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Authentication](#authentication)
4. [Core Concepts & Data Models](#core-concepts--data-models)
5. [Endpoint Reference](#endpoint-reference)
6. [Pagination](#pagination)
7. [Error Handling](#error-handling)
8. [Rate Limits](#rate-limits)
9. [Versioning](#versioning)
10. [Changelog](#changelog)

---

## Overview

The DataHub API gives programmatic access to three things:

| Resource | What it answers |
|---|---|
| **Datasets** | "What data exists, and what's in it?" |
| **Metrics** | "What does this number mean, and how is it calculated?" |
| **Lineage** | "Where does this data come from, and what depends on it?" |

**Base URL**

```
https://datahub-mock-api.onrender.com
```

**Staging URL**

```
https://datahub-mock-api.onrender.com/staging
```

All requests and responses use `application/json`.

---

## Getting Started

This section walks through a complete first request, end to end.

### 1. Get an API token

Request a token from your team's DataHub admin, or generate one under **Settings → API Tokens** in the DataHub UI. Tokens are scoped to your team's read access by default.

### 2. Make your first request

Every request requires an `Authorization` header. Here's the simplest possible call — listing datasets owned by the Pricing team:

```bash
curl https://api.datahub.internal/v1/datasets?owner_team=Pricing \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

**Response**

```json
{
  "total_count": 6,
  "page": 1,
  "results": [
    {
      "id": "pricing_events",
      "name": "Pricing Events",
      "description": "Price change events across all SKUs, captured in real time.",
      "owner_team": "Pricing",
      "update_frequency": "Real-time",
      "tags": ["pricing", "events"]
    }
  ]
}
```

That's it — you've made your first DataHub API call.

### 3. Walkthrough: find a dataset, check its lineage, and pull a related metric

This is the most common real-world task in DataHub: you're handed a metric name in a meeting, and you need to understand where it comes from before you trust it.

**Step 1 — Find the metric**

```bash
curl https://api.datahub.internal/v1/metrics/monthly_active_users \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

```json
{
  "id": "monthly_active_users",
  "name": "Monthly Active Users",
  "definition": "The number of distinct customers who triggered at least one product event in the last 30 days.",
  "calculation_formula": "COUNT(DISTINCT user_id) WHERE event_date >= CURRENT_DATE - 30",
  "unit": "count",
  "owner_team": "Growth Analytics",
  "related_dataset_id": "customer_events"
}
```

**Step 2 — Look up the source dataset**

The metric response tells you it's derived from `customer_events`. Pull the dataset details:

```bash
curl https://api.datahub.internal/v1/datasets/customer_events \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

**Step 3 — Check lineage before you rely on it**

Before presenting this metric in a report, confirm nothing upstream is about to change:

```bash
curl https://api.datahub.internal/v1/datasets/customer_events/lineage \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

```json
{
  "dataset_id": "customer_events",
  "upstream": [
    { "id": "segment_raw_stream", "type": "source_system" }
  ],
  "downstream": [
    { "id": "monthly_active_users", "type": "metric" }
  ]
}
```

Now you know exactly where the number comes from, what feeds it, and what else depends on it — in three API calls.

---

## Authentication

DataHub uses bearer token authentication. Include your token in the `Authorization` header on every request:

```
Authorization: Bearer YOUR_API_TOKEN
```

**Requests without a valid token return:**

```json
{
  "error_code": "UNAUTHORIZED",
  "message": "A valid API token is required. Include it as: Authorization: Bearer YOUR_TOKEN"
}
```

with HTTP status `401`.

Tokens are scoped by team. If you query a resource outside your team's read access, you'll receive a `403 FORBIDDEN` rather than a `404`, so you can tell the difference between "doesn't exist" and "exists but you can't see it."

---

## Core Concepts & Data Models

Three objects recur across the API. Understanding their shape up front makes the endpoint reference easier to skim.

### Dataset

Represents a queryable data source in the catalog.

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier, e.g. `customer_events` |
| `name` | string | Human-readable name |
| `description` | string | What the dataset contains |
| `owner_team` | string | Team accountable for this dataset |
| `source_system` | string | Where the data originates, e.g. `Segment`, `Postgres` |
| `update_frequency` | string | How often the dataset refreshes |
| `schema` | array | Column-level definitions (`name`, `type`, `description`) |
| `tags` | array | Free-text labels for discovery, e.g. `revenue`, `pii-sensitive` |

### Metric

Represents a defined, calculable business metric.

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier, e.g. `monthly_active_users` |
| `name` | string | Human-readable name |
| `definition` | string | Plain-language explanation |
| `calculation_formula` | string | The literal calculation logic |
| `unit` | string | e.g. `count`, `percentage`, `currency` |
| `owner_team` | string | Team accountable for the metric definition |
| `related_dataset_id` | string | The dataset this metric is derived from |

### Lineage

Represents the upstream/downstream relationships for a dataset.

| Field | Type | Description |
|---|---|---|
| `dataset_id` | string | The dataset being traced |
| `upstream` | array | Sources feeding into this dataset |
| `downstream` | array | Datasets or metrics that depend on this dataset |

---

## Endpoint Reference

### List datasets

`GET /datasets`

Returns a paginated, filterable list of datasets. Use this for browsing or search.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `owner_team` | string | No | Filter by owning team |
| `tag` | string | No | Filter by tag |
| `page` | integer | No | Page number (default `1`) |
| `page_size` | integer | No | Results per page (default `25`) |

```bash
GET /datasets?owner_team=Pricing&tag=revenue
```

---

### Get dataset details

`GET /datasets/{datasetId}`

Returns full metadata for one dataset, including its column-level schema.

```bash
GET /datasets/customer_events
```

---

### Get dataset lineage

`GET /datasets/{datasetId}/lineage`

Returns what feeds into a dataset and what depends on it. Use before modifying or deprecating a data source to understand downstream impact.

```bash
GET /datasets/customer_events/lineage
```

---

### List metrics

`GET /metrics`

Returns a paginated, filterable list of metric definitions.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `owner_team` | string | No | Filter by owning team |
| `related_dataset_id` | string | No | Filter to metrics derived from a given dataset |
| `page` | integer | No | Page number (default `1`) |
| `page_size` | integer | No | Results per page (default `25`) |

```bash
GET /metrics?related_dataset_id=customer_events
```

---

### Get metric details

`GET /metrics/{metricId}`

Returns a metric's full definition, including its calculation formula. This is the endpoint that answers "what does this number actually mean?"

```bash
GET /metrics/monthly_active_users
```

---

## Pagination

List endpoints (`/datasets`, `/metrics`) are paginated by default.

| Parameter | Default | Description |
|---|---|---|
| `page` | `1` | Which page to return |
| `page_size` | `25` | Items per page (max `100`) |

Every paginated response includes a `total_count` so you can calculate the total number of pages:

```json
{
  "total_count": 42,
  "page": 1,
  "results": [ ... ]
}
```

---

## Error Handling

All errors follow the same shape:

```json
{
  "error_code": "DATASET_NOT_FOUND",
  "message": "No dataset was found with the given ID."
}
```

| HTTP Status | error_code | Meaning |
|---|---|---|
| `400` | `INVALID_PARAMETER` | The request contained an invalid or malformed parameter |
| `401` | `UNAUTHORIZED` | Missing or invalid API token |
| `403` | `FORBIDDEN` | Valid token, but no access to this resource |
| `404` | `DATASET_NOT_FOUND` / `METRIC_NOT_FOUND` | The requested resource doesn't exist |
| `429` | `RATE_LIMITED` | Too many requests — see [Rate Limits](#rate-limits) |
| `500` | `INTERNAL_ERROR` | Something went wrong on our end |

---

## Rate Limits

Requests are limited to **120 requests per minute per token**. If you exceed this, you'll receive:

```json
{
  "error_code": "RATE_LIMITED",
  "message": "Rate limit exceeded. Please retry after the window resets."
}
```

with HTTP status `429` and a `Retry-After` header indicating how many seconds to wait.

---

## Versioning

The DataHub API is versioned via the URL path (`/v1/...`). Breaking changes will only ship in a new version (`/v2/...`); non-breaking additions (new optional fields, new endpoints) may be added to `/v1` without notice.

---

## Changelog

| Version | Date | Changes |
|---|---|---|
| `1.0.0` | 2026-08 | Initial release — Datasets, Metrics, and Lineage endpoints |

---

*Questions or feedback on these docs? Contact the DataHub documentation team.*