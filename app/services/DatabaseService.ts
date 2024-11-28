// /services/DatabaseService.ts

import SQLite from 'react-native-sqlite-storage';
import PlayerStat from '../models/PlayerStat';

const db = SQLite.openDatabase({ name: 'playerStats.db', location: 'default' });

// Initialisation de la base de données avec les tables nécessaires
const initDB = () => {
    db.transaction(tx => {
        // Création de la table players si elle n'existe pas
        tx.executeSql(`
            CREATE TABLE IF NOT EXISTS players (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                position TEXT,
                attacks INTEGER DEFAULT 0,
                attackSuccess INTEGER DEFAULT 0,
                attackPoint INTEGER DEFAULT 0,
                services INTEGER DEFAULT 0,
                serviceSuccess INTEGER DEFAULT 0,
                servicePoint INTEGER DEFAULT 0,
                receptions INTEGER DEFAULT 0,
                receptionSuccess INTEGER DEFAULT 0,
                blocks INTEGER DEFAULT 0,
                blockSuccess INTEGER DEFAULT 0,
                blockPoint INTEGER DEFAULT 0,
                passesFail INTEGER DEFAULT 0,
                faults INTEGER DEFAULT 0,
                pointsPlayed INTEGER DEFAULT 0
            );
        `);

        // Création de la table stat_history si elle n'existe pas
        tx.executeSql(`
            CREATE TABLE IF NOT EXISTS stat_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                playerId INTEGER,
                statType TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (playerId) REFERENCES players(id)
            );
        `);

        // Récupération des colonnes existantes dans la table players
        tx.executeSql(
            `PRAGMA table_info(players);`,
            [],
            (_, result) => {
                const existingColumns = [];
                for (let i = 0; i < result.rows.length; i++) {
                    existingColumns.push(result.rows.item(i).name);
                }

                // Définition des colonnes attendues avec leur type
                const columnDefinitions = {
                    'name': 'TEXT',
                    'position': 'TEXT',
                    'attacks': 'INTEGER DEFAULT 0',
                    'attackSuccess': 'INTEGER DEFAULT 0',
                    'attackPoint': 'INTEGER DEFAULT 0',
                    'services': 'INTEGER DEFAULT 0',
                    'serviceSuccess': 'INTEGER DEFAULT 0',
                    'servicePoint': 'INTEGER DEFAULT 0',
                    'receptions': 'INTEGER DEFAULT 0',
                    'receptionSuccess': 'INTEGER DEFAULT 0',
                    'blocks': 'INTEGER DEFAULT 0',
                    'blockSuccess': 'INTEGER DEFAULT 0',
                    'blockPoint': 'INTEGER DEFAULT 0',
                    'passesFail': 'INTEGER DEFAULT 0',
                    'faults': 'INTEGER DEFAULT 0',
                    'pointsPlayed': 'INTEGER DEFAULT 0'
                };

                // Pour chaque colonne attendue, vérifier si elle existe, sinon l'ajouter
                Object.keys(columnDefinitions).forEach(column => {
                    if (!existingColumns.includes(column)) {
                        const columnType = columnDefinitions[column];
                        tx.executeSql(
                            `ALTER TABLE players ADD COLUMN ${column} ${columnType};`,
                            [],
                            () => {
                                console.log(`Colonne '${column}' ajoutée à la table players.`);
                            },
                            (error) => {
                                console.error(`Erreur lors de l'ajout de la colonne '${column}':`, error);
                                return false;
                            }
                        );
                    }
                });
            },
            (error) => {
                console.error('Erreur lors de la récupération des informations de la table players:', error);
            }
        );
    });
};


// Ajoute un nouveau joueur dans la base de données
const addPlayer = (player: PlayerStat): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                `INSERT INTO players (name, position) VALUES (?, ?);`,
                [player.name, player.position],
                (_, result) => {
                    console.log('Joueur ajouté avec succès');
                    resolve();
                },
                (_, error) => {
                    console.error("Erreur lors de l'ajout du joueur :", error);
                    reject(error);
                    return false;
                }
            );
        }, error => {
            console.error("Erreur de transaction lors de l'ajout du joueur :", error);
            reject(error);
        });
    });
};

