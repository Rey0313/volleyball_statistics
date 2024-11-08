// /components/PlayerList.tsx
import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import PlayerStat from '../models/PlayerStat';

interface PlayerListProps {
    players: PlayerStat[];
    onPressPlayer: (playerId: number) => void;
}

const PlayerList: React.FC<PlayerListProps> = ({ players, onPressPlayer }) => {
    const renderPlayerItem = ({ item }: { item: PlayerStat }) => (
        <TouchableOpacity style={styles.card} onPress={() => onPressPlayer(item.id)}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.position}>{item.position}</Text>
            <Text style={styles.stats}>
                A: {item.attackSuccess}/{item.attacks} 
                S: {item.serviceSuccess}/{item.services} 
                R: {item.receptions} 
                B: {item.blocks}
            </Text>
        </TouchableOpacity>
    );

    return (
        <FlatList
            data={players}
            renderItem={renderPlayerItem}
            keyExtractor={(player) => player.id.toString()}
        />
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#f9f9f9',
        padding: 16,
        marginVertical: 8,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    name: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    position: {
        color: 'blue',
    }
);
