const login = require("itz-ur-raza");
const fs = require("fs");
const axios = require("axios");
const express = require("express");
const handleCommands = require("./commands");

const app = express();
app.get("/", (_, res) => res.send("<h1>Yuvi Family & Real AI Bot Active 🤖✨</h1>"));
app.listen(process.env.PORT || 3000);

if (!fs.existsSync("./cache")) fs.mkdirSync("./cache");

// 🔑 Teri nayi API Key
const AI_API_KEY = "sk-tinyfish-A7Tu3gGetsWItTyuTL1JAGgwm0m5NsAW";

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
      console.log(`✅ Real AI Bot Running Successfully (Bot ID: ${botID}).`);

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

            if (event.logMessageType === "log:unsubscribe" || leftParticipantFbId) {
              const sadText = `😔 Ek saathi chala gaya group chhod kar... Bahut yaad aayega! Take care! 💔`;
              
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

        // --- 🤖 HIGH-LEVEL AI CHAT INTEGRATION ---
        try {
          console.log(`💬 AI Processing message from ${senderID}: ${body}`);

          const aiResponse = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
              model: "gpt-3.5-turbo",
              messages: [
                {
                  role: "system",
                  content: "Tu ek mast, funny aur friendly AI bot hai jo Facebook group mein sabke sath dosto ki tarah Hinglish mein baat karta hai. User ke har sawaal ka bilkul natural aur alag jawaab de."
                },
                {
                  role: "user",
                  content: body
                }
              ]
            },
            {
              headers: {
                "Authorization": `Bearer ${AI_API_KEY}`,
                "Content-Type": "application/json"
              }
            }
          );

          const aiReply = aiResponse.data?.choices?.[0]?.message?.content;

          if (aiReply) {
            api.sendMessage(aiReply.trim(), threadID, event.messageID);
          } else {
            throw new Error("Empty AI Response");
          }

        } catch (error) {
          console.error("❌ Primary AI Error:", error.response?.data || error.message);
          
          // Smart backup call if standard endpoint differs
          try {
            const backupRes = await axios.get(`https://api.kenliejugarap.com/openai/?text=${encodeURIComponent(body)}`);
            const backupReply = backupRes.data?.response || backupRes.data?.result;
            if (backupReply) {
              api.sendMessage(backupReply, threadID, event.messageID);
              return;
            }
          } catch (e) {}

          api.sendMessage(`Bhai "${body}" par soch raha hu, thoda aur detail mein bol! 😄`, threadID, event.messageID);
        }
      });
    });
  } catch (e) { 
    console.error(`Initialization error:`, e);
    setTimeout(() => startInstance(), 15000); 
  }
}

startInstance();
