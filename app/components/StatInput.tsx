// /components/StatInput.tsx
import React, { useState } from 'react';
import { View, Button, Text, ToastAndroid } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';

type StatInputScreenRouteProp = RouteProp<RootStackParamList, 'StatInput'>;

interface Props {
    route: StatInputScreenRouteProp;
}

const StatInput: React.FC<Props> = ({ route }) => {
    const { playerId } = route.params;
    const [player, setPlayer] = useState<PlayerStat | null>(null);

    const updateStat = (statType: string) => {
        // Incrémenter les statistiques ici
        ToastAndroid.show("Statistiques mises à jour !", ToastAndroid.SHORT);
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
