// /screens/PlayerListScreen.tsx

import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  Alert,
  TextInput,
  SafeAreaView,
  Modal,
  FlatList,
} from 'react-native';
import DatabaseService from '../services/DatabaseService';
import ExcelService from '../services/ExcelService';
import PlayerStat from '../models/PlayerStat';
import { useIsFocused } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { OnCourtPlayersContext } from '../contexts/OnCourtPlayersContext';

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

  // Contexte des joueurs sur le terrain
  const { onCourtPlayers, setOnCourtPlayers } = useContext(OnCourtPlayersContext);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);

  useEffect(() => {
    if (isFocused) {
      loadPlayers();
    }
  }, [isFocused]);

  const loadPlayers = async () => {
    try {
      const allPlayers = await DatabaseService.getAllPlayers();
      setPlayers(allPlayers);

      // Initialiser les joueurs sur le terrain si ce n'est pas déjà fait
      if (allPlayers.length >= 6 && onCourtPlayers.length === 0) {
        setOnCourtPlayers(allPlayers.slice(0, 6));
      } else {
        // Mettre à jour les statistiques des joueurs sur le terrain
        const updatedOnCourtPlayers = allPlayers.filter((player) =>
          onCourtPlayers.some((onCourtPlayer) => onCourtPlayer.id === player.id)
        );
        setOnCourtPlayers(updatedOnCourtPlayers);
      }
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

              // Mettre à jour les joueurs sur le terrain
              setOnCourtPlayers((prevOnCourtPlayers) =>
                prevOnCourtPlayers.filter((player) => player.id !== playerId)
              );

              Alert.alert('Joueur supprimé', 'Le joueur a été supprimé avec succès.');
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
      libero: ['receptionSuccess', 'receptionFail', 'passesFail', 'pointsPlayed'],
      r4: [
        'attackSuccess',
        'attackFail',
        'blockSuccess',
        'blockFail',
        'blockPoint',
        'serviceSuccess',
        'serviceFail',
        'servicePoint',
        'receptionSuccess',
        'receptionFail',
        'passesFail',
        'faults',
        'pointsPlayed',
      ],
      pointu: [
        'attackSuccess',
        'attackFail',
        'blockSuccess',
        'blockFail',
        'blockPoint',
        'serviceSuccess',
        'serviceFail',
        'servicePoint',
        'receptionSuccess',
        'receptionFail',
        'passesFail',
        'faults',
        'pointsPlayed',
      ],
      central: [
        'blockSuccess',
        'blockFail',
        'blockPoint',
        'attackSuccess',
        'attackFail',
        'serviceSuccess',
        'serviceFail',
        'servicePoint',
        'receptionSuccess',
        'receptionFail',
        'passesFail',
        'faults',
        'pointsPlayed',
      ],
      passeur: [
        'blockSuccess',
        'blockFail',
        'blockPoint',
        'attackSuccess',
        'attackFail',
        'serviceSuccess',
        'serviceFail',
        'servicePoint',
        'receptionSuccess',
        'receptionFail',
        'passesFail',
        'faults',
        'pointsPlayed',
      ],
    };

    const allowedStats = positionStatsMap[position.toLowerCase()];
    return allowedStats ? allowedStats.includes(statType) : false;
  };

  const handleDeleteLastStat = () => {
    DatabaseService.getLastStatGlobal()
      .then((lastStat) => {
        if (lastStat) {
          // Annuler la statistique pour le joueur concerné
          DatabaseService.reverseStatUpdate(lastStat.playerId, lastStat.statType)
            .then(() => {
              // Vérifier si 'pointsPlayed' doit être décrémenté
              const actionsWithoutPointsPlayed = ['attackSuccess', 'serviceSuccess', 'receptionSuccess', 'blockSuccess'];
              const shouldDecrementPointsPlayed = !actionsWithoutPointsPlayed.includes(lastStat.statType);

              if (shouldDecrementPointsPlayed) {
                // Décrémenter 'pointsPlayed' pour tous les joueurs sur le terrain
                const decrementPromises = onCourtPlayers.map((player) => {
                  const newPointsPlayed = Math.max(0, player.pointsPlayed - 1);
                  return DatabaseService.updatePlayerStats(player.id, {
                    pointsPlayed: newPointsPlayed,
                  });
                });

                Promise.all(decrementPromises)
            .then(() => {
              // Supprimer l'entrée de l'historique
              DatabaseService.deleteStatHistoryEntry(lastStat.id)
                .then(() => {
                  // Mettre à jour l'état local
                  loadPlayers();
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
                    console.error(
                      "Erreur lors de la décrémentation de 'pointsPlayed' pour les joueurs sur le terrain :",
                      error
                    );
                  });
              } else {
                // Si 'pointsPlayed' ne doit pas être décrémenté
                DatabaseService.deleteStatHistoryEntry(lastStat.id)
                  .then(() => {
                    // Mettre à jour l'état local
                    loadPlayers();
                    Alert.alert('Succès', `La dernière statistique a été supprimée.`);
                  })
                  .catch((error) => {
                    console.error(
                      "Erreur lors de la suppression de l'historique des stats :",
                      error
                    );
                  });
              }
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
          { text: 'Non', style: 'cancel' },
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
      loadPlayers();
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

  // Fonction pour ouvrir la modale de remplacement
  const openSubstitutionModal = (playerId: number) => {
    setSelectedPlayerId(playerId);
    setIsModalVisible(true);
  };

  // Fonction pour obtenir les joueurs disponibles pour le remplacement
  const availablePlayers = () => {
    return players.filter(
      (player) => !onCourtPlayers.some((onCourtPlayer) => onCourtPlayer.id === player.id)
    );
  };

  // Fonction pour gérer le remplacement
  const handleSubstitution = (newPlayer: PlayerStat) => {
    if (selectedPlayerId !== null) {
      const updatedOnCourtPlayers = onCourtPlayers.map((player) =>
        player.id === selectedPlayerId ? newPlayer : player
      );
      setOnCourtPlayers(updatedOnCourtPlayers);
      setIsModalVisible(false);
    }
  };

  const renderItem = ({ item }: { item: PlayerStat }) => {
    const isOnCourt = onCourtPlayers.some((player) => player.id === item.id);

    return (
      <TouchableOpacity
        style={[
          styles.card,
          isOnCourt && styles.onCourtCard, // Bordure verte si le joueur est sur le terrain
        ]}
        onPress={() => navigation.navigate('StatInput', { playerId: item.id })}
      >
        {isOnCourt && (
          <View style={styles.onCourtLabelContainer}>
            <Text style={styles.onCourtLabel}>En jeu</Text>
          </View>
        )}
        <View style={styles.cardHeader}>
          <View style={styles.playerInfo}>
            <Text style={styles.playerName} numberOfLines={1} ellipsizeMode="tail">
              {item.name}
            </Text>
            <Text style={styles.playerPosition} numberOfLines={1} ellipsizeMode="tail">
              {item.position}
            </Text>
          </View>

          {isOnCourt ? (
            <TouchableOpacity
              onPress={() => openSubstitutionModal(item.id)}
              style={styles.substituteButton}
            >
              <Text style={styles.substituteButtonText}>Remplacer</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => deletePlayer(item.id)}
              style={styles.deleteButton}
            >
              <Text style={styles.deleteButtonText}>Supprimer</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.statsText}>
          {isStatAvailable('pointsPlayed', item.position) && (
            <>
              <Text style={styles.statLabelSuccess}>Points joués:</Text>{' '}
              {item.pointsPlayed}{'  '}
            </>
          )}
          {isStatAvailable('attackSuccess', item.position) && (
            <>
              <Text style={styles.statLabelSuccess}>Attaques:</Text>{' '}
              {item.attackSuccess}{'  '}
            </>
          )}
          {isStatAvailable('blockSuccess', item.position) && (
            <>
              <Text style={styles.statLabelSuccess}>Blocks:</Text> {item.blockSuccess}{'  '}
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
  };

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
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un joueur"
          value={searchText}
          onChangeText={setSearchText}
        />
        <View style={styles.footerButtons}>
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
      </View>

      {/* Modale de remplacement */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sélectionnez un joueur</Text>
            <FlatList
              data={availablePlayers()}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleSubstitution(item)}
                  style={styles.playerItem}
                >
                  <Text>
                    {item.name} ({item.position})
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              onPress={() => setIsModalVisible(false)}
              style={styles.closeButton}
            >
              <Text style={styles.buttonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f7f7f7' },
  searchInput: {
    padding: 10,
    marginBottom: 10,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
  },
  listContent: {
    paddingBottom: 140, // Hauteur du footer
    paddingHorizontal: 10,
  },
  sectionHeader: {
    marginBottom: 10,
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
  onCourtCard: {
    borderWidth: 2,
    borderColor: '#0b2951', // Bordure verte pour les joueurs sur le terrain
  },
  onCourtLabelContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#0b2951',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderTopLeftRadius: 0,
    borderBottomRightRadius: 8,
  },
  onCourtLabel: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Espacer les éléments
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
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  substituteButton: {
    backgroundColor: '#FFA500',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  substituteButtonText: {
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
    backgroundColor: 'white',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  footerButtons: {
    flexDirection: 'row',
  },
  buttonCancelLastStat: {
    flex: 1,
    backgroundColor: '#ff8633',
    padding: 15,
    marginRight: 5,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonExport: {
    flex: 1,
    backgroundColor: '#2196F3',
    padding: 15,
    marginLeft: 5,
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
  // Styles pour la modale
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  playerItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  closeButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
});

export default PlayerListScreen;
