# Invoice Feature Design Spec

## Overview
A new feature to allow users to view their invoices (payment transactions) and generate/share them as PDF documents locally on their device. 

## Architecture & Routing
The feature will use a dedicated module to maintain separation of concerns:
- **Module Path:** `src/features/invoice`
- **Routes:** Nested under the profile section.
  - `src/app/(protected)/profile/invoices/index.tsx` (List Page)
  - `src/app/(protected)/profile/invoices/[id].tsx` (Detail Page)

## Data Flow & State Management
- **API Client:** `src/features/invoice/services/invoice.service.ts`
  - `getInvoices()`: Fetch list of invoices.
  - `getInvoiceById(id: string)`: Fetch details of a single invoice.
- **Hooks:** React Query hooks for data fetching.
  - `useInvoices()`: Handles loading, error, and data states for the list.
  - `useInvoice(id: string)`: Handles fetching the detailed view.
- **Data Shape:** The backend returns `PaymentTransaction` with nested `association`, `user` (with `name`, `email`, `membershipNumber`, `designation`), and `allocations` (with `contributionPeriod`). 

## Types
We will leverage existing types where possible and extend them for the invoice feature:
- Reusing `Transaction`, `Allocation`, `ContributionPeriod` from `src/features/subscription/types/payment.ts`.
- Reusing `IUser` from `src/shared/types/user.ts`.
- Defining an `Invoice` type that merges these to match the backend payload.

```typescript
export type Invoice = Transaction & {
  user: Pick<IUser, 'name' | 'email' | 'designation'> & { membershipNumber?: string };
  association: any; // Add association type if defined, else generic or omit if unused in UI
};
```

## Components
- **`InvoiceListItem`**: Displays key info (Date, Amount, Currency, Status) with navigation to the detail screen.
- **`InvoiceDetailView`**: Displays full breakdown including user details, association details, and individual allocations for contribution periods.

## PDF Generation
- **Libraries:** `expo-print` and `expo-sharing`.
- **Workflow:**
  1. A utility function `generateInvoiceHtml(invoice: Invoice)` will convert the invoice data into a styled HTML string.
  2. The detail page will feature a "Share PDF" button.
  3. On press, `expo-print`'s `printToFileAsync` converts the HTML to a temporary PDF file.
  4. `expo-sharing`'s `shareAsync` presents the native share sheet to save or send the PDF.
