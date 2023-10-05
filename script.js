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

// const popQuestion = "If you had a time machine, which era would you most want to visit for a day? <span class='esp-question'>Si tuvieras una máquina del tiempo, ¿a qué época te gustaría visitar por un día?</span>"
// const popAnswers = [
//     "The Roaring Twenties <span class='esp-answer'>Los Años Locos (Década de 1920)</span>",
//     "The Age of Dinosaurs <span class='esp-answer'>La Era de los Dinosaurios</span>",
//     "The Future <span class='esp-answer'>El Futuro</span>",
//     "Ancient Egypt <span class='esp-answer'>El Antiguo Egipto</span>",
//     "The Renaissance <span class='esp-answer'>El Renacimiento</span>",
// ]

const popQuestion = "What kind of Halloween costume do you prefer? <span class='esp-question'>¿Qué tipo de disfraz de Halloween prefieres?</span>"

const popAnswers = [
"Spooky Costumes  - Frankenstein, Vampire, Fredy Krugger, ect. <span class='esp-answer'>Disfraces espeluznantes - Frankenstein, Vampiro, Freddy Krueger, etc</span>",
"Silly - A man riding an ostrich, A President, Santa Claus,  ect. <span class='esp-answer'>Tontos - Un hombre montando un avestruz, Un presidente, Santa Claus, etc</span>",
"Cute costumes- Pumpkin, Bumblebee Cat,  ect. <span class='esp-answer'>Disfraces lindos - Calabaza, Abejorro, Gato, etc</span>"
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
