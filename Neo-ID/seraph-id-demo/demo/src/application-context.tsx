// Copyright (c) 2019 Swisscom Blockchain AG
// Licensed under MIT License

import React from 'react';

export const Agents = {
    owner: 'Oliver',
    government: 'Government',
    smartAgency: 'Agency',
    landlord: 'Door Lock',
}

export const initialActions = {
    govPageAsOwner: 'toFillForm', /* toFillForm, askForCredentials, waitingForCredentials, success, failure */
    govPageAsGov: 'noRequests', /* noRequests, pendingRequest, issuing, credIssued, credNotIssued */
    agencyPageAsOwner: 'toChooseAFlat',  /* toChooseAFlat, requestingDigitalIdentity, errorRequestingDigitalIdentity, digitalIdentityNotFound, 
                                toShareDigitalIdentity, sharingCredentials, digitalIdentityNotShared, waitingForValidation, digitalIdentityNotVerified, waitingForAccessKey, success, failure */
    agencyPageAsAgency: 'noRequests', /* noRequests, pendingRequest, verifying, digitalIdentityVerified, digitalIdentityNotVerified, credIssuing, credIssued, credNotIssued */
    demoOwnerDID: 'todo', /* todo, waiting, success, failure */
    demoOwnerCredFromGov: 'todo', /* todo, waiting, success, failure */ 
    demoOwnerCredFromAgency: 'todo', /* todo, waiting, success, failure */
    demoOwnerOpenDoor: 'todo', /* todo, sharingCredentials, sharingCredentialsFailed, waiting, success, failure */
    demoGov: 'noRequests', /* noRequests, pendingRequest, credIssued, credNotIssued */
    demoAgency: 'noRequests', /* noRequests, pendingRequest, digitalIdentityVerified, digitalIdentityNotVerified, credIssued, credNotIssued */
    demoLandlord: 'noRequests'  /* noRequests, pendingRequest, verifying, doorOpened, doorNotOpened */
};

export const initialTip = `First of all, as ${Agents.owner} you need to create a wallet and generate your personal DID`;

export const ApplicationContext = React.createContext({
    afterReset: false,
    tip: initialTip,
    showHelp: false,
    actions: initialActions,
    passportClaim: null,
    accessKeyClaim: null,
    changeAction: () => { },
    nextTip: () => { },
    resetContext: () => {}
});

