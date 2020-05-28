const db = require('../conn');
require('dotenv').config();

module.exports = () => {
	let exp = {};

	exp.addTrack = async (req, res) => {
		let obj;
		try {
			obj = await db.Queue.create(req.body);
		} catch (err) {
			return res.send(err);
		}
		return res.status(200).send('Added to queue ' + obj._id);
	};

	exp.removeTrack = async (req, res) => {
		let delid;
		try {
			delid = await db.Queue.find(null, '_id', { limit: 1 });
			await db.Queue.findByIdAndDelete(delid);
		} catch (err) {
			return res.send(err);
		}
		return res.status(200).send('Removed from queue ' + delid);
	};

	exp.showCurrent = async (req, res) => {
		let obj;
		try {
			obj = await db.Queue.find(null, null, { limit: 1 });
		} catch (err) {
			return res.send(err);
		}
		return res.json(obj);
	};

	exp.showNext = async (req, res) => {
		let obj;
		try {
			obj = await db.Queue.find(null, null, { skip: 1, limit: 1 });
		} catch (err) {
			return res.send(err);
		}
		return res.json(obj);
	};

	exp.showAll = async (req, res) => {
		let obj;
		try {
			obj = await db.Queue.find();
		} catch (err) {
			return res.send(err);
		}
		return res.json(obj);
	};

	return exp;
}




