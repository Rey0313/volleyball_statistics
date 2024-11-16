// /screens/CreatePlayerScreen.tsx
import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, TouchableOpacity } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import DatabaseService from '../services/DatabaseService';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import PlayerStat from '../models/PlayerStat';

type CreatePlayerScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CreatePlayerScreen'>;

interface Props {
    navigation: CreatePlayerScreenNavigationProp;
}

const CreatePlayerScreen: React.FC<Props> = ({ navigation }) => {
    const [name, setName] = useState('');
    const [position, setPosition] = useState('');

    const handleAddPlayer = () => {
        if (name.trim() === '' || position.trim() === '') {
            alert('Veuillez remplir tous les champs');
            return;
        }

        const newPlayer = new PlayerStat(0, name, position);
        DatabaseService.addPlayer(newPlayer);
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Nom du joueur :</Text>
            <TextInput
                style={styles.input}
                placeholder="Entrez le nom du joueur"
                value={name}
                onChangeText={setName}
            />

            <Text style={styles.label}>Poste du joueur :</Text>
            <RNPickerSelect
                onValueChange={(value) => setPosition(value)}
                placeholder={{ label: 'Sélectionnez un poste', value: '' }}
                items={[
                    { label: 'R4', value: 'R4' },
                    { label: 'Pointu', value: 'pointu' },
                    { label: 'Central', value: 'central' },
                    { label: 'Libéro', value: 'libero' },
                    { label: 'Passeur', value: 'passeur' },
                ]}
                style={{
                    inputAndroid: styles.picker,
                    inputIOS: styles.picker,
                    placeholder: { color: '#999' },
                }}
                value={position}
            />

            <TouchableOpacity style={styles.button} onPress={handleAddPlayer}>
                <Text style={styles.buttonText}>Ajouter le joueur</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f7f7f7',
    },
    label: {
        fontSize: 16,
        color: '#333',
        marginBottom: 5,
        marginTop: 15,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    picker: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 12,
        fontSize: 16,
        backgroundColor: '#fff',
        color: '#333',
        marginBottom: 15,
    },
    button: {
        backgroundColor: '#2196F3',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 30,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default CreatePlayerScreen;
