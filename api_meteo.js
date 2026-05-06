/**
 * PROJET INSTANT WEATHER - JavaScript Main File
 * Gère l'interaction avec l'API Géo et l'API MétéoConcept
 */

// --- CONFIGURATION ET ÉLÉMENTS DU DOM ---
const TOKEN = '2a3e746581f7263d2e204e3da50ddca81177dad906c37b747fc1885c1a54881c';
const GEO_API_URL = 'https://geo.api.gouv.fr/communes?codePostal=';
const METEO_API_URL = 'https://api.meteo-concept.com/api/forecast/daily/0'; // Forecast du jour (V1)

const inputCP = document.getElementById('inputCP');
const btnChercher = document.getElementById('btnChercher');
const selectVille = document.getElementById('selectVille');
const divResultats = document.getElementById('resultatsMeteo');

// --- ÉTAPE 1 : RECHERCHER LES COMMUNES ---
// Permet à l'utilisateur de saisir un code postal puis de choisir la commune[cite: 1]
btnChercher.addEventListener('click', async () => {
    const cp = inputCP.value;

    // Validation simple du code postal
    if (!/^\d{5}$/.test(cp)) {
        alert("Veuillez saisir un code postal valide à 5 chiffres.");
        return;
    }

    try {
        const response = await fetch(`${GEO_API_URL}${cp}`);
        const communes = await response.json();

        if (communes.length === 0) {
            alert("Aucune ville trouvée pour ce code postal.");
            return;
        }

        // Nettoyage et remplissage du sélecteur de villes
        selectVille.innerHTML = '<option value="">-- Sélectionnez votre commune --</option>';
        communes.forEach(ville => {
            const option = document.createElement('option');
            option.value = ville.code; // On stocke le code INSEE pour l'étape suivante[cite: 1]
            option.textContent = ville.nom;
            selectVille.appendChild(option);
        });

        selectVille.style.display = 'block';
        divResultats.innerHTML = ''; // Reset des résultats précédents
    } catch (error) {
        console.error("Erreur API Géo :", error);
    }
});

// --- ÉTAPE 2 : RÉCUPÉRER LA MÉTÉO ---
// Utilisation du code INSEE sélectionné pour interroger MétéoConcept[cite: 1]
selectVille.addEventListener('change', async () => {
    const codeInsee = selectVille.value;
    if (!codeInsee) return;

    try {
        const response = await fetch(`${METEO_API_URL}?token=${TOKEN}&insee=${codeInsee}`);
        if (!response.ok) throw new Error("Erreur de réponse API Météo");
        
        const data = await response.json();
        afficherMeteo(data.city.name, data.forecast);
    } catch (error) {
        console.error("Erreur API MétéoConcept :", error);
        divResultats.innerHTML = "<p>Erreur lors de la récupération des données météo.</p>";
    }
});

// --- ÉTAPE 3 : AFFICHAGE DYNAMIQUE (Version de base V1) ---
// Intégration dynamique du contenu dans la page HTML via le DOM[cite: 1]
function afficherMeteo(ville, info) {
    // Extraction des données requises : Tmin, Tmax, Probabilité de pluie, Ensoleillement[cite: 1]
    divResultats.innerHTML = `
        <div class="weather-card">
            <h3>Météo à ${ville}</h3>
            <p><strong>Température minimale :</strong> ${info.tmin}°C</p>
            <p><strong>Température maximale :</strong> ${info.tmax}°C</p>
            <p><strong>Probabilité de pluie :</strong> ${info.probarain}%</p>
            <p><strong>Ensoleillement :</strong> ${info.sun_hours} h</p>
        </div>
    `;
    
    // Note pour le groupe : Pour la V2, ajoutez ici la logique des cases à cocher 
    // pour afficher le vent, la pluie en mm ou les coordonnées[cite: 1].
}
