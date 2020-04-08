const request = require('request');
const Doscg = require('../../models/doscg');
const config = require('../../configs/config/config');
const redisClient = require('../cache');
let key_cache = 'doscgs';
const mapClient = require("@googlemaps/google-maps-services-js").Client;
// let reply_token = '';

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

const getDoscgById = async (req, res, next) => {
    try {
        key_cache = key_cache + '/' + req.params.id;
        redisClient.get(key_cache , async (error, data) => {
            if (error) {
                res.json({
                message: 'Something went wrong!',
                error
                });
            }
            if (data) {
                return res.status(200).json({
                    'message': 'doscg with id ${req.params.id} fetched successfully',
                    'data': JSON.parse(data)
                });
            }

            let doscg = await Doscg.findById(req.params.id);

            if (doscg) {
                redisClient.setex(key_cache, 60, JSON.stringify(doscg));
                return res.status(200).json({
                    'message': `doscg with id ${req.params.id} fetched successfully`,
                    'data': doscg
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
                origin: "13.7466304,100.5371464",
                destination:"13.8058793,100.535343",
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
        console.log("AAAA");
        console.log(req.body.events[0].message.text);
        let reply_token = req.body.events[0].replyToken;
        let msg = req.body.events[0].message.text;
        let friends = ["เพชร" , "เมย์" , "โบว์" , "มิงค์" , "แอ๊ป" , "พี่แอ๊ะ" , "โอปอ", "น้ำฝน" , "ยับ" ,"ปอ"];

        if (friends.includes(msg)) {
            let friend1 = msg;
            let friend2 = '';
            let friend3 = '';
            let item = '';
            // let rand = Math.floor(Math.random() * 10);
            while(true) {
                item = Math.floor(Math.random() * friends.length);
                if(friend1 != friends[item]){
                    friend2 = friends[item];
                    break;
                }
            }

            while(true) {
                item = Math.floor(Math.random() * friends.length);
                if(friend1 != friends[item] && friend2 != friends[item]){
                    friend3 = friends[item];
                    break;
                }
            }

            let text = `${friend1}ค่ะ ${friend1}ค่ะ หนูชื่อ${friend1} มากับ${friend2} และก็มากับ${friend3} ลันลั้นลา ลั้นลั้นลา มาม้ามา ม้ามา มาออกมาเต้น`;
            reply(reply_token, text);
        }

        // const request_promise = require('request-promise')
        // const LINE_MESSAGING_API = 'https://api.line.me/v2/bot/message'
        // const LINE_HEADER = {
        //     'Content-Type': 'application/json',
        //     'Authorization': `Bearer {${config.channel_access_token}}`
        // };

        // const util = require('util');
        // const setTimeoutPromise = util.promisify(setTimeout);

        // setTimeoutPromise(10000).then((value) => {
        //     request_promise({
        //         method: `POST`,
        //         uri: `${LINE_MESSAGING_API}/push`,
        //         headers: LINE_HEADER,
        //         body: JSON.stringify({
        //             to: config.owner_id,
        //             messages: [
        //                 {
        //                 type: "text",
        //                 text:  `${msg}`
        //                 }
        //             ]
        //         })
        //     });
        // });

        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            'code': 'SERVER_ERROR',
            'description': 'something went wrong, Please try again'
        });
    }
}

const manualReply = async (req, res, next) => {
    try {
        reply(reply_token, req.query.msg)
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
    let headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer {${config.channel_access_token}}`
    }
    let body = JSON.stringify({
        replyToken: reply_token,
        messages: [{
            type: 'text',
            text: msg
        }]
    })
    request.post({
        url: 'https://api.line.me/v2/bot/message/reply',
        headers: headers,
        body: body
    }, (err, res, body) => {
        console.log(res);
        console.log('status = ' + res.statusCode);
    });
}

module.exports = {
    getDoscgs: getDoscgs,
    getDoscgById: getDoscgById,
    getProgression: getProgression,
    getEquation: getEquation,
    getBestway: getBestway,
    createReply: createReply,
    manualReply: manualReply
}
