// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;


contract MockMEVHarvester {
    uint256 public totalOps;
    uint256 public successfulOps;
    uint256 public failedOps;
    uint256 public avgGas;

    constructor(uint256 _avgGas) {
        totalOps = 0;
        successfulOps = 0;
        failedOps = 0;
        avgGas = _avgGas;
    }

    function setMetrics(uint256 _total, uint256 _success, uint256 _failed, uint256 _avgGas) external {
        totalOps = _total;
        successfulOps = _success;
        failedOps = _failed;
        avgGas = _avgGas;
    }

    function getPerformanceMetrics() external view returns (uint256, uint256, uint256, uint256) {
        return (totalOps, successfulOps, failedOps, avgGas);
    }
}
