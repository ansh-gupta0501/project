import { errors } from '@vinejs/vine'

export class CustomErrorReporter{
  /**
   * A flag to know if one or more errors have been
   * reported
   */
  hasErrors = false

  /**
   * A collection of errors. Feel free to give accurate types
   * to this property
   */
  errors = {}

  /**
   * VineJS call the report method
   */
  report(
    message, // The human-readable error message (e.g., "Username is required").
    rule,   // The name of the rule that failed (e.g., "required", "email").
    field, // 	An object containing metadata about the field. Most importantly field.wildCardPath – the path to the field, even if nested.
    meta  // Optional metadata passed to help understand the context of the failure.
  ) {
    this.hasErrors = true

    /**
     * Collecting errors as per the JSONAPI spec
     */
    // this.errors.push({
    //   code: rule,
    //   detail: message,
    //   source: {
    //     pointer: field.wildCardPath
    //   },
    //   ...(meta ? { meta } : {})
    // })

    this.errors[field.wildCardPath] = message
  }

  /**
   * Creates and returns an instance of the
   * ValidationError class
   */
  createError() {
    return new errors.E_VALIDATION_ERROR(this.errors)
  }
}
