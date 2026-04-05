import UserWallet from "../models/UserWallet.js";

/**
 * POST /api/minigame/coin-flip
 * Wager coins on heads or tails. 2x payout on win.
 */
export const playCoinFlip = async (req, res) => {
    try {
        const { wager, choice } = req.body; // choice: "heads" | "tails"
        const userId = req.user._id;

        if (!wager || wager < 5 || wager > 500) {
            return res.status(400).json({ message: "Wager must be between 5 and 500 BC" });
        }
        if (!["heads", "tails"].includes(choice)) {
            return res.status(400).json({ message: "Choose heads or tails" });
        }

        const wallet = await UserWallet.findOne({ userId });
        if (!wallet || (wallet.bonusBalance + wallet.winnings) < wager) {
            return res.status(400).json({ message: "Insufficient balance" });
        }

        const result = Math.random() < 0.5 ? "heads" : "tails";
        const won = result === choice;
        const payout = won ? wager : -wager;

        // Deduct from bonus first, then winnings
        if (won) {
            wallet.winnings += wager;
        } else {
            if (wallet.bonusBalance >= wager) {
                wallet.bonusBalance -= wager;
            } else {
                const remainder = wager - wallet.bonusBalance;
                wallet.bonusBalance = 0;
                wallet.winnings -= remainder;
            }
        }
        await wallet.save();

        res.json({
            result,
            won,
            payout,
            newBalance: wallet.winnings + wallet.bonusBalance
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * POST /api/minigame/dice-roll
 * Roll a dice. Pick over/under 3.5. 2x payout.
 */
export const playDiceRoll = async (req, res) => {
    try {
        const { wager, choice } = req.body; // choice: "over" | "under"
        const userId = req.user._id;

        if (!wager || wager < 5 || wager > 500) {
            return res.status(400).json({ message: "Wager must be between 5 and 500 BC" });
        }

        const wallet = await UserWallet.findOne({ userId });
        if (!wallet || (wallet.bonusBalance + wallet.winnings) < wager) {
            return res.status(400).json({ message: "Insufficient balance" });
        }

        const roll = Math.floor(Math.random() * 6) + 1;
        const won = choice === "over" ? roll > 3 : roll <= 3;
        const payout = won ? wager : -wager;

        if (won) {
            wallet.winnings += wager;
        } else {
            if (wallet.bonusBalance >= wager) {
                wallet.bonusBalance -= wager;
            } else {
                const remainder = wager - wallet.bonusBalance;
                wallet.bonusBalance = 0;
                wallet.winnings -= remainder;
            }
        }
        await wallet.save();

        res.json({ roll, won, payout, newBalance: wallet.winnings + wallet.bonusBalance });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
