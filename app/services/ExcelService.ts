// /services/ExcelService.ts
import XLSX from 'xlsx';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import PlayerStat from '../models/PlayerStat';

const DIRECTORY_PATH = `${RNFS.DocumentDirectoryPath}/PlayerStatsExports`;

const ExcelService = {
    ensureDirectoryExists: async () => {
        const exists = await RNFS.exists(DIRECTORY_PATH);
        if (!exists) {
            await RNFS.mkdir(DIRECTORY_PATH)
                .then(() => console.log(`Dossier créé : ${DIRECTORY_PATH}`))
                .catch((error) => console.error("Erreur lors de la création du dossier :", error));
        }
    },

    exportPlayerStats: async (players: PlayerStat[]) => {
        await ExcelService.ensureDirectoryExists();

        const data = players.map(player => ({
            Nom: player.name,
            Poste: player.position,
            Attaques: `${player.attackSuccess}/${player.attacks}`,
            Services: `${player.serviceSuccess}/${player.services}`,
            Réceptions: player.receptions,
            Blocs: player.blocks,
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Joueurs');

        const path = `${DIRECTORY_PATH}/PlayerStats_${Date.now()}.xlsx`;

        const excelData = XLSX.write(wb, { type: 'binary', bookType: 'xlsx' });
        await RNFS.writeFile(path, excelData, 'ascii')
            .then(() => {
                console.log('Fichier Excel créé avec succès:', path);
                return path;
            })
            .catch((error) => {
                console.error('Erreur lors de la création du fichier Excel :', error);
                throw error;
            });

        return path;
    },

    // Nouvelle fonction pour partager le fichier via WhatsApp
    shareFile: async (filePath: string) => {
        try {
            const shareOptions = {
                url: `file://${filePath}`,
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // Type MIME pour les fichiers Excel
                title: 'Partager les statistiques des joueurs',
                message: 'Voici les statistiques des joueurs en format Excel',
                social: Share.Social.WHATSAPP // Option pour cibler WhatsApp
            };

            await Share.open(shareOptions);
            console.log('Fichier partagé avec succès');
        } catch (error) {
            console.error('Erreur lors du partage du fichier :', error);
        }
    }
};

export default ExcelService;
