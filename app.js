// 1. On crée de fausses données (qui viendront plus tard de ta base de données)
const seanceAujourdhui = [
    { nom: "Développé Couché", series: 4, repetitions: 10, poids: "80kg" },
    { nom: "Tirage Poitrine", series: 4, repetitions: 12, poids: "60kg" },
    { nom: "Presse à cuisses", series: 3, repetitions: 15, poids: "120kg" }
];

// 2. On récupère la zone HTML où on veut afficher les exercices
const workoutListDiv = document.getElementById('workout-list');

// 3. On crée une fonction pour afficher les données sur la page
function afficherSeance() {
    workoutListDiv.innerHTML = ''; // On vide la zone au cas où

    seanceAujourdhui.forEach(exercice => {
        // On crée un bloc HTML pour chaque exercice
        const exerciseCard = document.createElement('div');
        exerciseCard.classList.add('exercise-card');
        
        exerciseCard.innerHTML = `
            <h3>${exercice.nom}</h3>
            <p><strong>Séries :</strong> ${exercice.series}</p>
            <p><strong>Répétitions :</strong> ${exercice.repetitions}</p>
            <p><strong>Poids cible :</strong> ${exercice.poids}</p>
            <button>Valider l'exercice ✅</button>
        `;
        
        workoutListDiv.appendChild(exerciseCard);
    });
}

// 4. On lance l'affichage au chargement de la page
afficherSeance();