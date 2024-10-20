/*
 * Copyright (c) 2020.
 */

let auth = firebase.auth()
let user

auth.onAuthStateChanged((u) => {
    if (u) {
        console.log(u)
        user = u

        document.querySelector(".menuButton.hidden").classList.remove("hidden")
        document.querySelector("#signOutButton").classList.remove("hidden")
        document.querySelector("#signInButton").classList.add("hidden")
        try {
            document.querySelector("#googleSignIn").classList.add("hidden")
        } catch (e) {}

        loadRooms()
    } else {
        console.log("Not signed in")
        try {
            document.querySelector("#root").innerHTML = "<span>Please sign in to continue: </span>" +
                "<button id='googleSignIn' class='gButton' onclick='signInWithGoogle()'>Sign In With Google</button>"
        } catch (e) {}
    }
})

function signInWithGoogle() {
    let provider = new firebase.auth.GoogleAuthProvider()
    provider.addScope("profile")
    provider.addScope("email")
    provider.setCustomParameters({
        "hd": "commschool.org"
    })
    firebase.auth().signInWithRedirect(provider)

    firebase.auth().getRedirectResult().catch(function(error) {
        console.error(error)
        alert("Error: " + error.message)
    })
}

function signOut() {
    auth.signOut().then(() => {
        location.reload()
    }).catch(error =>{
        alert(`Error: ${error.message}`)
    })
}