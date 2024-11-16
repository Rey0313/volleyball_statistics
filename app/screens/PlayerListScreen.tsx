import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Button, Switch, Alert } from 'react-native';
import DatabaseService from '../services/DatabaseService';
import ExcelService from '../services/ExcelService';
import PlayerStat from '../models/PlayerStat';
import { useIsFocused } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';

type PlayerListScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PlayerListScreen'>;

interface Props {
  navigation: PlayerListScreenNavigationProp;
}

const PlayerListScreen: React.FC<Props> = ({ navigation }) => {
  const [players, setPlayers] = useState<PlayerStat[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<PlayerStat[]>([]);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      DatabaseService.getAllPlayers()
        .then(setPlayers)
        .catch(error => {
          console.error('Erreur lors du chargement des joueurs :', error);
        });
    }
  }, [isFocused]);

  const loadPlayers = async () => {
    try {
      const allPlayers = await DatabaseService.getAllPlayers();
      setPlayers(allPlayers);
    } catch (error) {
      console.error('Erreur lors du chargement des joueurs :', error);
    }
  };

  const deletePlayer = async (playerId: number) => {
    Alert.alert(
      'Confirmer la suppression',
      'Voulez-vous vraiment supprimer ce joueur ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Oui',
          onPress: async () => {
            try {
              await DatabaseService.deletePlayer(playerId);
              await loadPlayers(); // Recharge les joueurs après suppression
              Alert.alert('Joueur supprimé', 'Le joueur a été supprimé avec succès.');
            } catch (error) {
              Alert.alert('Erreur', 'Une erreur est survenue lors de la suppression du joueur.');
            }
          },
        },
      ]
    );
  };

  const isStatAvailable = (statType: string, position: string) => {
    const positionStatsMap: { [key: string]: string[] } = {
      libero: ['receptionSuccess', 'receptionFail', 'passesFail'],
      r4: [
        'attackSuccess',
        'attackFail',
        'blockSuccess',
        'blockFail',
        'serviceSuccess',
        'serviceFail',
        'receptionSuccess',
        'receptionFail',
        'passesFail',
        'faults',
      ],
      pointu: [
        'attackSuccess',
        'attackFail',
        'blockSuccess',
        'blockFail',
        'serviceSuccess',
        'serviceFail',
        'receptionSuccess',
        'receptionFail',
        'passesFail',
        'faults',
      ],
      central: [
        'blockSuccess',
        'blockFail',
        'attackSuccess',
        'attackFail',
        'serviceSuccess',
        'serviceFail',
        'receptionSuccess',
        'receptionFail',
        'passesFail',
        'faults',
      ],
      passeur: [
        'blockSuccess',
        'blockFail',
        'attackSuccess',
        'attackFail',
        'serviceSuccess',
        'serviceFail',
        'receptionSuccess',
        'receptionFail',
        'passesFail',
        'faults',
      ],
    };

    const allowedStats = positionStatsMap[position];
    return allowedStats ? allowedStats.includes(statType) : false;
  };

  const handleExport = async () => {
    if (players.length === 0) {
        Alert.alert("Aucun joueur à exporter", "Veuillez enregistrer les statistiques d'au moins un joueur.");
        return;
    }

    try {
        const path = await ExcelService.exportPlayerStats(selectedPlayers);
        
        await ExcelService.shareFile(path);
        await ExcelService.deleteFile(path);
        Alert.alert("Exportation réussie", "Le fichier a été partagé avec succès.");

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
      Alert.alert('Statistiques réinitialisées', 'Les statistiques de tous les joueurs ont été réinitialisées.');
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de la réinitialisation des statistiques.');
    }
  };

  const renderItem = ({ item }: { item: PlayerStat }) => (
  <TouchableOpacity
    style={styles.card}
    onPress={() => navigation.navigate('StatInput', { playerId: item.id })}
  >
    <View style={styles.cardHeader}>
      <View>
        <Text style={styles.playerName}>{item.name}</Text>
        <Text style={styles.playerPosition}>{item.position}</Text>
      </View>
      <View style={styles.roundedButton}>
        <Button
          title="Supprimer"
          onPress={() => deletePlayer(item.id)}
          color="#F44336" // Rouge pour indiquer une action de suppression
        />
      </View>
    </View>
    <Text style={styles.statsText}>
      {isStatAvailable('attackSuccess', item.position) && (
        <>
          <Text style={styles.statLabelSuccess}>Attaques:</Text> {item.attackSuccess}{'  '}
        </>
      )}
      {isStatAvailable('blockSuccess', item.position) && (
        <>
          <Text style={styles.statLabelSuccess}>Blocks:</Text> {item.blockSuccess}{'  '}
        </>
      )}
      {isStatAvailable('serviceSuccess', item.position) && (
        <>
          <Text style={styles.statLabelSuccess}>Services:</Text> {item.serviceSuccess}{'  '}
        </>
      )}
      {isStatAvailable('receptionSuccess', item.position) && (
        <>
          <Text style={styles.statLabelSuccess}>Réceptions:</Text> {item.receptionSuccess}{'  '}
        </>
      )}
    </Text>
  </TouchableOpacity>
);


  return (
    <View style={styles.container}>
      <View style={styles.roundedButton}>
        <Button title="Exporter les stats en Excel" onPress={handleExport} />
      </View>

      <FlatList
        data={players}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#f7f7f7' },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 15,
    marginTop: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  playerName: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  playerPosition: { fontSize: 16, color: '#666' },
  statsText: { fontSize: 16, color: '#555' },
  statLabelSuccess: { fontWeight: 'bold', color: '#2196F3' },
  roundedButton: {
    overflow: 'hidden', // S'assure que le contenu respecte les bordures arrondies
    borderRadius: 12, // Arrondi des bords
  },
});

export default PlayerListScreen;
