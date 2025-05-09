//FIREBASE
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue } from "firebase/database";

import EventEmitter from "@onemorestudio/eventemitterjs";
// extend the class with a custom event emitter to be able to listen when data are received
export default class Firebase extends EventEmitter {
  constructor() {
    super();

    const firebaseConfig = {
        apiKey: "AIzaSyB2rEMsJcgt5AK2C1s43o8y-uKveautYkg",
        authDomain: "datavizzhb.firebaseapp.com",
        databaseURL: "https://datavizzhb-default-rtdb.europe-west1.firebasedatabase.app",
        projectId: "datavizzhb",
        storageBucket: "datavizzhb.firebasestorage.app",
        messagingSenderId: "278924614985",
        appId: "1:278924614985:web:1f9067c329b0fda5b24e98"
      };

      // Initialize Firebase
    
      this.app = initializeApp(firebaseConfig);

    this.DATABASE = getDatabase();

    console.log(this.DATABASE);
    //
    this.resume = false;
    //path
    const path = ref(this.DATABASE, `remoteControl`);
    //
    onValue(path, (snapshot) => {
      if (!this.resume) {
        this.resume = true;
      } else {
        const val = snapshot.val();
        console.log("----------val", val);
        this.emit("dataReceived", [val]);
      }
    });
  }

  send(_path, _val) {
    const path = ref(this.DATABASE, _path);
    console.log(path, _val);
    set(path, _val);
  }
  
  /**
   * Sends a filter command to trigger a specific filter button
   * @param {string} buttonId - The ID of the button to trigger (e.g., 'male', 'female', 'adult')
   */
  sendFilterCommand(buttonId) {
    this.send('remoteControl', {
      id: buttonId,
      timestamp: Date.now()
    });
  }
}