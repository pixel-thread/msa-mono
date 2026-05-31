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

const aboutSections: SectionData[] = [
  {
    icon: 'people-outline',
    title: 'Who We Are',
    items: [
      'The Meghalaya Finance Service Association (MFSA) is a professional body representing finance sector employees in the state of Meghalaya, North-East India',
      'We serve government-affiliated finance professionals across departments and cadres',
      'Our platform, MFSA Connect, digitizes membership management, financial operations, and governance',
      'The same infrastructure serves multiple affiliated associations (MFSA, MPSA, and others) under a unified system',
    ],
  },
  {
    icon: 'flag-outline',
    title: 'Our Mission',
    items: [
      'Empower finance professionals through a unified digital platform',
      'Ensure transparent financial management and accountability',
      'Protect member data rights in compliance with the DPDP Act 2023',
      'Foster professional development through structured training programs',
      'Strengthen democratic governance through organized meetings and records',
    ],
  },
  {
    icon: 'eye-outline',
    title: 'Our Vision',
    items: [
      'A fully digitized, transparent, and member-driven finance association',
      'Seamless access to financial records, meeting governance, and compliance tools',
      'Zero paper trails — all operations conducted through the platform',
      'Every member informed, engaged, and empowered',
    ],
  },
  {
    icon: 'briefcase-outline',
    title: 'What We Do',
    items: [
      'Manage membership profiles, subscriptions, and payment records',
      'Maintain a double-entry financial general ledger with maker-checker approval',
      'Schedule and conduct Executive Committee and General meetings',
      'Provide training modules for professional development and compliance',
      'Handle Data Subject Access Requests (DSAR) and consent management',
      'Generate financial reports, receipts, and meeting documentation',
    ],
  },
  {
    icon: 'heart-outline',
    title: 'Our Values',
    items: [
      'Integrity — Transparent financial operations and honest governance',
      'Accountability — Every action logged, every decision recorded',
      'Member-First — Platform designed for member convenience and access',
      'Compliance — Full adherence to DPDP Act 2023 and financial regulations',
      'Inclusion — Accessible to all members regardless of technical proficiency',
    ],
  },
  {
    icon: 'person-outline',
    title: 'Leadership & Roles',
    items: [
      'President — Executive oversight, financial approvals, strategic direction',
      'Secretary — Day-to-day operations, meeting scheduling, member management',
      'Finance Officer — Ledger entries, payment recording, financial reporting',
      'Data Protection Officer (DPO) — Privacy compliance, DSAR processing, consent audits',
      'Members — Active participation, subscription compliance, meeting attendance',
    ],
  },
  {
    icon: 'call-outline',
    title: 'Contact Us',
    items: [
      'Reach the association secretary through the platform messaging system',
      'Financial queries should be directed to the Finance Officer',
      'Privacy and data concerns should be addressed to the Data Protection Officer',
      'General inquiries can be submitted through the association portal',
      'Official correspondence may be sent to the registered office address',
    ],
  },
];

export const AboutScreen = () => {
  return (
    <>
      <StackHeader title="About MFSA" showBackButton />
      <Container>
        <ScrollView className="flex-1">
          <View className="p-4">
            <Card className="mb-4 overflow-hidden border-0">
              <View className="bg-teal-700 px-6 py-8">
                <View className="mb-4 h-14 w-14 items-center justify-center bg-white/20">
                  <Ionicons name="information-circle" size={28} color="#fff" />
                </View>
                <Text className="text-2xl font-bold text-white">About MFSA</Text>
                <Text className="mt-1 text-sm font-medium text-emerald-100">
                  Meghalaya Finance Service Association
                </Text>
                <Text className="mt-2 text-xs text-emerald-200">
                  Established · Meghalaya, North-East India
                </Text>
              </View>
            </Card>

            <Card className="mb-4">
              <CardContent className="p-5">
                <Text size="sm" className="leading-6 text-slate-600 dark:text-slate-300">
                  MFSA Connect is the official digital platform of the Meghalaya Finance Service
                  Association — built to modernize membership management, ensure financial
                  transparency, and empower every member with direct access to their data,
                  subscriptions, meetings, and training records.
                </Text>
              </CardContent>
            </Card>

            {aboutSections.map((section, index) => (
              <Card
                key={section.title}
                className={cn('mb-3', index === aboutSections.length - 1 ? 'mb-20' : '')}>
                <CardHeader className="pb-2">
                  <View className="flex-row items-center gap-3">
                    <View className="flex h-9 w-9 items-center justify-center bg-emerald-50 dark:bg-emerald-950">
                      <Ionicons
                        name={section.icon}
                        size={18}
                        color={Platform.OS === 'ios' ? '#059669' : '#059669'}
                      />
                    </View>
                    <CardTitle className="flex-1">{section.title}</CardTitle>
                  </View>
                </CardHeader>
                <CardContent className="pt-0">
                  {section.items.map((item, i) => (
                    <View key={i} className="mb-2 flex-row items-start gap-2">
                      <View className="mt-1.5 h-1.5 w-1.5 bg-emerald-400" />
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

            <Card className="mb-20 border-emerald-100 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/30">
              <CardContent className="p-5">
                <View className="flex-row items-center gap-3">
                  <Ionicons name="globe-outline" size={22} color="#059669" />
                  <View className="flex-1">
                    <Text
                      size="sm"
                      weight="semibold"
                      className="text-emerald-700 dark:text-emerald-300">
                      Multi-Association Platform
                    </Text>
                    <Text size="xs" className="mt-1 text-emerald-600/80 dark:text-emerald-400/80">
                      MFSA Connect serves multiple associations on a single backend with complete
                      data isolation. Each association has its own branding, plans, and governance.
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
