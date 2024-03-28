import { ApplicationError } from '@/protocols'

export function duplicatedError(message: string): ApplicationError {
  return {
    name: 'DuplicatedError',
    message: message,
  }
}