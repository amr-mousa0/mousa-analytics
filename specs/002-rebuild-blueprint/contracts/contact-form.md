# Contact Form API Contract

## Request Details

- **Action Endpoint**: `https://getform.io/f/allqdeya`
- **Method**: `POST`
- **Encoding**: `application/x-www-form-urlencoded` or `multipart/form-data`

## Payload Properties

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `name` | string | Yes | Sender's full name. |
| `email` | string | Yes | Sender's valid email address. |
| `message` | string | Yes | Inquiry details. |
| `_gotcha` | string | No | Honeypot field for spam prevention. **MUST remain empty.** |

## Honeypot Behavior

- If `_gotcha` is filled, the frontend submission script MUST prevent form POST propagation, or the endpoint backend will silently discard the submission as spam (no success page redirect).
