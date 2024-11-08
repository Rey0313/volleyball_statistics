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
                    attacks INTEGER DEFAULT 0,
                    attackSuccess INTEGER DEFAULT 0,
                    attackFail INTEGER DEFAULT 0,
                    services INTEGER DEFAULT 0,
                    serviceSuccess INTEGER DEFAULT 0,
                    serviceFail INTEGER DEFAULT 0,
                    receptions INTEGER DEFAULT 0,
                    receptionSuccess INTEGER DEFAULT 0,
                    receptionFail INTEGER DEFAULT 0,
                    blocks INTEGER DEFAULT 0
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
                                    Number(row.attacks),
                                    Number(row.attackSuccess),
                                    Number(row.attackFail),
                                    Number(row.services),
                                    Number(row.serviceSuccess),
                                    Number(row.serviceFail),
                                    Number(row.receptions),
                                    Number(row.receptionSuccess),
                                    Number(row.receptionFail),
                                    Number(row.blocks)
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
                                    Number(row.attacks),
                                    Number(row.attackSuccess),
                                    Number(row.attackFail),
                                    Number(row.services),
                                    Number(row.serviceSuccess),
                                    Number(row.serviceFail),
                                    Number(row.receptions),
                                    Number(row.receptionSuccess),
                                    Number(row.receptionFail),
                                    Number(row.blocks)
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
                    if (stats.serviceFail !== undefined) {
                        fields.push("serviceFail = ?");
                        values.push(stats.serviceFail);
                    }
                    if (stats.receptions !== undefined) {
                        fields.push("receptions = ?");
                        values.push(stats.receptions);
                    }
                    if (stats.receptionSuccess !== undefined) {
                        fields.push("receptionSuccess = ?");
                        values.push(stats.receptionSuccess);
                    }
                    if (stats.receptionFail !== undefined) {
                        fields.push("receptionFail = ?");
                        values.push(stats.receptionFail);
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
                },
                error => {
                    reject(error);
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
