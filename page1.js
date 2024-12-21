import { firebaseConfig } from "./config.js";

const firebaseApp = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const signoutBtn = document.querySelector("#signoutbtn");
const inputBox = document.querySelector("#input_box");
const listContainer = document.querySelector("#list-container");
const addBtn = document.querySelector("#add");

// Automatically login the user with email and password
auth.signInWithEmailAndPassword("tesliantech@gmail.com", "12345678")
    .then((userCredential) => {
        console.log("User logged in automatically:", userCredential.user);
    })
    .catch((error) => {
        console.error("Error during auto-login:", error.message);
    });

// Monitor authentication state
auth.onAuthStateChanged((user) => {
    if (user) {
        console.log("User is logged in:", user);
        displayTasksInUL(user);
    } else {
        console.log("User is not logged in.");
    }
});

// Add new task
addBtn.addEventListener("click", () => {
    console.log("Adding");
    if (inputBox.value === "") {
        alert("You must write something!");
    } else {
        const taskText = inputBox.value.trim();
        if (taskText) {
            addTaskToFirestore(taskText);
            inputBox.value = "";
        }
    }
});

function addTaskToFirestore(taskText) {
    const user = auth.currentUser;
    if (user) {
        const userId = user.uid;
        const tasksRef = db.collection("crt").doc('crt').collection("crt");
        tasksRef
            .add({
                text: taskText,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            })
            .then(() => {
                console.log("Task added to Firestore");
            })
            .catch((error) => {
                console.error("Error adding task to Firestore:", error);
            });
    } else {
        console.error("User is not logged in.");
    }
}

// Task interaction
listContainer.addEventListener("click", function(e) {
    if (e.target.tagName === "LI") {
        e.target.classList.toggle("checked");
    } else if (e.target.tagName === "SPAN") {
        const taskId = e.target.parentElement.getAttribute("data-task-id");
        if (taskId) {
            removeTaskFromFirestore(taskId);
        } else {
            console.error("TaskId is empty or undefined.");
        }
    }
});

// Display tasks in the list
function displayTasksInUL(user) {
    if (user) {
        const userId = user.uid;
        const tasksRef = db.collection("crt").doc('crt').collection("crt");
        tasksRef.onSnapshot((snapshot) => {
            const ul = listContainer;
            ul.innerHTML = "";
            snapshot.forEach((doc) => {
                const taskData = doc.data();
                const li = document.createElement("li");
                li.textContent = taskData.text;
                li.setAttribute("data-task-id", doc.id);
                const span = document.createElement("span");
                span.innerHTML = "\u00d7";
                li.appendChild(span);
                ul.appendChild(li);
            });
        });
    } else {
        console.error("User is not logged in.");
    }
}

// Sign out user
signoutBtn.addEventListener("click", () => {
    auth
        .signOut()
        .then(() => {
            console.log("User signed out successfully");
            location.href = "index.html";
        })
        .catch((error) => {
            alert("Error signing out: " + error.message);
        });
});

function removeTaskFromFirestore(taskId) {
    const user = auth.currentUser;
    if (user) {
        const userId = user.uid;
        if (taskId) {
            const taskRef = db
                .collection("crt")
                .doc('crt')
                .collection("crt")
                .doc(taskId);
            taskRef
                .delete()
                .then(() => {
                    console.log("Task removed from Firestore");
                })
                .catch((error) => {
                    console.error("Error removing task from Firestore:", error);
                });
        } else {
            console.error("TaskId is empty or undefined.");
        }
    } else {
        console.error("User is not logged in.");
    }
}