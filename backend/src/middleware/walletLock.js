import UserWallet from "../models/UserWallet.js";

export const walletDeduct = async (userId, amountUnits, session = null) => {
    const query = { 
        userId,
        winnings: { $gte: amountUnits } 
    };
    
    // Attempt atomic deduction
    const update = { 
        $inc: { winnings: -amountUnits, totalBalance: -amountUnits } 
    };
    
    const options = { new: true, session };
    const wallet = await UserWallet.findOneAndUpdate(query, update, options);
    
    if (!wallet) {
        throw new Error("WALLET_INSUFFICIENT");
    }
    
    return wallet;
};

export const walletRelease = async (userId, amountUnits, reason, session = null) => {
    const update = { 
        $inc: { winnings: amountUnits, totalBalance: amountUnits } 
    };
    const options = { new: true, session };
    return await UserWallet.findOneAndUpdate({ userId }, update, options);
};

export const withWallet = (req, res, next) => {
    req.wallet = {
        deduct: (amount, session) => walletDeduct(req.user._id, amount, session),
        release: (amount, reason, session) => walletRelease(req.user._id, amount, reason, session)
    };
    next();
};
