const Discord = require('discord.js');
const client = new Discord.Client();
const {Champions} = require('./leagueoflegends/champs.json')
const {data: Items} = require('./leagueoflegends/item.json');
const {data: Summoners} = require('./leagueoflegends/summoner.json');
const { capitalizeFirstLetter } = require('./Utils');
require('dotenv').config();
const prefix = process.env.DISCORD_BOT_PREFIX;

client.once('ready', () => {
    console.log("Bot is ready");
});

// Create an event listener for new guild members
client.on('guildMemberAdd', member => {
    // Send the message to a designated channel on a server:
    const channel = member.guild.channels.cache.find(ch => ch.name === 'member-log');
    // Do nothing if the channel wasn't found on this server
    if (!channel) return;
    // Send the message, mentioning the member
    channel.send(`Welcome to the weab squad, ${member}`);
  });
  
const championGGPage = (champion) => {  
    if(Champions[champion] !== undefined) {
        return `https://champion.gg/champion/${Champions[champion].id}`;
    } 
    else {
        return 'No Champ found.';
    }
};

 const PositionStatsPage = (position) => {
    let positionSearchTerm = null;
    switch(position[0]) {
        case 't':
            positionSearchTerm = 'Top';
            break;
        case 'j':
            positionSearchTerm = 'Jungle';
            break;
        case 'b':
            positionSearchTerm = 'Bottom';
            break;
        case 'm':
            positionSearchTerm = 'Middle';
            break;
        case 's':
            positionSearchTerm = 'Support';
            break;
        default:
            return 'Invalid position given. Please try the following options: mid, top bot, supp, jungle'
    }
    return `https://champion.gg/statistics/#?sortBy=general.winPercent&order=descend&roleSort=${positionSearchTerm}`       
}

// Suggestions for improvement: 
// Create an image of some kind which visually represents rather than pure text.
// Allow to ask for multiple champions.
const handleBravery = (message) => {
        const championKeys = Object.keys(Champions);
        const summonerKeys = Object.keys(Summoners);
        const randomChampion = Champions[championKeys[ championKeys.length * Math.random() << 0]];
        const randomItems = [];
        const randomSummoners = [];
        const itemKeys = Object.keys(Items);

        while(randomSummoners.length < 2){
            const randomSummoner = Summoners[summonerKeys[ summonerKeys.length * Math.random() << 0]];
            if(!randomSummoners.includes(randomSummoner.name) 
                && randomSummoner.name !== 'Mark' // Remove the useless summoners that we can't use.
                && randomSummoner.name !== 'To the King!'
                && randomSummoner.name !== 'Poro Toss'){
                randomSummoners.push(randomSummoner.name)
            }
        }


        while(randomItems.length < 6) {
            const randomItem = Items[itemKeys[ itemKeys.length * Math.random() << 0]];
            if(randomItem.gold.total > 2000 // Ensuring that it's a final item.
                && randomItem.maps["11"] === true // Must be available on SR
                && randomItems[randomItem.name] === undefined // TODO: Fix -> Ensure we don't already have it
                && randomItem.name.indexOf('(Quick Charge)') === -1
                && randomItem.requiredAlly === undefined // Avoid Ornn item
                && randomItem.tags[0] !== "boots" // NO BOOTS ALLOWED! 
                && (randomSummoners.includes('Smite') || randomItem.name.indexOf('Enchantment:') === -1) // Only allows for a jungle item if you have smite.
            ){
                randomItems.push(randomItem.name);
            }
        }
        return message.channel.send(
            `${message.member}, TIME TO GROW SOME CHEST HAIR! IT IS TIME FOR ULTIMATE BRAVERY!\n
            YOU WILL PLAY: ${randomChampion.name}\n
            YOUR SUMMONERS: ${randomSummoners.join( " AND ")}\n
            YOUR ITEMS: ${randomItems.join('| ')}`);
    }

const handleChampionInfo = (message, args) => {
    const champArgs = args.slice(1);
    const champion = champArgs.map(name => capitalizeFirstLetter(name));
    message.channel.send(championGGPage(champion.join('')));
}

client.on('message', message => {

    // Ensure that it's replying to a command from a human.
    if(!message.content.startsWith || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(' ');
    const command = args.shift().toLowerCase();

    console.log(command);

    // Test Command.
    if(command === 'ping'){
        return message.channel.send('Pong!');
    }

    // Help Command.
    if(command === 'help'){
        message.channel.send(`
        I can do the following: \n
        * !lol position {position} will get you the championGG list of best winrates of that position \n 
        * !lol champion {champname} will get you the championGG page for that champion.
        `);
    }

    if(command === 'bravery'){
        return handleBravery(message);
    }

    if(command === 'lol'){
        if(args[0] === 'bravery'){
            return handleBravery(message);
        }

        if(args.length < 1) { 
            return message.channel.send(`${message.author},I need some arguments for the lol command! Try !help for suggestions!`); 
        }

        if(args[0] === 'position'){
            const position = args[1];
            return message.channel.send(PositionStatsPage(position));
        }

        if(args[0] === 'champs' || args[0] === 'champion' || args[0] === 'champ'){
            return handleChampionInfo(message, args);
        }
    }

    if(command === 'champ'){
        handleChampionInfo(message, args);
    }
    if(command === 'bravery'){
        handleChampionInfo(message, args);
    }

});

if(!process.env.DISCORD_BOT_TOKEN) {
    console.log("No Token found in ENV file");
    process.exit(1);
}

client.login(process.env.DISCORD_BOT_TOKEN);
