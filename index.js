const login = require("itz-ur-raza");
const fs = require("fs");
const axios = require("axios");
const express = require("express");
const { GoogleGenAI } = require("@google/genai");
const handleCommands = require("./commands");

const app = express();
app.get("/", (_, res) => res.send("<h1>Yuvi Family & AI Smart Bot Active 🤖✨</h1>"));
app.listen(process.env.PORT || 3000);

if (!fs.existsSync("./cache")) fs.mkdirSync("./cache");

// 🔑 Yahan apni Gemini API Key daalein
const ai = new GoogleGenAI({ apiKey: "YOUR_GEMINI_API_KEY_HERE" });

const OWNER_ID = "61595178507849";
const stateFile = "appstate1.json";

function startInstance() {
  try {
    if (!fs.existsSync(stateFile)) {
      console.log(`⚠️ ${stateFile} missing! Bot cannot start.`);
      return;
    }

    const state = JSON.parse(fs.readFileSync(stateFile, "utf8"));
    login({ appState: state }, (err, api) => {
      if (err) {
        console.error(`❌ Login Error:`, err);
        return setTimeout(() => startInstance(), 15000);
      }

      api.setOptions({ listenEvents: true, selfListen: false, autoMarkRead: true });
      const botID = api.getCurrentUserID();
      console.log(`✅ Family AI Bot Running Successfully (Bot ID: ${botID}).`);

      api.listenMqtt(async (err, event) => {
        if (err || !event) return;
        
        // Debugging ke liye terminal par message print karega
        if (event.body) {
          console.log(`📩 [MSG RECEIVED] From: ${event.senderID} | Text: ${event.body}`);
        }

        const threadID = event.threadID;
        const senderID = event.senderID;
        const body = event.body;

        if (!body || senderID === botID) return;

        // --- ⌨️ COMMANDS (! se shuru hone wale messages) ---
        if (body.startsWith("!")) {
          const args = body.slice(1).trim().split(/\s+/);
          const cmd = args.shift().toLowerCase();
          
          try {
            console.log(`⚡ Executing Command: ${cmd}`);
            await handleCommands({ 
              api, event, args, cmd, OWNER_ID, 
              input: args.join(" ") 
            });
          } catch (e) {
            console.error("Command Error:", e);
          }
          return;
        }

        // --- 🤖 SMART AI CHAT (Normal Messages - Bina !) ---
        try {
          api.sendTypingIndicator(threadID, true);

          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Aap ek friendly aur funny AI bot hain jo Facebook group mein sabke sath masti karta hai aur Hindi/Hinglish mein jawaab deta hai. User ka message yeh hai: "${body}"`,
          });

          const aiReply = response.text || "Arre wah! Sahi hai. 😄";
          api.sendMessage(aiReply, threadID, event.messageID);
        } catch (error) {
          console.error("AI Error:", error.message);
        }
      });
    });
  } catch (e) { 
    console.error(`Initialization error:`, e);
    setTimeout(() => startInstance(), 15000); 
  }
}

startInstance();
