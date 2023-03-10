const Chat = require('../models/chat.model');
const Users = require('../models/user.model');
const Welfare = require('../models/welfare.model');

const userController = require("../controllers/users.controller");

exports.getRequests = async (req, res) => {
    try {
        const { email } = req.user;
        const { coordinateA, coordinateB } = req.query;
        const user = await Users.findOne({ email });
        if (!user) {
            throw "User doesn't exist";
        }
        const welfareRequests = await Welfare.find({
            location: {
                $near:
                {
                    $geometry: { type: "Point", coordinates: [coordinateA, coordinateB] },
                    $minDistance: 0,
                    $maxDistance: 10000
                }
            }
        }).populate("postedBy")
        res.status(200).send({ welfareRequests });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: error.errors?.[0]?.message || error });
    }
}

exports.createRequest = async (req, res) => {
    try {
        const { address, coordinateA, coordinateB } = req.body;
        const { email } = req.user;
        const user = await Users.findOne({ email });
        if (!user) {
            throw "User doesn't exist";
        }
        const welfareRequest = await Welfare.create({
            address,
            postedBy: user,
            location: {
                type: "Point",
                coordinates: [coordinateA, coordinateB]
            },
            neighborhood: await userController.getReverseGeoCodeFn(coordinateA, coordinateB)
        });
        res.status(200).send({ message: "Success", welfareRequest })

    } catch (error) {
        console.log(error);
        res.status(500).send({ error: error.errors?.[0]?.message || error });
    }
}

exports.acceptRequest = async (req, res) => {
    try {
        const { email } = req.user;
        const user = await Users.findOne({ email });
        console.log("USER", user);
        if (!user) {
            throw "User doesn't exist";
        }
        const welfareRequest = await Welfare.findOneAndUpdate({
            acceptedBy: user,
        });
        // TODO: do not create if already exists
        await Chat.create({ sender: user, receiver: welfareRequest.postedBy });
        console.log(welfareRequest);
        res.status(200).send({ message: "Success" });
    } catch (error) {
        res.status(500).send({ error: error.errors?.[0]?.message || error });
    }
}