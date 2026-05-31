# Backend Development rules baseline

- APIs reside in `src/features/*/routes/`.
- Scoping via `associationId` in services is mandatory (retrieved from `ContextStore` or `req.user`).
- Input validation using `validate()` middleware and Zod schemas.
- Use `asyncHandler()` for all asynchronous route handlers.
- Return responses using `success()` and `error()` helpers.
