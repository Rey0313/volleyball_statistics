// /components/StatInput.tsx

import React, { useState, useEffect, useContext } from 'react';
import { View, Text, ToastAndroid, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { RouteProp, useIsFocused, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import DatabaseService from '../services/DatabaseService';
import PlayerStat from '../models/PlayerStat';
import { OnCourtPlayersContext } from '../contexts/OnCourtPlayersContext';

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
  const { onCourtPlayers } = useContext(OnCourtPlayersContext);

  useEffect(() => {
    if (isFocused) {
      loadPlayerData();
    }
  }, [isFocused, playerId]);

  const loadPlayerData = async () => {
    try {
      const playerData = await DatabaseService.getPlayerById(playerId);
      if (playerData) {
        // PlayerData a déjà une performance à jour car DatabaseService la met à jour après calcul
        setPlayer(playerData);
      } else {
        ToastAndroid.show('Joueur non trouvé', ToastAndroid.SHORT);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du joueur :', error);
      ToastAndroid.show('Erreur lors du chargement du joueur', ToastAndroid.SHORT);
    }
  };

  const updateStat = async (statType: string) => {
    if (player) {
      const updatedStatsList: Promise<void>[] = [];

      // Définir les actions qui n'incrémentent pas pointsPlayed
      const actionsWithoutPointsPlayed = ['serviceSuccess', 'receptionSuccess', 'blockSuccess'];

      // Vérifier si l'action actuelle doit incrémenter pointsPlayed
      const shouldIncrementPointsPlayed = !actionsWithoutPointsPlayed.includes(statType);

      if (shouldIncrementPointsPlayed) {
        // Incrémenter pointsPlayed pour tous les joueurs sur le terrain
        for (const courtPlayer of onCourtPlayers) {
          const updatedPointsPlayed = courtPlayer.pointsPlayed + 1;

          // Mettre à jour en base de données
          const updatePromise = DatabaseService.updatePlayerStats(courtPlayer.id, {
            pointsPlayed: updatedPointsPlayed,
          })
            .then(() => {
              // Mettre à jour le joueur dans onCourtPlayers
              courtPlayer.pointsPlayed = updatedPointsPlayed;
            })
            .catch((error) => {
              console.error(
                `Erreur lors de la mise à jour de pointsPlayed pour le joueur ${courtPlayer.id}:`,
                error
              );
            });

          updatedStatsList.push(updatePromise);
        }
      }

      try {
        // Attendre la mise à jour de pointsPlayed si nécessaire
        await Promise.all(updatedStatsList);

        // Mise à jour de la stat spécifique du joueur courant
          let updatedPlayer = { ...player };
          const updatedStats: Partial<PlayerStat> = {};

          switch (statType) {
            case 'attackSuccess':
              updatedPlayer.attacks += 1;
              updatedPlayer.attackSuccess += 1;
              updatedStats.attacks = updatedPlayer.attacks;
              updatedStats.attackSuccess = updatedPlayer.attackSuccess;
              break;
            case 'attackFail':
              updatedPlayer.attacks += 1;
              updatedStats.attacks = updatedPlayer.attacks;
              break;
            case 'attackPoint':
              updatedPlayer.attacks += 1;
              updatedPlayer.attackSuccess += 1;
              updatedPlayer.attackPoint = (updatedPlayer.attackPoint || 0) + 1;
              updatedStats.attacks = updatedPlayer.attacks;
              updatedStats.attackSuccess = updatedPlayer.attackSuccess;
              updatedStats.attackPoint = updatedPlayer.attackPoint;
              break;
            case 'serviceSuccess':
              updatedPlayer.services += 1;
              updatedPlayer.serviceSuccess += 1;
              updatedStats.services = updatedPlayer.services;
              updatedStats.serviceSuccess = updatedPlayer.serviceSuccess;
              break;
            case 'serviceFail':
              updatedPlayer.services += 1;
              updatedStats.services = updatedPlayer.services;
              break;
            case 'servicePoint':
              updatedPlayer.services += 1;
              updatedPlayer.serviceSuccess += 1;
              updatedPlayer.servicePoint = (updatedPlayer.servicePoint || 0) + 1;
              updatedStats.services = updatedPlayer.services;
              updatedStats.serviceSuccess = updatedPlayer.serviceSuccess;
              updatedStats.servicePoint = updatedPlayer.servicePoint;
              break;
            case 'receptionSuccess':
              updatedPlayer.receptions += 1;
              updatedPlayer.receptionSuccess += 1;
              updatedStats.receptions = updatedPlayer.receptions;
              updatedStats.receptionSuccess = updatedPlayer.receptionSuccess;
              break;
            case 'receptionFail':
              updatedPlayer.receptions += 1;
              updatedStats.receptions = updatedPlayer.receptions;
              break;
            case 'blockSuccess':
              updatedPlayer.blocks += 1;
              updatedPlayer.blockSuccess += 1;
              updatedStats.blocks = updatedPlayer.blocks;
              updatedStats.blockSuccess = updatedPlayer.blockSuccess;
              break;
            case 'blockFail':
              updatedPlayer.blocks += 1;
              updatedStats.blocks = updatedPlayer.blocks;
              break;
            case 'blockPoint':
              updatedPlayer.blocks += 1;
              updatedPlayer.blockSuccess += 1;
              updatedPlayer.blockPoint = (updatedPlayer.blockPoint || 0) + 1;
              updatedStats.blocks = updatedPlayer.blocks;
              updatedStats.blockSuccess = updatedPlayer.blockSuccess;
              updatedStats.blockPoint = updatedPlayer.blockPoint;
              break;
            case 'passesFail':
              updatedPlayer.passesFail += 1;
              updatedStats.passesFail = updatedPlayer.passesFail;
              break;
            case 'faults':
              updatedPlayer.faults += 1;
              updatedStats.faults = updatedPlayer.faults;
              break;
            default:
              break;
          }

        // Sauvegarde des stats mises à jour
        await DatabaseService.updatePlayerStats(updatedPlayer.id, updatedStats);

        // Récupérer le joueur mis à jour et recalculer la performance
        const refreshedPlayer = await DatabaseService.getPlayerById(updatedPlayer.id);
        if (refreshedPlayer) {
          setPlayer(refreshedPlayer);
        }

                  ToastAndroid.show('Statistiques mises à jour !', ToastAndroid.SHORT);
                  navigation.goBack();

      } catch (error) {
        console.error('Erreur lors de la mise à jour des statistiques :', error);
        ToastAndroid.show('Erreur lors de la mise à jour des statistiques', ToastAndroid.SHORT);
      }

    } else {
      ToastAndroid.show('Erreur : joueur non chargé', ToastAndroid.SHORT);
    }
  };

  // Définition de la configuration des statistiques par poste
  const positionStatsMap: { [key: string]: string[] } = {
    libero: ['receptionSuccess', 'receptionFail', 'passesFail'],
    r4: [
      'attackSuccess',
      'attackFail',
      'attackPoint',
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
    ],
    pointu: [
      'attackSuccess',
      'attackFail',
      'attackPoint',
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
    ],
    central: [
      'blockSuccess',
      'blockFail',
      'blockPoint',
      'attackSuccess',
      'attackFail',
      'attackPoint',
      'serviceSuccess',
      'serviceFail',
      'servicePoint',
      'receptionSuccess',
      'receptionFail',
      'passesFail',
      'faults',
    ],
    passeur: [
      'blockSuccess',
      'blockFail',
      'blockPoint',
      'attackSuccess',
      'attackFail',
      'attackPoint',
      'serviceSuccess',
      'serviceFail',
      'servicePoint',
      'receptionSuccess',
      'receptionFail',
      'passesFail',
      'faults',
    ],
  };

  // Fonction pour vérifier si le bouton doit être affiché pour le poste du joueur
  const isStatAvailableForPosition = (statType: string) => {
    if (!player) return false;
    const allowedStats = positionStatsMap[player.position.toLowerCase()];
    return allowedStats ? allowedStats.includes(statType) : false;
  };

  // Définition des sections d'actions
  const actionSections = [
    {
      title: 'Service',
      actions: [
        {
          type: 'serviceSuccess',
          label: 'Réussi',
          style: 'successButton',
        },
        {
          type: 'serviceFail',
          label: 'Raté',
          style: 'failButton',
        },
        {
          type: 'servicePoint',
          label: 'Point',
          style: 'successButtonGreen',
        },
      ],
    },
    {
      title: 'Attaque',
      actions: [
        {
          type: 'attackSuccess',
          label: 'Réussie',
          style: 'successButton',
        },
        {
          type: 'attackFail',
          label: 'Ratée',
          style: 'failButton',
        },
        {
          type: 'attackPoint',
          label: 'Point',
          style: 'successButtonGreen',
        },
      ],
    },
    {
      title: 'Réception',
      actions: [
        {
          type: 'receptionSuccess',
          label: 'Réussie',
          style: 'successButton',
        },
        {
          type: 'receptionFail',
          label: 'Ratée',
          style: 'failButton',
        },
      ],
    },
    {
      title: 'Bloc',
      actions: [
        {
          type: 'blockSuccess',
          label: 'Réussi',
          style: 'successButton',
        },
        {
          type: 'blockFail',
          label: 'Raté',
          style: 'failButton',
        },
        {
          type: 'blockPoint',
          label: 'Point',
          style: 'successButtonGreen',
        },
      ],
    },
    {
      title: 'Passe',
      actions: [
        {
          type: 'passesFail',
          label: 'Ratée',
          style: 'failButton',
        },
      ],
    },
    {
      title: 'Fautes',
      actions: [
        {
          type: 'faults',
          label: 'Faute',
          style: 'failButton',
        },
      ],
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        {player ? `Statistiques de ${player.name}` : 'Chargement...'}
      </Text>
      {player && (
        <View style={styles.statsContainer}>
          {/* Carte des statistiques */}
          <View style={styles.statsCard}>
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Points joués</Text>
              </View>
              <Text style={styles.statValue}>{player.pointsPlayed}</Text>
            </View>

            {/* Affichage de la performance */}
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Performance</Text>
              </View>
              <Text style={styles.statValue}>
                {player.performance ? player.performance.toFixed(2) : 'N/A'} / 10
              </Text>
            </View>

          {isStatAvailableForPosition('attackSuccess') && (
              <View style={styles.statRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Attaques</Text>
                </View>
                <Text style={styles.statValue}>
                  {player.attackSuccess}/{player.attacks}
            </Text>
              </View>
          )}

          {isStatAvailableForPosition('serviceSuccess') && (
              <View style={styles.statRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Services</Text>
                </View>
                <Text style={styles.statValue}>
                  {player.serviceSuccess}/{player.services}
            </Text>
              </View>
          )}

          {isStatAvailableForPosition('receptionSuccess') && (
              <View style={styles.statRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Réceptions</Text>
                </View>
                <Text style={styles.statValue}>
                  {player.receptionSuccess}/{player.receptions}
            </Text>
              </View>
          )}

          {isStatAvailableForPosition('blockSuccess') && (
              <View style={styles.statRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Blocs</Text>
                </View>
                <Text style={styles.statValue}>
                  {player.blockSuccess}/{player.blocks}
            </Text>
              </View>
          )}

          {isStatAvailableForPosition('passesFail') && (
              <View style={styles.statRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Passes Ratées</Text>
                </View>
                <Text style={styles.statValue}>{player.passesFail}</Text>
              </View>
          )}

          {isStatAvailableForPosition('faults') && (
              <View style={styles.statRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Fautes</Text>
                </View>
                <Text style={styles.statValue}>{player.faults}</Text>
              </View>
          )}
          </View>
        </View>
      )}

      {/* Sections d'actions */}
      {actionSections.map((section) => {
        // Filtrer les actions disponibles pour le poste du joueur
        const availableActions = section.actions.filter((action) =>
          isStatAvailableForPosition(action.type)
        );

        if (availableActions.length === 0) return null;

        return (
          <View key={section.title} style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.buttonRow}>
              {availableActions.map((action) => (
                <TouchableOpacity
                  key={action.type}
                  style={[styles.button, styles[action.style]]}
                  onPress={() => updateStat(action.type)}
                >
                  <Text style={styles.buttonText}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  // ... (les styles restent inchangés)
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f7f7f7',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  statsContainer: {
    marginBottom: 20,
  },
  statsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    // Ombre pour iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    // Ombre pour Android
    elevation: 3,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 16,
    color: '#555',
    marginLeft: 10,
  },
  statValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    backgroundColor: '#eee',
    color: '#333',
    marginBottom: 10,
    padding: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  button: {
    width: '48%',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
    marginRight: '2%',
  },
  successButton: {
    backgroundColor: '#2196F3', // Bleu
  },
  successButtonGreen: {
    backgroundColor: '#4CAF50', // Vert
  },
  failButton: {
    backgroundColor: '#F44336', // Rouge
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default StatInput;
