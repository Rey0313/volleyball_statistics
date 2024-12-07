// /services/ExcelService.ts
import XLSX from 'xlsx';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import PlayerStat from '../models/PlayerStat';
import DatabaseService from '../services/DatabaseService';

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

        // Création d'un nouveau classeur et d'une feuille
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet([]); // Feuille vide pour commencer

        // Définition des en-têtes à deux niveaux
        const header = [
            ["Noms", "Poste", "Services", "", "", "", "Attaques", "", "", "", "Réceptions", "", "", "Blocs", "", "", "", "Passes", "", "Fautes", "Points joués", "Performance"],
            ["", "", "Points", "Réussis", "Ratés", "Total", "Points", "Réussis", "Ratés", "Total", "Réussis", "Ratés", "Total", "Points", "Réussis", "Ratés", "Total", "Ratées", "", "", ""]
        ];

        // Insérer les en-têtes dans la feuille
        XLSX.utils.sheet_add_aoa(ws, header, { origin: "A1" });

        // Fusion des cellules pour les en-têtes de la première ligne
        ws["!merges"] = [
            { s: { r: 0, c: 2 }, e: { r: 0, c: 5 } }, // Fusion pour "Services"
            { s: { r: 0, c: 6 }, e: { r: 0, c: 9 } }, // Fusion pour "Attaques"
            { s: { r: 0, c: 10 }, e: { r: 0, c: 12 } }, // Fusion pour "Réceptions"
            { s: { r: 0, c: 13 }, e: { r: 0, c: 16 } }, // Fusion pour "Blocs"
            { s: { r: 0, c: 17 }, e: { r: 0, c: 17 } }  // Pas de fusion pour "Passes Ratées"
        ];

        // Ajout des données des joueurs
        const data = players.map(player => ([
            player.name,
            player.position,
            player.serviceSuccess,
            player.serviceSuccess,
            player.services - player.serviceSuccess,
            player.services,
            player.attackSuccess,
            player.attackSuccess,
            player.attacks - player.attackSuccess,
            player.attacks,
            player.receptionSuccess,
            player.receptions - player.receptionSuccess,
            player.receptions,
            player.blockSuccess,
            player.blockSuccess,
            player.blocks - player.blockSuccess,
            player.blocks,
            player.passesFail,
            player.faults,
            player.pointsPlayed || "",
            player.performance || ""
        ]));

        XLSX.utils.sheet_add_aoa(ws, data, { origin: "A3" });

        // Ajustement de la largeur des colonnes
        ws["!cols"] = [
            { wch: 20 }, // Noms
            { wch: 15 }, // Poste
            { wch: 10 }, // Services Points
            { wch: 10 }, // Services Réussis
            { wch: 10 }, // Services Ratés
            { wch: 10 }, // Services Total
            { wch: 10 }, // Attaques Points
            { wch: 10 }, // Attaques Réussis
            { wch: 10 }, // Attaques Ratés
            { wch: 10 }, // Attaques Total
            { wch: 10 }, // Réceptions Réussis
            { wch: 10 }, // Réceptions Ratés
            { wch: 10 }, // Réceptions Total
            { wch: 10 }, // Blocs Points
            { wch: 10 }, // Blocs Réussis
            { wch: 10 }, // Blocs Ratés
            { wch: 10 }, // Blocs Total
            { wch: 10 }, // Passes Ratées
            { wch: 10 }, // Fautes
            { wch: 15 }, // Points joués
            { wch: 15 }  // Performance
        ];

        // Ajouter la feuille au classeur
        XLSX.utils.book_append_sheet(wb, ws, 'Statistiques');

        // Enregistrement du fichier Excel
        const path = `${DIRECTORY_PATH}/PlayerStats_${Date.now()}.xlsx`;

        const excelData = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });

        await RNFS.writeFile(path, excelData, 'base64')
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
    },

    /**
     * Supprime un fichier donné après utilisation.
     * @param filePath Le chemin du fichier à supprimer.
     */
    deleteFile: async (filePath: string) => {
        try {
            const exists = await RNFS.exists(filePath);
            if (exists) {
                await RNFS.unlink(filePath);
                console.log(`Fichier supprimé avec succès : ${filePath}`);
            } else {
                console.warn(`Le fichier n'existe pas : ${filePath}`);
            }
        } catch (error) {
            console.error('Erreur lors de la suppression du fichier :', error);
            throw error;
        }
    },
};

export default ExcelService;
