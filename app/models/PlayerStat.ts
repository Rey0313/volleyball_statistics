// /models/PlayerStat.ts
/**
 * Classe représentant les statistiques d'un joueur de volleyball.
 */
export default class PlayerStat {
    id: number;
    name: string;
    position: string;
    attacks: number;
    attackSuccess: number;
    attackFail: number;
    services: number;
    serviceSuccess: number;
    receptions: number;
    blocks: number;

    constructor(id: number, name: string, position: string) {
        this.id = id;
        this.name = name;
        this.position = position;
        this.attacks = 0;
        this.attackSuccess = 0;
        this.attackFail = 0;
        this.services = 0;
        this.serviceSuccess = 0;
        this.receptions = 0;
        this.blocks = 0;
    }
}
