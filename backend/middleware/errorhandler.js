function errorHandler(err,req,res,next){
    if (req.method === 'OPTIONS') return next();
    console.error(err.stack);
    res.status(500).json({error:err.message || 'Server error'});
}

export default errorHandler;