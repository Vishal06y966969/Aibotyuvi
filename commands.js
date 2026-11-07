const axios = require("axios");

module.exports = async function handleCommands({ api, event, args, cmd, OWNER_ID, input }) {
  const { threadID, messageID, senderID, mentions } = event;

  switch (cmd) {
    case "song": {
      if (!input) {
        return api.sendMessage("⚠️ Kripya gaane ka naam likhein! Example: `!song Channa Ve`", threadID, messageID);
      }

      api.sendMessage(`🎶 Searching and downloading audio for "${input}"... Thoda wait karo! ⏳`, threadID, messageID);

      try {
        const searchUrl = `https://apis.davidcyriltech.my.id/youtube/mp3?text=${encodeURIComponent(input)}`;
        const res = await axios.get(searchUrl);
        
        if (res.data && res.data.success && res.data.result.downloadUrl) {
          const audioUrl = res.data.result.downloadUrl;
          const title = res.data.result.title || input;

          const stream = await axios.get(audioUrl, { responseType: 'stream' });
          
          return api.sendMessage({
            body: `🎧 **Now Playing:** ${title}`,
            attachment: stream.data
          }, threadID, messageID);
        } else {
          const query = encodeURIComponent(input);
          return api.sendMessage(`🎵 Audio download link nahi mila, par yeh raha gaana:\nhttps://www.youtube.com/results?search_query=${query}`, threadID, messageID);
        }
      } catch (err) {
        console.error("Song Command Error:", err);
        return api.sendMessage("❌ Gaana download karne mein kuch error aa gaya bhai, dobara try karo!", threadID, messageID);
      }
      break;
    }

    case "video": {
      if (!input) {
        return api.sendMessage("⚠️ Kripya video ka naam likhein! Example: `!video Sad Song`", threadID, messageID);
      }

      api.sendMessage(`🎬 Searching and downloading video for "${input}"... Thoda wait karo! ⏳`, threadID, messageID);

      try {
        const searchUrl = `https://apis.davidcyriltech.my.id/youtube/mp4?text=${encodeURIComponent(input)}`;
        const res = await axios.get(searchUrl);
        
        if (res.data && res.data.success && res.data.result.downloadUrl) {
          const videoUrl = res.data.result.downloadUrl;
          const title = res.data.result.title || input;

          const stream = await axios.get(videoUrl, { responseType: 'stream' });
          
          return api.sendMessage({
            body: `🎬 **Video:** ${title}`,
            attachment: stream.data
          }, threadID, messageID);
        } else {
          const query = encodeURIComponent(input);
          return api.sendMessage(`🎬 Video download link nahi mila, par yeh raha link:\nhttps://www.youtube.com/results?search_query=${query}`, threadID, messageID);
        }
      } catch (err) {
        console.error("Video Command Error:", err);
        return api.sendMessage("❌ Video download karne mein kuch error aa gaya bhai, dobara try karo!", threadID, messageID);
      }
      break;
    }

    case "couple": {
      let targetUser = "Dost";
      if (mentions && Object.keys(mentions).length > 0) {
        const mentionedID = Object.keys(mentions)[0];
        targetUser = mentions[mentionedID].replace("@", "");
      } else if (input) {
        targetUser = input.replace("@", "").trim();
      }

      const matchPercent = Math.floor(Math.random() * 41) + 60;
      const coupleMsg = `💖 **Couple Matchmaking:**\n\n👫 Joota Jodi: **Yuvi** ❤️ **${targetUser}**\n💞 Match Percentage: **${matchPercent}%**\n\nBohot hi pyari jodi hai bhai! nazar na lage! ✨`;
      
      api.sendMessage(coupleMsg, threadID, messageID);
      break;
    }

    case "shayari": {
      const shayaris = [
        "Dil se roye toh hum bhi the, kisi ke pyaar mein khoye toh hum bhi the, fark sirf itna tha ki unhone hume khel samjha aur hum unhe apni zindagi maan baithe the. 🥀",
        "Waqt ne sikhaya hume hathon ki lakeeron par bharosa karna, warna hum toh unhe apna mante the jo mere kismat mein hi nahi the. 💔",
        "Muskurana toh har kisi ki ada hai, jo ise pyaar samjhe wo sabse bada gadha hai! 😂❤️",
        "Zindagi mein doston ka hona bhi zaroori hai, warna dukh mein rulaane wale toh rishtedaar hi kaafi hain! 🍻"
      ];
      const randomShayari = shayaris[Math.floor(Math.random() * shayaris.length)];
      api.sendMessage(`📜 **Shayari:**\n\n${randomShayari}`, threadID, messageID);
      break;
    }

    case "roast": {
      let targetUser = "Dost";
      if (mentions && Object.keys(mentions).length > 0) {
        const mentionedID = Object.keys(mentions)[0];
        targetUser = mentions[mentionedID].replace("@", "");
      } else if (input) {
        targetUser = input.replace("@", "").trim();
      }

      const roasts = [
        `Arre ${targetUser}, tumhari shakal dekh kar toh Google Map bhi rasta bhool jata hai! 🗺️😂`,
        `Bhai ${targetUser}, jab tum paida hue the toh doctor ne tumhare gharwalo ko sorry bola hoga! 💀`,
        `${targetUser} bhai, thoda dimag istemal kiya karo, warranty khatam ho jayegi warna! 🔋😂`,
        `Oye ${targetUser}, aisi ajeeb baatein mat kiya karo, log sochte hain ki bot tumse zyada smart hai! 🤖🔥`
      ];
      const randomRoast = roasts[Math.floor(Math.random() * roasts.length)];
      
      api.sendMessage(`🔥 **Roast Time:**\n\n${randomRoast}`, threadID, messageID);
      break;
    }

    case "joke": {
      const jokes = [
        "Teacher: Tum itne din se school kyu nahi aaye?\nStudent: Sir, raste mein likha tha 'School Ahead, Go Slow', toh main dheere-dheere chal raha tha! 🤣",
        "Santa: Yaar, bijli kab aayegi?\nBanta: Jab andhera hoga! 💡",
        "Pappu: Yaar meri biwi mujhe bhagwan manti hai!\nFriend: Wo kaise?\nPappu: Kyunki wo kuch nahi maanti, bas pooja karti rehti hai! 😆"
      ];
      const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
      api.sendMessage(`😂 **Joke of the Day:**\n\n${randomJoke}`, threadID, messageID);
      break;
    }

    case "bot":
    case "menu": {
      const menuText = `🤖 **Yuvi Family & AI Bot Menu:**\n\n` +
        `🎶 \`!song <name>\` - Direct MP3 Audio bheje\n` +
        `🎬 \`!video <name>\` - Direct MP4 Video bheje\n` +
        `💖 \`!couple @name\` - Couple matchmaking\n` +
        `📜 \`!shayari\` - Romantic/Desi shayari\n` +
        `🔥 \`!roast @name\` - Doston ke sath light masti\n` +
        `😂 \`!joke\` - Mazedaar chutkule\n\n` +
        `💬 *(Baaki aap bina kisi command ke seedha baat bhi kar sakte hain, main AI ki tarah jawab dunga!)*`;
      
      api.sendMessage(menuText, threadID, messageID);
      break;
    }

    default:
      api.sendMessage(`❌ Invalid Command! Type \`!bot\` to see the full menu.`, threadID, messageID);
      break;
  }
};
