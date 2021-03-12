//Importing Packages
const express = require('express');
const database = require('mongodb');
const session = require('express-session');
const mongoose = require('mongoose');
const path = require('path');
const schedule = require('node-cron');
const nodemailer = require('nodemailer');
const bodyParser = require("body-parser");
const Users = require('./databs.js');
const Send = require('./anodb.js');


//Initializing Packages
const app = express();
const PORT = process.env.PORT || 5000;
const url = "mongodb+srv://root:alphavega@cluster0.46fr7.mongodb.net/test";

//Connecting to Database
mongoose.connect(url, {useNewUrlParser:true});
const conn = mongoose.connection;

//Initializing mail server
const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: "eselleronline123@gmail.com",
		pass: "eseller123!@#"
	}
});



//Initializing Server
app.set('trust proxy', 1);
app.use(express.static(path.join(__dirname, 'static')));
app.use(session({secret: 'alpha-vega',}));
app.use(express.json());
app.engine('html', require('ejs').renderFile);
app.set('view-engine', 'ejs');
app.use(express.urlencoded({ extended: false }))

//Routing
app.get('/', (req, res) => {
	sess = req.session;
	sess.referal = req.query.ref;
	if (sess.logged && sess.logged == true){
		res.render(__dirname + "/templates/login/home.ejs");

	}else{
		res.render(__dirname + '/templates/index.ejs');
	}
});

app.post('/createacc', async(req, res) =>{
	sess = req.session;
	if (!sess.referal){
		ref = "nobody";
	}else{
		ref = sess.referal;
	}
	let add = req.body.address;
	let refid = Math.floor(100000 + Math.random() * 900000)
	const tuser = Users.findOne({btcad: add}, async (err, usr) => {
		if (usr == null){
			const user = new Users({
				refid: refid,
				btcad: add,
				refby: ref,
				accbal: '0',
				days: 0
				});
			const save = await user.save();
	};
	});
	sess.btcad = add;
	sess.logged = true;
	res.redirect('/dashboard');
});

app.get('/dashboard', async (req, res) => {
	sess = req.session;
	if (!sess.logged && sess.logged == false){
		res.redirect('/');
	}else{
		let mm = ""
		if (sess.anmes){
			mm = sess.anmes
		}
		let addr = sess.btcad;
		sess.addr = addr;
		let tusr = await Users.findOne({btcad: addr}, (err, res) =>{
			sess.refid = res.refid;
			sess.plan = res.plan;
			sess.accbal = res.accbal;		
		})
		const refusr = await Send.find({refid: String(sess.refid)}, (err, res) => {
			sess.obc = res;
		});
		thetag = "";
		for (let i = 0; i < sess.obc.length; i++){
			let a = sess.obc[i].thet;
			let b = sess.obc[i].amount;
			let c = sess.obc[i].status;
			let needed = `<tr><td>${a}</td><td>${b}</td><td>${c}</td></tr>`;
			thetag = thetag + needed;
		}
		sess.mess = " "
		res.render(__dirname + '/templates/login/dashboard.ejs', {addr: sess.addr, id: sess.refid, plan: sess.plan, accbal: sess.accbal,  mm: mm, alltra: thetag});
	}
});


app.get('/plans', (req, res) => {
	sess = req.session;
	sess.anmes = ""
	if (!sess.logged && sess.logged == false){
		res.redirect('/');
	}
	res.render(__dirname + '/templates/login/plans.ejs', {addr: sess.addr, id: sess.refid, plan: sess.plan, accbal: sess.accbal});
})

app.get('/payment', (req, res) => {
	sess = req.session;
	let a = true
	sess.anmes = ""
	if (!sess.logged && sess.logged == false){
		res.redirect('/')
	}
	let theplan = req.query.plan;
	let btcam = 0;
	if (theplan == 'Starter'){
		btcam = 0.002;
	}else if(theplan == 'Student'){
		btcam = 0.015;
	}else if(theplan == 'Master'){
		btcam = 0.05;
	}else {
		a = false;
	}
	if (!a){
		res.redirect('/')
	}else{
		res.render(__dirname + '/templates/payment.ejs', {tplan: theplan, btccam: btcam});
	}
})

app.get('/refferals', async (req, res) => {
	sess = req.session;
	sess.anmes = ""
	const refusr = await Users.find({refby: String(sess.refid)}, (err, res) => {
		sess.objt = res;
	});
	if (!sess.logged && sess.logged == false){
		res.redirect('/')
	}
	let thetag = "";
	for (let i = 0; i < sess.objt.length; i++){
		let a = sess.objt[i].refid;
		let b = sess.objt[i].btcad;
		let needed = `<tr><td>${a}</td><td>${b}</td></tr>`;
		thetag = thetag + needed;

	}

	await res.render(__dirname + '/templates/login/refferals.ejs', {addr: sess.addr, id: sess.refid, plan: sess.plan, accbal: sess.accbal,  thetag: thetag});
});

app.get('/contact', (req, res) => {
	sess = req.session;
	sess.anmes = ""
	if (!sess.logged && sess.logged == false){
		res.redirect('/')
	}
	res.render(__dirname + '/templates/login/contact.ejs', {message: sess.mess});
});

app.get('/logout', (req, res) =>{
	req.session.logged = false;
	res.redirect('/')
})

app.post('/sendmail', (req, res) =>{
	const sess = req.session;
	let usrnm = req.body.user_name;
	let email = req.body.user_email;
	let subject = req.body.user_subject;
	let message = req.body.user_message;
	const mail = {
		from: "eseller123@gmail.com",
		to: "eseller123@gmail.com",
		subject: subject,
		text: message
	}
	transporter.sendMail(mail, (error, info) =>{
		if(error){
			console.log(error);
		}
	});
	sess.mess = "Mail Sent"
	res.redirect('/contact');
})

