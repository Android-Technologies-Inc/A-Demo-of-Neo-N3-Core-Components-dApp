// Copyright (c) 2019 Swisscom Blockchain AG
// Licensed under MIT License

import * as React from 'react';
import './FlatCards.css';
import { theme } from '../../containers/App';
import { Typography, Fab, Card, CardActionArea, CardMedia, CardContent, CardActions } from '@material-ui/core';
import MediaQuery from 'react-responsive';
import * as configs from '../../configs';
import {PriceFeedService} from '../../pricefeed/pricefeedservice';
import { useState, useEffect } from 'react';

const pricefeed = new PriceFeedService(configs.PRICE_FEED_SERVICE, configs.NEO_RPC_URL, configs.DID_NETWORK, configs.MAGIC);
interface FlatCard {
    id: number;
    pictureRef: string;
    city: string;
    price: string;
    rooms: number;
    meters: number;
    others: string;
}

interface Props {
    flatBooked: any;
}

function GetTokenPrice(price: number, tokenPrice: number): string{
    return String((price/tokenPrice).toFixed(8));
}

function FlatCards({ flatBooked }: Props) {
    const [tokenPrice, setPrice] = useState(0);
    useEffect(() => {
        async function getPriceFunc(){
            let response = await pricefeed.getPrice();
            setPrice(response);
        }
        getPriceFunc()
    }, []);

    const topFlats: FlatCard[] = [
        { id: 1, pictureRef: configs.OBJECT_ID1, city: 'Florence', price: tokenPrice === 0 ? '' : GetTokenPrice(200, tokenPrice), rooms: 2, meters: 65, others: 'Bathtub' },
        { id: 2, pictureRef: configs.OBJECT_ID2, city: 'Beijing', price: tokenPrice === 0 ? '' : GetTokenPrice(280, tokenPrice), rooms: 3, meters: 110, others: 'Garden' },
        { id: 3, pictureRef: configs.OBJECT_ID3, city: 'New York', price: tokenPrice === 0 ? '' : GetTokenPrice(370, tokenPrice), rooms: 4, meters: 155, others: 'Terrace' },
    ];

    const bottomFlats: FlatCard[] = [
        { id: 4, pictureRef: configs.OBJECT_ID4, city: 'Paris', price: tokenPrice === 0 ? '' : GetTokenPrice(195, tokenPrice), rooms: 2, meters: 54, others: 'Position' },
        { id: 5, pictureRef: configs.OBJECT_ID5, city: 'Zürich', price: tokenPrice === 0 ? '' : GetTokenPrice(450, tokenPrice), rooms: 5, meters: 240, others: 'Magnific view' },
        { id: 6, pictureRef: configs.OBJECT_ID6, city: 'Madrid', price: tokenPrice === 0 ? '' : GetTokenPrice(210, tokenPrice), rooms: 2, meters: 80, others: 'Pool' },
    ];

    const renderFlatsInRow = (flats: FlatCard[]) => {
        return flats.map(
            flat => {
                return (
                    <FlatCard
                        key={flat.id}
                        imageRef={flat.pictureRef}
                        city={flat.city}
                        price={flat.price}
                        rooms={flat.rooms}
                        meters={flat.meters}
                        others={flat.others}
                        clicked={() => flatBooked(flat.id, flat.city, flat.price)}
                    />
                );
            }
        );
    }

    return (
        <div className="FlatCardContainer">

            <MediaQuery query="(min-device-width: 1224px)">
                {/* desktop or laptop */}
                <div className="FlatCardRowContainer">
                    {renderFlatsInRow(topFlats)}
                </div>

                <div className="FlatCardRowContainer">
                    {renderFlatsInRow(bottomFlats)}
                </div>
            </MediaQuery>

            <MediaQuery query="(max-device-width: 1224px)">
                {/* tablet */}
                <MediaQuery query="(min-width: 750px)">

                    <div className="FlatCardRowContainer">
                        {renderFlatsInRow(topFlats.slice(0, 2))}
                    </div>

                    <div className="FlatCardRowContainer">
                        {renderFlatsInRow([topFlats[2], bottomFlats[0]])}
                    </div>

                    <div className="FlatCardRowContainer">
                        {renderFlatsInRow(bottomFlats.slice(1, 3))}
                    </div>

                </MediaQuery>

                {/* mobile */}
                <MediaQuery query="(max-width: 750px)">

                    <div className="FlatCardRowContainer">
                        {renderFlatsInRow([topFlats[0]])}
                    </div>

                    <div className="FlatCardRowContainer">
                        {renderFlatsInRow([topFlats[1]])}
                    </div>


                    <div className="FlatCardRowContainer">
                        {renderFlatsInRow([topFlats[2]])}
                    </div>

                    <div className="FlatCardRowContainer">
                        {renderFlatsInRow([bottomFlats[0]])}
                    </div>

                </MediaQuery>
            </MediaQuery>

        </div>

    );
}

export default FlatCards;


interface CardProps {
    imageRef: string;
    city: string;
    price: string;
    rooms: number;
    meters: number;
    others: string;
    clicked: any;
}



function FlatCard({ imageRef, city, price, rooms, meters, others, clicked }: CardProps) {

    const style = { backgroundColor: theme.palette.error.main, color: 'white' };

    const [imageData, setImageData] = useState('');
    useEffect(() =>{
    fetch('http://172.168.3.42:4030/get/'+ configs.CONTAINER_ID + '/' + imageRef)
        .then(response => response.blob())
        .then(image => {
            // Create a local URL of that image
            const localUrl = URL.createObjectURL(image);
            setImageData(localUrl);
        });
    }, []);

    return (
        <Card className="FlatCard">
            <CardActionArea>
                <CardMedia
                    className="FlatPicture"
                    image={imageData}
                    title="Contemplative Reptile"
                />
                <CardContent className="FlatCardContent">

                    <div className="FlatCardTitle">
                        <Typography gutterBottom variant="h6" component="h2">
                            {city}
                        </Typography>

                        <Typography gutterBottom variant="h6" component="h2">
                            <strong> {price} GAS </strong>
                            <small className="PriceSpec"> /night </small>
                        </Typography>
                    </div>
                    <Typography component="p" >
                        <strong> Rooms: </strong> {rooms}
                        <br />
                        <strong> Square meteres: </strong> {meters} m<sup>2</sup>
                        <br />
                        <strong> Plus: </strong> {others}
                    </Typography>
                </CardContent>
            </CardActionArea>
            <CardActions className="FlatCardActions">
                <div></div>
                <Fab size="medium" variant="extended" style={style} onClick={clicked}>
                    Book
                </Fab>
            </CardActions>
        </Card>
    );
}
