// Copyright (c) 2019 Swisscom Blockchain AG
// Licensed under MIT License

import * as React from 'react';
import './AccessKeyRequests.css';
import { Paper, Table, TableHead, TableRow, TableBody, TableCell, Fab, Grid, Tooltip } from '@material-ui/core';
import { theme } from '../../containers/App';
import moment from 'moment';
import MediaQuery from 'react-responsive'

interface Props {
    activeRequest?: AccessKeyReq;
    denied?: any;
    issued?: any;
    verified?: any;
}

export enum PassportStatus {
    toVerify,
    valid,
    notValid
}

export enum AccessKeyStatus {
    waitingForPassport,
    pending,
    issued,
    denied,
    error
}

export class AccessKeyReq {
    id: number;
    city: string;
    checkIn: string;
    checkOut: string;
    price: string;
    applicantPassportStatus: PassportStatus;
    accessKeyStatus: AccessKeyStatus;

    constructor(id: number, city: string, checkIn: string, checkOut: string, price: string, applicantPassportStatus: PassportStatus, accessKeyStatus: AccessKeyStatus) {
        this.id = id;
        this.city = city;
        this.checkIn = checkIn;
        this.checkOut = checkOut;
        this.price = price;
        this.applicantPassportStatus = applicantPassportStatus;
        this.accessKeyStatus = accessKeyStatus;
    }
}

function AccessKeyRequests({ activeRequest, verified, issued, denied }: Props) {

    const themeColor = theme.palette.error.main;
    const style = { backgroundColor: themeColor, color: 'white' };


    const getRandomInRange = (min: number, max: number) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    const getCheckInDate = () => {
        return moment().format("MMMM Do YYYY");
    }

    const getCheckOutDate = () => {
        const days = getRandomInRange(0, 15);
        return moment().add(days, 'days').format("MMMM Do YYYY");
    }

    const generatePrice = () => {
        return `${getRandomInRange(70, 500)}`;
    }



    let requests: AccessKeyReq[] = [
    ];

    if (activeRequest) {
        requests.unshift(activeRequest);

    }

    const applicantPassportStatus = (req: AccessKeyReq) => {
        if (req.applicantPassportStatus === PassportStatus.toVerify) {
            return (
                <TableCell padding="checkbox" align="center">
                    <Fab onClick={verified} variant="extended" style={style}> Verify Passport </Fab>
                </TableCell>
            );
        } else if (req.applicantPassportStatus === PassportStatus.valid) {
            return (
                <TableCell padding="checkbox" align="center"> <span className="CredentialIssued"> Valid </span> </TableCell>
            )
        } else {
            return (
                <TableCell padding="checkbox" align="center"> <span className="ReqDenied"> Not valid </span> </TableCell>
            )
        }
    }

    const accessKeyStatus = (req: AccessKeyReq) => {

        if (req.accessKeyStatus === AccessKeyStatus.waitingForPassport) {
            return (
                <TableCell padding="checkbox" align="center">
                    -
                </TableCell>
            );
        } else if (req.accessKeyStatus === AccessKeyStatus.pending) {
            return (
                <TableCell padding="checkbox" align="center">
                    <Fab onClick={denied} variant="extended" style={style}> Deny </Fab>
                    <Fab onClick={issued} variant="extended" style={style} className="RightButton"> Issue </Fab>
                </TableCell>
            );
        } else if (req.accessKeyStatus === AccessKeyStatus.issued) {
            return (
                <TableCell padding="checkbox" align="center"> <span className="CredentialIssued"> Issued </span> </TableCell>
            )
        } else if (req.accessKeyStatus === AccessKeyStatus.denied) {
            return (
                <TableCell padding="checkbox" align="center"> <span className="ReqDenied"> Denied </span> </TableCell>
            )
        } else {
            return (
                <TableCell padding="checkbox" align="center">
                    <Tooltip title="Error: calling smart contract failed!">
                        <span className="ReqDenied"> Error </span>
                    </Tooltip>
                </TableCell>
            )

        }
    }

    return (
        <div className="AccessKeyReqContainer">
            <h1> Access Key Requests Overview </h1>

            <Grid container direction="row" justify="space-between">
                <Grid item> </Grid>

                <Grid item>
                    <Paper className="RequestsPaper">


                        <MediaQuery query="(min-device-width: 1224px)">
                            {/* desktop or laptop */}

                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell> Flat location </TableCell>
                                        <TableCell> Check in </TableCell>
                                        <TableCell align="right"> Check Out </TableCell>
                                        <TableCell align="right"> Price per night </TableCell>
                                        <TableCell align="right"> Applicant Passport </TableCell>
                                        <TableCell align="center"> Access Key </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {requests.map(req => (
                                        <TableRow key={req.id}>
                                            <TableCell component="th" scope="row">
                                                {req.city}
                                            </TableCell>
                                            <TableCell>{req.checkIn}</TableCell>
                                            <TableCell align="right">{req.checkOut}</TableCell>
                                            <TableCell align="right">{req.price} GAS </TableCell>
                                            {applicantPassportStatus(req)}
                                            {accessKeyStatus(req)}
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
                                            <TableCell> Flat location </TableCell>
                                            <TableCell align="right"> Price per night </TableCell>
                                            <TableCell align="right"> Applicant Passport </TableCell>
                                            <TableCell padding="checkbox" align="center"> Access Key </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {requests.map(req => (
                                            <TableRow key={req.id}>
                                                <TableCell component="th" scope="row">
                                                    {req.city}
                                                </TableCell>
                                                <TableCell align="right">{req.price} $ </TableCell>
                                                {applicantPassportStatus(req)}
                                                {accessKeyStatus(req)}
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

                                            <TableCell padding="checkbox"> Flat location </TableCell>
                                            <TableCell padding="checkbox" align="right"> Applicant Passport </TableCell>
                                            <TableCell padding="checkbox" align="center"> Access Key </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {requests.map(req => (
                                            <TableRow key={req.id}>

                                                <TableCell padding="checkbox" component="th" scope="row">
                                                    {req.city}
                                                </TableCell>
                                                {applicantPassportStatus(req)}
                                                {accessKeyStatus(req)}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                            </MediaQuery>
                        </MediaQuery>

                    </Paper>
                </Grid>

                <Grid item> </Grid>

            </Grid>
        </div>


    );
}

export default AccessKeyRequests;
