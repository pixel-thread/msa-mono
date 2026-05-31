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

const termsSections: SectionData[] = [
  {
    icon: 'person-add-outline',
    title: 'Membership',
    items: [
      'Membership is open to eligible individuals as defined by the association constitution',
      'Each member is assigned a unique membership number upon registration',
      'Members must complete onboarding by providing accurate personal and employment details',
      'The association reserves the right to suspend or terminate membership for violations',
      'Members may resign by providing written notice to the secretary',
    ],
  },
  {
    icon: 'card-outline',
    title: 'Subscriptions & Payments',
    items: [
      'Annual subscription fees are set by the association and may be revised with notice',
      'Subscriptions are billed yearly and are due on the renewal date',
      'Late payments may result in suspension of platform access',
      'Subscription waivers are available in cases of death or exit from service',
      'All payments are recorded in the financial ledger with receipts issued',
      'Refund policies are determined by the executive committee on a case-by-case basis',
    ],
  },
  {
    icon: 'document-lock-outline',
    title: 'Code of Conduct',
    items: [
      'Members must use the platform responsibly and in accordance with association values',
      'Sharing account credentials with unauthorized persons is prohibited',
      'Harassment, abuse, or misuse of platform features will result in disciplinary action',
      'Members must respect the confidentiality of meeting discussions and documents',
      'The association may monitor platform usage for security and compliance purposes',
    ],
  },
  {
    icon: 'calculator-outline',
    title: 'Financial Obligations',
    items: [
      'All financial entries follow double-entry bookkeeping principles',
      'Ledger entries require maker-checker approval (finance officer creates, president approves)',
      'Members are responsible for keeping their subscription payments current',
      'Financial reports are available to authorized officials and auditors',
      'Disputed charges should be reported to the finance officer within 30 days',
    ],
  },
  {
    icon: 'calendar-outline',
    title: 'Meetings & Governance',
    items: [
      'Meetings are scheduled by the secretary or president and notices are issued to attendees',
      'Members must RSVP to meeting invitations (Accept or Decline)',
      'Meeting minutes and decisions are recorded and accessible to attendees',
      'Quorum requirements are as defined in the association constitution',
      'Action items from meetings are tracked and assigned to responsible members',
    ],
  },
  {
    icon: 'school-outline',
    title: 'Training & Development',
    items: [
      'Training modules are provided for member development and compliance',
      'Completion of required modules may be mandatory for certain roles',
      'Training records are maintained and accessible to the member and administrators',
      'Scores and certificates are issued upon successful completion',
    ],
  },
  {
    icon: 'warning-outline',
    title: 'Limitation of Liability',
    items: [
      'The platform is provided "as is" without warranties of any kind',
      'The association is not liable for indirect, incidental, or consequential damages',
      'Members use the platform at their own risk',
      'The association reserves the right to modify or discontinue features with notice',
      'Force majeure events may affect platform availability without liability',
    ],
  },
  {
    icon: 'scale-outline',
    title: 'Dispute Resolution',
    items: [
      'Disputes shall first be addressed through internal grievance procedures',
      'Unresolved disputes may be referred to mediation or arbitration',
      'The jurisdiction for legal proceedings is as defined by the association registration',
      'These terms are governed by applicable Indian law',
    ],
  },
  {
    icon: 'shield-outline',
    title: 'Data Protection',
    items: [
      'Personal data is processed in accordance with our Privacy Policy and the DPDP Act 2023',
      'Members retain the right to access, correct, or delete their personal data',
      'Data is retained for 7 years and then anonymized',
      'Members may file Data Subject Access Requests (DSAR) at any time',
    ],
  },
  {
    icon: 'refresh-outline',
    title: 'Amendments',
    items: [
      'These terms may be amended by the executive committee with member notification',
      'Material changes will be communicated through the platform and/or email',
      'Continued use of the platform after amendments constitutes acceptance',
      'Previous versions of these terms are archived and available upon request',
    ],
  },
];

export const TermsScreen = () => {
  return (
    <>
      <StackHeader title="Terms & Conditions" showBackButton />
      <Container>
        <ScrollView className="flex-1">
          <View className="p-4">
            <Card className="mb-4 overflow-hidden border-0">
              <View className="bg-slate-900 px-6 py-8">
                <View className="mb-4 h-14 w-14 items-center justify-center bg-white/20">
                  <Ionicons name="document-text" size={28} color="#fff" />
                </View>
                <Text className="text-2xl font-bold text-white">Terms & Conditions</Text>
                <Text className="mt-1 text-sm font-medium text-slate-200">
                  MFSA Connect — Platform Usage Agreement
                </Text>
                <Text className="mt-2 text-xs text-slate-300">
                  Last updated: May 2026 · Governing law: India
                </Text>
              </View>
            </Card>

            <Card className="mb-4">
              <CardContent className="p-5">
                <Text size="sm" className="leading-6 text-slate-600 dark:text-slate-300">
                  By registering for and using the MFSA Connect platform, you agree to be bound by
                  these Terms & Conditions. These terms govern your membership, use of the platform,
                  financial obligations, and relationship with the Meghalaya Finance Service
                  Association (MFSA) and its affiliated associations.
                </Text>
              </CardContent>
            </Card>

            {termsSections.map((section, index) => (
              <Card
                key={section.title}
                className={cn('mb-3', index === termsSections.length - 1 ? 'mb-20' : '')}>
                <CardHeader className="pb-2">
                  <View className="flex-row items-center gap-3">
                    <View className="flex h-9 w-9 items-center justify-center bg-slate-100 dark:bg-slate-800">
                      <Ionicons
                        name={section.icon}
                        size={18}
                        color={Platform.OS === 'ios' ? '#475569' : '#475569'}
                      />
                    </View>
                    <CardTitle className="flex-1">{section.title}</CardTitle>
                  </View>
                </CardHeader>
                <CardContent className="pt-0">
                  {section.items.map((item, i) => (
                    <View key={i} className="mb-2 flex-row items-start gap-2">
                      <View className="mt-1.5 h-1.5 w-1.5 bg-slate-400" />
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

            <Card className="mb-20 border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
              <CardContent className="p-5">
                <View className="flex-row items-center gap-3">
                  <Ionicons name="information-circle" size={22} color="#475569" />
                  <View className="flex-1">
                    <Text
                      size="sm"
                      weight="semibold"
                      className="text-slate-700 dark:text-slate-200">
                      Need Clarification?
                    </Text>
                    <Text size="xs" className="mt-1 text-slate-500 dark:text-slate-400">
                      Contact the association secretary for questions about these terms or your
                      membership obligations.
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