// Récupère tous les joueurs de la base de données
const getAllPlayers = (): Promise<PlayerStat[]> => {
    return new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                `SELECT * FROM players;`,
                [],
                (_, results) => {
                    const players: PlayerStat[] = [];
                    for (let i = 0; i < results.rows.length; i++) {
                        const row = results.rows.item(i);
                        players.push(
                            new PlayerStat(
                                row.id,
                                row.name,
                                row.position,
                                Number(row.attacks),
                                Number(row.attackSuccess),
                                Number(row.attackPoint),
                                Number(row.services),
                                Number(row.serviceSuccess),
                                Number(row.servicePoint),
                                Number(row.receptions),
                                Number(row.receptionSuccess),
                                Number(row.blocks),
                                Number(row.blockSuccess),
                                Number(row.blockPoint),
                                Number(row.passesFail),
                                Number(row.faults),
                                Number(row.pointsPlayed)
                            )
                        );
                    }
                    resolve(players);
                },
                (_, error) => {
                    reject(error);
                    return false;
                }
            );
        });
    });
};

// Récupère un joueur par son identifiant
const getPlayerById = (playerId: number): Promise<PlayerStat | null> => {
    return new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                `SELECT * FROM players WHERE id = ?;`,
                [playerId],
                (_, results) => {
                    if (results.rows.length > 0) {
                        const row = results.rows.item(0);
                        resolve(
                            new PlayerStat(
                                row.id,
                                row.name,
                                row.position,
                                Number(row.attacks),
                                Number(row.attackSuccess),
                                Number(row.attackPoint),
                                Number(row.services),
                                Number(row.serviceSuccess),
                                Number(row.servicePoint),
                                Number(row.receptions),
                                Number(row.receptionSuccess),
                                Number(row.blocks),
                                Number(row.blockSuccess),
                                Number(row.blockPoint),
                                Number(row.passesFail),
                                Number(row.faults),
                                Number(row.pointsPlayed)
                            )
                        );
                    } else {
                        resolve(null);
                    }
                },
                (_, error) => {
                    reject(error);
                    return false;
                }
            );
        });
    });
};

// Met à jour les statistiques d'un joueur
const updatePlayerStats = (playerId: number, stats: Partial<PlayerStat>): Promise<void> => {
    return new Promise((resolve, reject) => {
        db.transaction(
            tx => {
                const fields = Object.keys(stats).map(key => `${key} = ?`).join(", ");
                const values = Object.values(stats);
                values.push(playerId);

                tx.executeSql(
                    `UPDATE players SET ${fields} WHERE id = ?;`,
                    values,
                    (_, result) => {
                        resolve();
                    },
                    (_, error) => {
                        reject(error);
                        return false;
                    }
                );
            },
            error => {
                reject(error);
            }
        );
    });
};

// Ajoute une entrée dans l'historique des statistiques
const addStatHistory = (playerId: number, statType: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        db.transaction(
            tx => {
                tx.executeSql(
                    `INSERT INTO stat_history (playerId, statType) VALUES (?, ?);`,
                    [playerId, statType],
                    (_, result) => {
                        resolve();
                    },
                    (_, error) => {
                        reject(error);
                        return false;
                    }
                );
            },
            error => {
                reject(error);
            }
        );
    });
};