app.get('/adminacc', (req, res) => {
	sess = req.session;
	if (!sess.admin){
		res.redirect('/adminlogs')
	}else{
		res.render(__dirname + '/templates/admin.ejs');
}
})

app.get("/adminlogs", (req, res) =>{
	res.render(__dirname + '/templates/adminlog.ejs');
})

app.post("/adminlogs", (req, res) => {
	sess = req.session;
	let user = req.body.usrnm;
	let passwd = req.body.passwd;
	if (user == "classmate" && passwd == "notebook"){
		sess.admin = true;
	}
	res.redirect('/adminacc')

})

app.get('/*', (req, res) => {
	res.redirect('/');
})

app.post('/withordep', async (req, res) =>{
	sess = req.session;
	let wdam = req.body.amount;
	let haveam = sess.accbal;
	let ifam = Number(wdam)
	if (ifam && (ifam < 0.002 || haveam < 0.002 || ifam > haveam)){
		sess.anmes = "Sorry the balance is not enough, if you want more money consider buying a plan.";
		res.redirect('/dashboard')
		
	}else{
		let type = req.body.ttype;
		let typet = type.charAt(0).toUpperCase() + type.slice(1)
		let idv = sess.refid;
		let btcac = sess.addr
		if (typet == 'Withdraw'){
			const entry = new Send({
				refid: idv,
				amount: wdam,
				thet: "Withdraw",
				status: "Pending"
			});
			const save = await entry.save();
		}else{
			let amo = req.body.amo;
			const entry = new Send({
			refid: idv,
			amount: Number(amo),
			thet: "Depsoit",
			status: "Pending"
			});
	const save = await entry.save();
		}
		let mes = `${type}, ID: ${idv}, Amount: ${wdam}`;
		const mail = {
			from: "eseller123@gmail.com",
			to: "eseller123@gmail.com",
			subject: type,
			text: mes
		}

		transporter.sendMail(mail, (err, info) => {
			if (err){
				console.log(err)
			}
		})
		sess.anmes = "Your request has been delivered, please wait."
		res.redirect('/dashboard')
	}
 } )

app.post("/adminacc", async (req, res) => {
	sess = req.session
	let accid = req.body.acid;
	let tplan = req.body.chpl;
	let refama = 0;
	switch (tplan){
		case "Starter":
			refama = 0.0002
			break
		case "Student":
			refama= 0.0015
			break
		case "Master":
			refama = 0.0050;
			break
	}
	let done = "Done";
	let deposit = "Depsoit"
	let tam = 0;	
	await Users.findOneAndUpdate({refid: accid}, {plan: tplan});
	await Send.updateMany({refid: accid, thet: deposit }, {status: done});
	user = await Users.findOne({refid: accid}, async (err, res) => {
		if (res){
			addrel = res.refby;
			user2 = await Users.findOne({refid: accid}, async (err, res2) => {
				if (res){
					console.log(res2.accbal)
					let thebal = Number(res2.accbal).toFixed(4);
					refama = refama
					thebal = parseFloat(thebal + refama);
					thebal = thebal
					console.log(thebal)
					await Users.findOneAndUpdate({refid: addrel}, {accbal : thebal})
					let ref = new Send({
						refid: addrel,
						amount: refama,
						thet: "Referal",
						status: "Done"
					})
					const save = ref.save()
				}
			})
		}
	})
	res.redirect('/adminacc')
})


app.post("/witham", async (req, res) => {
	let accid = req.body.acid;
	let amount = Number(req.body.witam);
	user = await Users.findOne({refid: accid}, async (err, res) => {
		if (res){
			thebal = Number(res.accbal).toFixed(12);
			thebal = thebal - amount;
			await Users.findOneAndUpdate({refid: accid}, {accbal : thebal});
		}
	let withdrw = "Withdraw";
	let done = "Done";
	await Send.updateMany({refid: accid, thet: withdrw }, {status: done});
	})
	res.redirect('/adminacc')
})


//Adding amount every 1 second
schedule.schedule('* * * * * *',async() => {
	user = await Users.find({}, async (err, res) => {
		if (res){
			for (let i = 0; i < res.length; i++){
				let arefid = res[i].refid;
				let planc = res[i].plan;
				let taccbal = 0
				switch (planc){
					case "Free":
						taccbal = (Number(res[i].accbal) + 0.00000000007).toFixed(12);
						break;
					case "Starter":
						taccbal = (Number(res[i].accbal) + 0.0000000006).toFixed(12);
						break;
					case "Student":
						taccbal = (Number(res[i].accbal) + 0.0000000054).toFixed(12);
						break;
					case "Master":
						taccbal = (Number(res[i].accbal) + 0.0000000216).toFixed(12);
						break;
				}
				taccbal = String(taccbal);
				await Users.findOneAndUpdate({refid: arefid}, {accbal : taccbal});
			}
		}else {
			console.log(err)
		}

	})
} )

//Adding one day every day to database
schedule.schedule('0 0 0 * * *', async() => {
	user = await Users.find({plan : {"$ne": "Free"}}, async (err, res) => {
		if (res){
			for (let i = 0; i < res.length; i++){
				let tid = res[i].refid;
				let tam = res[i].days;
				if (tam >= 180){
					await Users.findOneAndUpdate({refid: tid}, {plan: "Free"})
				}else{
					tam = Number(tam) + 1;
					await Users.findOneAndUpdate({refid: tid}, {days : tam});
				}

			}
		}

	})
})

//Listening to port
conn.on('open', () => console.log('Database Connected.'))
app.listen(PORT, () => console.log("Sever started at port 5000"))

