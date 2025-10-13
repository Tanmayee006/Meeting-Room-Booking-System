class ApiResponse{
    constructor(statusCode, message, result, success){
        this.statusCode = statusCode;
        this.result = result;
        this.message = message;
        this.success = success;
    }
};

export default ApiResponse