// Annule la dernière statistique ajoutée à un joueur
const reverseStatUpdate = (playerId: number, statType: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        // Récupérer les statistiques actuelles
        getPlayerById(playerId)
            .then(player => {
                if (player) {
                    // Décrémenter la statistique correspondante
                    const updatedStats: Partial<PlayerStat> = {};
                    if (statType === 'attackSuccess') {
                        updatedStats.attacks = Math.max(0, player.attacks - 1);
                        updatedStats.attackSuccess = Math.max(0, player.attackSuccess - 1);
                    } else if (statType === 'attackFail') {
                        updatedStats.attacks = Math.max(0, player.attacks - 1);
                    } else if (statType === 'attackPoint') {
                        updatedStats.attacks = Math.max(0, player.attacks - 1);
                        updatedStats.attackSuccess = Math.max(0, player.attackSuccess - 1);
                        updatedStats.attackPoint = Math.max(0, player.attackPoint - 1);
                    } else if (statType === 'serviceSuccess') {
                        updatedStats.services = Math.max(0, player.services - 1);
                        updatedStats.serviceSuccess = Math.max(0, player.serviceSuccess - 1);
                    } else if (statType === 'serviceFail') {
                        updatedStats.services = Math.max(0, player.services - 1);
                    } else if (statType === 'servicePoint') {
                        updatedStats.services = Math.max(0, player.services - 1);
                        updatedStats.serviceSuccess = Math.max(0, player.serviceSuccess - 1);
                        updatedStats.servicePoint = Math.max(0, player.servicePoint - 1);
                    } else if (statType === 'receptionSuccess') {
                        updatedStats.receptions = Math.max(0, player.receptions - 1);
                        updatedStats.receptionSuccess = Math.max(0, player.receptionSuccess - 1);
                    } else if (statType === 'receptionFail') {
                        updatedStats.receptions = Math.max(0, player.receptions - 1);
                    } else if (statType === 'blockSuccess') {
                        updatedStats.blocks = Math.max(0, player.blocks - 1);
                        updatedStats.blockSuccess = Math.max(0, player.blockSuccess - 1);
                    } else if (statType === 'blockFail') {
                        updatedStats.blocks = Math.max(0, player.blocks - 1);
                    } else if (statType === 'blockPoint') {
                        updatedStats.blocks = Math.max(0, player.blocks - 1);
                        updatedStats.blockSuccess = Math.max(0, player.blockSuccess - 1);
                        updatedStats.blockPoint = Math.max(0, player.blockPoint - 1);
                    } else if (statType === 'passesFail') {
                        updatedStats.passesFail = Math.max(0, player.passesFail - 1);
                    } else if (statType === 'faults') {
                        updatedStats.faults = Math.max(0, player.faults - 1);
                    }
                    // Vérifier si pointsPlayed doit être décrémenté
                    const actionsWithoutPointsPlayed = ['attackSuccess', 'serviceSuccess', 'receptionSuccess', 'blockSuccess'];
                    if (!actionsWithoutPointsPlayed.includes(statType)) {
                        updatedStats.pointsPlayed = Math.max(0, player.pointsPlayed - 1);
                    }

                    // Mettre à jour les statistiques
                    updatePlayerStats(playerId, updatedStats)
                        .then(() => resolve())
                        .catch(error => reject(error));
                } else {
                    reject(new Error('Joueur non trouvé'));
                }
            })
            .catch(error => reject(error));
    });
};


// Récupère la dernière statistique enregistrée, quel que soit le joueur
const getLastStatGlobal = (): Promise<{ id: number; playerId: number; statType: string } | null> => {
    return new Promise((resolve, reject) => {
        db.transaction(
            tx => {
                tx.executeSql(
                    `SELECT id, playerId, statType FROM stat_history ORDER BY timestamp DESC LIMIT 1;`,
                    [],
                    (_, results) => {
                        if (results.rows.length > 0) {
                            const row = results.rows.item(0);
                            resolve({ id: row.id, playerId: row.playerId, statType: row.statType });
                        } else {
                            resolve(null);
                        }
                    },
                    (_, error) => {
                        reject(error);
                        return false;
                    }
                );
            },
            error => {
                reject(error);
            }
        );
    });
};

// Supprime une entrée spécifique de l'historique des statistiques
const deleteStatHistoryEntry = (id: number): Promise<void> => {
    return new Promise((resolve, reject) => {
        db.transaction(
            tx => {
                tx.executeSql(
                    `DELETE FROM stat_history WHERE id = ?;`,
                    [id],
                    (_, result) => {
                        resolve();
                    },
                    (_, error) => {
                        reject(error);
                        return false;
                    }
                );
            },
            error => {
                reject(error);
            }
        );
    });
};

// Supprime un joueur de la base de données
const deletePlayer = (playerId: number): Promise<void> => {
    return new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(`DELETE FROM players WHERE id = ?;`, [playerId],
                (_, result) => resolve(),
                (_, error) => {
                    reject(error);
                    return false;
                }
            );
        },
        error => reject(error));
    });
};

// Réinitialise toutes les statistiques des joueurs dans la base de données
const resetAllPlayerStats = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                `UPDATE players SET
                    attacks = 0,
                    attackSuccess = 0,
                    attackPoint = 0,
                    services = 0,
                    serviceSuccess = 0,
                    servicePoint = 0,
                    receptions = 0,
                    receptionSuccess = 0,
                    blocks = 0,
                    blockSuccess = 0,
                    blockPoint = 0,
                    passesFail = 0,
                    faults = 0,
                    pointsPlayed = 0
                `,
                [],
                (_, result) => {
                    console.log("Statistiques des joueurs réinitialisées avec succès.");
                    resolve();
                },
                (_, error) => {
                    console.error("Erreur lors de la réinitialisation des statistiques :", error);
                    reject(error);
                    return false;
                }
            );
        });
    });
};

