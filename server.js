const express = require("express");
const connectDB = require("./config/db");
const app = express();
const bodyParser = require("body-parser");
const Moralis = require("moralis").default;
const { Contract, providers, utils } = require("ethers");
const {mintAbi,cueAbi} = require("./contract/abi.json");
const SaveTransaction = require('./routes/save');
const SaveVolume = require('./routes/saveVolume');

require("dotenv").config();
// Connect to Database
connectDB();

// Initialize Middleware
app.use(express.json({ strict: false }));

app.use(bodyParser.urlencoded({ extended: true }));

// Define Routes
app.use("/api/transaction", require("./routes/api/transaction"));

// Set Static Folder
app.use(express.static(__dirname + "/build"));
app.get("/*", function (req, res) {
  res.sendFile(__dirname + "/build/index.html", function (err) {
    if (err) {
      res.status(500).send(err);
    }
  });
});

// SERVER
const PORT = process.env.PORT || 5000;
// const PORT = 5000;

let Rarity = ["Common", "Uncommon", "Rare", "Epic", "Legendary"];

const provider = new providers.WebSocketProvider(
  "wss://api.avax-test.network/ext/bc/C/ws",
  {
    chainId: 43113,
    name: "fuji",
  }
);

const mintContract = new Contract(
  "0x10c43C1947d08e6fE69cAaC1730F8863a4Ddaa69",
  mintAbi,
  provider
);

const cueContract = new Contract(
  "0xcd9df581f855d07144f150b0c681824548008644",
  cueAbi,
  provider
)

const mintListener = async (from, tokenId, collectionId, rarity, price, event) => {
  try{
    console.log("-------mintListener--------");
    const tokenData = JSON.parse(
      await cueContract.tokenURIJSON(tokenId)
    );
    
    console.log("From:", from);
    console.log("Token ID:", tokenId.toNumber());
    console.log("Collection ID:", collectionId.toNumber());
    console.log("Rarity:", Rarity[rarity]);
    console.log("Price:", utils.formatEther(price), "AVAX");
    console.log("EventHash:", event.transactionHash);
  
    SaveVolume({type:"mint",collectionId: Number(collectionId),price:Number(utils.formatEther(price))})
    SaveTransaction({userAddress:from,nftName:tokenData.name,game:"8Ball",transferType:"mint",transactionID:event.transactionHash,amount: Number(utils.formatEther(price)) });
  } catch(err) {
    console.log(err);
  }
};

const upgradeListener = async (from, tokenId, collectionId, rarity, price, event) => {
  try{
    console.log("-------upgradeListener--------");
    const tokenData = JSON.parse(
      await cueContract.tokenURIJSON(tokenId)
    );
    
    console.log("From:", from);
    console.log("Token ID:", tokenId.toNumber());
    console.log("Collection ID:", collectionId.toNumber());
    console.log("Rarity:", Rarity[rarity]);
    console.log("Price:", utils.formatEther(price), "AVAX");
    console.log("EventHash:", event.transactionHash);
  
    SaveVolume({type:"upgrade",collectionId: Number(collectionId),price:Number(utils.formatEther(price))})
    SaveTransaction({userAddress:from,nftName:tokenData.name,game:"8Ball",transferType:"upgrade",transactionID:event.transactionHash,amount: Number(utils.formatEther(price)) });
  } catch(err) {
    console.log(err);
  }
};

const InitializeContract = () => {
  mintContract.on(mintContract.filters.CuePurchased(), mintListener);
  mintContract.on(mintContract.filters.CueUpgraded(), upgradeListener);
}

InitializeContract();

app.listen(PORT, () => console.log(`Server started on PORT ${PORT}`));
