const jwt = require('jsonwebtoken');


const verifyToken = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        jwt.verify(token, "4fb7f246-1e67-447e-a955-f6e1d0e05a6e", (err,user) => {
            if(err) res.status(403).json('Token is not valid !')
            req.user = user;
            next();
        })
    } catch (error) {
        return res.status(401).json({
            message: 'Auth failed'
        });
    }
}


const verifyTokenAndIsAdmin = (req, res, next) => {
    verifyToken(req, res, () => {

        if(req.user.isAdmin){
            next();
        }else{
            return res.status(403).json('Only the admins are allowed to access this route!')
        }
    })
}

const verifyTokenAndIsAdminOrSameUser = (req, res, next) => {
    verifyToken(req, res, () => {

        if(req.user.isAdmin || String(req.user.userId) == String(req.params.userId)){
            next();
        }else{
            console.log(req.user);
            return res.status(403).json('Only the admins or the same user are allowed to access this route!')
        }
    })
}

const verifyTokenAndAdminOrManager = (req, res, next) => {
    verifyToken(req, res, () => {
        if(req.user.isAdmin || req.user.isManager){
            next();
        }else{
            return res.status(403).json('Only the admins or managers are allowed to access this route!')
        }
    })
}

const verifyTokenAndIsAdminOrSameManager = (req, res, next) => {
    verifyToken(req, res, () => {
        if(req.user.isAdmin || req.user.shopManaged == req.params.shopId){
            next();
        }else{
            return res.status(403).json('Only the admins or the shop manager are allowed to access this route!')
        }
    })
}

const verifyIsNotAuthenticated = (req, res, next) => {  
        if(req.headers.authorization == null){
            next();
        }else{
            return res.status(403).json('You are not allowed to this when you are already authenticated!')
        }   
}

module.exports = {  
                   verifyTokenAndIsAdmin,
                   verifyTokenAndAdminOrManager,
                   verifyTokenAndIsAdminOrSameUser,
                   verifyTokenAndIsAdminOrSameManager,
                   verifyIsNotAuthenticated
                };
