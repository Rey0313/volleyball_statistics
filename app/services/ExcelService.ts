// /services/ExcelService.ts
import XLSX from 'xlsx';
import RNFS from 'react-native-fs';
import PlayerStat from '../models/PlayerStat';

/**
 * Gère l'exportation des statistiques de joueurs en fichier Excel.
 */
const ExcelService = {
    exportPlayerStats: (players: PlayerStat[]) => {
        const ws = XLSX.utils.json_to_sheet(players);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'PlayersStats');
        
        const path = `${RNFS.DocumentDirectoryPath}/PlayerStats.xlsx`;
        const excelData = XLSX.write(wb, { type: 'binary', bookType: 'xlsx' });
        
        return RNFS.writeFile(path, excelData, 'ascii')
            .then(() => path)
            .catch((error) => console.error('Exportation échouée : ', error));
    },
};

export default ExcelService;
