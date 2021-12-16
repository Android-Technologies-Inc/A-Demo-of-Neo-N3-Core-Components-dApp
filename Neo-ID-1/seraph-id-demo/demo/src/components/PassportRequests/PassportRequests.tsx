// Copyright (c) 2019 Swisscom Blockchain AG
// Licensed under MIT License

import * as React from 'react';
import './PassportRequests.css';
import { Paper, Table, TableHead, TableRow, TableBody, TableCell, Fab, Grid, Tooltip } from '@material-ui/core';
import MediaQuery from 'react-responsive';


interface Props {
    activeRequest?: PassportReq;
    denied?: any;
    issued?: any;
}

export enum PassportStatus {
    pending,
    issued,
    denied,
    error
}

export class PassportReq {
    firstName: string;
    secondName: string;
    birthDate: string;
    citizenship: string;
    address: string;
    gender: string;
    passportId: string;
    status: PassportStatus;
    issuedClaim: string;

    constructor(firstName: string, secondName: string, birthDate: string, citizenship: string, address: string, gender: string,
        passportId: string, status: PassportStatus, issuedClaim: string) {
        this.firstName = firstName;
        this.secondName = secondName;
        this.birthDate = birthDate;
        this.citizenship = citizenship;
        this.address = address;
        this.gender = gender;
        this.passportId = passportId;
        this.status = status;
        this.issuedClaim = issuedClaim;
    }
}

function PassportRequests({ activeRequest, issued, denied }: Props) {

    let requests: PassportReq[] = [
    ];

    if (activeRequest) {
        requests.unshift(activeRequest);

    }

    const actions = (req: PassportReq) => {
        if (req.status === PassportStatus.pending) {
            return (
                <TableCell align="center">
                    <Fab className="ActionButtonLeft" onClick={denied} variant="extended" color="secondary"> Reject </Fab>
                    <Fab onClick={issued} variant="extended" color="secondary"> Issue </Fab>
                </TableCell>
            );
        } else if (req.status === PassportStatus.issued) {
            return (
                <TableCell align="center"> <span className="CredentialIssued"> Credential Issued </span> </TableCell>
            )
        } else if (req.status === PassportStatus.denied) {
            return (
                <TableCell align="center"> <span className="ReqDenied"> Request Denied </span> </TableCell>
            )
        } else {
            return (
                <TableCell align="center">
                    <Tooltip title="Error: calling smart contract failed!">
                        <span className="ReqDenied"> Error </span>
                    </Tooltip>
                </TableCell>
            );

        }
    }

    return (
        <div className="PassportReqContainer">
            <h1> Passport Requests Overview </h1>

            <Grid container direction="row" justify="space-between">
                <Grid item> </Grid>

                <Grid item>
                    <Paper className="RequestsPaper">

                        <MediaQuery query="(min-device-width: 1224px)">
                            {/* desktop or laptop */}
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell> First Name </TableCell>
                                        <TableCell> Second Name</TableCell>
                                        <TableCell> Gender </TableCell>
                                        <TableCell align="right"> Birth Date</TableCell>
                                        <TableCell align="right"> City </TableCell>
                                        <TableCell align="right"> Passport ID</TableCell>
                                        <TableCell align="center"> Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {requests.map(req => (
                                        <TableRow key={req.firstName + req.secondName}>
                                            <TableCell component="th" scope="row">
                                                {req.firstName}
                                            </TableCell>
                                            <TableCell>{req.secondName}</TableCell>
                                            <TableCell>{req.gender === 'female' ? 'F' : 'M'}</TableCell>
                                            <TableCell align="right">{req.birthDate}</TableCell>
                                            <TableCell align="right">{req.address}</TableCell>
                                            <TableCell align="right">{req.passportId}</TableCell>
                                            {actions(req)}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </MediaQuery>


                        <MediaQuery query="(max-device-width: 1224px)">
                            {/* tablet */}
                            <MediaQuery query="(min-width: 750px)">

                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell> First Name </TableCell>
                                            <TableCell> Second Name</TableCell>
                                            <TableCell align="right"> Passport ID</TableCell>
                                            <TableCell align="center"> Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {requests.map(req => (
                                            <TableRow key={req.firstName + req.secondName}>
                                                <TableCell component="th" scope="row">
                                                    {req.firstName}
                                                </TableCell>
                                                <TableCell>{req.secondName}</TableCell>
                                                <TableCell align="right">{req.passportId}</TableCell>
                                                {actions(req)}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                            </MediaQuery>

                            {/* mobile */}
                            <MediaQuery query="(max-width: 750px)">

                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell> Name </TableCell>
                                            <TableCell align="center"> Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {requests.map(req => (
                                            <TableRow key={req.firstName + req.secondName}>
                                                <TableCell component="th" scope="row"> {req.firstName} {req.secondName} </TableCell>
                                                {actions(req)}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                            </MediaQuery>
                        </MediaQuery>

                    </Paper>
                </Grid>
                <Grid item> </Grid>

            </Grid >
        </div >


    );
}

export default PassportRequests;
