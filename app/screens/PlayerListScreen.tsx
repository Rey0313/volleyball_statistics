// /screens/PlayerListScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import DatabaseService from '../services/DatabaseService';
import PlayerStat from '../models/PlayerStat';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';

type PlayerListScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PlayerListScreen'>;

interface Props {
    navigation: PlayerListScreenNavigationProp;
}

const PlayerListScreen: React.FC<Props> = ({ navigation }) => {
    const [players, setPlayers] = useState<PlayerStat[]>([]);

    useEffect(() => {
        DatabaseService.getAllPlayers().then(setPlayers);
    }, []);

    const renderPlayer = ({ item }: { item: PlayerStat }) => (
        <TouchableOpacity onPress={() => navigation.navigate('StatInput', { playerId: item.id })}>
            <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
            <Text style={{ color: 'blue' }}>{item.position}</Text>
            <Text style={{ color: 'blue' }}>A: {item.attackSuccess}/{item.attacks} S: {item.serviceSuccess}/{item.services} R: {item.receptions} B: {item.blocks}</Text>
        </TouchableOpacity>
    );

    return (
        <View>
            <FlatList data={players} renderItem={renderPlayer} keyExtractor={player => player.id.toString()} />
        </View>
    );
};

export default PlayerListScreen;