// Calcule le score de performance d'un joueur en fonction de son poste et de ses statistiques
const calculatePerformanceScore = async (
    player: PlayerStat,
    includePointsPlayed: boolean
): Promise<{
    rawScore: number;
    normalizedScore: number;
    maxScore: number;
    minScore: number;
}> => {
    const weights = {
        // Pondérations mises à jour
        libero: {
            receptionSuccess: 1,
            receptionFail: -0.5,
            passesFail: -0.5,
            faults: -1,
        },
        r4: {
            attackPoint: 3,
            attackSuccess: 1,
            attackFail: -1,
            blockPoint: 2,
            blockSuccess: 1,
            blockFail: -0.5,
            servicePoint: 2.5,
            serviceSuccess: 1,
            serviceFail: -0.5,
            receptionSuccess: 0.5,
            receptionFail: -0.5,
            passesFail: -0.5,
            faults: -1,
        },
        pointu: {
            attackPoint: 3,
            attackSuccess: 1,
            attackFail: -1,
            blockPoint: 2,
            blockSuccess: 1,
            blockFail: -0.5,
            servicePoint: 2.5,
            serviceSuccess: 1,
            serviceFail: -0.5,
            passesFail: -0.5,
            faults: -1,
        },
        central: {
            blockPoint: 3,
            blockSuccess: 1,
            blockFail: -0.5,
            attackPoint: 2,
            attackSuccess: 1,
            attackFail: -1,
            servicePoint: 1.5,
            serviceSuccess: 1,
            serviceFail: -0.5,
            passesFail: -0.5,
            faults: -1,
        },
        passeur: {
            passesFail: -0.5,
            blockSuccess: 1,
            blockFail: -0.5,
            faults: -1,
        },
    };

    const position = player.position.toLowerCase();
    const positionWeights = weights[position];

    if (!positionWeights) {
        throw new Error(`Position '${player.position}' non supportée.`);
    }

    // Calcul du score brut
    let rawScore = 0;
    for (const stat in positionWeights) {
        const weight = positionWeights[stat];
        const statValue = player[stat as keyof PlayerStat] || 0;
        rawScore += statValue * weight;
    }

    // Calcul du score par point joué si nécessaire
    let scoreToNormalize = rawScore;
    if (includePointsPlayed && player.pointsPlayed > 0) {
        scoreToNormalize = rawScore / player.pointsPlayed;
    }

    // Obtenir le score max et min possibles pour normalisation
    const { maxScore, minScore } = getMaxMinScoresForPosition(
        position,
        positionWeights,
        includePointsPlayed,
        player.pointsPlayed
    );

    // Normalisation du score sur une échelle de 0 à 10
    const normalizedScore =
        maxScore - minScore !== 0
            ? ((scoreToNormalize - minScore) / (maxScore - minScore)) * 10
            : 0;

    // S'assurer que le score est entre 0 et 10
    const clampedScore = Math.max(0, Math.min(10, normalizedScore));

    return {
        rawScore: scoreToNormalize,
        normalizedScore: clampedScore,
        maxScore,
        minScore,
    };
};


// Calcule les scores maximum et minimum possibles pour un poste donné
const getMaxMinScoresForPosition = (
    position: string,
    positionWeights: { [key: string]: number },
    includePointsPlayed: boolean,
    pointsPlayed: number
): { maxScore: number; minScore: number } => {
    let maxScore = 0;
    let minScore = 0;

    // Supposons que le joueur peut avoir 1 unité de chaque statistique pour simplifier
    for (const stat in positionWeights) {
        const weight = positionWeights[stat];

        // Meilleur cas
        if (weight > 0) {
            maxScore += weight * (includePointsPlayed && pointsPlayed > 0 ? 1 / pointsPlayed : 1);
        }

        // Pire cas
        if (weight < 0) {
            minScore += weight * (includePointsPlayed && pointsPlayed > 0 ? 1 / pointsPlayed : 1);
        }
    }

    return { maxScore, minScore };
};


// Exportation de l'objet DatabaseService
const DatabaseService = {
    initDB,
    addPlayer,
    getAllPlayers,
    getPlayerById,
    updatePlayerStats,
    addStatHistory,
    reverseStatUpdate,
    getLastStatGlobal,
    deletePlayer,
    resetAllPlayerStats,
    deleteStatHistoryEntry,
    calculatePerformanceScore,
};

export default DatabaseService;
