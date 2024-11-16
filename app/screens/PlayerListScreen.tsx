// /screens/PlayerListScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Button, Switch, Alert } from 'react-native';
import DatabaseService from '../services/DatabaseService';
import ExcelService from '../services/ExcelService';
import PlayerStat from '../models/PlayerStat';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';
import { useIsFocused } from '@react-navigation/native';
import Modal from 'react-native-modal';

type PlayerListScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PlayerListScreen'>;

interface Props {
    navigation: PlayerListScreenNavigationProp;
}

const PlayerListScreen: React.FC<Props> = ({ navigation }) => {
    const [players, setPlayers] = useState<PlayerStat[]>([]);
    const [selectedPlayers, setSelectedPlayers] = useState<PlayerStat[]>([]);
    const [isModalVisible, setModalVisible] = useState(false);
    const isFocused = useIsFocused();

    useEffect(() => {
        if (isFocused) {
            DatabaseService.getAllPlayers().then(setPlayers);
        }
    }, [isFocused]);

    const togglePlayerSelection = (player: PlayerStat) => {
        setSelectedPlayers(prevSelectedPlayers => {
            if (prevSelectedPlayers.some(p => p.id === player.id)) {
                return prevSelectedPlayers.filter(p => p.id !== player.id);
            } else {
                return [...prevSelectedPlayers, player];
            }
        });
    };

    const handleExport = async () => {
        if (players.length === 0) {
            Alert.alert("Aucun joueur à exporter", "Veuillez enregistrer les statistiques d'au moins un joueur.");
            return;
        }

        try {
            const path = await ExcelService.exportPlayerStats(selectedPlayers);
    
            Alert.alert(
                "Exportation réussie",
                `Le fichier Excel a été enregistré ici : ${path}`,
                [
                    {
                        text: "Partager sur WhatsApp",
                        onPress: async () => {
                            try {
                                await ExcelService.shareFile(path);
                                // Supprime le fichier après le partage
                                await ExcelService.deleteFile(path);
                                Alert.alert("Fichier supprimé", "Le fichier a été partagé et supprimé avec succès.");
                            } catch (error) {
                                Alert.alert("Erreur", "Impossible de partager le fichier sur WhatsApp ou de le supprimer.");
                            }
                        },
                    },
                    {
                        text: "OK",
                        onPress: async () => {
                            // Supprime le fichier si l'utilisateur ne le partage pas
                            await ExcelService.deleteFile(path);
                        },
                    },
                ]
            );
    
            Alert.alert(
                "Réinitialiser les statistiques",
                "Souhaitez-vous réinitialiser les statistiques de tous les joueurs ?",
                [
                    { text: "Annuler", style: "cancel" },
                    { text: "Oui", onPress: resetPlayerStats },
                ]
            );
        } catch (error) {
            Alert.alert("Erreur", "Une erreur est survenue lors de l'exportation vers Excel.");
        }
    };

    const resetPlayerStats = async () => {
        try {
            await DatabaseService.resetAllPlayerStats();
            DatabaseService.getAllPlayers().then(setPlayers);
            Alert.alert("Statistiques réinitialisées", "Les statistiques de tous les joueurs ont été réinitialisées.");
        } catch (error) {
            Alert.alert("Erreur", "Une erreur est survenue lors de la réinitialisation des statistiques.");
        }
    };

    const renderPlayerSelection = ({ item }: { item: PlayerStat }) => (
        <View style={styles.playerRow}>
            <Text style={styles.playerName}>{item.name}</Text>
            <Switch
                value={selectedPlayers.some(p => p.id === item.id)}
                onValueChange={() => togglePlayerSelection(item)}
            />
        </View>
    );

    return (
        <View style={styles.container}>
            <Button title="Exporter les stats en Excel" onPress={handleExport} />

            <FlatList
                data={players}
                renderItem={({ item }) => (
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
                )}
                keyExtractor={player => player.id.toString()}
            />

            {/* Modale pour sélectionner les joueurs */}
            <Modal isVisible={isModalVisible} onBackdropPress={() => setModalVisible(false)}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Sélectionnez les joueurs à exporter</Text>
                    <FlatList
                        data={players}
                        renderItem={renderPlayerSelection}
                        keyExtractor={player => player.id.toString()}
                    />
                    <Button title="Exporter" onPress={handleExport} />
                </View>
            </Modal>
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
        elevation: 2,
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
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    playerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
        width: '100%',
    },
});

export default PlayerListScreen;
