# Payment Providers UI Design Spec

**Status:** APPROVED
**Created:** 2026-05-21

## 1. Overview
Implement the UI for managing Payment Providers within the React Native (Expo) application. This will allow the association (typically a user with PRESIDENT role) to list, add, view details, activate, and delete payment providers such as RAZORPAY, STRIPE, PAYU, or CASHFREE.

## 2. Architecture & State Management
The implementation will strictly follow the SOLID architecture and feature-sliced design already established in the codebase (e.g., the `dsar` feature).

### 2.1 File Structure (`@src/features/payment-providers/`)
- **`types/payment-providers.types.ts`**: TypeScript interfaces matching the API response and request payloads.
- **`utils/constants.ts`**: API endpoints (`paymentProviderEndpoints`) and React Query keys (`ProviderQueryKeys`).
- **`validators/payment-providers.schema.ts`**: Zod schemas for the "Add Provider" form to enforce validation rules on `provider`, `keyId`, `keySecret`, and `webhookSecret`.
- **`hooks/use-payment-providers.ts`**: React Query hooks for fetching data (`useProviders`, `useProviderDetail`).
- **`hooks/use-payment-provider-mutations.ts`**: React Query hooks for mutations (`useAddProvider`, `useUpdateProvider`, `useDeleteProvider`, `useActivateProvider`).
- **`components/ProviderCard.tsx`**: Reusable component for the list view, containing the UI for the provider info and inline actions (toggle, delete).
- **`screens/ProvidersListScreen.tsx`**: The main list view.
- **`screens/ProviderAddScreen.tsx`**: The form to add a provider.
- **`screens/ProviderDetailScreen.tsx`**: The detail view of a specific provider.

### 2.2 Routing (`@src/app/(protected)/payments/providers/`)
- `index.tsx`: Maps to `ProvidersListScreen`.
- `add.tsx`: Maps to `ProviderAddScreen`.
- `[id].tsx`: Maps to `ProviderDetailScreen`.

## 3. UI/UX Flow
1. **Providers List**: A `FlashList` or `FlatList` displaying all configured providers. 
   - Each item shows the provider name and status.
   - Inline actions: A switch/toggle to call the `activate` API, and a delete button to call the `delete` API.
2. **Add Provider**: A form utilizing `react-hook-form` and `zod`. 
   - A select/dropdown for the provider type (`RAZORPAY`, `STRIPE`, etc.).
   - Text inputs for `keyId`, `keySecret`, and an optional `webhookSecret`.
   - On success, navigates back to the list.
3. **Provider Details**: Displays read-only information about a specific provider by ID.

## 4. Error Handling
- API errors during mutations (add/delete/activate) will be displayed via standard toast/alert notifications (e.g., `sonner-native`).
- Form validation errors will be displayed inline below the respective inputs.

## 5. Security & Access
- The UI assumes the user has the requisite permissions (e.g., `PRESIDENT`), as enforced by the backend API.
- Sensitive fields like `keySecret` and `webhookSecret` are not returned by the GET APIs, so the Detail screen will only show `keyId` and status.

## 6. Testing
- Components will be implemented to be easily testable. Hook logic is separated from UI.
