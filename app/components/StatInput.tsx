// /components/StatInput.tsx
import React, { useState, useEffect } from 'react';
import { View, Button, Text, ToastAndroid } from 'react-native';
import { RouteProp } from '@react-navigation/native';
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

    useEffect(() => {
        // Charger les infos du joueur
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
    }, [playerId]);

    const updateStat = (statType: string) => {
        if (player) {
            // Incrémenter les statistiques
            setPlayer(prevPlayer => {
                if (!prevPlayer) return null;
                const updatedPlayer = { ...prevPlayer, [statType]: prevPlayer[statType] + 1 };
                return updatedPlayer as PlayerStat;
            });
            ToastAndroid.show("Statistiques mises à jour !", ToastAndroid.SHORT);
        } else {
            ToastAndroid.show("Erreur : joueur non chargé", ToastAndroid.SHORT);
        }
    };

    return (
        <View>
            <Text>{player ? `Statistiques de ${player.name}` : 'Chargement...'}</Text>
            <Button title="Attaque Réussie" onPress={() => updateStat('attackSuccess')} />
            <Button title="Attaque Ratée" onPress={() => updateStat('attackFail')} />
            <Button title="Service Réussi" onPress={() => updateStat('serviceSuccess')} />
            <Button title="Réception Réussie" onPress={() => updateStat('receptions')} />
            <Button title="Bloc Réussi" onPress={() => updateStat('blocks')} />
            <Button title="Sauvegarder" onPress={() => {/* Enregistrer les stats et revenir */}} />
        </View>
    );
};

export default StatInput;
