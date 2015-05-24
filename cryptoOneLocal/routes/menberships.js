var express = require('express');
var router = express.Router();
var defaultRequestHandler= require('./default')
var crypto = require('../others/crypto');
var session= require('../others/session')
var remote = require('../others/remote')
var errorMgs =  require('../others/error')



router.get('/',  function(req,res, next ){
	defaultRequestHandler(req, res, next , {});
});
router.get('/:id',  function(req,res, next ){
	defaultRequestHandler(req, res, next , {});
});

router.put('/:id',  function(req,res, next ){
	defaultRequestHandler(req, res, next , {});
});
router.delete('/:id',  function(req,res, next ){
	defaultRequestHandler(req, res, next , {});
});
router.post('/',  function(req,res, next ){
	// load the user public key ans signature 
	// check if the user publicKey is correct
	// load the menbership of the menbership(included KGV) ofthis or as admin of the group uses the KGV of this group 
	// decrypt private key with the passphrase
	// decrypt kgv with the user private key
	// encrypt KGV with the new Menber public key
	// save the encrypted KGV in the request object
	//delete passphrase

	var userId = req.body.userId 
	var groupId = req.body.groupId
	var passphrase = req.body.passphrase;
	remote.getSignature(session.user.id, userId, function(signature){ //the public key is contained in the signature object
		console.log(signature);
		if(crypto.validSignature(session.publicKey, signature, passphrase ,session.secretKey)){// valid public key
			var beforeRequestCallback = function(req , args){
				var encryptedKGV = args.data.encryptedKGV;
				var menberPublicKey= signature.user.publicKey //args.data.menberPublicKey; // public Key of the new menber
				console.log("passphrase "+passphrase + " secretkey "+session.secretKey + " encryptedKGV "+ encryptedKGV);
				var decryptedKGV= crypto.RSAdecrypt(passphrase, session.secretKey, encryptedKGV);
				args.data.encryptedKGV= crypto.RSAencrypt(menberPublicKey, decryptedKGV);
				passphrase=null;
				delete args.data.passphrase; 
				delete args.data.menberPublicKey
				delete req.body.passphrase;
			}
			defaultRequestHandler(req, res, next , {beforeRequestCallback : beforeRequestCallback});
		}else{
			delete req.body.passphrase;
			res.status(500).json({ error : errorMsg.wrongSignature})
		}

	})
	
});

module.exports = router;
