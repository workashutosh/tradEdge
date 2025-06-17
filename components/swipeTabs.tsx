// SwipeTabs.tsx
import React, { useState, useMemo } from 'react';
import { Text, useWindowDimensions } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { useStockContext } from '../context/StockContext';

const SwipeTabs = () => {
  const layout = useWindowDimensions();
  const { packages } = useStockContext();

  // Dynamically create scenes and routes based on package categories
  const categoryGroups = useMemo(() => {
    const groups: { [key: string]: any[] } = {};
    for (const pkg of packages) {
      if (!groups[pkg.categoryTag]) groups[pkg.categoryTag] = [];
      groups[pkg.categoryTag].push(pkg);
    }
    return groups;
  }, [packages]);

  const routes = Object.keys(categoryGroups).map((category, idx) => ({
    key: category.toLowerCase().replace(/\s+/g, ''),
    title: category,
  }));

  const scenes = Object.entries(categoryGroups).reduce((acc, [category, pkgs]) => {
    const key = category.toLowerCase().replace(/\s+/g, '');
    acc[key] = () => (
      <>
        {pkgs.map(pkg => (
          <Text key={pkg.package_id} style={{ marginVertical: 8 }}>
            {pkg.icon} {pkg.title} - ₹{pkg.price}
          </Text>
        ))}
      </>
    );
    return acc;
  }, {} as { [key: string]: React.ComponentType });

  const [index, setIndex] = useState(0);

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={SceneMap(scenes)}
      onIndexChange={setIndex}
      initialLayout={{ width: layout.width }}
      renderTabBar={props => (
        <TabBar
          {...props}
          scrollEnabled
          indicatorStyle={{ backgroundColor: 'blue' }}
          style={{ backgroundColor: 'white' }}
          renderLabel={({ route }) => (
            <Text style={{ color: 'black' }}>{route.title}</Text>
          )}
        />
      )}
    />
  );
};

export default SwipeTabs;
