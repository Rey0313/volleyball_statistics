// /screens/HomeScreen.tsx
import React from 'react';
import { View, Button, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'HomeScreen'>;

const HomeScreen: React.FC = () => {
    const navigation = useNavigation<HomeScreenNavigationProp>();

    return (
        <View>
            <Text>Accueil</Text>
            <Button title="Liste des joueurs" onPress={() => navigation.navigate('PlayerListScreen')} />
            <Button title="Ajouter un joueur" onPress={() => navigation.navigate('CreatePlayerScreen')} />
        </View>
    );
};

export default HomeScreen;
