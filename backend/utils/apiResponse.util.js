class ApiResponse {
  constructor(statusCode, result, message, success) {
    this.statusCode = statusCode;
    this.result = result;
    this.message = message;
    this.success = success;
  }
}

export default ApiResponse;