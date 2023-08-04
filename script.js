import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.2/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, getDocs, getDoc, setDoc, doc, arrayUnion, updateDoc, orderBy, limit } from "https://www.gstatic.com/firebasejs/9.8.2/firebase-firestore.js";
// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAq7QQMk068CzNVJrN0YPveydIECpsW80I",
    authDomain: "storefrontsurvey.firebaseapp.com",
    projectId: "storefrontsurvey",
    storageBucket: "storefrontsurvey.appspot.com",
    messagingSenderId: "207565698957",
    appId: "1:207565698957:web:a9b6b57520a924b9cd2fc4"
};

// const popQuestion = "What is your spirit animal?"
// const popAnswers = ["Wolf", "Bear", "Eagle", "Fox", "Owl", "Lion", "Hawk/Falcon", "Dolphin", "Butterfly", "Deer", "Otter", "Snake", "Lizard", "Flamingo", "Salamandar", "Gator", "Shark", "Capybara", "Dragon", "Dave Grohl"]

// const popQuestion = "Which conspiracy theory sounds the most plausible? (Remember this is a silly survey and not to be taken seriously)"
// const popAnswers = [
// "Moon landing is fake",
// "Earth is flat",
// "Government knows about aliens",
// "Illuminati controls the weather",
// "Shape shifting lizard people run the government",
// "Ancient Aliens built the pyramids.",
// "Paul McCartney died and was replaced by a look alike.",
// "Bigfoot exists and owns controlling interest in REI",
// "None, these are ridiculous.",
// "None, these are just distractions from what’s really going on! Wake up sheeple!!!"
// ]

const popQuestion = "Summer Vacation Destinations: Where Would You Rather Be? <span class='esp-question'>Destinos para Vacaciones de Verano: Donde Preferirias Estar?</span>"
const popAnswers = [
    "Tropical Paradise: Relaxing on the beautiful beaches of the Maldives, Bali, or Hawaii and enjoying the crystal-clear waters and white sandy beaches while watching the palm trees swaying gently in the breeze. <span class='esp-answer'>Paraiso Tropical: Relajandote en una hermosa playa disfrutando de las aguas cristalinas y playas de arena.</span>",
    "Adventure Seeker: Embarking on thrilling adventures like bungee jumping in New Zealand, zip-lining through the rainforests of Costa Rica, or hiking and skiing through the Swiss Alps. <span class='esp-answer'>Buscador de Aventuras: Aventuras como salto en bungee, tirolesa de la selva tropical o senderismo en las montañas.</span>",
    "Historical and Cultural Explorers: Learning about our world by visiting historically and culturally-rich destinations like Italy for its ancient ruins, Greece for its mythology, or Japan for its traditional temples and tea ceremonies. <span class='esp-answer'>Exploradores Históricos y Culturales: Aprendiendo sobre nuestro mundo visitando destinos con una rica historia cultural.</span>",
    "City Escapes: Relishing in the hustle and bustle of destination cities like New York City for its iconic landmarks, Paris for its romantic ambiance, or London for its royal grandeur. <span class='esp-answer'>Escapadas a la Ciudad: Disfrutando ciudades como Nueva York por sus icónicos lugares, Paris por su ambiente romantico, o visitar Los Angeles por sus atracciones turisticas.</span>",
    "Nature Retreats: Practicing solitude and connection with nature by taking in the serene landscapes of the Swiss countryside, hiking through the awe-inspiring wilderness of the Canadian Rockies, or appreciating the tranquil and mystical experience of the Norwegian fjords. <span class='esp-answer'>Refugios Naturales: Practicando la soledad y conexion con la naturaleza disfrutando de los serenos paisajes del campo o haciendo senderismo por la naturaleza salvaje.</span>",
    "Staycation: Keeping it low-key by visiting close-to-home national parks, lakes, and resorts…or just staying home. <span class='esp-answer'>Vacaciones en Casa: Manteniendolo tranquilo visitando parques nacionales, lagos o resorts cercanos a casa o simplemente quedandote en casa.</span>"
]


const app = initializeApp(firebaseConfig)
const db = getFirestore()
let currentUser = localStorage.getItem('DPG-user')


if (currentUser) {
    console.log(currentUser);
} else {
    let userId = uuid()
    setDoc(doc(db, "survey", userId), {
    })
        .then(() => {
            localStorage.setItem('DPG-user', userId)
            currentUser = userId;
            console.log(`${userId} set as current user`);
        })
}

function uuid() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

