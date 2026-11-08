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

// 🔑 Initialize official GoogleGenAI
const ai = new GoogleGenAI({ apiKey: "AQ.Ab8RN6KIOgO612OTXXpEvlcAJFmR4TKEzbEQDSXIkKYqpwh31g" });

const OWNER_ID = "61595178507849";
const stateFile = "appstate1.json";

// Welcome aur Leave ke liye direct video links
const WELCOME_VIDEO_URL = "https://www.image2url.com/r2/default/videos/1794084612727-a30ff310-2c6f-4868-8de9-bb6131b7570c.mp4";
const LEAVE_VIDEO_URL = "https://www.image2url.com/r2/default/videos/1794084791089-dc70a41d-c4ec-4790-a86d-ee617b69c542.mp4";

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

        const threadID = event.threadID;
        const senderID = event.senderID;
        const body = event.body;

        // --- 🎉 WELCOME & LEAVE EVENT HANDLING ---
        if (event.type === "event" || event.logMessageType === "log:subscribe" || event.logMessageType === "log:unsubscribe") {
          try {
            const addedParticipants = event.logMessageData?.addedParticipants || [];
            const leftParticipantFbId = event.logMessageData?.leftParticipantFbId;

            // 1. Welcome Member with Video Song
            if (event.logMessageType === "log:subscribe" && addedParticipants.length > 0) {
              for (let participant of addedParticipants) {
                const name = participant.fullName || "Dost";
                const welcomeText = `✨ Welcome to the Family, ${name}! 🎉\n\nAapka dil se swagat hai is group mein! Masti karo, enjoy karo! 🎶❤️`;
                
                try {
                  const videoStream = await axios.get(WELCOME_VIDEO_URL, { responseType: 'stream' });
                  api.sendMessage({
                    body: welcomeText,
                    attachment: videoStream.data
                  }, threadID);
                } catch (vidErr) {
                  api.sendMessage(welcomeText, threadID);
                }
              }
            }

            // 2. Leave Member with Sad Video Song
            if (event.logMessageType === "log:unsubscribe" || leftParticipantFbId) {
              const sadText = `😔 Ek saathi chala gaya group chhod kar... Bahut yaad aaogi/aayega! Take care! 💔`;
              
              try {
                const videoStream = await axios.get(LEAVE_VIDEO_URL, { responseType: 'stream' });
                api.sendMessage({
                  body: sadText,
                  attachment: videoStream.data
                }, threadID);
              } catch (vidErr) {
                api.sendMessage(sadText, threadID);
              }
            }
          } catch (err) {
            console.error("Welcome/Leave Event Error:", err);
          }
          return;
        }

        if (!body || senderID === botID) return;

        // --- ⌨️ COMMANDS ---
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

        // --- 🤖 SMART AI CHAT ---
        try {
          console.log(`💬 AI Processing message from ${senderID}: ${body}`);

          const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: `Aap ek friendly aur funny AI bot hain jo Facebook group mein sabke sath masti karta hai aur Hinglish mein mazedaar jawaab deta hai. User ka message yeh hai: "${body}"`,
          });

          const aiReply = response.text || "Arre wah! Sahi hai. 😄";
          api.sendMessage(aiReply, threadID, event.messageID);
        } catch (error) {
          console.error("❌ Exact AI Error:", error);
          api.sendMessage(`🤖 AI Error: ${error.message || "Kuch gadbad ho gayi!"}`, threadID, event.messageID);
        }
      });
    });
  } catch (e) { 
    console.error(`Initialization error:`, e);
    setTimeout(() => startInstance(), 15000); 
  }
}

startInstance();
