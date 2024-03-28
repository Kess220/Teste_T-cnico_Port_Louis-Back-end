import { ApplicationError } from '@/protocols'

export function invalidFormatError(message: string): ApplicationError {
  return {
    name: 'InvalidFormatError',
    message: message,
  }
}