function answerTheQuestion(answer) {
    setDoc(doc(db, "survey", currentUser), {question: popQuestion, answer: answer}, {merge: true})
    console.log(`${popQuestion} = ${answer} - ${currentUser}`)
    checkVote(answer)
}

function votiongConfirmation() {}

function checkVote() {
    const questionMain = document.getElementById("question-main")
    if (!questionMain) {
        return
    }

    try {
        getDoc(doc(db, "survey", currentUser))
        .then((doc) => {
            if ( doc.data().answer ) {
                let lookupAnswer = doc.data().answer
                console.log(lookupAnswer);
                document.querySelectorAll('.option').forEach((option) => {
                    option.classList.remove('selected')
                })
                document.querySelector(`[data-option="${lookupAnswer}"]`).classList.add('selected')
            }
        })
    } catch (error) {
        console.error(error);
    }
}

function questionPopulator(popQuestion, popAnswers) {
    const questionMain = document.getElementById("question-main")

    if (!questionMain) {
        return
    }

    let htmlAnswers = "";

    popAnswers.forEach((answer) => {
        let formattedAnswer = `<div class="option" data-option="${answer}">${answer}</div>`
        htmlAnswers = htmlAnswers + formattedAnswer
    })

    let htmlOutput = `<h2>${popQuestion}</h2>
    ${htmlAnswers}
    `

    questionMain.innerHTML = htmlOutput;
}

function getAllCategoryVotesTable(category) {
    // Finds display table in HTML
    const displayTable = document.getElementById(category)
    if (!displayTable) {
        return
    }
    // Sets up the query, get all users who's CATEGORY in question isn't blank
    let voteDocs = query(collection(db, "survey"), where("question", "==", popQuestion))
    getDocs(voteDocs)
        .then((docs) => {
            // Collects the votes for sorting
            let voteCount = []
            docs.forEach(user => {
                let voteVote = user.data().answer
                // Adds to the count for a user
                voteCount[voteVote] = (voteCount[voteVote] || 0) + 1
            })
            // Sets the category table heading
            let voteTableContent = '<tr><th>Option</th><th>Votes</th></tr>'
            // Sorts the list of contestants by vote count
            const sorted = Object.entries(voteCount)
                .sort(([,a],[,b]) => b-a)
                .reduce((r, [k, v]) => ({...r, [k]: v}), {})
            // Places the sorted list into the HTML table
            for (const [key, value] of Object.entries(sorted)) {
                voteTableContent = voteTableContent + `<tr><td>${key}</td><td>${value}</td></tr>`
            }
            // Places the HTML table data into the DOM
            displayTable.innerHTML = voteTableContent
        })
        .catch((error) => console.error(error))
}

function liveDisplayVotesTable(category) {
    // Finds display table in HTML
    const displayTable = document.getElementById("live")
    if (!displayTable) {
        return
    }
    // Sets up the query, get all users who's CATEGORY in question isn't blank
    let voteDocs = query(collection(db, "survey"), where("question", "==", popQuestion))
    getDocs(voteDocs)
        .then((docs) => {
            // Collects the votes for sorting
            let voteCount = []
            docs.forEach(user => {
                let voteVote = user.data().answer
                // Adds to the count for a user
                voteCount[voteVote] = (voteCount[voteVote] || 0) + 1
            })
            // Sets the category table heading
            let voteTableContent = `<div class="live-row live-header">${popQuestion}</div>`
            // Sorts the list of contestants by vote count
            const sorted = Object.entries(voteCount)
                .sort(([,a],[,b]) => b-a)
                .reduce((r, [k, v]) => ({...r, [k]: v}), {})
            // Places the sorted list into the HTML table
            for (const [key, value] of Object.entries(sorted)) {
                voteTableContent = voteTableContent + `<div class="live-row">${key} - ${value}</div>`
            }
            // Places the HTML table data into the DOM
            displayTable.innerHTML = voteTableContent
            console.log("Information Refreshed.")
            setTimeout(liveDisplayVotesTable, 50000)
        })
        .catch((error) => console.error(error))
    
}

function initialize() {
    
    questionPopulator(popQuestion, popAnswers)

    const options = document.getElementsByClassName("option")
    for (let i = 0; i < options.length; i++) {
        let option = options[i];
        option.addEventListener('click', e  => {
            const data = e.target.getAttribute('data-option')
            answerTheQuestion(data)
        })
    }

    checkVote()
}



getAllCategoryVotesTable('answer')
liveDisplayVotesTable('answer')


initialize();
