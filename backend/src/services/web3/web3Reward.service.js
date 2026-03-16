import { ethers } from "ethers";

/**
 * Web3 Reward Service — Bridges off-chain engagement to on-chain $BOND tokens.
 */
export const Web3RewardService = {
    /**
     * Sends $BOND tokens to a user's wallet for engagement.
     * Uses a gas-less experience via meta-transactions or an admin-payer model.
     */
    rewardEngagement: async (userWalletAddress, amount) => {
        try {
            const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
            const adminWallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);
            
            const bondTokenAddress = process.env.BOND_TOKEN_CONTRACT_ADDRESS;
            const abi = [
                "function transfer(address to, uint256 amount) public returns (bool)",
                "function balanceOf(address owner) view returns (uint256)"
            ];

            const contract = new ethers.Contract(bondTokenAddress, abi, adminWallet);
            
            const tx = await contract.transfer(userWalletAddress, ethers.parseUnits(amount.toString(), 18));
            await tx.wait();

            console.log(`[Web3] Rewarded ${amount} $BOND to ${userWalletAddress}. TX: ${tx.hash}`);
            return tx.hash;
        } catch (error) {
            console.error("[Web3] Reward failed:", error.message);
            return null;
        }
    }
};
