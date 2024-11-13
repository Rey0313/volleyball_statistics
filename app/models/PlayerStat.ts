// /models/PlayerStat.ts

export default class PlayerStat {
    id: number;
    name: string;
    position: string;
    attacks: number;
    attackSuccess: number;
    services: number;
    serviceSuccess: number;
    receptions: number;
    receptionSuccess: number;
    blocks: number;
    blockSuccess: number;
    passesFail: number;
    faults: number;

    constructor(
        id: number,
        name: string,
        position: string,
        attacks: number = 0,
        attackSuccess: number = 0,
        services: number = 0,
        serviceSuccess: number = 0,
        receptions: number = 0,
        receptionSuccess: number = 0,
        blocks: number = 0,
        blockSuccess: number = 0,
        passesFail: number = 0,
        faults: number = 0
    ) {
        this.id = id;
        this.name = name;
        this.position = position;
        this.attacks = attacks;
        this.attackSuccess = attackSuccess;
        this.services = services;
        this.serviceSuccess = serviceSuccess;
        this.receptions = receptions;
        this.receptionSuccess = receptionSuccess;
        this.blocks = blocks;
        this.blockSuccess = blockSuccess;
        this.passesFail = passesFail;
        this.faults = faults;
    }

    // Méthodes pour calculer les échecs
    get attackFail(): number {
        return this.attacks - this.attackSuccess;
    }

    get serviceFail(): number {
        return this.services - this.serviceSuccess;
    }

    get receptionFail(): number {
        return this.receptions - this.receptionSuccess;
    }

    get blockFail(): number {
        return this.blocks - this.blockSuccess;
    }
}
