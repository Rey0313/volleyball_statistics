import React, { useEffect } from 'react';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './app/screens/HomeScreen';
import PlayerListScreen from './app/screens/PlayerListScreen';
import StatInput from './app/components/StatInput';
import CreatePlayerScreen from './app/screens/CreatePlayerScreen';
import DatabaseService from './app/services/DatabaseService';

type RootStackParamList = {
    HomeScreen: undefined;
    PlayerListScreen: undefined;
    StatInput: { playerId: number };
    CreatePlayerScreen: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const App: React.FC = () => {
    useEffect(() => {
        DatabaseService.initDB();
    }, []);
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="HomeScreen">
                <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ title: 'Accueil' }}/>
                <Stack.Screen name="PlayerListScreen" component={PlayerListScreen} options={{ title: 'Liste des Joueurs' }}/>
                <Stack.Screen name="StatInput" component={StatInput} options={{ title: 'Statistiques' }}/>
                <Stack.Screen name="CreatePlayerScreen" component={CreatePlayerScreen} options={{ title: 'Création des joueurs' }}/>
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default App;