// SPDX-License-Identifier: GPL-3.0
 
pragma solidity ^0.8.8;
 
contract TokenAddressContract {
    address public token1;
    
    function set(address token) public {
        token1 = token;
    }
    
    function remove(address ) public {
        delete token1;
    }
 
    function getToken() public view returns(address) {
        return token1;
    }
}
