// /services/DatabaseService.ts
import SQLite from 'react-native-sqlite-storage';
import PlayerStat from '../models/PlayerStat';

const db = SQLite.openDatabase({ name: 'playerStats.db', location: 'default' });

const DatabaseService = {
    initDB: () => {
        db.transaction(tx => {
            tx.executeSql(`
                CREATE TABLE IF NOT EXISTS players (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT,
                    position TEXT,
                    attacks INTEGER,
                    attackSuccess INTEGER,
                    attackFail INTEGER,
                    services INTEGER,
                    serviceSuccess INTEGER,
                    receptions INTEGER,
                    blocks INTEGER
                );
            `);
        });
    },

    /**
     * Ajoute un nouveau joueur dans la base de données.
     * @param player - Un objet PlayerStat contenant les informations du joueur.
     */
    addPlayer: (player: PlayerStat) => {
        db.transaction(tx => {
            tx.executeSql(
                `INSERT INTO players (name, position, attacks, attackSuccess, attackFail, services, serviceSuccess, receptions, blocks) VALUES (?, ?, 0, 0, 0, 0, 0, 0, 0);`,
                [player.name, player.position]
            );
        });
    },

    /**
     * Récupère tous les joueurs de la base de données.
     * @returns Une promesse qui se résout avec un tableau d'objets PlayerStat.
     */
    getAllPlayers: (): Promise<PlayerStat[]> => {
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
                                    row.attacks,
                                    row.attackSuccess,
                                    row.attackFail,
                                    row.services,
                                    row.serviceSuccess,
                                    row.receptions,
                                    row.blocks
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
    },

    /**
     * Récupère un joueur par son identifiant.
     * @param playerId - L'identifiant du joueur.
     * @returns Une promesse qui se résout avec l'objet PlayerStat du joueur.
     */
    getPlayerById: (playerId: number): Promise<PlayerStat | null> => {
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
                                    row.attacks,
                                    row.attackSuccess,
                                    row.attackFail,
                                    row.services,
                                    row.serviceSuccess,
                                    row.receptions,
                                    row.blocks
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
    },

    /**
     * Met à jour les statistiques d'un joueur.
     * @param playerId - L'identifiant du joueur.
     * @param stats - Un objet partiel contenant les statistiques à mettre à jour.
     */
    updatePlayerStats: (playerId: number, stats: Partial<PlayerStat>): Promise<void> => {
        return new Promise((resolve, reject) => {
            db.transaction(
                tx => {
                    const fields = [];
                    const values: any[] = [];

                    if (stats.attacks !== undefined) {
                        fields.push("attacks = ?");
                        values.push(stats.attacks);
                    }
                    if (stats.attackSuccess !== undefined) {
                        fields.push("attackSuccess = ?");
                        values.push(stats.attackSuccess);
                    }
                    if (stats.attackFail !== undefined) {
                        fields.push("attackFail = ?");
                        values.push(stats.attackFail);
                    }
                    if (stats.services !== undefined) {
                        fields.push("services = ?");
                        values.push(stats.services);
                    }
                    if (stats.serviceSuccess !== undefined) {
                        fields.push("serviceSuccess = ?");
                        values.push(stats.serviceSuccess);
                    }
                    if (stats.receptions !== undefined) {
                        fields.push("receptions = ?");
                        values.push(stats.receptions);
                    }
                    if (stats.blocks !== undefined) {
                        fields.push("blocks = ?");
                        values.push(stats.blocks);
                    }

                    values.push(playerId);

                    tx.executeSql(
                        `UPDATE players SET ${fields.join(", ")} WHERE id = ?;`,
                        values,
                        (_, result) => {
                            resolve();
                        },
                        (_, error) => {
                            reject(error);
                            return false;
                        }
                    );
                }, (error) => {
                    console.error('Erreur lors de la transaction SQL :', error);
                    reject(error);
                },
                () => {
                    console.log('Transaction SQL réussie');
                    resolve();
                }
            );
        });
    },


    /**
     * Supprime un joueur de la base de données.
     * @param playerId - L'identifiant du joueur à supprimer.
     */
    deletePlayer: (playerId: number) => {
        db.transaction(tx => {
            tx.executeSql(`DELETE FROM players WHERE id = ?;`, [playerId]);
        });
    }
};

export default DatabaseService;
