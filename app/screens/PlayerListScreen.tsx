// /screens/PlayerListScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  Alert,
  TextInput,
  SafeAreaView,
} from 'react-native';
import DatabaseService from '../services/DatabaseService';
import ExcelService from '../services/ExcelService';
import PlayerStat from '../models/PlayerStat';
import { useIsFocused } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';

type PlayerListScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'PlayerListScreen'
>;

interface Props {
  navigation: PlayerListScreenNavigationProp;
}

const PlayerListScreen: React.FC<Props> = ({ navigation }) => {
  const [players, setPlayers] = useState<PlayerStat[]>([]);
  const [searchText, setSearchText] = useState('');
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      DatabaseService.getAllPlayers()
        .then(setPlayers)
        .catch((error) => {
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
              Alert.alert(
                'Joueur supprimé',
                'Le joueur a été supprimé avec succès.'
              );
            } catch (error) {
              Alert.alert(
                'Erreur',
                'Une erreur est survenue lors de la suppression du joueur.'
              );
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

  const handleDeleteLastStat = () => {
    DatabaseService.getLastStatGlobal()
      .then((lastStat) => {
        if (lastStat) {
          // Annuler la statistique
          DatabaseService.reverseStatUpdate(lastStat.playerId, lastStat.statType)
            .then(() => {
              // Supprimer l'entrée de l'historique
              DatabaseService.deleteStatHistoryEntry(lastStat.id)
                .then(() => {
                  // Mettre à jour l'état local
                  DatabaseService.getAllPlayers()
                    .then((fetchedPlayers) => {
                      setPlayers(fetchedPlayers);
                    })
                    .catch((error) => {
                      console.error(
                        'Erreur lors du rechargement des joueurs :',
                        error
                      );
                    });
                  Alert.alert('Succès', `La dernière statistique a été supprimée.`);
                })
                .catch((error) => {
                  console.error(
                    "Erreur lors de la suppression de l'historique des stats :",
                    error
                  );
                });
            })
            .catch((error) => {
              console.error("Erreur lors de l'annulation de la statistique :", error);
            });
        } else {
          Alert.alert('Erreur', 'Aucune statistique à supprimer.');
        }
      })
      .catch((error) => {
        console.error(
          'Erreur lors de la récupération de la dernière statistique :',
          error
        );
      });
  };

  const handleExport = async () => {
    if (players.length === 0) {
      Alert.alert(
        'Aucun joueur à exporter',
        "Veuillez enregistrer les statistiques d'au moins un joueur."
      );
      return;
    }

    try {
      const path = await ExcelService.exportPlayerStats(players);

      await ExcelService.shareFile(path);
      await ExcelService.deleteFile(path);
      Alert.alert('Exportation réussie', 'Le fichier a été partagé avec succès.');

      Alert.alert(
        'Réinitialiser les statistiques',
        'Souhaitez-vous réinitialiser les statistiques de tous les joueurs ?',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Oui', onPress: resetPlayerStats },
        ]
      );
    } catch (error) {
      console.error("Erreur lors de l'exportation vers Excel :", error);
      Alert.alert(
        'Erreur',
        `Une erreur est survenue lors de l'exportation vers Excel : ${
          error.message || error.toString()
        }`
      );
    }
  };

  const resetPlayerStats = async () => {
    try {
      await DatabaseService.resetAllPlayerStats();
      DatabaseService.getAllPlayers().then(setPlayers);
      Alert.alert(
        'Statistiques réinitialisées',
        'Les statistiques de tous les joueurs ont été réinitialisées.'
      );
    } catch (error) {
      Alert.alert(
        'Erreur',
        'Une erreur est survenue lors de la réinitialisation des statistiques.'
      );
    }
  };

  const renderItem = ({ item }: { item: PlayerStat }) => (
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
            <Text style={styles.statLabelSuccess}>Attaques:</Text>{' '}
            {item.attackSuccess}{'  '}
          </>
        )}
        {isStatAvailable('blockSuccess', item.position) && (
          <>
            <Text style={styles.statLabelSuccess}>Blocks:</Text>{' '}
            {item.blockSuccess}{'  '}
          </>
        )}
        {isStatAvailable('serviceSuccess', item.position) && (
          <>
            <Text style={styles.statLabelSuccess}>Services:</Text>{' '}
            {item.serviceSuccess}{'  '}
          </>
        )}
        {isStatAvailable('receptionSuccess', item.position) && (
          <>
            <Text style={styles.statLabelSuccess}>Réceptions:</Text>{' '}
            {item.receptionSuccess}{'  '}
          </>
        )}
      </Text>
    </TouchableOpacity>
  );

  const getSections = () => {
    const filteredPlayers = !searchText
      ? players
      : players.filter((player) =>
          player.name.toLowerCase().includes(searchText.toLowerCase())
        );

    // Regrouper les joueurs par poste
    const groupedPlayers = filteredPlayers.reduce(
      (sections: any[], player) => {
        const position = player.position;
        const existingSection = sections.find(
          (section) => section.title === position
        );
        if (existingSection) {
          existingSection.data.push(player);
        } else {
          sections.push({
            title: position,
            data: [player],
          });
        }
        return sections;
      },
      []
    );
    return groupedPlayers;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Barre de recherche */}
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un joueur"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Liste des joueurs */}
      {players.length > 0 ? (
        <SectionList
          sections={getSections()}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.sectionHeader}>{title}</Text>
          )}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <Text style={styles.noPlayersText}>Aucun joueur n'est créé.</Text>
      )}

      {/* Footer avec les boutons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.buttonCancelLastStat}
          onPress={handleDeleteLastStat}
        >
          <Text style={styles.buttonText}>Annuler dernière stat</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonExport} onPress={handleExport}>
          <Text style={styles.buttonText}>Exporter les stats en Excel</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f7f7f7' },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#f7f7f7',
    padding: 10,
    zIndex: 1,
  },
  searchInput: {
    padding: 10,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
  },
  listContent: {
    paddingTop: 70, // Hauteur du header
    paddingBottom: 70, // Hauteur du footer
    paddingHorizontal: 10,
  },
  sectionHeader: {
    backgroundColor: '#eee',
    padding: 5,
    fontWeight: 'bold',
    fontSize: 18,
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Ajouté pour espacer les éléments
    marginBottom: 10,
  },
  playerInfo: {
    flex: 1, // Permet au bloc d'occuper tout l'espace disponible
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
    // Aucune marge pour aligner à droite
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
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#f7f7f7',
    padding: 10,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  buttonCancelLastStat: {
    flex: 1,
    backgroundColor: '#ff8633',
    padding: 15,
    marginHorizontal: 5,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonExport: {
    flex: 1,
    backgroundColor: '#2196F3',
    padding: 15,
    marginHorizontal: 5,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default PlayerListScreen;
