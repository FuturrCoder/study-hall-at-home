/*
 * Copyright (c) 2020.
 */

let firestore = firebase.firestore()

MicroModal.init({
    onShow: modal => console.log(`${modal.id} is shown`),
    onClose: modal => console.log(`${modal.id} is hidden`),
    openTrigger: 'data-custom-open',
    closeTrigger: 'data-custom-close',
    openClass: 'is-open',
    disableScroll: true,
    disableFocus: false,
    awaitOpenAnimation: false,
    awaitCloseAnimation: false,
    debugMode: false
})

let roomForm = document.getElementById("roomForm")
function roomFormSubmit(event) { event.preventDefault() }
roomForm.addEventListener("submit", roomFormSubmit)

function showMembers(link, id) {
    fetch(`https://bitly-link-clicks.herokuapp.com/?link=${link}`)
        .then(response => response.text())
        .then(data => {
            for (let i = 0; i < parseInt(data); i++) {
                let membersList = document.getElementById(id)
                let icon = document.createElement("I")
                icon.className = "material-icons"
                icon.appendChild(document.createTextNode("person"))
                icon.style.fontSize = "14px"
                icon.style.color = "#e31e2d"

                membersList.appendChild(icon)
            }
        })
        .catch(error => {
            console.error("Error fetching link clicks: ", error)
            alert("Error: " + error)
        })
}

function loadRooms() {
    firestore.collection("rooms").get().then(function(querySnapshot) {
        let count = 0
        let roomsTable = document.getElementById("rooms")

        querySnapshot.forEach(function(doc) {
            let data = doc.data()
            if (data.expire <= Date.now()) {
                console.log("Deleting expired document: ", doc.id, "...")
                firestore.collection("rooms").doc(doc.id).delete().then(() => {
                    console.log("deleted")
                }).catch(error => {
                    console.error("Error deleting document: ", error);
                })
            } else {
                let row, cell
                if (count % 4 === 0) {
                    row = roomsTable.insertRow(roomsTable.rows.length)
                    cell = row.insertCell(0)
                } else {
                    row = roomsTable.rows[roomsTable.rows.length - 1]
                    cell = row.insertCell(row.cells.length)
                }
                cell.innerHTML = `<h2>${doc.id}</h2>
                    <div id="members${count}" title="Number of times the Zoom link was clicked in the past hour"></div>
                    <a class="joinButton" href="${data.url}" target="_blank">Join Room</a>`
                showMembers(data.url, "members" + count)

                count ++
            }
        })
    }).catch(function(error) {
        console.error("Error getting documents: ", error)
        alert("Error: " + error)
    })
}

function newRoom() {
    MicroModal.show("modal-1")
}

function createRoom() {
    let topic = document.getElementById("topicInput").value
    let expiry = document.getElementById("expiry").value

    if (topic && user && (!isNaN(expiry) || expiry.toLowerCase() === "forever")) {
        document.getElementById("createButton").innerHTML = "<div class='loader'></div>"

        fetch(`https://study-hall-at-home.herokuapp.com/?topic=${topic}`)
            .then(response => response.text())
            .then(data => {
                console.log(data)
                if (data && data !== "false") {
                    if (expiry.toLowerCase() === "forever") {
                        expiry = 100000
                    } else {
                        expiry = +expiry
                    }
                    let expirationDate = Date.now() + 3600000 * expiry
                    firestore.collection("rooms").doc(topic).set({
                        url: data,
                        creator: user.uid,
                        expire: expirationDate
                    })
                        .then(function() {
                            document.getElementById("createButton").innerHTML = "Create"
                            location.reload()
                        })
                        .catch(function(error) {
                            console.error("Error writing document: ", error)
                            alert("Error: " + error)
                        })
                } else {
                    alert("Error: Failed to create new Zoom room")
                }
            })
            .catch(error => {
                console.error("Error creating new Zoom room: ", error)
                alert("Error: " + error)
            })
    } else {
        alert("Error: Failed to create new Zoom room")
    }
}