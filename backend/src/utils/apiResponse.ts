class ApiResponse<T> {
  data: T;
  message: string;
  success = true;

  constructor(_statusCode: number, data: T, message = "Request completed successfully") {
    this.data = data;
    this.message = message;
  }
}

export { ApiResponse };
