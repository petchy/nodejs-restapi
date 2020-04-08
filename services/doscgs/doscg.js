const request = require('request');
const Doscg = require('../../models/doscg');
const config = require('../../configs/config/config');
const redisClient = require('../cache');
let key_cache = 'doscgs';
const mapClient = require("@googlemaps/google-maps-services-js").Client;
const LINE_MESSAGING_API = 'https://api.line.me/v2/bot/message';
const LINE_HEADER = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer {${config.channel_access_token}}`
};
let reply_token = '';

const getDoscgs = async (req, res, next) => {
    try {
        redisClient.get(key_cache, async (error, data) => {
            if (error) {
                res.json({
                message: 'Something went wrong!',
                error
                });
            }

            if (data) {
                return res.status(200).json({
                    'message': 'doscgs fetched successfully',
                    'data': JSON.parse(data)
                });
            }

            let doscgs = await Doscg.find({});
            if (doscgs.length > 0) {
                //set cache expire in 60 seconds
                redisClient.setex(key_cache, 60, JSON.stringify(doscgs));

                return res.status(200).json({
                    'message': 'doscgs fetched successfully',
                    'data': doscgs
                });
            }

            return res.status(404).json({
                'code': 'BAD_REQUEST_ERROR',
                'description': 'No doscgs found in the system'
            });
        });
    } catch (error) {
        return res.status(500).json({
            'code': 'SERVER_ERROR',
            'description': 'something went wrong, Please try again'
        });
    }
}

const getProgression = async (req, res, next) => {
    try {
        key_cache = 'progression';
        redisClient.get(key_cache , async (error, data) => {
            if (error) {
                res.json({
                message: 'Something went wrong!',
                error
                });
            }

            if (data) {
                return res.status(200).json({
                    'message': 'Get progression is successfully',
                    'data': JSON.parse(data)
                });
            }

            let round = 7;
            let sequence = 2;
            let numbers = [3];
            let number_start = 3;
            for (i = 0; i < round; i++) {
                number_start += i * sequence;
                numbers.push(number_start);
            }

            redisClient.setex(key_cache, 60, JSON.stringify(numbers));

            return res.status(200).json({
                'message': 'Get progression is successfully',
                'data': numbers
            });
        });
    } catch (error) {
        return res.status(500).json({
            'code': 'SERVER_ERROR',
            'description': 'something went wrong, Please try again'
        });
    }
}

const getEquation = async (req, res, next) => {
    try {
        key_cache = 'equation';
        redisClient.get(key_cache , async (error, data) => {
            if (error) {
                res.json({
                message: 'Something went wrong!',
                error
                });
            }

            if (data) {
                return res.status(200).json({
                    'message': 'Get equation is successfully',
                    'data': JSON.parse(data)
                });
            }
            a = 21;
            b = 23 - a;
            c = -21 - a;
            let result = {"a": a, "b" : b, "c" : c};

            redisClient.setex(key_cache, 60, JSON.stringify(result));

            return res.status(200).json({
                'message': 'Get equation is successfully',
                'data': result
            });
        });
    } catch (error) {
        return res.status(500).json({
            'code': 'SERVER_ERROR',
            'description': 'something went wrong, Please try again'
        });
    }
}

const getBestway = async (req, res, next) => {
    try {
        key_cache = 'bestway';
        redisClient.get(key_cache , async (error, data) => {
            if (error) {
                res.json({
                message: 'Something went wrong!',
                error
                });
            }

            if (data) {
                return res.status(200).json({
                    'message': 'Get bestway is successfully',
                    'data': JSON.parse(data)
                });
            }

            const map = new mapClient({});
            map
            .directions({
                params: {
                origin: "13.8058793,100.535343",
                destination:"13.7466304,100.5371464",
                key: config.google_api_key,
                // transit_routing_preference:"less_walking"
                },
                timeout: 1000 // milliseconds
            })
            .then(result => {
                redisClient.setex(key_cache, 60, JSON.stringify(result.data.routes[0].summary));
                return res.status(200).json({
                    'message': 'Get bestway is successfully',
                    'data': result.data.routes[0].summary
                });
            })
            .catch(e => {
                console.log(e);
                return res.status(500).json({
                    'code': 'SERVER_ERROR',
                    'description': 'something went wrong, Please try again'
                });
            });
        });
    } catch (error) {
        return res.status(500).json({
            'code': 'SERVER_ERROR',
            'description': 'something went wrong, Please try again'
        });
    }
}

const createReply = async (req, res, next) => {
    try {
        reply_token = req.body.events[0].replyToken;
        let msg = req.body.events[0].message.text;
        let reply_msg = '';

        if (msg == 'hello') {
            reply_msg = 'Hi';
            reply(reply_token, reply_msg);
        } else {
            const request_promise = require('request-promise');
            const util = require('util');
            const setTimeoutPromise = util.promisify(setTimeout);

            setTimeoutPromise(10000).then((value) => {
                request_promise({
                    method: `POST`,
                    uri: `${LINE_MESSAGING_API}/push`,
                    headers: LINE_HEADER,
                    body: JSON.stringify({
                        to: config.owner_id,
                        messages: [
                            {
                            type: "text",
                            text:  `${msg}`
                            }
                        ]
                    })
                });
            });
        }
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            'code': 'SERVER_ERROR',
            'description': 'something went wrong, Please try again'
        });
    }
}

function reply(reply_token, msg) {
    let body = JSON.stringify({
        replyToken: reply_token,
        messages: [{
            type: 'text',
            text: msg
        }]
    })
    request.post({
        url: `${LINE_MESSAGING_API}/reply`,
        headers: LINE_HEADER,
        body: body
    }, (err, res, body) => {
        console.log(res);
        console.log('status = ' + res.statusCode);
    });
}

module.exports = {
    getDoscgs: getDoscgs,
    getProgression: getProgression,
    getEquation: getEquation,
    getBestway: getBestway,
    createReply: createReply
}
