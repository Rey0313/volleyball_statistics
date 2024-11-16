<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Button, Switch, Alert } from 'react-native';
=======
// /screens/PlayerListScreen.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
>>>>>>> ft_btn_remove_last_action
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

    const allowedStats = positionStatsMap[position.toLowerCase()];
    return allowedStats ? allowedStats.includes(statType) : false;
  };

<<<<<<< HEAD
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
=======
    const handleDeleteLastStat = () => {
      DatabaseService.getLastStatGlobal()
        .then(lastStat => {
          if (lastStat) {
            // Annuler la statistique
            DatabaseService.reverseStatUpdate(lastStat.playerId, lastStat.statType)
              .then(() => {
                // Supprimer l'entrée de l'historique
                DatabaseService.deleteStatHistoryEntry(lastStat.id)
                  .then(() => {
                    // Mettre à jour l'état local
                    DatabaseService.getAllPlayers()
                      .then(fetchedPlayers => {
                        setPlayers(fetchedPlayers);
                      })
                      .catch(error => {
                        console.error('Erreur lors du rechargement des joueurs :', error);
                      });
                    Alert.alert('Succès', `La dernière statistique a été supprimée.`);
                  })
                  .catch(error => {
                    console.error("Erreur lors de la suppression de l'historique des stats :", error);
                  });
              })
              .catch(error => {
                console.error("Erreur lors de l'annulation de la statistique :", error);
              });
          } else {
            Alert.alert('Erreur', 'Aucune statistique à supprimer.');
          }
        })
        .catch(error => {
          console.error('Erreur lors de la récupération de la dernière statistique :', error);
        });
    };


    const handleExport = async () => {
        if (players.length === 0) {
            Alert.alert("Aucun joueur à exporter", "Veuillez enregistrer les statistiques d'au moins un joueur.");
            return;
        }

        try {
            const path = await ExcelService.exportPlayerStats(players);

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
            console.error('Erreur lors de l\'exportation vers Excel :', error);
            Alert.alert("Erreur", `Une erreur est survenue lors de l'exportation vers Excel : ${error.message || error.toString()}`);
        }
    };


>>>>>>> ft_btn_remove_last_action

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
<<<<<<< HEAD
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
=======
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('StatInput', { playerId: item.id })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.playerInfo}>
          <Text style={styles.playerName} numberOfLines={1} ellipsizeMode="tail">
            {item.name}
          </Text>
          <Text style={styles.playerPosition} numberOfLines={1} ellipsizeMode="tail">
            {item.position}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => deletePlayer(item.id)}
          style={styles.deleteButton}
        >
          <Text style={styles.deleteButtonText}>Supprimer</Text>
        </TouchableOpacity>
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
      <View style={styles.topButtons}>
        <TouchableOpacity style={styles.buttonCancelLastStat} onPress={handleDeleteLastStat}>
          <Text style={styles.buttonText}>Annuler dernière stat</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonExport} onPress={handleExport}>
          <Text style={styles.buttonText}>Exporter les stats en Excel</Text>
        </TouchableOpacity>
      </View>

      {players.length > 0 ? (
        <FlatList
          data={players}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
        />
      ) : (
        <Text style={styles.noPlayersText}>Aucun joueur n'est créé.</Text>
      )}
>>>>>>> ft_btn_remove_last_action
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#f7f7f7' },
<<<<<<< HEAD
=======
  topButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  buttonCancelLastStat: {
    flex: 1,
    backgroundColor: '#ff8633',
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center', // Ajouté pour centrer verticalement le contenu
  },
  buttonExport: {
    flex: 1,
    backgroundColor: '#2196F3',
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center', // Ajouté pour centrer verticalement le contenu
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
>>>>>>> ft_btn_remove_last_action
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 15,
    marginTop: 10,
<<<<<<< HEAD
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
=======
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  playerInfo: {
    maxWidth: '70%',
    marginRight: 10,
  },
  playerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flexShrink: 1,
  },
  playerPosition: {
    fontSize: 16,
    color: '#666',
    flexShrink: 1,
  },
  deleteButton: {
    backgroundColor: '#F44336',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  statsText: { fontSize: 16, color: '#555' },
  statLabelSuccess: { fontWeight: 'bold', color: '#2196F3' },
  noPlayersText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
>>>>>>> ft_btn_remove_last_action
  },
});

export default PlayerListScreen;
