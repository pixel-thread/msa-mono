rm -rf node_modules
rm -rf pnpm-lock.yaml

rm -rf apps/backend/node_modules
rm -rf apps/web/node_modules
rm -rf apps/mobile/node_modules

rm -rf apps/web/.next
rm -rf apps/mobile/.expo
rm -rf apps/mobile/.expo-shared

rm -rf node_modules/.prisma
rm -rf apps/backend/node_modules/.prisma

rm -rf .turbo

pnpm install
