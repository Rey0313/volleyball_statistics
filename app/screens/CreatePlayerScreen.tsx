// /screens/CreatePlayerScreen.tsx
import React, { useState } from 'react';
import { View, TextInput, Button } from 'react-native';
import DatabaseService from '../services/DatabaseService';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import PlayerStat from '../models/PlayerStat';

type CreatePlayerScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CreatePlayerScreen'>;

interface Props {
    navigation: CreatePlayerScreenNavigationProp;
}

const CreatePlayerScreen: React.FC<Props> = ({ navigation }) => {
    const [name, setName] = useState('');
    const [position, setPosition] = useState('');

    const handleAddPlayer = () => {
        DatabaseService.addPlayer(new PlayerStat(0, name, position));
        navigation.goBack();
    };

    return (
        <View>
            <TextInput placeholder="Nom du joueur" value={name} onChangeText={setName} />
            <TextInput placeholder="Poste du joueur" value={position} onChangeText={setPosition} />
            <Button title="Ajouter le joueur" onPress={handleAddPlayer} />
        </View>
    );
};

export default CreatePlayerScreen;
