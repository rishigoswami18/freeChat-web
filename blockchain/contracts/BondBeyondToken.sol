// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BondBeyondToken ($BOND)
 * @dev Simple reward system for Social Engagement and Focus Sessions.
 */
contract BondBeyondToken is ERC20, Ownable {
    mapping(address => uint256) public lastLogin;
    uint256 public constant LOGIN_REWARD = 10 * 10**18; // 10 $BOND
    uint256 public constant FOCUS_REWARD_PER_HOUR = 50 * 10**18; // 50 $BOND

    event RewardClaimed(address indexed user, uint256 amount, string reason);

    constructor() ERC20("BondBeyond", "BOND") Ownable(msg.sender) {
        _mint(msg.sender, 1000000000 * 10**18); // Mint 1 Billion $BOND to treasury
    }

    /**
     * @dev Reward user for daily login.
     */
    function claimDailyReward() external {
        require(block.timestamp >= lastLogin[msg.sender] + 1 days, "Already claimed today");
        lastLogin[msg.sender] = block.timestamp;
        _transfer(owner(), msg.sender, LOGIN_REWARD);
        emit RewardClaimed(msg.sender, LOGIN_REWARD, "daily_login");
    }

    /**
     * @dev Reward user for completing a Focus Session.
     * In production, this would be called by the backend service.
     */
    function rewardFocusSession(address user, uint256 durationMinutes) external onlyOwner {
        uint256 reward = (durationMinutes * FOCUS_REWARD_PER_HOUR) / 60;
        _transfer(owner(), user, reward);
        emit RewardClaimed(user, reward, "focus_session");
    }
}
