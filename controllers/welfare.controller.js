const Users = require('../models/user.model');
const Welfare = require('../models/welfare.model');

exports.getRequests = async (req, res) => {
    try {
        const {email} = req.user;
        console.log(email)
        const {coordinateA, coordinateB} = req.query;
        console.log("coordinateB", coordinateB)
        const user = await Users.findOne({ where: { email } });
        if (!user) {
            throw "User doesn't exist";
        }
        const welfareRequests = await Welfare.find({
            location: {
                $near:
                {
                    $geometry: { type: "Point",  coordinates: [ coordinateA, coordinateB ] },
                    $minDistance: 0,
                    $maxDistance: 10000
                }
            }
        })
        console.log(welfareRequests);
        res.status(200).send({ welfareRequests });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: error.errors?.[0]?.message || error });
    }
}

exports.createRequest = async (req, res) => {
    try {
        const { address, coordinateA, coordinateB } = req.body;
        const {email} = req.user;
        const user = await Users.findOne({ where: { email } });
        if (!user) {
            throw "User doesn't exist";
        }
        const welfareRequest = await Welfare.create({
            address,
            postedBy: user,
            location: {
                type: "Point",
                coordinates: [coordinateA, coordinateB]
            }
        });
        console.log(welfareRequest);
        res.status(200).send({message: "Success"})
 
    } catch (error) {
        res.status(500).send({ error: error.errors?.[0]?.message || error });
    }
}