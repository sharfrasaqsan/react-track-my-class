# Track My Class

[![Live Demo](https://img.icons8.com/?size=100&id=UyjPlooIqDBC&format=png&color=000000)](https://track-my-class.vercel.app/) 

A web application designed to help teachers manage their classes, track schedules, and monitor student fees.

## Features and Functionality

-   **Dashboard:** Provides an overview of the day's sessions, monthly completions, active classes, and upcoming sessions.
-   **Class Management:**
    -   Create, edit, and delete classes.
    -   Define class schedules with specific days and times.
    -   Set capacity and fees per student.
    -   Track attendance and mark classes as completed.
-   **User Authentication:** Secure user registration and login using Firebase Authentication.
-   **Fee Tracking:** Monitor expected, collected, and due fees for each class on a monthly basis.
-   **Protected Routes:** Ensure that only authenticated users can access specific pages.
-   **Responsive Design:** Provides a user-friendly experience on various devices.

## Technology Stack

-   **React:** A JavaScript library for building user interfaces.
-   **React Router:** A standard library for routing in React.
-   **Firebase:**
    -   **Authentication:** For user authentication (login/register).
    -   **Firestore:** For storing application data, including user profiles, classes, schedules, and fee information.
-   **Bootstrap:** A CSS framework for responsive design and styling.
-   **Sonner:** For displaying toast notifications.

## Prerequisites

Before you begin, ensure you have the following installed:

-   **Node.js:** (version >= 16)  - [https://nodejs.org/](https://nodejs.org/)
-   **npm** or **yarn:** Package managers for installing dependencies.
-   **Firebase Project:** You'll need a Firebase project to configure authentication and Firestore.  Create a project at [https://console.firebase.google.com/](https://console.firebase.google.com/)

## Installation Instructions

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/sharfrasaqsan/react-track-my-class.git
    cd react-track-my-class
    ```

2.  **Install dependencies:**

    Using npm:

    ```bash
    npm install
    ```

    Using yarn:

    ```bash
    yarn install
    ```

3.  **Configure Firebase:**

    -   Create a `src/firebase/Config.js` file (if it doesn't already exist, it is already created).
    -   Replace the placeholder values with your Firebase project credentials.  You can find these credentials in the Firebase console under Project settings.
    ```javascript
    import { initializeApp } from "firebase/app";
    import { getAuth } from "firebase/auth";
    import { getFirestore } from "firebase/firestore";

    const firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_PROJECT_ID.appspot.com",
      messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
      appId: "YOUR_APP_ID",
      measurementId: "YOUR_MEASUREMENT_ID"
    };

    const app = initializeApp(firebaseConfig);

    export const auth = getAuth(app);
    export const db = getFirestore(app);
    ```

4.  **Environment Variables (if needed):**  This project does not directly utilize `.env` files for configuration within the provided code. However, if you plan to expand the project and require environment variables, you would create a `.env` file in the root directory and access the variables using `process.env.VARIABLE_NAME`.

## Usage Guide

1.  **Start the development server:**

    Using npm:

    ```bash
    npm start
    ```

    Using yarn:

    ```bash
    yarn start
    ```

2.  **Open the application in your browser:** Navigate to `http://localhost:3000` (or the address provided by the development server).

3.  **Register or Login:** Create a new account or log in with your existing credentials.

4.  **Navigate the Application:**

    -   **Dashboard:** View a summary of your classes and activities.
    -   **Classes:** Manage your classes (add, edit, delete).  Access this page via the Navbar or `http://localhost:3000/classes`.
    -   **Today:** See the schedule for the current day. Access via the Navbar or `http://localhost:3000/today`.
    -   **Add Class:** Create a new class. Access via the Navbar -> Classes, then click '+ Add Class', or directly at `http://localhost:3000/add-class`.
    -   **Edit Class:**  Modify existing class details. Access by navigating to Classes and then clicking "Edit" button of the class or directly at `http://localhost:3000/classes/edit/:id`.

## API Documentation

This project uses Firebase Authentication and Firestore, and relies on their respective APIs. Please refer to the official Firebase documentation for detailed API usage:

-   **Firebase Authentication:** [https://firebase.google.com/docs/auth](https://firebase.google.com/docs/auth)
-   **Firestore:** [https://firebase.google.com/docs/firestore](https://firebase.google.com/docs/firestore)

Specific API calls used within the codebase:

-   `createUserWithEmailAndPassword(auth, email, password)` (src/pages/Register.js): Creates a new user with email and password.
-   `signInWithEmailAndPassword(auth, email, password)` (src/pages/Login.js): Signs in an existing user with email and password.
-   `signOut(auth)` (src/components/Logout.js): Signs out the current user.
-   `getDoc(doc(db, "users", currentUser.uid))` (src/context/AuthContext.js): Retrieves user data from Firestore.
-   `addDoc(collection(db, "classes"), newClass)` (src/pages/AddClass.js): Adds a new class document to Firestore.
-   `updateDoc(doc(db, "classes", classId), updatedClass)` (src/pages/EditClass.js): Updates an existing class document in Firestore.
-   `deleteDoc(doc(db, "classes", classId))` (src/components/class/ClassCard.js): Deletes a class document from Firestore.
-   `getDocs(collection(db, "users"))` (src/context/DataContext.js): Retrieves all users from Firestore.
-   `getDocs(collection(db, "classes"))` (src/context/DataContext.js): Retrieves all classes from Firestore.

## Contributing Guidelines

Contributions are welcome! To contribute to this project, please follow these guidelines:

1.  **Fork the repository.**
2.  **Create a new branch** for your feature or bug fix.  Name your branch descriptively (e.g., `feature/add-fee-tracking`, `fix/login-error`).
3.  **Make your changes** and ensure your code adheres to the existing style and conventions.
4.  **Test your changes** thoroughly.
5.  **Commit your changes** with clear and concise commit messages.
6.  **Push your branch** to your forked repository.
7.  **Submit a pull request** to the `main` branch of the original repository.  Provide a detailed description of your changes in the pull request.

## License Information

No license has been specified for this project. All rights are reserved.

## Contact/Support Information

For questions, bug reports, or feature requests, please contact the repository owner through GitHub.  You can open an issue on the repository to report any problems or suggest improvements.
