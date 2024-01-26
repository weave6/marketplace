// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

interface IWeave6Pool {
    event Transfer(address indexed from, address indexed to, uint256 amount);

    function totalSupply() external view returns (uint256);
    function balanceOf(address user) external view returns (uint256);

    function deposit() external payable;
    function withdraw(uint256) external;

    function transferFrom(address from, address to, uint256 amount)
        external
        returns (bool);
}
