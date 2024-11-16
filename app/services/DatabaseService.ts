// /services/DatabaseService.ts
import SQLite from 'react-native-sqlite-storage';
import PlayerStat from '../models/PlayerStat';

const db = SQLite.openDatabase({ name: 'playerStats.db', location: 'default' });

// Fonction pour initialiser la base de données avec la table stat_history
const initDB = () => {
    db.transaction(tx => {
        tx.executeSql(`
            CREATE TABLE IF NOT EXISTS players (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                position TEXT,
                attacks INTEGER DEFAULT 0,
                attackSuccess INTEGER DEFAULT 0,
                services INTEGER DEFAULT 0,
                serviceSuccess INTEGER DEFAULT 0,
                receptions INTEGER DEFAULT 0,
                receptionSuccess INTEGER DEFAULT 0,
                blocks INTEGER DEFAULT 0,
                blockSuccess INTEGER DEFAULT 0,
                passesFail INTEGER DEFAULT 0,
                faults INTEGER DEFAULT 0
            );
        `);

        tx.executeSql(`
            CREATE TABLE IF NOT EXISTS stat_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                playerId INTEGER,
                statType TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (playerId) REFERENCES players(id)
            );
        `);
    });
};

/**
 * Ajoute un nouveau joueur dans la base de données.
 * @param player - Un objet PlayerStat contenant les informations du joueur.
 */
const addPlayer = (player: PlayerStat) => {
    db.transaction(tx => {
        tx.executeSql(
            `INSERT INTO players (name, position) VALUES (?, ?);`,
            [player.name, player.position],
            (_, result) => {
                console.log('Joueur ajouté avec succès');
            },
            (_, error) => {
                console.error("Erreur lors de l'ajout du joueur :", error);
                return false;
            }
        );
    }, error => {
        console.error("Erreur de transaction lors de l'ajout du joueur :", error);
    });
};

/**
 * Récupère tous les joueurs de la base de données.
 * @returns Une promesse qui se résout avec un tableau d'objets PlayerStat.
 */
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
                                Number(row.services),
                                Number(row.serviceSuccess),
                                Number(row.receptions),
                                Number(row.receptionSuccess),
                                Number(row.blocks),
                                Number(row.blockSuccess),
                                Number(row.passesFail),
                                Number(row.faults)
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

/**
 * Récupère un joueur par son identifiant.
 * @param playerId - L'identifiant du joueur.
 * @returns Une promesse qui se résout avec l'objet PlayerStat du joueur.
 */
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
                                Number(row.services),
                                Number(row.serviceSuccess),
                                Number(row.receptions),
                                Number(row.receptionSuccess),
                                Number(row.blocks),
                                Number(row.blockSuccess),
                                Number(row.passesFail),
                                Number(row.faults)
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

/**
 * Met à jour les statistiques d'un joueur.
 * @param playerId - L'identifiant du joueur.
 * @param stats - Un objet partiel contenant les statistiques à mettre à jour.
 */
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

/**
 * Ajoute une entrée dans l'historique des statistiques.
 * @param playerId - L'identifiant du joueur.
 * @param statType - Le type de statistique ajoutée.
 */
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

/**
 * Récupère la dernière statistique ajoutée pour un joueur.
 * @param playerId - L'identifiant du joueur.
 */
const getLastStatForPlayer = (playerId: number): Promise<{ id: number; statType: string } | null> => {
    return new Promise((resolve, reject) => {
        db.transaction(
            tx => {
                tx.executeSql(
                    `SELECT id, statType FROM stat_history WHERE playerId = ? ORDER BY timestamp DESC LIMIT 1;`,
                    [playerId],
                    (_, results) => {
                        if (results.rows.length > 0) {
                            const row = results.rows.item(0);
                            resolve({ id: row.id, statType: row.statType });
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

/**
 * Annule la dernière statistique ajoutée à un joueur.
 * @param playerId - L'identifiant du joueur.
 * @param statType - Le type de statistique à annuler.
 */
const reverseStatUpdate = (playerId: number, statType: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        // Récupérer les statistiques actuelles
        getPlayerById(playerId)
            .then(player => {
                if (player) {
                    // Décrémenter la statistique correspondante
                    const updatedStats: Partial<PlayerStat> = {};
                    if (statType === 'attackSuccess') {
                        updatedStats.attacks = player.attacks - 1;
                        updatedStats.attackSuccess = player.attackSuccess - 1;
                    } else if (statType === 'attackFail') {
                        updatedStats.attacks = player.attacks - 1;
                    } else if (statType === 'serviceSuccess') {
                        updatedStats.services = player.services - 1;
                        updatedStats.serviceSuccess = player.serviceSuccess - 1;
                    } else if (statType === 'serviceFail') {
                        updatedStats.services = player.services - 1;
                    } else if (statType === 'receptionSuccess') {
                        updatedStats.receptions = player.receptions - 1;
                        updatedStats.receptionSuccess = player.receptionSuccess - 1;
                    } else if (statType === 'receptionFail') {
                        updatedStats.receptions = player.receptions - 1;
                    } else if (statType === 'blockSuccess') {
                        updatedStats.blocks = player.blocks - 1;
                        updatedStats.blockSuccess = player.blockSuccess - 1;
                    } else if (statType === 'blockFail') {
                        updatedStats.blocks = player.blocks - 1;
                    } else if (statType === 'passesFail') {
                        updatedStats.passesFail = player.passesFail - 1;
                    } else if (statType === 'faults') {
                        updatedStats.faults = player.faults - 1;
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

/**
 * Récupère la dernière statistique enregistrée, quel que soit le joueur.
 * @returns Une promesse qui se résout avec l'objet { id, playerId, statType } de la dernière statistique.
 */
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

/**
 * Supprime une entrée spécifique de l'historique des statistiques.
 * @param id - L'identifiant de l'entrée de l'historique.
 */
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

/**
 * Supprime un joueur de la base de données.
 * @param playerId - L'identifiant du joueur à supprimer.
 */
const deletePlayer = (playerId: number) => {
    db.transaction(tx => {
        tx.executeSql(`DELETE FROM players WHERE id = ?;`, [playerId]);
    });
};

/**
 * Réinitialise toutes les statistiques des joueurs dans la base de données.
 */
const resetAllPlayerStats = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                `UPDATE players SET
                    attacks = 0,
                    attackSuccess = 0,
                    services = 0,
                    serviceSuccess = 0,
                    receptions = 0,
                    receptionSuccess = 0,
                    blocks = 0,
                    blockSuccess = 0,
                    passesFail = 0,
                    faults = 0`,
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

// Exportation par défaut de l'objet DatabaseService
const DatabaseService = {
    initDB,
    addPlayer,
    getAllPlayers,
    getPlayerById,
    updatePlayerStats,
    addStatHistory,
    getLastStatForPlayer,
    reverseStatUpdate,
    getLastStatGlobal,
    deletePlayer,
    resetAllPlayerStats,
    deleteStatHistoryEntry
};

export default DatabaseService;
