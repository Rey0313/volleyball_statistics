// /screens/PlayerListScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Button, Alert } from 'react-native';
import DatabaseService from '../services/DatabaseService';
import ExcelService from '../services/ExcelService';
import PlayerStat from '../models/PlayerStat';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';
import { useIsFocused } from '@react-navigation/native';

type PlayerListScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PlayerListScreen'>;

interface Props {
    navigation: PlayerListScreenNavigationProp;
}

const PlayerListScreen: React.FC<Props> = ({ navigation }) => {
    const [players, setPlayers] = useState<PlayerStat[]>([]);
    const isFocused = useIsFocused();

    useEffect(() => {
        if (isFocused) {
            DatabaseService.getAllPlayers().then(setPlayers);
        }
    }, [isFocused]);

    // Fonction pour exporter les statistiques vers Excel et partager le fichier
    const exportAndShare = async () => {
        try {
            const path = await ExcelService.exportPlayerStats(players);
            Alert.alert("Exportation réussie", `Le fichier Excel a été enregistré ici : ${path}`);

            // Partager le fichier sur WhatsApp
            await ExcelService.shareFile(path);
        } catch (error) {
            Alert.alert("Erreur", "Une erreur est survenue lors de l'exportation ou du partage du fichier Excel.");
        }
    };

    const renderPlayer = ({ item }: { item: PlayerStat }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('StatInput', { playerId: item.id })}
        >
            <View style={styles.cardContent}>
                <Text style={styles.playerName}>{item.name}</Text>
                <Text style={styles.playerPosition}>{item.position}</Text>
                <View style={styles.statsRow}>
                    <Text style={styles.statText}>
                        Attaques: {item.attackSuccess}
                        {'  '}Services: {item.serviceSuccess}
                        {'  '}Réceptions: {item.receptionSuccess}
                        {'  '}Blocks: {item.blockSuccess}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Bouton pour exporter en Excel et partager sur WhatsApp */}
            <Button title="Exporter et partager sur WhatsApp" onPress={exportAndShare} />
            <FlatList
                data={players}
                renderItem={renderPlayer}
                keyExtractor={player => player.id.toString()}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f7f7f7',
        padding: 10,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 8,
        marginVertical: 6,
        padding: 10,
        elevation: 2, // For Android shadow
        shadowColor: '#000', // For iOS shadow
        shadowOffset: { width: 0, height: 2 }, // For iOS shadow
        shadowOpacity: 0.1, // For iOS shadow
        shadowRadius: 2, // For iOS shadow
    },
    cardContent: {
        flexDirection: 'column',
    },
    playerName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    playerPosition: {
        fontSize: 14,
        color: '#777',
        marginBottom: 6,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statText: {
        fontSize: 14,
        color: '#555',
    },
});

export default PlayerListScreen;
