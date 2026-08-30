# DataHub API Reference

DataHub is an internal data catalog and metrics service. It helps teams discover available datasets, understand what a metric means and how it's calculated, and trace how data flows between systems.

This page is a human-readable companion to the [Interactive OpenAPI specification](/docs/api/data-hub-core-api). Use it to understand what each endpoint does before diving into the full schema.

![DataHub Core Architecture Overview](/img/datahub-api-lp.png)

**Base URL:** `https://api.datahub.internal/v1`

---

## Datasets

### List datasets

`GET /datasets`

Returns a paginated list of datasets in the catalog. Use this when a user wants to browse or search for data rather than look up something specific.

**Common use case:** A data analyst wants to find all datasets owned by the Pricing team before starting a new report.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `owner_team` | string | No | Filter results to datasets owned by a specific team. |
| `tag` | string | No | Filter results by tag, e.g. `revenue` or `retail`. |
| `page` | integer | No | Page number. Defaults to `1`. |
| `page_size` | integer | No | Results per page. Defaults to `25`. |

**Example request**
```
GET /datasets?owner_team=Pricing&tag=revenue
```

---

### Get dataset details

`GET /datasets/{datasetId}`

Returns full metadata for one dataset: its column-level schema, owning team, source system, and how often it refreshes. This is the endpoint the DataHub UI calls when a user clicks into a dataset from search results.

**Example request**
```
GET /datasets/customer_events
```

**Example response (abridged)**
```json
{
  "id": "customer_events",
  "name": "Customer Events",
  "owner_team": "Growth Analytics",
  "source_system": "Segment",
  "update_frequency": "Hourly",
  "schema": [
    { "name": "user_id", "type": "string", "description": "Unique identifier for the customer." }
  ]
}
```

---

### Get dataset lineage

`GET /datasets/{datasetId}/lineage`

Returns what feeds into a dataset (upstream) and what depends on it (downstream) — datasets, metrics, or systems. Teams typically call this before changing a data source, to understand what will break downstream.

**Common use case:** An engineer plans to deprecate a source table and needs to know which metrics depend on it before making the change.

---

## Metrics

### List metrics

`GET /metrics`

Returns a paginated list of metric definitions. Filter by `owner_team` to see all metrics a team is accountable for, or by `related_dataset_id` to see every metric calculated from a specific dataset.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `owner_team` | string | No | Filter by the team that owns the metric definition. |
| `related_dataset_id` | string | No | Filter to metrics derived from a given dataset. |
| `page` | integer | No | Page number. Defaults to `1`. |
| `page_size` | integer | No | Results per page. Defaults to `25`. |

---

### Get metric details

`GET /metrics/{metricId}`

Returns the full definition of a metric: its plain-language definition, the exact calculation formula, its unit, and which dataset it's derived from. This is the endpoint that resolves the most common support question DataHub is built to prevent: *"what does this metric actually mean, and how is it calculated?"*

**Example request**
```
GET /metrics/monthly_active_users
```

**Example response**
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

---

## Errors

All endpoints return a standard error shape:

```json
{
  "error_code": "DATASET_NOT_FOUND",
  "message": "No dataset was found with the given ID."
}
```

| Status | Meaning |
|---|---|
| `400` | The request was malformed or contained invalid parameters. |
| `404` | The requested dataset or metric does not exist. |

---

*See the full [OpenAPI specification](./datahub-api-openapi.yaml) for complete request/response schemas.*