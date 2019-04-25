#!/bin/bash

CC_RUNTIME_LANGUAGE=node # chaincode runtime language is node.js
CC_SRC_PATH=/opt/gopath/src/github.com/trace-chaincode/typescript
echo Compiling TypeScript code into JavaScript ...
pushd ../chaincode/trace-chaincode/typescript
npm install
npm run build
popd
echo Finished compiling TypeScript code into JavaScript

echo $1

docker kill $(docker ps -a | grep dev | tr -s ' ' | cut -d ' ' -f 1) ; \
docker rm  $(docker ps -a | grep dev | tr -s ' ' | cut -d ' ' -f 1) ; \
docker rmi  $(docker images | grep dev | tr -s ' ' | cut -d ' ' -f 3) ; \ 

echo $1

docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" cli peer chaincode install -n ${1:- "trace-chaincode"} -v 1.0 -p "$CC_SRC_PATH" -l "$CC_RUNTIME_LANGUAGE"
docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" cli peer chaincode instantiate -o orderer.example.com:7050 -C mychannel -n ${1:- "trace-chaincode"} -l "$CC_RUNTIME_LANGUAGE" -v 1.0 -c '{"Args":[]}' -P "OR ('Org1MSP.member','Org2MSP.member')"
