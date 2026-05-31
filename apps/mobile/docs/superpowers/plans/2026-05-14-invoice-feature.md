# Invoice Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a new feature to view a list of invoices, view invoice details, and generate/share them as PDF documents locally.

**Architecture:** We will create a dedicated `invoice` feature module containing its own types, hooks, services, utilities, and components. Routing will use Expo Router nested under `/profile/invoices`. PDF generation will be handled client-side using `expo-print` and `expo-sharing`.

**Tech Stack:** React Native, Expo Router, React Query, `expo-print`, `expo-sharing`, Tailwind CSS (NativeWind).

---

### Task 1: Setup Invoice Types and API Service

**Files:**
- Create: `src/features/invoice/types/invoice.types.ts`
- Create: `src/features/invoice/services/invoice.service.ts`

- [x] **Step 1: Define Invoice Types**

Create the types file extending the existing payment types.

```typescript
// src/features/invoice/types/invoice.types.ts
import { Transaction, Allocation } from '@src/features/subscription/types/payment';
import { IUser } from '@src/shared/types/user';

export type InvoiceUser = Pick<IUser, 'name' | 'email' | 'designation'> & { membershipNumber?: string };

export type Invoice = Transaction & {
  user: InvoiceUser;
  association: any; // Using any or defining a basic association type
  allocations: Allocation[];
};
```

- [x] **Step 2: Create API Service**

Create the service to fetch invoice data. Note: The backend endpoints are assumed to be `/api/invoices` or similar. Since we are using an existing API client, we will use `apiClient`. If the endpoint structure is slightly different, adjust accordingly. We assume `/user/invoices` based on the prompt.

```typescript
// src/features/invoice/services/invoice.service.ts
import { apiClient } from '@src/shared/lib/api-client';
import { Invoice } from '../types/invoice.types';

export const invoiceService = {
  getInvoices: async (): Promise<Invoice[]> => {
    const response = await apiClient.get<Invoice[]>('/user/invoices');
    return response.data;
  },
  
  getInvoiceById: async (id: string): Promise<Invoice> => {
    const response = await apiClient.get<Invoice>(`/user/invoices/${id}`);
    return response.data;
  }
};
```

- [x] **Step 3: Commit**

```bash
git add src/features/invoice/types/invoice.types.ts src/features/invoice/services/invoice.service.ts
git commit -m "feat(invoice): add invoice types and api service"
```

### Task 2: Setup React Query Hooks

**Files:**
- Create: `src/features/invoice/hooks/use-invoices.ts`
- Create: `src/features/invoice/hooks/use-invoice.ts`

- [x] **Step 1: Create hook for fetching the list**

```typescript
// src/features/invoice/hooks/use-invoices.ts
import { useQuery } from '@tanstack/react-query';
import { invoiceService } from '../services/invoice.service';

export const useInvoices = () => {
  return useQuery({
    queryKey: ['invoices'],
    queryFn: () => invoiceService.getInvoices(),
  });
};
```

- [x] **Step 2: Create hook for fetching single invoice**

```typescript
// src/features/invoice/hooks/use-invoice.ts
import { useQuery } from '@tanstack/react-query';
import { invoiceService } from '../services/invoice.service';

export const useInvoice = (id: string) => {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: () => invoiceService.getInvoiceById(id),
    enabled: !!id,
  });
};
```

- [x] **Step 3: Commit**

```bash
git add src/features/invoice/hooks/use-invoices.ts src/features/invoice/hooks/use-invoice.ts
git commit -m "feat(invoice): add data fetching hooks for invoices"
```

### Task 3: Setup PDF Generation Utility

**Files:**
- Create: `src/features/invoice/utils/pdf.ts`

- [x] **Step 1: Write PDF generation utility**

We need `expo-print` and `expo-sharing`. Wait, we should make sure they are installed first.

```bash
npx expo install expo-print expo-sharing
```

- [x] **Step 2: Write PDF utility code**

