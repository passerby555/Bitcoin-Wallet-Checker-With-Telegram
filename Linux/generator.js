"use strict";

process.title = "Bitcoin checker";

const CoinKey = require('coinkey');
const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');

// Telegram bot configuration
const telegramToken = 'YOUR_TELEGRAM_BOT_TOKEN';
const telegramChatId = 'YOUR_TELEGRAM_CHAT_ID';
const bot = new TelegramBot(telegramToken);

let privateKeyHex, ck, addresses;
addresses = new Map();

const data = fs.readFileSync('./riches.txt');
data.toString().split("\n").forEach(address => addresses.set(address, true));

function generate() {
    // generate random private key hex
    let privateKeyHex = r(64);
    
    // create new bitcoin key pairs
    let ck = new CoinKey(Buffer.from(privateKeyHex, 'hex'));
    
    ck.compressed = false;
    
    // if generated wallet matches any from the riches.txt file, tell us we won!
    if(addresses.has(ck.publicAddress)){
        console.log("");
        process.stdout.write('\x07');
        console.log("\x1b[32m%s\x1b[0m", ">> Success: " + ck.publicAddress);
        var successString = "Wallet: " + ck.publicAddress + "\n\nSeed: " + ck.privateWif;
            
        // save the wallet and its private key (seed) to a Success.txt file in the same folder 
        fs.writeFileSync('./Success.txt', successString, (err) => {
            if (err) throw err; 
        });

        // send a message to the Telegram bot
        bot.sendMessage(telegramChatId, successString);
            
        // close program after success
        process.exit();
    }
    
    // destroy the objects
    ck = null;
    privateKeyHex = null;
}

// the function to generate random hex string
function r(l) {
    let randomChars = 'ABCDEF0123456789';
    let result = '';
    for ( var i = 0; i < l; i++ ) {
        result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }
    return result;
}

console.log("\x1b[32m%s\x1b[0m", ">> Program Started and is working silently (edit code if you want logs)"); // don't trip, it's working

// run forever
while(true){
    generate();
    if (process.memoryUsage().heapUsed / 1000000 > 500) {
        global.gc();
    }
}
