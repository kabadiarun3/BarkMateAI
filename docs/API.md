# API

## GET /api/health
Returns API status and makes clear that audio analysis is demo-only.

## POST /api/audio/analyze
Multipart: `file`, optional `dog_name`, optional `breed`.
Checks MIME type, empty file and 20 MB maximum. Returns an explicit demo response; no trained classifier is connected.

## POST /api/feedback
JSON: `dog_name`, `observed_context`, optional `owner_note`.
Allowed contexts: `doorbell_or_visitor`, `play`, `left_alone`, `outside_sound`, `attention`, `unknown`.
Stores owner-observed context in SQLite. This is contextual feedback, not verified emotion ground truth.

## Privacy note
This starter does not persist uploaded audio. Feedback storage is local SQLite in the backend container. Production needs authentication, retention/deletion controls, encryption, consent and access controls.