```typescript
// src/features/invoice/utils/pdf.ts
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Invoice } from '../types/invoice.types';
import { formatCurrency, formatDate } from '@src/shared/utils/format'; // Adjust if these don't exist exactly like this

export const generateInvoiceHtml = (invoice: Invoice) => {
  const allocationsHtml = invoice.allocations.map(alloc => `
    <tr>
      <td>${alloc.contributionPeriod?.month}/${alloc.contributionPeriod?.year}</td>
      <td>${alloc.allocatedAmount} ${invoice.currency}</td>
    </tr>
  `).join('');

  return `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; color: #333; }
          .header { text-align: center; margin-bottom: 40px; }
          .invoice-details { margin-bottom: 30px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f8f9fa; }
          .total { text-align: right; font-size: 1.2em; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Invoice</h1>
        </div>
        <div class="invoice-details">
          <p><strong>Invoice ID:</strong> ${invoice.id}</p>
          <p><strong>Date:</strong> ${new Date(invoice.paymentDate).toLocaleDateString()}</p>
          <p><strong>Status:</strong> ${invoice.status}</p>
          <p><strong>Billed To:</strong> ${invoice.user?.name} (${invoice.user?.email})</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Period</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${allocationsHtml}
          </tbody>
        </table>
        <div class="total">
          <p>Total: ${invoice.amount} ${invoice.currency}</p>
        </div>
      </body>
    </html>
  `;
};

export const generateAndShareInvoicePdf = async (invoice: Invoice) => {
  try {
    const html = generateInvoiceHtml(invoice);
    const { uri } = await Print.printToFileAsync({ html });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri);
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};
```

- [x] **Step 3: Commit**

```bash
git add package.json package-lock.json src/features/invoice/utils/pdf.ts
git commit -m "feat(invoice): add utility to generate and share invoice pdf"
```

### Task 4: Create Invoice UI Components

**Files:**
- Create: `src/features/invoice/components/invoice-list-item.tsx`
- Create: `src/features/invoice/components/invoice-detail-view.tsx`

- [x] **Step 1: Create InvoiceListItem**

```typescript
// src/features/invoice/components/invoice-list-item.tsx
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Text } from '@src/shared/components/ui';
import { Invoice } from '../types/invoice.types';
import { useRouter } from 'expo-router';

export const InvoiceListItem = ({ invoice }: { invoice: Invoice }) => {
  const router = useRouter();

  return (
    <TouchableOpacity
      className="mb-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
      onPress={() => router.push(`/(protected)/profile/invoices/${invoice.id}`)}
    >
      <View className="flex-row items-center justify-between mb-2">
        <Text weight="semibold" className="text-slate-900">
          {new Date(invoice.paymentDate).toLocaleDateString()}
        </Text>
        <View className="rounded-full bg-slate-100 px-2 py-1">
          <Text size="xs" weight="medium" className="text-slate-600">
            {invoice.status}
          </Text>
        </View>
      </View>
      <Text className="text-slate-500">
        Amount: {invoice.amount} {invoice.currency}
      </Text>
    </TouchableOpacity>
  );
};
```

- [x] **Step 2: Create InvoiceDetailView**

```typescript
// src/features/invoice/components/invoice-detail-view.tsx
import React from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Button } from '@src/shared/components/ui';
import { Invoice } from '../types/invoice.types';
import { generateAndShareInvoicePdf } from '../utils/pdf';

export const InvoiceDetailView = ({ invoice }: { invoice: Invoice }) => {
  const handleSharePdf = async () => {
    await generateAndShareInvoicePdf(invoice);
  };

  return (
    <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
      <View className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <View className="mb-6 items-center border-b border-slate-100 pb-6">
          <Text variant="heading" size="2xl" className="text-slate-900 mb-2">Invoice</Text>
          <Text className="text-slate-500">{invoice.id}</Text>
        </View>
        
        <View className="mb-6">
          <Text weight="bold" className="mb-2 text-slate-700">Billed To</Text>
          <Text className="text-slate-600">{invoice.user?.name}</Text>
          <Text className="text-slate-600">{invoice.user?.email}</Text>
        </View>

        <View className="mb-6">
          <Text weight="bold" className="mb-2 text-slate-700">Details</Text>
          <View className="flex-row justify-between mb-1">
            <Text className="text-slate-600">Date</Text>
            <Text weight="medium">{new Date(invoice.paymentDate).toLocaleDateString()}</Text>
          </View>
          <View className="flex-row justify-between mb-1">
            <Text className="text-slate-600">Status</Text>
            <Text weight="medium">{invoice.status}</Text>
          </View>
        </View>

        <View className="mb-8">
          <Text weight="bold" className="mb-3 text-slate-700">Allocations</Text>
          {invoice.allocations?.map((alloc, idx) => (
            <View key={idx} className="flex-row justify-between mb-2">
              <Text className="text-slate-600">Period {alloc.contributionPeriod?.month}/{alloc.contributionPeriod?.year}</Text>
              <Text weight="medium">{alloc.allocatedAmount} {invoice.currency}</Text>
            </View>
          ))}
          <View className="mt-4 border-t border-slate-100 pt-4 flex-row justify-between">
            <Text weight="bold" className="text-slate-900">Total Amount</Text>
            <Text weight="bold" className="text-slate-900">{invoice.amount} {invoice.currency}</Text>
          </View>
        </View>

        <Button title="Share PDF" onPress={handleSharePdf} />
      </View>
    </ScrollView>
  );
};
```

- [x] **Step 3: Commit**

```bash
git add src/features/invoice/components/invoice-list-item.tsx src/features/invoice/components/invoice-detail-view.tsx
git commit -m "feat(invoice): add invoice list item and detail view components"
```

### Task 5: Create Screens and Routing

**Files:**
- Create: `src/app/(protected)/profile/invoices/index.tsx`
- Create: `src/app/(protected)/profile/invoices/[id].tsx`

- [x] **Step 1: Create Invoice List Screen**

```typescript
// src/app/(protected)/profile/invoices/index.tsx
import React from 'react';
import { View, FlatList, ActivityIndicator } from 'react-native';
import { StackHeader, Container } from '@src/shared/components';
import { Text } from '@src/shared/components/ui';
import { useInvoices } from '@src/features/invoice/hooks/use-invoices';
import { InvoiceListItem } from '@src/features/invoice/components/invoice-list-item';

export default function InvoicesScreen() {
  const { data: invoices, isLoading, isError } = useInvoices();

  return (
    <Container>
      <StackHeader title="Invoices" />
      <View className="flex-1 px-4 pt-6">
        {isLoading ? (
          <ActivityIndicator size="large" color="#6366f1" className="mt-10" />
        ) : isError ? (
          <Text className="mt-10 text-center text-red-500">Failed to load invoices.</Text>
        ) : invoices?.length === 0 ? (
          <Text className="mt-10 text-center text-slate-500">No invoices found.</Text>
        ) : (
          <FlatList
            data={invoices}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <InvoiceListItem invoice={item} />}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </Container>
  );
}
```

- [x] **Step 2: Create Invoice Detail Screen**

```typescript
// src/app/(protected)/profile/invoices/[id].tsx
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { StackHeader, Container } from '@src/shared/components';
import { Text } from '@src/shared/components/ui';
import { useLocalSearchParams } from 'expo-router';
import { useInvoice } from '@src/features/invoice/hooks/use-invoice';
import { InvoiceDetailView } from '@src/features/invoice/components/invoice-detail-view';

export default function InvoiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: invoice, isLoading, isError } = useInvoice(id as string);

  return (
    <Container>
      <StackHeader title="Invoice Details" />
      {isLoading ? (
        <View className="flex-1 items-center pt-10">
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : isError || !invoice ? (
        <View className="flex-1 pt-10">
          <Text className="text-center text-red-500">Failed to load invoice details.</Text>
        </View>
      ) : (
        <InvoiceDetailView invoice={invoice} />
      )}
    </Container>
  );
}
```

- [x] **Step 3: Commit**

```bash
git add src/app/\(protected\)/profile/invoices/index.tsx src/app/\(protected\)/profile/invoices/\[id\].tsx
git commit -m "feat(invoice): add invoice list and detail screens"
```

### Task 6: Update Profile Screen Link

**Files:**
- Modify: `src/features/profile/screens/profile.screen.tsx`

- [x] **Step 1: Add Invoices Accordion Item**

Modify the file `src/features/profile/screens/profile.screen.tsx` to add an Invoices accordion item under the Preferences section.

Locate the `Accordion` component inside the Preferences & Settings section, and add a new `AccordionItem` before or after "Notifications" / "Security". 

```typescript
// In src/features/profile/screens/profile.screen.tsx
// Add this AccordionItem before the "help" item.

<AccordionItem value="invoices">
  <AccordionTrigger>
    <View className="flex-row items-center gap-x-3">
      <Ionicons name="document-text-outline" size={20} color="#6366f1" />
      <Text weight="medium">Invoices</Text>
    </View>
  </AccordionTrigger>
  <AccordionContent>
    <Text variant="subtext" size="sm">
      View your payment history and download invoices as PDFs.
    </Text>
    <Button 
      variant="outline" 
      size="sm" 
      title="View Invoices" 
      className="mt-3 h-10" 
      onPress={() => router.push('/(protected)/profile/invoices')}
    />
  </AccordionContent>
</AccordionItem>
```

- [x] **Step 2: Commit**

```bash
git add src/features/profile/screens/profile.screen.tsx
git commit -m "feat(profile): link invoices feature in profile settings"
```
