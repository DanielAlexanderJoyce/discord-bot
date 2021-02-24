const {Champions} = require('./champs.json')
const {data: Items} = require('./item.json');
const {data: Summoners} = require('./summoner.json');
const { capitalizeFirstLetter } = require('../Utils');

const handleChampionInfo = (message, args) => {
    const champArgs = args.slice(1);
    const champion = champArgs.map(name => capitalizeFirstLetter(name));
    message.channel.send(championGGPage(champion.join('')));
}

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
    switch(position[0]) { // checks first character to handle naming variation
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
            && randomSummoner.name !== 'To the King!'){
            randomSummoners.push(randomSummoner.name)
        }
    }

    while(randomItems.length < 6) {
        const randomItem = Items[itemKeys[itemKeys.length * Math.random() << 0]];
        if(randomItem.gold.total > 2000 // Ensuring that it's a final item.
            && randomItem.maps["11"] === true // Must be available on SR
            && randomItems[randomItem.name] === undefined// Ensure we don't already have it
            && randomItem.name.indexOf('(Quick Charge)') === -1 // Quick Charge items from aram filter.
            && randomItem.requiredAlly === undefined // Ornn item filter.
            && randomItem.tags[0] !== "boots" // boots filter.
            && (randomSummoners.includes('Smite') || randomItem.name.indexOf('Enchantment:') === -1) // Only allows for a jungle item if you have smite.
        ){
            randomItems.push(randomItem.name);
        }
    }

    return message.channel.send(
        `${message.member}, TIME TO GROW SOME CHEST HAIR! IT IS TIME FOR ULTIMATE BRAVERY!\n
        YOU WILL PLAY: ${randomChampion.name}\n
        YOUR SUMMONERS: ${randomSummoners.join( " and ")}\n
        YOUR ITEMS: ${randomItems.join('| ')}`);
}



module.exports = { 
    handleBravery,
    PositionStatsPage,
    handleChampionInfo,
    championGGPage,
}
