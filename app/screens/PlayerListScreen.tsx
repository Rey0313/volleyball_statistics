// /screens/PlayerListScreen.tsx

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import DatabaseService from '../services/DatabaseService';
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
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      DatabaseService.getAllPlayers()
        .then(fetchedPlayers => {
          setPlayers(fetchedPlayers);
        })
        .catch(error => {
          console.error('Erreur lors du chargement des joueurs :', error);
        });
    }
  }, [isFocused]);

  // Fonction pour vérifier si une statistique est disponible pour le poste du joueur
  const isStatAvailable = (statType: string, position: string) => {
    const positionStatsMap: { [key: string]: string[] } = {
      'libero': ['receptionSuccess', 'receptionFail', 'passesFail'],
      'r4': ['attackSuccess', 'attackFail', 'blockSuccess', 'blockFail', 'serviceSuccess', 'serviceFail', 'receptionSuccess', 'receptionFail', 'passesFail', 'faults'],
      'pointu': ['attackSuccess', 'attackFail', 'blockSuccess', 'blockFail', 'serviceSuccess', 'serviceFail', 'receptionSuccess', 'receptionFail', 'passesFail', 'faults'],
      'central': ['blockSuccess', 'blockFail', 'attackSuccess', 'attackFail', 'serviceSuccess', 'serviceFail', 'receptionSuccess', 'receptionFail', 'passesFail', 'faults'],
      'passeur': ['blockSuccess', 'blockFail', 'attackSuccess', 'attackFail', 'serviceSuccess', 'serviceFail', 'receptionSuccess', 'receptionFail', 'passesFail', 'faults'],
    };

    const allowedStats = positionStatsMap[position.toLowerCase()];
    return allowedStats ? allowedStats.includes(statType) : false;
  };

  const handleDeleteLastStat = (playerId: number) => {
    // Récupérer la dernière statistique pour le joueur
    DatabaseService.getLastStatForPlayer(playerId)
      .then(lastStat => {
        if (lastStat) {
          // Annuler la statistique
          DatabaseService.reverseStatUpdate(playerId, lastStat.statType)
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
                  console.error('Erreur lors de la suppression de l\'historique des stats :', error);
                });
            })
            .catch(error => {
              console.error('Erreur lors de l\'annulation de la statistique :', error);
            });
        } else {
          Alert.alert('Erreur', 'Aucune statistique à supprimer.');
        }
      })
      .catch(error => {
        console.error('Erreur lors de la récupération de la dernière statistique :', error);
      });
  };

  const renderItem = ({ item }: { item: PlayerStat }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('StatInput', { playerId: item.id })}
    >
      <Text style={styles.playerName}>{item.name}</Text>
      <Text style={styles.playerPosition}>{item.position}</Text>
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
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteLastStat(item.id)}
      >
        <Text style={styles.deleteButtonText}>Supprimer la dernière stat</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {players.length > 0 ? (
        <FlatList
          data={players}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
        />
      ) : (
        <Text style={styles.noPlayersText}>Aucun joueur n'est créé.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f7f7f7',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  playerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  playerPosition: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  statsText: {
    fontSize: 16,
    color: '#555',
  },
  statLabelSuccess: {
    fontWeight: 'bold',
    color: '#2196F3',
  },
  deleteButton: {
    backgroundColor: '#F44336',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  deleteButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  noPlayersText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default PlayerListScreen;
