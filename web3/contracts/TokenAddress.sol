// SPDX-License-Identifier: MIT
 
pragma solidity ^0.8.8;
 
contract TokenAddressContract {
    address public token;
    
    function set(address tokenAddress) public {
        token = tokenAddress;
    }
    
    function remove(address ) public {
        delete token;
    }
 
    function getToken() public view returns(address) {
        return token;
    }
}
