// Import necessary Firebase modules and the configuration
import { firebaseConfig } from './config.js';

// Initialize Firebase
const firebaseApp = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const userName = document.getElementById("name1");
const submitBtn = document.getElementById("submitBtn1");
const loadingDiv = document.getElementById("loadingDiv");

const { PDFDocument, rgb } = PDFLib;

const capitalize = (str, lower = false) =>
    (lower ? str.toLowerCase() : str).replace(/(?:^|\s|["'([{])+\S/g, (match) =>
        match.toUpperCase()
    );

submitBtn.addEventListener("click", async() => {
    const val = capitalize(userName.value);
    let jo = val;
    loadingDiv.classList.toggle("hidden");

    if (val.trim() !== "" && userName.checkValidity()) {
        try {
            await saveNameToFirestore(jo); // Save to Firestore
            generatePDF(val); // Generate the PDF
            loadingDiv.classList.toggle("show");
        } catch (error) {
            console.error("Error saving to Firestore:", error);
        }
    } else {
        userName.reportValidity();
    }
});

// Function to save the name to Firestore
const saveNameToFirestore = async(jo) => {
    try {
        // Automatically log the user in
        const userCredential = await auth.signInWithEmailAndPassword("tesliantech@gmail.com", "12345678");
        console.log("User logged in automatically:", userCredential.user);

        const user = auth.currentUser;
        if (!user) {
            throw new Error("User is not logged in.");
        }

        const userId = user.uid; // Get the user ID
        const nameRef = db.collection("crt").doc(jo).collection('crt');

        await nameRef.add({
            name: jo,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        });

        console.log("Name saved to Firestore:", jo);
    } catch (error) {
        console.error("Error saving name to Firestore:", error);
        throw error; // Rethrow the error to handle it in the caller
    }
};

// Function to generate a PDF
const generatePDF = async(name) => {
    const existingPdfBytes = await fetch("./cert.pdf").then((res) => res.arrayBuffer());

    // Load a PDFDocument from the existing PDF bytes
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    pdfDoc.registerFontkit(fontkit);

    // Get font
    const fontBytes = await fetch("./Sanchez-Regular.ttf").then((res) => res.arrayBuffer());
    const SanChezFont = await pdfDoc.embedFont(fontBytes);

    // Get the first page of the document
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    // Get the current date and format it
    const today = new Date();
    const options = { year: "numeric", month: "long", day: "numeric" };
    const formattedDate = ` ${today.toLocaleDateString("en-US", options)}`;

    // Draw the user's name
    firstPage.drawText(name, {
        x: 170,
        y: 370,
        size: 30,
        font: SanChezFont,
        color: rgb(0.55294, 0.14902, 0.0), // #8D2600
    });

    // Draw the current date
    firstPage.drawText(formattedDate, {
        x: 400,
        y: 100,
        size: 12,
        font: SanChezFont,
        color: rgb(0, 0, 0), // Black color
    });

    // Serialize the PDFDocument to bytes (a Uint8Array)
    const pdfBytes = await pdfDoc.save();
    console.log("PDF creation completed.");

    // Save the PDF as a file
    const file = new File([pdfBytes], "istdevcertificate.pdf", {
        type: "application/pdf;charset=utf-8",
    });
    saveAs(file);
};