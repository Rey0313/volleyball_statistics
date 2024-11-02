import React from 'react';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './app/screens/HomeScreen';
import PlayerListScreen from './app/screens/PlayerListScreen';
import StatInput from './app/components/StatInput';
import CreatePlayerScreen from './app/screens/CreatePlayerScreen';

type RootStackParamList = {
    HomeScreen: undefined;
    PlayerListScreen: undefined;
    StatInput: { playerId: number };
    CreatePlayerScreen: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const App: React.FC = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="HomeScreen">
                <Stack.Screen name="HomeScreen" component={HomeScreen} />
                <Stack.Screen name="PlayerListScreen" component={PlayerListScreen} />
                <Stack.Screen name="StatInput" component={StatInput} />
                <Stack.Screen name="CreatePlayerScreen" component={CreatePlayerScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default App;