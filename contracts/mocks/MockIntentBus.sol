// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

struct Intent {
    string description;
    uint256 cost;
    address creator;
}

contract MockIntentBus {
    event IntentSubmitted(string description, uint256 cost, address creator);

    function submitTopologicalIntent(Intent calldata intent) external {
        emit IntentSubmitted(intent.description, intent.cost, intent.creator);
    }
}
