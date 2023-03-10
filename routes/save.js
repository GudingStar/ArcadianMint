const MintTransaction = require('../models/mintTransaction');

const SaveTransaction = async ({userAddress,nftName,game,transferType,transactionID,amount}) => {
    try{
        let transaction = new MintTransaction({          
            userAddress: userAddress,
            nftName: nftName,
            game: game,
            transferType: transferType,
            transactionID: transactionID,
            amount: amount
        })
        await transaction.save();
    }catch(err){
        console.log(err);
    }    
}

module.exports = SaveTransaction;