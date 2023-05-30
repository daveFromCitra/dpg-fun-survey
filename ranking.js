import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.2/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, getDocs, getDoc, setDoc, doc, arrayUnion, updateDoc, orderBy, limit } from "https://www.gstatic.com/firebasejs/9.8.2/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAq7QQMk068CzNVJrN0YPveydIECpsW80I",
    authDomain: "storefrontsurvey.firebaseapp.com",
    projectId: "storefrontsurvey",
    storageBucket: "storefrontsurvey.appspot.com",
    messagingSenderId: "207565698957",
    appId: "1:207565698957:web:a9b6b57520a924b9cd2fc4"
  };
const app = initializeApp(firebaseConfig)
const db = getFirestore()

function getAllCategoryVotesTable(category) {
    // Finds display table in HTML
    const displayTable = document.getElementById(category)
    // Sets up the query, get all users who's CATEGORY in question isn't blank
    let voteDocs = query(collection(db, "survey"), where(category, "!=", ""))
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
            let voteTableContent = '<tr><th>Contestant</th><th>Votes</th></tr>'
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

function getAllCategoryVotesGraph(category) {
    // Finds corresponding graph area
    const ctx = document.getElementById('charts');

    // Sets up the query, get all users who's CATEGORY in question isn't blank
    let voteDocs = query(collection(db, "users"), where(category, "!=", ""))
    getDocs(voteDocs)
        .then((docs) => {
            // Collects the votes for sorting
            let voteCount = []
            docs.forEach(user => {
                let voteVote = user.data()[category]
                // Adds to the count for a user
                voteCount[voteVote] = (voteCount[voteVote] || 0) + 1
            })
            // Sorts the list of contestants by vote count
            const sorted = Object.entries(voteCount)
                .sort(([,a],[,b]) => b-a)
                .reduce((r, [k, v]) => ({...r, [k]: v}), {})
            // Places the sorted list into the HTML table
            let voteLabels = []
            let voteData = []
            for (const [key, value] of Object.entries(sorted)) {
                voteLabels.length < 5 ? voteLabels.push(key) : console.log(key)
                voteData.length < 5 ? voteData.push(value) : console.log(value)
                // voteLabels.push(key)
                // voteData.push(value)

            }
            // Sets up a new chart object from a class
            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: voteLabels,
                    datasets: [{
                        label: 'Votes',
                        data: voteData,
                        borderWidth: 1
                    }]
                },
                options: {

                }
            })
        })
        .catch((error) => console.error(error))
}

getAllCategoryVotesTable('answer')
// getAllCategoryVotesGraph('answer')