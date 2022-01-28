require('dotenv').config();
const ENV = process.env;

const username = ENV.account || 'regardspk';
const active = ENV.active || '';
const follow = ENV.follow || 'regardspk';
const msowner = ENV.msowner || '';
const memoKey = ENV.memo || '';
const hookurl = ENV.discordwebhook || '';
const NODEDOMAIN = ENV.domain || 'https://spktoken.dlux.io' //where your API lives
const acm = ENV.account_creator || false //account creation market ... use your accounts HP to claim account tokens
const mirror = ENV.mirror || false //makes identical posts, votes and IPFS pins as the leader account
const port = ENV.PORT || 3001;
const pintoken = ENV.pintoken || ''
const pinurl = ENV.pinurl || '';
const status = ENV.status || true
const dbcs = ENV.DATABASE_URL || '';
const history = ENV.history || 3600

// testing configs for replays
const override = ENV.override || 0 //69116600 //will use standard restarts after this blocknumber
const engineCrank = ENV.startingHash || '' //but this state will be inserted before

// third party configs
const rta = ENV.rta || '' //rtrades account : IPFS pinning interface
const rtp = ENV.rtp || '' //rtrades password : IPFS pinning interface

const ipfshost = ENV.ipfshost || 'ipfs.infura.io' //IPFS upload/download provider provider
const ipfsport = ENV.ipfsport || '5001' //IPFS upload/download provider provider
const ipfsprotocol = ENV.ipfsprotocol || 'https' //IPFS upload/download protocol
//node market config > 2500 is 25% inflation to node operators, this is currently not used
const bidRate = ENV.BIDRATE || 2500 //

//HIVE CONFIGS
var startURL = ENV.STARTURL || "https://api.deathwing.me/"
var clientURL = ENV.APIURL || "https://api.deathwing.me/"
const clients = ENV.clients || [
    "https://api.deathwing.me/",
    //"https://api.c0ff33a.uk/",
    //"https://rpc.ecency.com/",
    "https://hived.emre.sh/",
    //"https://rpc.ausbit.dev/",
    "https://api.hive.blog/"
]

//!!!!!!! -- THESE ARE COMMUNITY CONSTANTS -- !!!!!!!!!//
//TOKEN CONFIGS -- ALL COMMUNITY RUNNERS NEED THESE SAME VALUES
const starting_block = 61200000; //from what block does your token start
const prefix = 'spk_' //Community token name for Custom Json IDs
const TOKEN = 'LARYNX' //Token name
const precision = 3 //precision of token
const tag = 'spk' //the fe.com/<tag>/@<leader>/<permlink>
const jsonTokenName = 'larynx' //what customJSON in Escrows and sends is looking for
const leader = 'regardspk' //Default account to pull state from, will post token 
const ben = '' //Account where comment benifits trigger token action
const delegation = '' //account people can delegate to for rewards
const delegationWeight = 1000 //when to trigger community rewards with bens
const msaccount = 'spk-cc' //account controlled by community leaders
const mainAPI = 'spktoken.dlux.io' //leaders API probably
const mainRender = '' //data and render server
const mainFE = '3speak.tv' //frontend for content
const mainIPFS = 'ipfs.3speak.tv' //IPFS service
const mainICO = '' //Account collecting ICO HIVE
const footer = ''//`\n[Find us on Discord](https://discord.gg/Beeb38j)`
const hive_service_fee = 100 //HIVE service fee for transactions in Hive/HBD in centipercents (1% = 100)
const features = {
    pob: false, //proof of brain
    delegate: false, //delegation
    liquidity: false, //liquidity
    ico: false, //ico
    dex: true, //dex
    nft: false, //nfts
    state: true, //api dumps
    claimdrop: true //claim drops
}
const detail = {
                name: 'Larynx Miner Token',
                symbol: 'LARYNX',
                icon: 'https://www.dlux.io/img/dlux-hive-logo-alpha.svg',
                supply:'Hive 1:1 Airdrop',
                wp:`https://docs.google.com/document/d/1_jHIJsX0BRa5ujX0s-CQg3UoQC2CBW4wooP2lSSh3n0/edit?usp=sharing`,
                ws:`https://www.dlux.io`,
                be:`https://hiveblockexplorer.com/`,
                text: `Larynx is a token that is used to mine SPK.`
            }

//Aditionally on your branch, look closely at dao, this is where tokenomics happen and custom status posts are made

let config = {
    username,
    active,
    msowner,
    memoKey,
    follow,
    NODEDOMAIN,
    hookurl,
    status,
    history,
    dbcs,
    mirror,
    bidRate,
    engineCrank,
    port,
    pintoken,
    pinurl,
    clientURL,
    startURL,
    clients,
    acm,
    rta,
    rtp,
    override,
    ipfshost,
    ipfsprotocol,
    ipfsport,
    starting_block,
    prefix,
    leader,
    msaccount,
    ben,
    delegation,
    delegationWeight,
    TOKEN,
    precision,
    tag,
    mainAPI,
    jsonTokenName,
    mainFE,
    mainRender,
    mainIPFS,
    mainICO,
    detail,
    footer,
    hive_service_fee,
    features
};

module.exports = config;