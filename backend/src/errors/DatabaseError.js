import AppError from "./AppError.js";

export class DatabaseError extends AppError {
  constructor(
    message = "Database error",
    code = "db_error",
    originalError = null
  ) {
    super(message, 500, code);
    this.originalError = originalError;
  }
}

export class RecordNotFoundError extends DatabaseError {
  constructor(recordType = "Record", code = "record_not_found") {
    super(`${recordType} not found`, 404, code);
    this.name = "RecordNotFoundError";
  }
}

export class DuplicateRecordError extends DatabaseError {
  constructor(recordType = "Record", code = "duplicate_record") {
    super(`${recordType} already exists`, 409, code);
    this.name = "DuplicateRecordError";
  }
}

export class QueryExecutionError extends DatabaseError {
  constructor(
    message = "Failed to execute database query",
    code = "query_execution_error",
    originalError = null
  ) {
    super(message, 500, code, originalError);
    this.name = "QueryExecutionError";
  }
}

export class TransactionError extends DatabaseError {
  constructor(
    message = "Database transaction failed",
    code = "transaction_error",
    originalError = null
  ) {
    super(message, 500, code, originalError);
    this.name = "TransactionError";
  }
}

export class ConnectionError extends DatabaseError {
  constructor(
    message = "Database connection error",
    code = "connection_error",
    originalError = null
  ) {
    super(message, 500, code, originalError);
    this.name = "ConnectionError";
  }
}

export class DataValidationError extends DatabaseError {
  constructor(
    message = "Data validation error",
    code = "data_validation_error",
    originalError = null
  ) {
    super(message, 400, code, originalError);
    this.name = "DataValidationError";
  }
}
