// /components/StatInput.tsx
import React, { useState, useEffect } from 'react';
import { View, Button, Text, ToastAndroid, StyleSheet, TouchableOpacity } from 'react-native';
import { RouteProp, useIsFocused } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import DatabaseService from '../services/DatabaseService';
import PlayerStat from '../models/PlayerStat';

type StatInputScreenRouteProp = RouteProp<RootStackParamList, 'StatInput'>;

interface Props {
    route: StatInputScreenRouteProp;
}

const StatInput: React.FC<Props> = ({ route }) => {
    const { playerId } = route.params;
    const [player, setPlayer] = useState<PlayerStat | null>(null);
    const isFocused = useIsFocused();

    useEffect(() => {
        if (isFocused) {
            DatabaseService.getPlayerById(playerId)
                .then(playerData => {
                    if (playerData) {
                        setPlayer(playerData);
                    } else {
                        ToastAndroid.show("Joueur non trouvé", ToastAndroid.SHORT);
                    }
                })
                .catch(error => {
                    console.error("Erreur lors du chargement du joueur :", error);
                    ToastAndroid.show("Erreur lors du chargement du joueur", ToastAndroid.SHORT);
                });
        }
    }, [isFocused, playerId]);

    const updateStat = (statType: string) => {
        if (player) {
            setPlayer(prevPlayer => {
                if (!prevPlayer) return null;
                let updatedPlayer = { ...prevPlayer };

                switch (statType) {
                    case 'attackSuccess':
                        updatedPlayer.attacks += 1;
                        updatedPlayer.attackSuccess += 1;
                        break;
                    case 'attackFail':
                        updatedPlayer.attacks += 1;
                        updatedPlayer.attackFail += 1;
                        break;
                    case 'serviceSuccess':
                        updatedPlayer.services += 1;
                        updatedPlayer.serviceSuccess += 1;
                        break;
                    case 'receptions':
                        updatedPlayer.receptions += 1;
                        break;
                    case 'blocks':
                        updatedPlayer.blocks += 1;
                        break;
                    default:
                        break;
                }

                return updatedPlayer;
            });
            ToastAndroid.show("Statistiques mises à jour !", ToastAndroid.SHORT);
        } else {
            ToastAndroid.show("Erreur : joueur non chargé", ToastAndroid.SHORT);
        }
    };

    const saveStats = () => {
        if (player) {
            DatabaseService.updatePlayerStats(player.id, {
                attacks: player.attacks,
                attackSuccess: player.attackSuccess,
                attackFail: player.attackFail,
                services: player.services,
                serviceSuccess: player.serviceSuccess,
                receptions: player.receptions,
                blocks: player.blocks
            })
            .then(() => {
                ToastAndroid.show("Statistiques sauvegardées !", ToastAndroid.SHORT);
            })
            .catch(error => {
                console.error("Erreur lors de la sauvegarde des statistiques :", error);
                ToastAndroid.show("Erreur lors de la sauvegarde des statistiques", ToastAndroid.SHORT);
            });
        } else {
            ToastAndroid.show("Erreur : joueur non chargé", ToastAndroid.SHORT);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{player ? `Statistiques de ${player.name}` : 'Chargement...'}</Text>
            {player && (
                <View style={styles.statsContainer}>
                    <Text style={styles.statText}>Attaques : {player.attackSuccess}/{player.attacks}</Text>
                    <Text style={styles.statText}>Services : {player.serviceSuccess}/{player.services}</Text>
                    <Text style={styles.statText}>Réceptions : {player.receptions}</Text>
                    <Text style={styles.statText}>Blocs : {player.blocks}</Text>
                </View>
            )}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, styles.attackSuccessButton]}
                    onPress={() => updateStat('attackSuccess')}
                >
                    <Text style={styles.buttonText}>Attaque Réussie</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, styles.attackFailButton]}
                    onPress={() => updateStat('attackFail')}
                >
                    <Text style={styles.buttonText}>Attaque Ratée</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, styles.serviceSuccessButton]}
                    onPress={() => updateStat('serviceSuccess')}
                >
                    <Text style={styles.buttonText}>Service Réussi</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, styles.receptionButton]}
                    onPress={() => updateStat('receptions')}
                >
                    <Text style={styles.buttonText}>Réception Réussie</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, styles.blockButton]}
                    onPress={() => updateStat('blocks')}
                >
                    <Text style={styles.buttonText}>Bloc Réussi</Text>
                </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.saveButton} onPress={saveStats}>
                <Text style={styles.saveButtonText}>Sauvegarder</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f7f7f7',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
        textAlign: 'center',
    },
    statsContainer: {
        marginBottom: 20,
    },
    statText: {
        fontSize: 16,
        color: '#555',
        marginBottom: 5,
    },
    buttonContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    button: {
        width: '48%',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        alignItems: 'center',
    },
    attackSuccessButton: {
        backgroundColor: '#4CAF50',
    },
    attackFailButton: {
        backgroundColor: '#F44336',
    },
    serviceSuccessButton: {
        backgroundColor: '#2196F3',
    },
    receptionButton: {
        backgroundColor: '#FF9800',
    },
    blockButton: {
        backgroundColor: '#9C27B0',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
    saveButton: {
        backgroundColor: '#607D8B',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 18,
    },
});

export default StatInput;
