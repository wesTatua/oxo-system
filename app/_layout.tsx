import { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, Fonts } from '../src/presentation/theme';
import { startCoreLoop, stopCoreLoop } from '../src/core/loop/oxoCoreLoop';

export default function RootLayout() {
  useEffect(() => {
    startCoreLoop();
    return () => stopCoreLoop();
  }, []);

  return (
    <>
      <StatusBar style="light" backgroundColor={Colors.bg} />
      <Tabs
        screenOptions={{
          headerStyle:        { backgroundColor: Colors.bg, borderBottomWidth: 1, borderBottomColor: 'rgba(0,200,180,0.4)' },
          headerTintColor:    Colors.tealHi,
          headerTitleStyle:   { fontFamily: Fonts.heading, fontSize: 11, letterSpacing: 3 },
          tabBarStyle:        { backgroundColor: 'rgba(0,5,15,0.97)', borderTopWidth: 1, borderTopColor: 'rgba(0,200,180,0.4)', height: 56 },
          tabBarActiveTintColor:   Colors.tealHi,
          tabBarInactiveTintColor: Colors.tealDim,
          tabBarLabelStyle:   { fontFamily: Fonts.heading, fontSize: 7, letterSpacing: 1.5 },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{ title: 'HQ', tabBarLabel: 'HQ', tabBarIcon: ({ color }) => <TabIcon icon="⬡" color={color} /> }}
        />
        <Tabs.Screen
          name="vendas"
          options={{ title: 'VENDAS', tabBarLabel: 'VENDAS', tabBarIcon: ({ color }) => <TabIcon icon="▲" color={color} /> }}
        />
        <Tabs.Screen
          name="chat"
          options={{ title: 'OXO //', tabBarLabel: 'OXO', tabBarIcon: ({ color }) => <TabIcon icon="◎" color={color} /> }}
        />
        <Tabs.Screen
          name="agenda"
          options={{ title: 'AGENDA', tabBarLabel: 'AGENDA', tabBarIcon: ({ color }) => <TabIcon icon="◈" color={color} /> }}
        />
      </Tabs>
    </>
  );
}

function TabIcon({ icon, color }: { icon: string; color: string }) {
  const { Text } = require('react-native');
  return <Text style={{ fontSize: 18, color }}>{icon}</Text>;
}
