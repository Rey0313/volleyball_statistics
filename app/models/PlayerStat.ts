// /models/PlayerStat.ts

export default class PlayerStat {
    id: number;
    name: string;
    position: string;
    attacks: number;
    attackSuccess: number;
    attackFail: number;
    services: number;
    serviceSuccess: number;
    serviceFail: number;
    receptions: number;
    receptionSuccess: number;
    receptionFail: number;
    blocks: number;

    constructor(
        id: number,
        name: string,
        position: string,
        attacks: number = 0,
        attackSuccess: number = 0,
        attackFail: number = 0,
        services: number = 0,
        serviceSuccess: number = 0,
        serviceFail: number = 0,
        receptions: number = 0,
        receptionSuccess: number = 0,
        receptionFail: number = 0,
        blocks: number = 0
    ) {
        this.id = id;
        this.name = name;
        this.position = position;
        this.attacks = attacks;
        this.attackSuccess = attackSuccess;
        this.attackFail = attackFail;
        this.services = services;
        this.serviceSuccess = serviceSuccess;
        this.serviceFail = serviceFail;
        this.receptions = receptions;
        this.receptionSuccess = receptionSuccess;
        this.receptionFail = receptionFail;
        this.blocks = blocks;
    }
}
