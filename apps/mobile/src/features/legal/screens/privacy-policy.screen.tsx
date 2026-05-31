import React from 'react';
import { ScrollView, View, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Container, StackHeader } from '@src/shared/components';
import { Card, CardContent, CardHeader, CardTitle } from '@src/shared/components/ui/card';
import { Text } from '@src/shared/components/ui/text';
import { cn } from '@src/shared/lib/cn';

interface SectionData {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  items: string[];
}

const privacySections: SectionData[] = [
  {
    icon: 'information-circle-outline',
    title: 'Information We Collect',
    items: [
      'Personal identification details (name, email, mobile number, designation)',
      'Government service records (date of joining, membership number)',
      'Subscription and payment history',
      'Meeting attendance and RSVP records',
      'Consent preferences and audit trail',
      'Training module completion records',
      'Device information and IP addresses for security purposes',
    ],
  },
  {
    icon: 'shield-checkmark-outline',
    title: 'Legal Basis — DPDP Act 2023',
    items: [
      'All data processing is based on your explicit consent as required under the Digital Personal Data Protection Act, 2023',
      'You may grant or withdraw consent for each processing purpose independently',
      'Withdrawal of consent does not affect the lawfulness of prior processing',
      'Certain data is processed under legitimate purposes as permitted by law',
    ],
  },
  {
    icon: 'eye-outline',
    title: 'How We Use Your Data',
    items: [
      'Managing your membership and association profile',
      'Processing subscription payments and generating receipts',
      'Scheduling meetings and tracking attendance',
      'Maintaining financial ledgers and audit records',
      'Sending association communications and notices',
      'Compliance reporting and regulatory obligations',
    ],
  },
  {
    icon: 'people-outline',
    title: 'Data Sharing & Disclosure',
    items: [
      'Your data is never sold to third parties',
      'Data may be shared with authorized association officials based on their role',
      'Payment information is processed through secure, PCI-compliant payment providers',
      'Data may be disclosed when required by law or court order',
      'Anonymized, aggregated data may be used for analytics',
    ],
  },
  {
    icon: 'lock-closed-outline',
    title: 'Data Security',
    items: [
      'AES-256-GCM encryption for sensitive fields (mobile, designation)',
      'JWT-based authentication with short-lived access tokens',
      'Row-level database security with association-level isolation',
      'Immutable audit logging of all data access and modifications',
      'Regular security audits and penetration testing',
    ],
  },
  {
    icon: 'document-text-outline',
    title: 'Your Rights (Data Subject Rights)',
    items: [
      'Right to Access — Request a copy of all your personal data',
      'Right to Correction — Request correction of inaccurate data',
      'Right to Deletion — Request erasure of your data (subject to legal retention)',
      'Right to Portability — Receive your data in a machine-readable format',
      'File a DSAR request anytime from Profile → Privacy → Submit Request',
      'All DSAR requests are responded to within 21 days as mandated',
    ],
  },
  {
    icon: 'time-outline',
    title: 'Data Retention',
    items: [
      'Personal data is retained for 7 years from the date of collection',
      'Upon expiry, your data is automatically anonymized',
      'Financial records are retained as per statutory requirements',
      'Audit logs are retained for compliance verification',
      'You may request early deletion via a DSAR request',
    ],
  },
  {
    icon: 'mail-outline',
    title: 'Data Protection Officer (DPO)',
    items: [
      'Our DPO oversees all data protection compliance matters',
      'Contact the DPO for any privacy-related questions or concerns',
      'The DPO reviews and responds to all DSAR requests',
      'DPO contact details are available on the association portal',
    ],
  },
  {
    icon: 'refresh-outline',
    title: 'Policy Updates',
    items: [
      'This policy may be updated to reflect changes in law or our practices',
      'Members will be notified of material changes via the platform',
      'Continued use of the platform after updates constitutes acceptance',
      'Previous versions are archived and available upon request',
    ],
  },
];

export const PrivacyPolicyScreen = () => {
  return (
    <>
      <StackHeader title="Privacy Policy" showBackButton />
      <Container>
        <ScrollView className="flex-1">
          <View className="p-4">
            <Card className="mb-4 overflow-hidden border-0">
              <View className="bg-indigo-700 px-6 py-8">
                <View className="mb-4 h-14 w-14 items-center justify-center bg-white/20">
                  <Ionicons name="shield-checkmark" size={28} color="#fff" />
                </View>
                <Text className="text-2xl font-bold text-white">Privacy Policy</Text>
                <Text className="mt-1 text-sm font-medium text-indigo-100">
                  MFSA Connect — Data Protection & Privacy
                </Text>
                <Text className="mt-2 text-xs text-indigo-200">
                  Last updated: May 2026 · Compliant with DPDP Act 2023
                </Text>
              </View>
            </Card>

            <Card className="mb-4">
              <CardContent className="p-5">
                <Text size="sm" className="leading-6 text-slate-600 dark:text-slate-300">
                  The Meghalaya Finance Service Association (MFSA) is committed to protecting your
                  personal data in accordance with the Digital Personal Data Protection (DPDP) Act,
                  2023. This policy explains how we collect, use, store, and protect your
                  information when you use the MFSA Connect platform.
                </Text>
              </CardContent>
            </Card>

            {privacySections.map((section, index) => (
              <Card
                key={section.title}
                className={cn('mb-3', index === privacySections.length - 1 ? 'mb-20' : '')}>
                <CardHeader className="pb-2">
                  <View className="flex-row items-center gap-3">
                    <View className="flex h-9 w-9 items-center justify-center bg-indigo-50 dark:bg-indigo-950">
                      <Ionicons
                        name={section.icon}
                        size={18}
                        color={Platform.OS === 'ios' ? '#6366f1' : '#6366f1'}
                      />
                    </View>
                    <CardTitle className="flex-1">{section.title}</CardTitle>
                  </View>
                </CardHeader>
                <CardContent className="pt-0">
                  {section.items.map((item, i) => (
                    <View key={i} className="mb-2 flex-row items-start gap-2">
                      <View className="mt-1.5 h-1.5 w-1.5 bg-indigo-400" />
                      <Text
                        size="sm"
                        className="flex-1 leading-5 text-slate-600 dark:text-slate-300">
                        {item}
                      </Text>
                    </View>
                  ))}
                </CardContent>
              </Card>
            ))}

            <Card className="mb-20 border-indigo-100 bg-indigo-50/50 dark:border-indigo-900 dark:bg-indigo-950/30">
              <CardContent className="p-5">
                <View className="flex-row items-center gap-3">
                  <Ionicons name="information-circle" size={22} color="#6366f1" />
                  <View className="flex-1">
                    <Text
                      size="sm"
                      weight="semibold"
                      className="text-indigo-700 dark:text-indigo-300">
                      Questions About Your Privacy?
                    </Text>
                    <Text size="xs" className="mt-1 text-indigo-600/80 dark:text-indigo-400/80">
                      Contact the Data Protection Officer through the app or file a DSAR request
                      from Profile → Privacy → Submit Request.
                    </Text>
                  </View>
                </View>
              </CardContent>
            </Card>
          </View>
        </ScrollView>
      </Container>
    </>
  );
};
