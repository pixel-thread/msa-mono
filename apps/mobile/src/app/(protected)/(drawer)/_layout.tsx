import React from 'react';
import { Drawer } from 'expo-router/drawer';
import { CustomDrawerContent } from '@src/shared/components/common/drawer-content';

const DrawerLayout = () => {
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{ headerShown: false }}>
      <Drawer.Screen name="(tabs)" options={{ drawerLabel: 'Home' }} />
    </Drawer>
  );
};

export default DrawerLayout;
