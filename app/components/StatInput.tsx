// /components/StatInput.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ToastAndroid, StyleSheet, TouchableOpacity } from 'react-native';
import { RouteProp, useIsFocused, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import DatabaseService from '../services/DatabaseService';
import PlayerStat from '../models/PlayerStat';

type StatInputScreenRouteProp = RouteProp<RootStackParamList, 'StatInput'>;
type StatInputScreenNavigationProp = StackNavigationProp<RootStackParamList, 'StatInput'>;

interface Props {
    route: StatInputScreenRouteProp;
}

const StatInput: React.FC<Props> = ({ route }) => {
    const { playerId } = route.params;
    const [player, setPlayer] = useState<PlayerStat | null>(null);
    const isFocused = useIsFocused();
    const navigation = useNavigation<StatInputScreenNavigationProp>();

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
                        break;
                    case 'serviceSuccess':
                        updatedPlayer.services += 1;
                        updatedPlayer.serviceSuccess += 1;
                        break;
                    case 'serviceFail':
                        updatedPlayer.services += 1;
                        break;
                    case 'receptionSuccess':
                        updatedPlayer.receptions += 1;
                        updatedPlayer.receptionSuccess += 1;
                        break;
                    case 'receptionFail':
                        updatedPlayer.receptions += 1;
                        break;
                    case 'blockSuccess':
                        updatedPlayer.blocks += 1;
                        updatedPlayer.blockSuccess += 1;
                        break;
                    case 'blockFail':
                        updatedPlayer.blocks += 1;
                        break;
                    case 'passesFail':
                        updatedPlayer.passesFail += 1;
                        break;
                    case 'faults':
                        updatedPlayer.faults += 1;
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
                services: player.services,
                serviceSuccess: player.serviceSuccess,
                receptions: player.receptions,
                receptionSuccess: player.receptionSuccess,
                blocks: player.blocks,
                blockSuccess: player.blockSuccess,
                passesFail: player.passesFail,
                faults: player.faults
            })
            .then(() => {
                ToastAndroid.show("Statistiques sauvegardées !", ToastAndroid.SHORT);
                navigation.navigate('PlayerListScreen');
            })
            .catch(error => {
                console.error("Erreur lors de la sauvegarde des statistiques :", error);
                ToastAndroid.show("Erreur lors de la sauvegarde des statistiques", ToastAndroid.SHORT);
            });
        } else {
            ToastAndroid.show("Erreur : joueur non chargé", ToastAndroid.SHORT);
        }
    };

    // Définition de la configuration des statistiques par poste
    const positionStatsMap: { [key: string]: string[] } = {
        'libero': ['receptionSuccess', 'receptionFail', 'passesFail'],
        'r4': ['attackSuccess', 'attackFail', 'blockSuccess', 'blockFail', 'serviceSuccess', 'serviceFail', 'receptionSuccess', 'receptionFail', 'passesFail', 'faults'],
        'pointu': ['attackSuccess', 'attackFail', 'blockSuccess', 'blockFail', 'serviceSuccess', 'serviceFail', 'receptionSuccess', 'receptionFail', 'passesFail', 'faults'],
        'central': ['blockSuccess', 'blockFail', 'attackSuccess', 'attackFail', 'serviceSuccess', 'serviceFail', 'receptionSuccess', 'receptionFail', 'passesFail', 'faults'],
        'passeur': ['blockSuccess', 'blockFail', 'attackSuccess', 'attackFail', 'serviceSuccess', 'serviceFail', 'receptionSuccess', 'receptionFail', 'passesFail', 'faults'],
    };

    // Fonction pour vérifier si le bouton doit être affiché pour le poste du joueur
    const isStatAvailableForPosition = (statType: string) => {
        if (!player) return false;
        const allowedStats = positionStatsMap[player.position];
        return allowedStats ? allowedStats.includes(statType) : false;
    };

    // Définition des paires d'actions
    const actionPairs = [
        {
            success: 'attackSuccess',
            fail: 'attackFail',
            successLabel: 'Attaque Réussie',
            failLabel: 'Attaque Ratée'
        },
        {
            success: 'serviceSuccess',
            fail: 'serviceFail',
            successLabel: 'Service Réussi',
            failLabel: 'Service Raté'
        },
        {
            success: 'receptionSuccess',
            fail: 'receptionFail',
            successLabel: 'Réception Réussie',
            failLabel: 'Réception Ratée'
        },
        {
            success: 'blockSuccess',
            fail: 'blockFail',
            successLabel: 'Bloc Réussi',
            failLabel: 'Bloc Raté'
        },
    ];

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{player ? `Statistiques de ${player.name}` : 'Chargement...'}</Text>
            {player && (
                <View style={styles.statsContainer}>
                    {isStatAvailableForPosition('attackSuccess') && (
                        <Text style={styles.statText}>
                            Attaques : {player.attackSuccess}/{player.attacks}
                        </Text>
                    )}
                    {isStatAvailableForPosition('serviceSuccess') && (
                        <Text style={styles.statText}>
                            Services : {player.serviceSuccess}/{player.services}
                        </Text>
                    )}
                    {isStatAvailableForPosition('receptionSuccess') && (
                        <Text style={styles.statText}>
                            Réceptions : {player.receptionSuccess}/{player.receptions}
                        </Text>
                    )}
                    {isStatAvailableForPosition('blockSuccess') && (
                        <Text style={styles.statText}>
                            Blocs : {player.blockSuccess}/{player.blocks}
                        </Text>
                    )}
                    {isStatAvailableForPosition('passesFail') && (
                        <Text style={styles.statText}>
                            Passes Ratées : {player.passesFail}
                        </Text>
                    )}
                    {isStatAvailableForPosition('faults') && (
                        <Text style={styles.statText}>
                            Fautes : {player.faults}
                        </Text>
                    )}
                </View>
            )}

            <View style={styles.buttonContainer}>
                {/* Boutons en paires */}
                {actionPairs.map(pair => {
                    const showSuccess = isStatAvailableForPosition(pair.success);
                    const showFail = isStatAvailableForPosition(pair.fail);

                    // Si ni l'un ni l'autre n'est disponible, on ne rend rien
                    if (!showSuccess && !showFail) {
                        return null;
                    }

                    // Dans le rendu des boutons
                    return (
                        <View style={styles.buttonRow} key={pair.success}>
                            {showSuccess && (
                                <TouchableOpacity
                                    style={[
                                        styles.button,
                                        styles.successButton,
                                        !showFail && { width: '100%' } // Si seul le bouton réussi est affiché
                                    ]}
                                    onPress={() => updateStat(pair.success)}
                                >
                                    <Text style={styles.buttonText}>{pair.successLabel}</Text>
                                </TouchableOpacity>
                            )}
                            {showFail && (
                                <TouchableOpacity
                                    style={[
                                        styles.button,
                                        styles.failButton,
                                        !showSuccess && { width: '100%' } // Si seul le bouton raté est affiché
                                    ]}
                                    onPress={() => updateStat(pair.fail)}
                                >
                                    <Text style={styles.buttonText}>{pair.failLabel}</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    );
                })}

                {/* Boutons pour les actions sans paire */}
                <View style={styles.buttonRow}>
                    {isStatAvailableForPosition('passesFail') && (
                        <TouchableOpacity
                            style={[styles.button, styles.failButton]}
                            onPress={() => updateStat('passesFail')}
                        >
                            <Text style={styles.buttonText}>Passe Ratée</Text>
                        </TouchableOpacity>
                    )}
                    {isStatAvailableForPosition('faults') && (
                        <TouchableOpacity
                            style={[styles.button, styles.failButton]}
                            onPress={() => updateStat('faults')}
                        >
                            <Text style={styles.buttonText}>Faute</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
            <TouchableOpacity style={styles.saveButton} onPress={saveStats}>
                <Text style={styles.saveButtonText}>Sauvegarder</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    // ... styles mis à jour ...
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
        // Retirer le flexDirection ici pour permettre aux boutons d'être organisés en lignes
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    button: {
        width: '48%',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    successButton: {
        backgroundColor: '#2196F3',
    },
    failButton: {
        backgroundColor: '#F44336',
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
