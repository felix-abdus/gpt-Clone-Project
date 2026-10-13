export const errorHandler= (err, req, res, next)=>{
    // let customError= {
    //     statusCode: err.statusCode || statusCode.INTERNAL_SERVER_ERROR,
    //     message: err.message || "sth went wrong try again later"
    // };
    console.error('error in request:', err.message);
    return res.status(err.status || 500).json({
        status: false,
        message: err.message || 'sth went wrong try again later'
    });
}