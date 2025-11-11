import {
  RecordNotFoundError,
  DuplicateRecordError,
  QueryExecutionError,
  TransactionError,
  ConnectionError,
  DataValidationError,
} from './DatabaseError.js';

export function handlePrismaError(err) {
  if (!err || !err.code) {
    return new QueryExecutionError(err?.message || 'Unknown database error', 'query_execution_error', err);
  }

  switch (err.code) {
    case 'P2002': // unique constraint failed
      if (err.meta && err.meta.target) {
        const field = Array.isArray(err.meta.target) ? err.meta.target.join(', ') : err.meta.target;
        return new DuplicateRecordError(field);
      }
      return new DuplicateRecordError();
    case 'P2025': // record not found
      return new RecordNotFoundError();
    case 'P2003': // foreign key constraint failed
      return new DataValidationError('Foreign key constraint failed', 'foreign_key_error', err);
    case 'P1001': // connection error
      return new ConnectionError('Database connection failed', 'connection_error', err);
    case 'P2011': // transaction error
      return new TransactionError('Transaction failed', 'transaction_error', err);
    default:
      return new QueryExecutionError(err.message, 'query_execution_error', err);
  }
}