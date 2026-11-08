const login = require("itz-ur-raza");
const fs = require("fs");
const axios = require("axios");
const express = require("express");
const handleCommands = require("./commands");

const app = express();
app.get("/", (_, res) => res.send("<h1>Yuvi Family & AI Bot Active 🤖✨</h1>"));
app.listen(process.env.PORT || 3000);

if (!fs.existsSync("./cache")) fs.mkdirSync("./cache");

const OWNER_ID = "61595178507849";
const stateFile = "appstate1.json";

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
      console.log(`✅ Bot Running Successfully (Bot ID: ${botID}).`);

      api.listenMqtt(async (err, event) => {
        if (err || !event) return;

        const threadID = event.threadID;
        const senderID = event.senderID;
        const body = event.body;

        // --- 🎉 WELCOME & LEAVE ---
        if (event.type === "event" || event.logMessageType === "log:subscribe" || event.logMessageType === "log:unsubscribe") {
          try {
            const addedParticipants = event.logMessageData?.addedParticipants || [];
            const leftParticipantFbId = event.logMessageData?.leftParticipantFbId;

            if (event.logMessageType === "log:subscribe" && addedParticipants.length > 0) {
              for (let participant of addedParticipants) {
                const name = participant.fullName || "Dost";
                const welcomeText = `✨ Welcome to the Family, ${name}! 🎉\n\nAapka dil se swagat hai is group mein! Masti karo! 🎶❤️`;
                try {
                  const videoStream = await axios.get(WELCOME_VIDEO_URL, { responseType: 'stream' });
                  api.sendMessage({ body: welcomeText, attachment: videoStream.data }, threadID);
                } catch (vidErr) {
                  api.sendMessage(welcomeText, threadID);
                }
              }
            }

            if (event.logMessageType === "log:unsubscribe" || leftParticipantFbId) {
              const sadText = `😔 Ek saathi chala gaya group chhod kar... Take care! 💔`;
              try {
                const videoStream = await axios.get(LEAVE_VIDEO_URL, { responseType: 'stream' });
                api.sendMessage({ body: sadText, attachment: videoStream.data }, threadID);
              } catch (vidErr) {
                api.sendMessage(sadText, threadID);
              }
            }
          } catch (err) {
            console.error("Welcome/Leave Error:", err);
          }
          return;
        }

        if (!body || senderID === botID) return;

        // --- ⌨️ COMMANDS ---
        if (body.startsWith("!")) {
          const args = body.slice(1).trim().split(/\s+/);
          const cmd = args.shift().toLowerCase();
          try {
            await handleCommands({ api, event, args, cmd, OWNER_ID, input: args.join(" ") });
          } catch (e) {
            console.error("Command Error:", e);
          }
          return;
        }

        // --- 🤖 SMART CONVERSATIONAL AI CHAT ---
        try {
          console.log(`💬 Processing message: ${body}`);

          // Ultra-stable primary AI gateway
          const apiUrl = `https://bk9.fun/ai/gemini?q=${encodeURIComponent(body)}`;
          const response = await axios.get(apiUrl, { timeout: 8000 });
          let reply = response.data?.BK9 || response.data?.result;

          if (!reply) {
            // Backup gateway if primary takes time
            const backupUrl = `https://hercai.onrender.com/gemini?question=${encodeURIComponent(body)}`;
            const bkRes = await axios.get(backupUrl, { timeout: 8000 });
            reply = bkRes.data?.reply;
          }

          if (reply) {
            api.sendMessage(reply, threadID, event.messageID);
          } else {
            api.sendMessage(`Bhai "${body}" ke baare mein sochna padega, tu thoda aur detail bata na! 😄`, threadID, event.messageID);
          }
        } catch (error) {
          console.error("❌ AI Error:", error.message);
          // Intelligent contextual fallback so chat never breaks
          const smartReplies = [
            `Sahi keh raha hai bhai, "${body}" wali baat mein dum hai! 😄`,
            `Acha aisa hai kya? Phir ispe tera kya plan hai, ${body}? 🤔`,
            `Bhai "${body}" par zyada mat soch, chill kar! 🚀`,
            `Is baare mein toh sochna padega dost, tu bata tera kya opinion hai? 😆`
          ];
          const randomReply = smartReplies[Math.floor(Math.random() * smartReplies.length)];
          api.sendMessage(randomReply, threadID, event.messageID);
        }
      });
    });
  } catch (e) { 
    console.error(`Initialization error:`, e);
    setTimeout(() => startInstance(), 15000); 
  }
}

startInstance();
