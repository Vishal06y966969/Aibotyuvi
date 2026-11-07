module.exports = async function handleCommands({
  api, event, args, cmd, OWNER_ID, input
}) {
  const { threadID, senderID } = event;

  // 1. SONG PLAYER / SEARCH
  if (cmd === "song") {
    const query = input.trim();
    if (!query) return api.sendMessage("❌ Kripya gaane ka naam likhein!\nExample: `!song Ranjha`", threadID);
    api.sendMessage(`🎶 Searching audio for: "${query}"...\n🎧 Link: https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, threadID);
    return;
  }

  // 2. VIDEO PLAYER / SEARCH
  if (cmd === "video") {
    const query = input.trim();
    if (!query) return api.sendMessage("❌ Kripya video ka naam likhein!\nExample: `!video Lyrical Song`", threadID);
    api.sendMessage(`🎬 Searching video for: "${query}"...\n📺 Link: https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, threadID);
    return;
  }

  // 3. COUPLE DP / MATCHMAKING
  if (cmd === "couple") {
    let targetID = event.messageReply ? event.messageReply.senderID : (event.mentions && Object.keys(event.mentions)[0]);
    if (!targetID) {
      return api.sendMessage("✨ Couple DP banane ke liye kisi member ko tag karo ya unke message par reply karke `!couple` likho! ❤️", threadID);
    }

    api.getUserInfo([senderID, targetID], (err, ret) => {
      if (err || !ret) return api.sendMessage("❌ User info fetch karne mein error aaya!", threadID);
      const user1Name = ret[senderID] ? ret[senderID].name : "User 1";
      const user2Name = ret[targetID] ? ret[targetID].name : "User 2";
      
      api.sendMessage(`💖 **Couple Matchmaking** 💖\n\n👤 ${user1Name}\n  ➕\n👤 ${user2Name}\n\n✨ Status: Perfect Jodi! 🔥`, threadID);
    });
    return;
  }

  // 4. SHAYARI COMMAND
  if (cmd === "shayari") {
    const shayariyan = [
      "Pahadon ki thandi hawa aur chaye ka cup, yaad aa gaye aap chupchap! ☕✨",
      "Raston se ho agar pyaar, toh manzil ki fikar nahi hoti! 🔥",
      "Aapki muskaan se hi roshan hai yeh mehfil saari! 😊",
      "Waqt badalta hai, log badalte hain, par dosto ki masti kabhi nahi badalti! 🚀"
    ];
    const randomShayari = shayariyan[Math.floor(Math.random() * shayariyan.length)];
    api.sendMessage(`📜 **Shayari-e-Dil:**\n\n"${randomShayari}"`, threadID);
    return;
  }

  // 5. FRIENDLY ROAST COMMAND
  if (cmd === "roast") {
    let targetID = event.messageReply ? event.messageReply.senderID : (event.mentions && Object.keys(event.mentions)[0]);
    if (!targetID) {
      return api.sendMessage("🔥 Kisi ko roast karne ke liye unhe tag karo ya reply karke `!roast` likho!", threadID);
    }

    api.getUserInfo(targetID, (err, ret) => {
      let tName = (!err && ret && ret[targetID]) ? ret[targetID].name : "Dost";
      const roasts = [
        `Bhai ${tName}, jab tu paida hua tha toh doctor ne tere gharwalo ko sorry bola tha! 😂`,
        `${tName} bhai, akal badi ya bhains? Chal chhod, tere case mein dono hi confuse hain! 🐃`,
        `Oye ${tName}, itna smart mat ban, warna google bhi tujhe search karke thak jayega! 🤖`
      ];
      const selectedRoast = roasts[Math.floor(Math.random() * roasts.length)];
      api.sendMessage(`🔥 **Roast Time:**\n\n@${tName} ${selectedRoast}`, threadID, event.messageID);
    });
    return;
  }

  // 6. JOKE COMMAND
  if (cmd === "joke") {
    const jokes = [
      "Teacher: Tum itne din se school kyu nahi aaye?\nStudent: Sir, raste mein likha tha 'School Ahead, Go Slow', toh main dheere-dheere chal raha tha! 🤣",
      "Pati: Main jo bhi bolta hoon tumhara dhyan kyu nahi rehta?\nPatni: Kyuki main aapki baat sunne se pehle hi 'Like' ka sochne lagti hoon! 😜",
      "Santa: Yaar, bijli kab aayegi?\nBanta: Jab andhera hoga! 💡"
    ];
    const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
    api.sendMessage(`😂 **Joke of the Day:**\n\n${randomJoke}`, threadID);
    return;
  }

  // 7. HELP COMMAND
  if (cmd === "help" || cmd === "bot") {
    api.sendMessage(
      `🤖 **Yuvi Family & AI Bot Menu:**\n\n` +
      `🎵 \`!song <name>\` - Gaana search karein\n` +
      `📺 \`!video <name>\` - Video search karein\n` +
      `❤️ \`!couple @tag\` - Couple matchmaking\n` +
      `📜 \`!shayari\` - Romantic/Desi shayari\n` +
      `🔥 \`!roast @tag\` - Dosto ke sath light masti\n` +
      `😂 \`!joke\` - Mazedaar chutkule\n\n` +
      `💬 *(Baaki aap bina kisi command ke seedha baat bhi kar sakte hain, main AI ki tarah jawab dunga!)*`, 
      threadID
    );
    return;
  }
};
