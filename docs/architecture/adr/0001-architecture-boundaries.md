# ADR 0001 — SportsCam architecture boundaries

- Status: accepted
- Date: 2026-10-03

## Context
The project contains a deterministic project-resolution Engine, a physical/media runtime, a backend and a product UI. Mixing these responsibilities would make hardware changes expensive and would make technical decisions depend on HTTP/database/UI concerns.

## Decision
Maintain four primary boundaries:
1. Engine — deterministic project composition and validation.
2. Runtime/Core — physical devices, recording, media and recovery.
3. Backend — persistence, authentication, jobs, media metadata and tenancy.
4. UI — presentation and user workflows.

The Engine cannot import Fastify, database or UI packages. Device drivers cannot import the API. Catalog and rules remain versioned data.

## Consequences
Positive:
- replace hardware adapters without rewriting domain logic;
- execute the Engine from CLI, API, CI or browser;
- test media/runtime independently;
- keep AI optional.

Negative:
- explicit contracts are required between layers;
- some data is duplicated as snapshots for reproducibility.
